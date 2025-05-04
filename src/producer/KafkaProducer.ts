// src/producer/KafkaProducer.ts
import { EventEmitter } from 'events';
import { ProducerRecord } from './ProducerRecord';
import { Callback, RecordMetadata } from './Callback';
import { ProducerConfig } from './ProducerConfig';

/**
 * Events that can be emitted by the KafkaProducer
 */
interface KafkaProducerEvents {
  ready: () => void;
  error: (error: Error) => void;
  close: () => void;
}

/**
 * Main class for sending messages to Kafka
 */
export class KafkaProducer<K, V> extends EventEmitter {
  private readonly config: ProducerConfig;
  private isInitialized: boolean = false;
  private isClosed: boolean = false;

  /**
   * Creates a new KafkaProducer
   * @param config Configuration for the producer
   */
  constructor(config: ProducerConfig) {
    super();
    this.config = {
      // Default configuration values
      clientId: `nodejs-kafka-producer-${Date.now()}`,
      requestTimeout: 30000,
      maxRequestSize: 1048576, // 1MB
      acks: 'all',
      maxInFlightRequestsPerConnection: 5,
      bufferMemory: 33554432, // 32MB
      batchSize: 16384, // 16KB
      lingerMs: 0,
      compressionType: 'none',
      retries: 3,
      retryBackoffMs: 100,
      partitionerClass: 'DefaultPartitioner',
      ...config
    };
  }

  /**
   * Override the emit method for type safety
   */
  emit<E extends keyof KafkaProducerEvents>(
    event: E,
    ...args: Parameters<KafkaProducerEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override the on method for type safety
   */
  on<E extends keyof KafkaProducerEvents>(
    event: E,
    listener: KafkaProducerEvents[E]
  ): this {
    return super.on(event, listener);
  }

  /**
   * Initializes the producer and connects to the Kafka cluster
   * @returns Promise that resolves when the producer is ready
   */
  public async connect(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // In a real implementation, this would establish connections to the brokers
      // For now, we'll just simulate the connection
      console.log(`Connecting to Kafka cluster: ${this.config.bootstrapServers}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInitialized = true;
      this.emit('ready');
      console.log('Producer connected successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Sends a single record to Kafka
   * @param record The record to send
   * @param callback Optional callback to be called when the send operation completes
   * @returns Promise that resolves to the record metadata
   */
  public async send(record: ProducerRecord<K, V>, callback?: Callback): Promise<RecordMetadata> {
    if (!this.isInitialized) {
      await this.connect();
    }

    if (this.isClosed) {
      const error = new Error('Producer is closed');
      if (callback) {
        callback.onCompletion(error, null);
      }
      throw error;
    }

    try {
      // Here we would actually send the record to Kafka
      // For this implementation, we'll simulate sending and receiving metadata
      
      // Validate the record
      if (!record.topic) {
        throw new Error('Topic cannot be null or undefined');
      }

      console.log(`Sending record to topic ${record.topic}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create record metadata
      const partition = record.partition ?? this.calculatePartition(record);
      const timestamp = record.timestamp ?? Date.now();
      const offset = this.generateRandomOffset();
      
      const metadata = new RecordMetadata(
        record.topic,
        partition,
        offset,
        timestamp
      );
      
      // Call the callback if provided
      if (callback) {
        callback.onCompletion(null, metadata);
      }
      
      return metadata;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (callback) {
        callback.onCompletion(err, null);
      }
      
      throw err;
    }
  }

  /**
   * Flushes any accumulated records and blocks until all sends are complete
   * @param timeout Optional timeout in milliseconds
   */
  public async flush(timeout?: number): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    // In a real implementation, this would wait for all in-flight requests to complete
    console.log('Flushing producer...');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Producer flushed');
  }

  /**
   * Closes the producer and releases all resources
   */
  public async close(): Promise<void> {
    if (this.isClosed) {
      return;
    }

    try {
      // Flush any pending records before closing
      await this.flush();
      
      console.log('Closing producer...');
      
      // In a real implementation, this would close connections and release resources
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.isClosed = true;
      this.emit('close');
      console.log('Producer closed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Calculates the partition based on the record's key
   * @param record The record
   * @returns The calculated partition
   */
  private calculatePartition(record: ProducerRecord<K, V>): number {
    // In a real implementation, this would use the configured partitioner
    // For now, we'll use a simple hash-based partitioning
    if (record.key === undefined || record.key === null) {
      // If no key is provided, return a random partition
      return Math.floor(Math.random() * 10);
    }

    // Simple hash function to determine partition
    const keyStr = String(record.key);
    let hash = 0;
    for (let i = 0; i < keyStr.length; i++) {
      hash = ((hash << 5) - hash) + keyStr.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use absolute value and mod by 10 (assuming 10 partitions)
    return Math.abs(hash) % 10;
  }

  /**
   * Generates a random offset for demonstration purposes
   * @returns A random offset
   */
  private generateRandomOffset(): number {
    return Math.floor(Math.random() * 10000);
  }
}