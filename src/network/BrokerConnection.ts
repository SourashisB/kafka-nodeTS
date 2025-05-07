import * as net from 'net';
import * as tls from 'tls';
import { EventEmitter } from 'events';
import { RequestHeader, ResponseHeader } from './protocol/Headers';
import { ApiKeys } from './protocol/ApiKeys';
import { KafkaError, DisconnectedError, TimeoutError } from '../errors/KafkaError';
import {Buffer} from 'buffer';
/**
 * Configuration options for a broker connection
 */
export interface BrokerConnectionConfig {
  /**
   * The broker host
   */
  host: string;
  
  /**
   * The broker port
   */
  port: number;
  
  /**
   * Client identifier to use for connection
   */
  clientId: string;
  
  /**
   * Connection timeout in milliseconds
   */
  connectionTimeout: number;
  
  /**
   * Socket timeout in milliseconds
   */
  socketTimeout: number;
  
  /**
   * Maximum size of a request in bytes
   */
  maxRequestSize: number;
  
  /**
   * Optional TLS/SSL configuration
   */
  ssl?: tls.ConnectionOptions;
  
  /**
   * Request timeout in milliseconds
   */
  requestTimeout: number;
}

/**
 * Structure representing a request that has been sent
 */
interface InFlightRequest {
  /**
   * Request correlationId
   */
  correlationId: number;
  
  /**
   * Time when the request was sent
   */
  sentTime: number;
  
  /**
   * Request timeout
   */
  timeout: number;
  
  /**
   * API key for the request
   */
  apiKey: number;
  
  /**
   * API version for the request
   */
  apiVersion: number;
  
  /**
   * Request data
   */
  requestData: Buffer;
  
  /**
   * Promise resolver function
   */
  resolve: (response: Buffer) => void;
  
  /**
   * Promise rejection function
   */
  reject: (error: Error) => void;
}

/**
 * Describes the current connection state
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  CLOSING = 'CLOSING',
}

/**
 * Events emitted by the BrokerConnection
 */
interface BrokerConnectionEvents {
  connect: () => void;
  disconnect: (error?: Error) => void;
  error: (error: Error) => void;
  request: (apiKey: ApiKeys, apiVersion: number, correlationId: number) => void;
  response: (apiKey: ApiKeys, apiVersion: number, correlationId: number, duration: number) => void;
  throttle: (throttleTimeMs: number) => void;
  bytesOut: (bytes: number) => void;
  bytesIn: (bytes: number) => void;
}

/**
 * Class for managing a TCP connection to an individual Kafka broker
 */
export class BrokerConnection extends EventEmitter {
  private readonly config: BrokerConnectionConfig;
  private socket: net.Socket | tls.TLSSocket | null = null;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionError: Error | null = null;
  private correlationIdCounter: number = 0;
  private readonly inFlightRequests: Map<number, InFlightRequest> = new Map();
  
  // Buffer for partial data when we receive incomplete messages
  private buffer: Buffer | null = null;
  
  // Timeout reference for connection attempt
  private connectionTimeout: NodeJS.Timeout | null = null;
  
  // Interval reference for checking request timeouts
  private requestTimeoutInterval: NodeJS.Timeout | null = null;
  
  // Node ID assigned by the broker
  private nodeId: number = -1;
  
  /**
   * Create a new broker connection
   * @param config Connection configuration
   */
  constructor(config: BrokerConnectionConfig) {
    super();
    this.config = {
      ...config,
      connectionTimeout: config.connectionTimeout || 10000,
      socketTimeout: config.socketTimeout || 30000,
      maxRequestSize: config.maxRequestSize || 100 * 1024 * 1024, // 100MB
      requestTimeout: config.requestTimeout || 30000
    };
  }
  
  /**
   * Override the emit method for type safety
   */
  emit<E extends keyof BrokerConnectionEvents>(
    event: E,
    ...args: Parameters<BrokerConnectionEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override the on method for type safety
   */
  on<E extends keyof BrokerConnectionEvents>(
    event: E,
    listener: BrokerConnectionEvents[E]
  ): this {
    return super.on(event, listener);
  }
  
  /**
   * Connect to the broker
   */
  public connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED) {
      return Promise.resolve();
    }
    
    if (this.state === ConnectionState.CONNECTING) {
      return new Promise((resolve, reject) => {
        this.once('connect', resolve);
        this.once('error', reject);
      });
    }
    
    this.state = ConnectionState.CONNECTING;
    this.connectionError = null;
    
    return new Promise<void>((resolve, reject) => {
      // Create socket - either TLS or plain TCP
      if (this.config.ssl) {
        this.socket = tls.connect({
          host: this.config.host,
          port: this.config.port,
          ...this.config.ssl
        });
      } else {
        this.socket = net.connect({
          host: this.config.host,
          port: this.config.port
        });
      }
      
      // Set up connection timeout
      this.connectionTimeout = setTimeout(() => {
        const error = new TimeoutError(`Connection to ${this.config.host}:${this.config.port} timed out after ${this.config.connectionTimeout}ms`);
        this.onError(error);
        reject(error);
      }, this.config.connectionTimeout);
      
      // Set up event handlers
      this.socket.on('connect', () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
        this.state = ConnectionState.CONNECTED;
        this.startRequestTimeoutTimer();
        
        this.emit('connect');
        resolve();
      });
      
      this.socket.on('data', (data: Buffer) => this.handleIncomingData(data));
      
      this.socket.on('error', (error: Error) => {
        this.onError(error);
        reject(error);
      });
      
      this.socket.on('end', () => {
        this.onDisconnect(new DisconnectedError('Broker closed connection'));
        reject(new DisconnectedError('Broker closed connection'));
      });
      
      this.socket.on('close', (hadError: boolean) => {
        if (!hadError) {
          this.onDisconnect();
        }
      });
      
      // Set socket timeout
      this.socket.setTimeout(this.config.socketTimeout, () => {
        this.onError(new TimeoutError(`Socket timeout after ${this.config.socketTimeout}ms`));
      });
    });
  }
  
  /**
   * Disconnect from the broker
   */
  public async disconnect(): Promise<void> {
    if (this.state === ConnectionState.DISCONNECTED) {
      return;
    }
    
    this.state = ConnectionState.CLOSING;
    
    // Clear timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.stopRequestTimeoutTimer();
    
    // Reject any in-flight requests
    for (const request of this.inFlightRequests.values()) {
      request.reject(new DisconnectedError('Connection closed'));
    }
    this.inFlightRequests.clear();
    
    // Close the socket
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
    
    this.state = ConnectionState.DISCONNECTED;
    this.emit('disconnect');
  }
  
  /**
   * Check if the connection is established
   */
  public isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED && this.socket !== null;
  }
  
  /**
   * Send a request to the broker and get the response
   * @param apiKey The API key for the request
   * @param apiVersion The API version for the request
   * @param correlationId Unique identifier for this request
   * @param requestData Request payload
   * @param timeout Optional custom timeout for this request
   */
  public async send(
    apiKey: ApiKeys,
    apiVersion: number,
    requestData: Buffer,
    timeout?: number
  ): Promise<Buffer> {
    if (!this.isConnected()) {
      throw new DisconnectedError('Not connected to broker');
    }
    
    // Generate correlation ID
    const correlationId = this.nextCorrelationId();
    
    // Create request header
    const header = new RequestHeader(apiKey, apiVersion, correlationId, this.config.clientId);
    const headerBuffer = header.encode();
    
    // Calculate total size (4 bytes for size + header + payload)
    const totalSize = 4 + headerBuffer.length + requestData.length;
    
    // Check if request is too large
    if (totalSize > this.config.maxRequestSize) {
      throw new KafkaError(`Request size ${totalSize} bytes exceeds max size ${this.config.maxRequestSize} bytes`);
    }
    
    // Create full request (size + header + payload)
    const request = Buffer.alloc(totalSize);
    request.writeInt32BE(totalSize - 4, 0); // Size excludes the size field itself
    headerBuffer.copy(request, 4);
    requestData.copy(request, 4 + headerBuffer.length);
    
    // Track outgoing bytes
    this.emit('bytesOut', request.length);
    
    return new Promise<Buffer>((resolve, reject) => {
      // Create in-flight request entry
      const inFlightRequest: InFlightRequest = {
        correlationId,
        sentTime: Date.now(),
        timeout: timeout || this.config.requestTimeout,
        apiKey,
        apiVersion,
        requestData,
        resolve,
        reject
      };
      
      // Add to in-flight requests
      this.inFlightRequests.set(correlationId, inFlightRequest);
      
      // Emit event for metrics
      this.emit('request', apiKey, apiVersion, correlationId);
      
      // Send the request
      this.socket!.write(request, (error) => {
        if (error) {
          // Remove from in-flight requests
          this.inFlightRequests.delete(correlationId);
          reject(error);
        }
      });
    });
  }
  
  /**
   * Handle incoming data from the socket
   * @param data The received data buffer
   */
  private handleIncomingData(data: Buffer): void {
    // Track incoming bytes
    this.emit('bytesIn', data.length);
    
    // Append to existing buffer if we have one
    if (this.buffer) {
      this.buffer = Buffer.concat([this.buffer, data]);
    } else {
      this.buffer = data;
    }
    
    // Process as many complete messages as possible
    let processed = 0;
    while (processed < this.buffer.length) {
      // Need at least 4 bytes to read message size
      if (this.buffer.length - processed < 4) {
        break;
      }
      
      // Read message size
      const messageSize = this.buffer.readInt32BE(processed);
      
      // Check if we have the complete message
      if (this.buffer.length - processed - 4 < messageSize) {
        break;
      }
      
      // Extract the message (excluding size field)
      const message = this.buffer.slice(processed + 4, processed + 4 + messageSize);
      
      // Process the message
      this.handleResponse(message);
      
      // Move to the next message
      processed += 4 + messageSize;
    }
    
    // Keep any unprocessed data in the buffer
    if (processed === 0) {
      // We didn't process anything, so keep the entire buffer
      return;
    } else if (processed < this.buffer.length) {
      // We processed some data, keep the remainder
      this.buffer = this.buffer.slice(processed);
    } else {
      // We processed all data
      this.buffer = null;
    }
  }
  
  /**
   * Handle a complete response message
   * @param responseBuffer The response message buffer (excluding size field)
   */
  private handleResponse(responseBuffer: Buffer): void {
    try {
      // Decode response header
      const header = ResponseHeader.decode(responseBuffer);
      
      // Find the corresponding in-flight request
      const request = this.inFlightRequests.get(header.correlationId);
      if (!request) {
        // No matching request, might be a response to a timed-out request
        return;
      }
      
      // Remove from in-flight requests
      this.inFlightRequests.delete(header.correlationId);
      
      // Calculate request duration
      const duration = Date.now() - request.sentTime;
      
      // Emit response event for metrics
      this.emit('response', request.apiKey, request.apiVersion, header.correlationId, duration);
      
      // Check for throttling (common to most response types)
      // This assumes the throttle time is at a fixed position, which isn't always true for all API types
      // A more robust solution would decode based on API key and version
      if (responseBuffer.length >= header.size + 4) {
        const throttleTimeMs = responseBuffer.readInt32BE(header.size);
        if (throttleTimeMs > 0) {
          this.emit('throttle', throttleTimeMs);
        }
      }
      
      // Resolve the promise with the response (excluding header)
      request.resolve(responseBuffer.slice(header.size));
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      this.onError(error);
    }
  }
  
  /**
   * Generate the next correlation ID
   */
  private nextCorrelationId(): number {
    this.correlationIdCounter = (this.correlationIdCounter + 1) % 2147483647; // Max positive 32-bit int
    return this.correlationIdCounter;
  }
  
  /**
   * Handle socket errors
   * @param error The error that occurred
   */
  private onError(error: Error): void {
    this.connectionError = error;
    this.emit('error', error);
    this.disconnect().catch(e => {
      // Swallow any errors during disconnect after an error
      console.error('Error during disconnect after error:', e);
    });
  }
  
  /**
   * Handle disconnection
   * @param error Optional error that caused the disconnection
   */
  private onDisconnect(error?: Error): void {
    const wasConnected = this.state === ConnectionState.CONNECTED;
    
    this.state = ConnectionState.DISCONNECTED;
    
    // Clear timeouts
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.stopRequestTimeoutTimer();
    
    // Reject any in-flight requests
    for (const request of this.inFlightRequests.values()) {
      request.reject(error || new DisconnectedError('Connection closed'));
    }
    this.inFlightRequests.clear();
    
    // Clean up socket
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket = null;
    }
    
    // Only emit disconnect if we were previously connected
    if (wasConnected) {
      this.emit('disconnect', error);
    }
  }
  
  /**
   * Start the timer that checks for timed-out requests
   */
  private startRequestTimeoutTimer(): void {
    this.requestTimeoutInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [correlationId, request] of this.inFlightRequests.entries()) {
        const age = now - request.sentTime;
        
        if (age > request.timeout) {
          // Request has timed out
          this.inFlightRequests.delete(correlationId);
          request.reject(new TimeoutError(
            `Request timed out after ${age}ms (correlationId: ${correlationId}, apiKey: ${ApiKeys[request.apiKey]})`
          ));
        }
      }
    }, 1000); // Check every second
  }
  
  /**
   * Stop the request timeout timer
   */
  private stopRequestTimeoutTimer(): void {
    if (this.requestTimeoutInterval) {
      clearInterval(this.requestTimeoutInterval);
      this.requestTimeoutInterval = null;
    }
  }
  
  /**
   * Get the broker node ID
   */
  public getNodeId(): number {
    return this.nodeId;
  }
  
  /**
   * Set the broker node ID
   */
  public setNodeId(nodeId: number): void {
    this.nodeId = nodeId;
  }
  
  /**
   * Get a string representation of this connection
   */
  public toString(): string {
    return `${this.config.host}:${this.config.port} (nodeId=${this.nodeId})`;
  }
}
