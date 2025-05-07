import { EventEmitter } from 'events';
import { BrokerConnection, ConnectionState, BrokerConnectionConfig } from './BrokerConnection';
import { ClusterMetadata } from './ClusterMetadata';
import { ApiKeys, apiVersion } from './protocol/ApiKeys';
import { MetadataRequest } from './protocol/requests/MetadataRequest';
import { ApiVersionsRequest } from './protocol/requests/ApiVersionsRequest';
import { MetadataResponse, Broker } from './protocol/responses/MetadataResponse';
import { ApiVersionsResponse, ApiVersionRange } from './protocol/responses/ApiVersionsResponse';
import { KafkaError, DisconnectedError, TimeoutError } from '../errors/KafkaError';

/**
 * Configuration for the NetworkClient
 */
export interface NetworkClientConfig {
  /**
   * Broker node configurations
   */
  brokerConfigs: BrokerConnectionConfig[];
  
  /**
   * Client identifier
   */
  clientId: string;
  
  /**
   * Reconnection backoff in milliseconds
   */
  reconnectBackoffMs: number;
  
  /**
   * Maximum reconnection backoff in milliseconds
   */
  reconnectBackoffMaxMs: number;
  
  /**
   * Socket connection timeout in milliseconds
   */
  connectionTimeout: number;
  
  /**
   * Default request timeout in milliseconds
   */
  requestTimeout: number;
  
  /**
   * Metadata refresh interval in milliseconds
   */
  metadataRefreshIntervalMs: number;
  
  /**
   * Whether to automatically refresh metadata when needed
   */
  autoRefreshMetadata: boolean;
}

/**
 * Events emitted by the NetworkClient
 */
interface NetworkClientEvents {
  ready: () => void;
  error: (error: Error) => void;
  close: () => void;
  brokerConnect: (nodeId: number, host: string, port: number) => void;
  brokerDisconnect: (nodeId: number, host: string, port: number) => void;
  metadataUpdate: (topics: string[]) => void;
}

/**
 * Client for network communication with the Kafka cluster
 */
export class NetworkClient extends EventEmitter {
  private readonly config: NetworkClientConfig;
  private readonly clusterMetadata: ClusterMetadata;
  private readonly connections: Map<number, BrokerConnection> = new Map();
  private seedBrokers: BrokerConnection[] = [];
  private isInitialized: boolean = false;
  private isClosed: boolean = false;
  private isRefreshingMetadata: boolean = false;
  private metadataRefreshTimer: NodeJS.Timeout | null = null;
  private apiVersions: Map<ApiKeys, ApiVersionRange> = new Map();
  
  /**
   * Create a new NetworkClient
   * @param config Client configuration
   * @param clusterMetadata Optional existing cluster metadata
   */
  constructor(config: NetworkClientConfig, clusterMetadata?: ClusterMetadata) {
    super();
    this.config = {
      reconnectBackoffMs: 100,
      reconnectBackoffMaxMs: 10000,
      connectionTimeout: 10000,
      requestTimeout: 30000,
      metadataRefreshIntervalMs: 300000, // 5 minutes
      autoRefreshMetadata: true,
      ...config
    };
    
    this.clusterMetadata = clusterMetadata || new ClusterMetadata();
    
    // Set up metadata update forwarding
    this.clusterMetadata.on('update', (topics) => {
      this.emit('metadataUpdate', topics);
    });
    
    // Create connections to seed brokers
    this.seedBrokers = this.config.brokerConfigs.map(brokerConfig => {
      return new BrokerConnection(brokerConfig);
    });
  }
  
  /**
   * Override the emit method for type safety
   */
  emit<E extends keyof NetworkClientEvents>(
    event: E,
    ...args: Parameters<NetworkClientEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override the on method for type safety
   */
  on<E extends keyof NetworkClientEvents>(
    event: E,
    listener: NetworkClientEvents[E]
  ): this {
    return super.on(event, listener);
  }
  
  /**
   * Connect to the Kafka cluster
   */
  public async connect(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    if (this.isClosed) {
      throw new KafkaError('Client is closed');
    }
    
    try {
      // Connect to at least one seed broker
      let connectedBroker: BrokerConnection | null = null;
      const errors: Error[] = [];
      
      for (const broker of this.seedBrokers) {
        try {
          await broker.connect();
          connectedBroker = broker;
          break;
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));
        }
      }
      
      if (!connectedBroker) {
        throw new KafkaError(
          `Failed to connect to any seed brokers: ${errors.map(e => e.message).join(', ')}`
        );
      }
      
      // Fetch API versions from the connected broker
      await this.fetchApiVersions(connectedBroker);
      
      // Fetch cluster metadata from the connected broker
      await this.refreshMetadata(null, connectedBroker);
      
      // Set up scheduled metadata refresh
      this.startMetadataRefreshTimer();
      
      this.isInitialized = true;
      this.emit('ready');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }
  
  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    if (this.isClosed) {
      return;
    }
    
    this.isClosed = true;
    
    // Stop metadata refresh timer
    if (this.metadataRefreshTimer) {
      clearTimeout(this.metadataRefreshTimer);
      this.metadataRefreshTimer = null;
    }
    
    // Close all broker connections
    const closePromises: Promise<void>[] = [];
    
    for (const broker of this.seedBrokers) {
      closePromises.push(broker.disconnect());
    }
    
    for (const connection of this.connections.values()) {
      closePromises.push(connection.disconnect());
    }
    
    // Wait for all connections to close
    await Promise.all(closePromises);
    
    this.connections.clear();
    this.seedBrokers = [];
    
    this.emit('close');
  }
  
  /**
   * Fetch API versions from a broker
   */
  private async fetchApiVersions(broker: BrokerConnection): Promise<void> {
    const request = ApiVersionsRequest.create();
    
    // Send the request using ApiVersions API Key
    const responseBuffer = await broker.send(
      ApiKeys.API_VERSIONS,
      0, // Use version 0 initially
      request.encode()
    );
    
    // Parse the response
    const response = ApiVersionsResponse.parse(responseBuffer);
    
    // Check for errors
    if (response.errorCode !== 0) {
      throw new KafkaError(`Error fetching API versions: ${response.errorCode}`);
    }
    
    // Store the API versions
    this.apiVersions.clear();
    for (const version of response.apiVersions) {
      this.apiVersions.set(version.apiKey, version);
    }
  }
  
  /**
   * Refresh cluster metadata
   * @param topics Optional list of topics to include, or null for all topics
   * @param specificBroker Optional specific broker to use for the request
   */
  public async refreshMetadata(
    topics: string[] | null = null,
    specificBroker?: BrokerConnection
  ): Promise<void> {
    if (this.isRefreshingMetadata) {
      return;
    }
    
    this.isRefreshingMetadata = true;
    
    try {
      let request: MetadataRequest;
      
      if (topics === null) {
        request = MetadataRequest.forAllTopics();
      } else {
        request = MetadataRequest.forTopics(topics);
      }
      
      // Determine which broker to send the request to
      let broker: BrokerConnection;
      
      if (specificBroker) {
        broker = specificBroker;
      } else {
        // Try to use an existing broker connection, or fall back to a seed broker
        const brokers = Array.from(this.connections.values());
        
        if (brokers.length > 0) {
          broker = brokers[0];
        } else if (this.seedBrokers.length > 0) {
          broker = this.seedBrokers[0];
          await broker.connect();
        } else {
          throw new KafkaError('No brokers available to refresh metadata');
        }
      }
      
      // Get the maximum supported version for METADATA API
      const metadataVersionInfo = this.apiVersions.get(ApiKeys.METADATA);
      const version = metadataVersionInfo ? metadataVersionInfo.maxVersion : 0;
      
      // Send the request
      const responseBuffer = await broker.send(
        ApiKeys.METADATA,
        version,
        request.encode()
      );
      
      // Parse the response
      const response = MetadataResponse.parse(responseBuffer);
      
      // Update cluster metadata
      this.clusterMetadata.updateMetadata(
        response.brokers,
        response.topics,
        response.clusterId,
        response.controllerId
      );
      
      // Update broker connections based on metadata
      await this.updateBrokerConnections(response.brokers);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    } finally {
      this.isRefreshingMetadata = false;
    }
  }
  
  /**
   * Update broker connections based on metadata
   */
  private async updateBrokerConnections(brokers: Broker[]): Promise<void> {
    // Track current node IDs
    const currentNodeIds = new Set<number>();
    
    // Create or update connections for each broker in metadata
    for (const broker of brokers) {
      currentNodeIds.add(broker.nodeId);
      
      // Check if we already have a connection to this broker
      if (this.connections.has(broker.nodeId)) {
        continue;
      }
      
      // Create a new connection to this broker
      const connectionConfig: BrokerConnectionConfig = {
        host: broker.host,
        port: broker.port,
        clientId: this.config.clientId,
        connectionTimeout: this.config.connectionTimeout,
        requestTimeout: this.config.requestTimeout,
        // Reuse SSL config from seed brokers if available
        ssl: this.seedBrokers.length > 0 ? this.seedBrokers[0].config.ssl : undefined
      };
      
      const connection = new BrokerConnection(connectionConfig);
      
      try {
        await connection.connect();
        
        // Set node ID on the connection
        connection.setNodeId(broker.nodeId);
        
        // Add to connections map
        this.connections.set(broker.nodeId, connection);
        
        // Set up event handlers
        connection.on('error', (error) => {
          this.emit('error', error);
        });
        
        connection.on('disconnect', () => {
          this.emit('brokerDisconnect', broker.nodeId, broker.host, broker.port);
        });
        
        // Emit broker connect event
        this.emit('brokerConnect', broker.nodeId, broker.host, broker.port);
      } catch (error) {
        // Couldn't connect to this broker, but we'll try again later
        console.error(`Failed to connect to broker ${broker.nodeId} at ${broker.host}:${broker.port}`, error);
      }
    }
    
    // Close connections to brokers that are no longer in the metadata
    for (const [nodeId, connection] of this.connections.entries()) {
      if (!currentNodeIds.has(nodeId)) {
        await connection.disconnect();
        this.connections.delete(nodeId);
      }
    }
  }
  
  /**
   * Start the timer for periodic metadata refresh
   */
  private startMetadataRefreshTimer(): void {
    if (this.metadataRefreshTimer) {
      clearTimeout(this.metadataRefreshTimer);
    }
    
    if (this.config.autoRefreshMetadata) {
      this.metadataRefreshTimer = setTimeout(() => {
        this.refreshMetadata()
          .catch(error => {
            console.error('Error refreshing metadata:', error);
          })
          .finally(() => {
            // Re-schedule the timer
            this.startMetadataRefreshTimer();
          });
      }, this.config.metadataRefreshIntervalMs);
    }
  }
  
  /**
   * Send a request to a specific node
   * @param nodeId The node ID to send the request to
   * @param apiKey The API key for the request
   * @param apiVersion The API version for the request
   * @param requestData The request data
   * @param timeout Optional custom timeout for this request
   */
  public async sendRequest(
    nodeId: number,
    apiKey: ApiKeys,
    apiVersion: number,
    requestData: Buffer,
    timeout?: number
  ): Promise<Buffer> {
    // Get the connection for this node
    const connection = this.connections.get(nodeId);
    
    if (!connection || !connection.isConnected()) {
      if (this.config.autoRefreshMetadata) {
        // Try to refresh metadata and get a new connection
        await this.refreshMetadata();
        
        // Check again after refresh
        const newConnection = this.connections.get(nodeId);
        if (!newConnection || !newConnection.isConnected()) {
          throw new DisconnectedError(`No connection to node ${nodeId}`);
        }
        
        return this.sendRequest(nodeId, apiKey, apiVersion, requestData, timeout);
      } else {
        throw new DisconnectedError(`No connection to node ${nodeId}`);
      }
    }
    
    // Send the request
    try {
      return await connection.send(apiKey, apiVersion, requestData, timeout);
    } catch (error) {
      // If we get a connection error, try to refresh metadata
      if (error instanceof DisconnectedError && this.config.autoRefreshMetadata) {
        await this.refreshMetadata();
        
        // Re-check the connection after refresh
        const newConnection = this.connections.get(nodeId);
        if (!newConnection || !newConnection.isConnected()) {
          throw error;
        }
        
        // Retry the request
        return await newConnection.send(apiKey, apiVersion, requestData, timeout);
      }
      
      throw error;
    }
  }
  
  /**
   * Find the node that is the leader for a specific topic-partition
   */
  public findLeaderForPartition(topic: string, partition: number): number {
    return this.clusterMetadata.findLeader(topic, partition);
  }
  
  /**
   * Send a request to the leader for a specific topic-partition
   */
  public async sendToPartitionLeader(
    topic: string,
    partition: number,
    apiKey: ApiKeys,
    apiVersion: number,
    requestData: Buffer,
    timeout?: number
  ): Promise<Buffer> {
    try {
      const leaderId = this.findLeaderForPartition(topic, partition);
      return await this.sendRequest(leaderId, apiKey, apiVersion, requestData, timeout);
    } catch (error) {
      // If we can't find the leader, refresh metadata and try again
      if (this.config.autoRefreshMetadata) {
        await this.refreshMetadata([topic]);
        
        // Try again after refresh
        const leaderId = this.findLeaderForPartition(topic, partition);
        return await this.sendRequest(leaderId, apiKey, apiVersion, requestData, timeout);
      }
      
      throw error;
    }
  }
  
  /**
   * Get the cluster metadata
   */
  public getClusterMetadata(): ClusterMetadata {
    return this.clusterMetadata;
  }
  
  /**
   * Get information about the maximum supported version for a specific API
   */
  public getApiVersion(apiKey: ApiKeys): { minVersion: number; maxVersion: number } {
    const version = this.apiVersions.get(apiKey);
    
    if (!version) {
      // Default to version 0 if we don't have version info
      return { minVersion: 0, maxVersion: 0 };
    }
    
    return { minVersion: version.minVersion, maxVersion: version.maxVersion };
  }
  
  /**
   * Check if a specific API version is supported
   */
  public supportsApiVersion(apiKey: ApiKeys, apiVersion: number): boolean {
    const version = this.apiVersions.get(apiKey);
    
    if (!version) {
      return false;
    }
    
    return apiVersion >= version.minVersion && apiVersion <= version.maxVersion;
  }
}
