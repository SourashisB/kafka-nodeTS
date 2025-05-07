import { EventEmitter } from 'events';
import { TopicMetadata, PartitionMetadata, Broker } from './protocol/responses/MetadataResponse';
import { ApiKeys } from './protocol/ApiKeys';
import { KafkaError, LeaderNotAvailableError } from '../errors/KafkaError';

/**
 * Events emitted by the ClusterMetadata
 */
interface ClusterMetadataEvents {
  update: (topics: string[]) => void;
  error: (error: Error) => void;
}

/**
 * Provides access to metadata about the Kafka cluster
 */
export class ClusterMetadata extends EventEmitter {
  private topics: Map<string, TopicMetadata> = new Map();
  private brokers: Map<number, Broker> = new Map();
  private clusterId: string | null = null;
  private controllerId: number = -1;
  private isMetadataInitialized: boolean = false;
  
  constructor() {
    super();
  }
  
  /**
   * Override the emit method for type safety
   */
  emit<E extends keyof ClusterMetadataEvents>(
    event: E,
    ...args: Parameters<ClusterMetadataEvents[E]>
  ): boolean {
    return super.emit(event, ...args);
  }

  /**
   * Override the on method for type safety
   */
  on<E extends keyof ClusterMetadataEvents>(
    event: E,
    listener: ClusterMetadataEvents[E]
  ): this {
    return super.on(event, listener);
  }
  
  /**
   * Check if metadata is available for the specified topic
   */
  public hasTopicMetadata(topic: string): boolean {
    return this.topics.has(topic);
  }
  
  /**
   * Get metadata for a specific topic
   */
  public getTopicMetadata(topic: string): TopicMetadata | undefined {
    return this.topics.get(topic);
  }
  
  /**
   * Get metadata for all known topics
   */
  public getAllTopics(): TopicMetadata[] {
    return Array.from(this.topics.values());
  }
  
  /**
   * Get the names of all known topics
   */
  public getTopicNames(): string[] {
    return Array.from(this.topics.keys());
  }
  
  /**
   * Get a specific broker by node ID
   */
  public getBroker(nodeId: number): Broker | undefined {
    return this.brokers.get(nodeId);
  }
  
  /**
   * Get all known brokers
   */
  public getAllBrokers(): Broker[] {
    return Array.from(this.brokers.values());
  }
  
  /**
   * Get the cluster ID
   */
  public getClusterId(): string | null {
    return this.clusterId;
  }
  
  /**
   * Get the controller ID
   */
  public getControllerId(): number {
    return this.controllerId;
  }
  
  /**
   * Get the node ID of the leader for a specific topic-partition
   */
  public findLeader(topic: string, partition: number): number {
    const topicMetadata = this.topics.get(topic);
    if (!topicMetadata) {
      throw new KafkaError(`Topic ${topic} not found in metadata`);
    }
    
    const partitionMetadata = topicMetadata.partitions.find(p => p.partitionIndex === partition);
    if (!partitionMetadata) {
      throw new KafkaError(`Partition ${partition} not found for topic ${topic}`);
    }
    
    if (partitionMetadata.leaderId < 0) {
      throw new LeaderNotAvailableError(`No leader for topic ${topic} partition ${partition}`);
    }
    
    return partitionMetadata.leaderId;
  }
  
  /**
   * Get all partition information for a specific topic
   */
  public getPartitionsForTopic(topic: string): PartitionMetadata[] {
    const topicMetadata = this.topics.get(topic);
    if (!topicMetadata) {
      return [];
    }
    
    return topicMetadata.partitions;
  }
  
  /**
   * Get the number of partitions for a specific topic
   */
  public getPartitionCount(topic: string): number {
    const partitions = this.getPartitionsForTopic(topic);
    return partitions.length;
  }
  
  /**
   * Update the cluster metadata from a MetadataResponse
   */
  public updateMetadata(
    brokers: Broker[],
    topics: TopicMetadata[],
    clusterId: string | null,
    controllerId: number
  ): void {
    // Update brokers
    this.brokers.clear();
    for (const broker of brokers) {
      this.brokers.set(broker.nodeId, broker);
    }
    
    // Update topics
    const updatedTopics: string[] = [];
    for (const topic of topics) {
      // Skip topics with errors
      if (topic.errorCode !== 0) {
        continue;
      }
      
      // Check if topic metadata has changed
      const existingTopic = this.topics.get(topic.name);
      if (
        !existingTopic ||
        existingTopic.partitions.length !== topic.partitions.length ||
        this.hasPartitionChanges(existingTopic.partitions, topic.partitions)
      ) {
        updatedTopics.push(topic.name);
      }
      
      this.topics.set(topic.name, topic);
    }
    
    // Update cluster information
    this.clusterId = clusterId;
    this.controllerId = controllerId;
    
    // Mark as initialized if not already
    const wasInitialized = this.isMetadataInitialized;
    this.isMetadataInitialized = true;
    
    // Emit update event if we have updated topics
    if (updatedTopics.length > 0 || !wasInitialized) {
      this.emit('update', updatedTopics);
    }
  }
  
  /**
   * Check if partition metadata has changed
   */
  private hasPartitionChanges(
    existing: PartitionMetadata[],
    updated: PartitionMetadata[]
  ): boolean {
    // Quick check: if the arrays are different lengths, there's definitely a change
    if (existing.length !== updated.length) {
      return true;
    }
    
    // Create a map of partition index to metadata for faster lookups
    const existingMap = new Map<number, PartitionMetadata>();
    for (const partition of existing) {
      existingMap.set(partition.partitionIndex, partition);
    }
    
    // Check each updated partition against the existing one
    for (const partition of updated) {
      const existingPartition = existingMap.get(partition.partitionIndex);
      
      // If we don't have this partition or the leader has changed, there's a change
      if (
        !existingPartition ||
        existingPartition.leaderId !== partition.leaderId ||
        existingPartition.leaderEpoch !== partition.leaderEpoch
      ) {
        return true;
      }
      
      // Check if the replica sets have changed
      if (this.hasArrayChanged(existingPartition.replicaNodes, partition.replicaNodes)) {
        return true;
      }
      
      // Check if the ISR sets have changed
      if (this.hasArrayChanged(existingPartition.isrNodes, partition.isrNodes)) {
        return true;
      }
      
      // Check if the offline replicas have changed
      if (this.hasArrayChanged(existingPartition.offlineReplicas, partition.offlineReplicas)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if two arrays have different contents
   */
  private hasArrayChanged(a: number[], b: number[]): boolean {
    if (a.length !== b.length) {
      return true;
    }
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check if metadata is initialized
   */
  public isInitialized(): boolean {
    return this.isMetadataInitialized;
  }
  
  /**
   * Determine which node is the coordinator for a specific group
   * @param groupId The consumer group ID
   */
  public findCoordinatorNode(groupId: string): number {
    // In a real implementation, this would use the FindCoordinator API
    // For now, we'll just return the controller ID if available, or the first broker
    if (this.controllerId >= 0) {
      return this.controllerId;
    }
    
    const brokers = this.getAllBrokers();
    if (brokers.length > 0) {
      return brokers[0].nodeId;
    }
    
    throw new KafkaError('No brokers available to find coordinator');
  }
}
