import { EventEmitter } from 'events';
import { ConsumerRecord } from './ConsumerRecord';
import { ConsumerConfig } from './ConsumerConfig';
import { ConsumerRebalanceListener } from './ConsumerRebalanceListener';
import { TopicPartition } from './TopicPartition';
import { OffsetAndMetadata } from './OffsetAndMetadata';

/**
 * Events that can be emitted by the KafkaConsumer
 */
interface KafkaConsumerEvents {
  ready: () => void;
  data: <K, V>(record: ConsumerRecord<K, V>) => void;
  error: (error: Error) => void;
  rebalance: (event: 'assigned' | 'revoked' | 'lost', partitions: TopicPartition[]) => void;
  close: () => void;
}

/**
 * Main class for receiving messages from Kafka
 */
export class KafkaConsumer<K, V> extends EventEmitter {
  private readonly config: ConsumerConfig;
  private isInitialized: boolean = false;
  private isClosed: boolean = false;
  private isRunning: boolean = false;
  private rebalanceListener?: ConsumerRebalanceListener;
  private assignedPartitions: TopicPartition[] = [];
  private subscriptions: Set<string> = new Set();
  private pollInterval?: ReturnType<typeof setInterval>;

  /**
   * Creates a new KafkaConsumer
   * @param config Configuration for the consumer
   */
  constructor(config: ConsumerConfig) {
    super();
    this.config = {
      // Default configuration values
      clientId: `nodejs-kafka-consumer-${Date.now()}`,
      requestTimeout: 30000,
      enableAutoCommit: true,
      autoCommitIntervalMs: 5000,
      autoOffsetReset: 'latest',
      maxPollRecords: 500,
      sessionTimeoutMs: 10000,
      heartbeatIntervalMs: 3000,
      retryBackoffMs: 100,
      isolationLevel: 'read_uncommitted',
      ...config
    };
  }

  /**
   * Override the emit method for type safety
   */
  emit<E extends keyof KafkaConsumerEvents>(
    event: E,
    ...args: Parameters<KafkaConsumerEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override the on method for type safety
   */
  on<E extends keyof KafkaConsumerEvents>(
    event: E,
    listener: KafkaConsumerEvents[E]
  ): this {
    return super.on(event, listener);
  }

  /**
   * Connects to the Kafka cluster and initializes the consumer
   */
  public async connect(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // In a real implementation, this would establish connections to the brokers
      // and join the consumer group
      console.log(`Connecting to Kafka cluster: ${this.config.bootstrapServers}`);
      console.log(`Using consumer group: ${this.config.groupId}`);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.isInitialized = true;
      this.emit('ready');
      console.log('Consumer connected successfully');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Subscribe to the given list of topics
   * @param topics Array of topic names
   * @param listener Optional listener for rebalance events
   */
  public subscribe(topics: string[], listener?: ConsumerRebalanceListener): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    // Clear previous subscriptions
    this.subscriptions.clear();
    
    // Add new subscriptions
    for (const topic of topics) {
      this.subscriptions.add(topic);
    }
    
    // Set the rebalance listener if provided
    if (listener) {
      this.rebalanceListener = listener;
    }
    
    console.log(`Subscribed to topics: ${topics.join(', ')}`);
    
    // Simulate partition assignment
    this.simulateRebalance();
  }

  /**
   * Manually assign a list of partitions to this consumer
   * @param partitions Array of topic-partition assignments
   */
  public assign(partitions: TopicPartition[]): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    // Clear subscriptions since we are manually assigning partitions
    this.subscriptions.clear();
    
    // Set the assigned partitions
    this.assignedPartitions = [...partitions];
    
    console.log(`Manually assigned partitions: ${partitions.map(p => p.toString()).join(', ')}`);
  }

  /**
   * Unsubscribe from all topics and clear all assignments
   */
  public unsubscribe(): void {
    if (!this.isInitialized) {
      return;
    }

    // Clear subscriptions and assignments
    this.subscriptions.clear();
    
    // Notify listener about partition revocation
    if (this.rebalanceListener && this.assignedPartitions.length > 0) {
      try {
        this.rebalanceListener.onPartitionsRevoked(this.assignedPartitions);
      } catch (error) {
        console.error('Error in rebalance listener:', error);
      }
    }
    
    this.assignedPartitions = [];
    console.log('Unsubscribed from all topics');
  }

  /**
   * Start consuming records from Kafka
   * This method will start polling for records in the background
   */
  public start(): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    
    // Begin polling for records
    this.pollInterval = setInterval(() => {
      this.poll();
    }, 100); // Poll every 100ms
    
    console.log('Consumer started polling for records');
  }

  /**
   * Stop consuming records
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    
    this.isRunning = false;
    console.log('Consumer stopped polling for records');
  }

  /**
   * Poll for records from the subscribed topics
   * @param timeout Optional timeout in milliseconds
   * @returns Array of consumer records
   */
  public async poll(timeout?: number): Promise<ConsumerRecord<K, V>[]> {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    if (this.assignedPartitions.length === 0) {
      return [];
    }

    try {
      // In a real implementation, this would fetch records from Kafka
      // For now, we'll generate mock records
      const records = this.generateMockRecords();
      
      // Emit each record as a data event
      for (const record of records) {
        this.emit('data', record);
      }
      
      // Auto-commit offsets if enabled
      if (this.config.enableAutoCommit) {
        await this.commitSync();
      }
      
      return records;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Commit offsets synchronously
   * @param offsets Optional map of topic-partition to offset metadata
   */
  public async commitSync(offsets?: Record<string, OffsetAndMetadata>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    try {
      // In a real implementation, this would commit offsets to Kafka
      console.log('Committing offsets synchronously');
      
      // Simulate commit delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (offsets) {
        console.log('Committed specific offsets:', JSON.stringify(offsets));
      } else {
        console.log('Committed current offsets for all assigned partitions');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Commit offsets asynchronously
   * @param offsets Optional map of topic-partition to offset metadata
   * @param callback Optional callback to be called when the commit completes
   */
  public commitAsync(
    offsets?: Record<string, OffsetAndMetadata>,
    callback?: (error: Error | null, result: Record<string, OffsetAndMetadata> | null) => void
  ): void {
    if (!this.isInitialized) {
      const error = new Error('Consumer is not initialized. Call connect() first.');
      if (callback) {
        callback(error, null);
      }
      return;
    }

    if (this.isClosed) {
      const error = new Error('Consumer is closed');
      if (callback) {
        callback(error, null);
      }
      return;
    }

    // In a real implementation, this would commit offsets to Kafka asynchronously
    console.log('Committing offsets asynchronously');

    setTimeout(() => {
      if (offsets) {
        console.log('Committed specific offsets:', JSON.stringify(offsets));
      } else {
        console.log('Committed current offsets for all assigned partitions');
      }
      
      if (callback) {
        callback(null, offsets || {});
      }
    }, 50);
  }

  /**
   * Seek to a specific offset for a partition
   * @param partition The topic-partition to seek
   * @param offset The offset to seek to
   */
  public seek(partition: TopicPartition, offset: number): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    // Check if the partition is assigned to this consumer
    const isAssigned = this.assignedPartitions.some(
      p => p.topic === partition.topic && p.partition === partition.partition
    );
    
    if (!isAssigned) {
      throw new Error(`Partition ${partition.toString()} is not assigned to this consumer`);
    }
    
    console.log(`Seeking to offset ${offset} for partition ${partition.toString()}`);
  }

  /**
   * Seek to the beginning of all assigned partitions or specific partitions
   * @param partitions Optional list of partitions to seek
   */
  public seekToBeginning(partitions?: TopicPartition[]): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    const toSeek = partitions || this.assignedPartitions;
    
    console.log(`Seeking to beginning for partitions: ${toSeek.map(p => p.toString()).join(', ')}`);
  }

  /**
   * Seek to the end of all assigned partitions or specific partitions
   * @param partitions Optional list of partitions to seek
   */
  public seekToEnd(partitions?: TopicPartition[]): void {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    const toSeek = partitions || this.assignedPartitions;
    
    console.log(`Seeking to end for partitions: ${toSeek.map(p => p.toString()).join(', ')}`);
  }

  /**
   * Get the current position (offset) for a partition
   * @param partition The topic-partition to get the position for
   * @returns The current position
   */
  public position(partition: TopicPartition): number {
    if (!this.isInitialized) {
      throw new Error('Consumer is not initialized. Call connect() first.');
    }

    if (this.isClosed) {
      throw new Error('Consumer is closed');
    }

    // Check if the partition is assigned to this consumer
    const isAssigned = this.assignedPartitions.some(
      p => p.topic === partition.topic && p.partition === partition.partition
    );
    
    if (!isAssigned) {
      throw new Error(`Partition ${partition.toString()} is not assigned to this consumer`);
    }
    
    // In a real implementation, this would return the actual position
    // For now, return a random offset
    return Math.floor(Math.random() * 10000);
  }

  /**
   * Close the consumer and release all resources
   */
  public async close(): Promise<void> {
    if (this.isClosed) {
      return;
    }

    try {
      // Stop polling
      this.stop();
      
      // Unsubscribe from all topics
      this.unsubscribe();
      
      console.log('Closing consumer...');
      
      // In a real implementation, this would close connections and leave the consumer group
      await new Promise(resolve => setTimeout(resolve, 300));
      
      this.isClosed = true;
      this.emit('close');
      console.log('Consumer closed');
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', err);
      throw err;
    }
  }

  /**
   * Simulate a rebalance event
   * This is for demonstration purposes only
   */
  private simulateRebalance(): void {
    // Simulate partition revocation if there are assigned partitions
    if (this.assignedPartitions.length > 0) {
      const partitionsToRevoke = [...this.assignedPartitions];
      
      if (this.rebalanceListener) {
        try {
          this.rebalanceListener.onPartitionsRevoked(partitionsToRevoke);
        } catch (error) {
          console.error('Error in rebalance listener (revoke):', error);
        }
      }
      
      this.emit('rebalance', 'revoked', partitionsToRevoke);
    }
    
    // Assign random partitions for each subscribed topic
    this.assignedPartitions = [];
    for (const topic of this.subscriptions) {
      // Assign 3 random partitions for each topic
      for (let i = 0; i < 3; i++) {
        this.assignedPartitions.push(new TopicPartition(topic, i));
      }
    }
    
    if (this.rebalanceListener) {
      try {
        this.rebalanceListener.onPartitionsAssigned(this.assignedPartitions);
      } catch (error) {
        console.error('Error in rebalance listener (assign):', error);
      }
    }
    
    this.emit('rebalance', 'assigned', this.assignedPartitions);
    
    console.log(`Partitions assigned: ${this.assignedPartitions.map(p => p.toString()).join(', ')}`);
  }

  /**
   * Generate mock consumer records for testing
   * This is for demonstration purposes only
   */
  private generateMockRecords(): ConsumerRecord<K, V>[] {
    if (this.assignedPartitions.length === 0) {
      return [];
    }
    
    const records: ConsumerRecord<K, V>[] = [];
    
    // Generate between 0-10 records
    const count = Math.floor(Math.random() * 10);
    
    for (let i = 0; i < count; i++) {
      // Select a random assigned partition
      const randomIndex = Math.floor(Math.random() * this.assignedPartitions.length);
      const partition = this.assignedPartitions[randomIndex];
      
      // Generate a random offset
      const offset = Math.floor(Math.random() * 10000);
      
      // Generate a timestamp close to now
      const timestamp = Date.now() - Math.floor(Math.random() * 1000);
      
      // Create a mock record
      const record = new ConsumerRecord<K, V>(
        partition.topic,
        partition.partition,
        offset,
        timestamp,
        'CreateTime',
        null, // key
        null, // value
        Math.floor(Math.random() * 1000000), // checksum
        {} // headers
      );
      
      records.push(record);
    }
    
    return records;
  }
}
