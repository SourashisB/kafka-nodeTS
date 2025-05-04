export class NewTopic {
    /**
     * Replica assignment map from partition to replicas
     */
    private replicaAssignments: Map<number, number[]> = new Map();
    
    /**
     * Topic configuration entries
     */
    private configs: Map<string, string> = new Map();
    
    constructor(
      /**
       * The name of the topic to create
       */
      public readonly name: string,
      /**
       * The number of partitions for the topic
       */
      public readonly numPartitions: number,
      /**
       * The replication factor for the topic
       */
      public readonly replicationFactor: number
    ) {
      if (numPartitions <= 0) {
        throw new Error('numPartitions must be positive');
      }
      
      if (replicationFactor <= 0) {
        throw new Error('replicationFactor must be positive');
      }
    }
    
    /**
     * Set the assignment of replicas to partitions
     * @param partition The partition index
     * @param replicas Array of broker ids to assign as replicas
     */
    public assignReplicas(partition: number, replicas: number[]): NewTopic {
      if (partition < 0 || partition >= this.numPartitions) {
        throw new Error(`Partition ${partition} is out of range (0-${this.numPartitions - 1})`);
      }
      
      if (replicas.length === 0) {
        throw new Error('Replica assignment cannot be empty');
      }
      
      this.replicaAssignments.set(partition, [...replicas]);
      return this;
    }
    
    /**
     * Get the replica assignments
     */
    public getReplicaAssignments(): Map<number, number[]> {
      return new Map(this.replicaAssignments);
    }
    
    /**
     * Set the configuration for the topic
     * @param key Configuration key
     * @param value Configuration value
     */
    public setConfig(key: string, value: string): NewTopic {
      this.configs.set(key, value);
      return this;
    }
    
    /**
     * Set multiple configuration entries at once
     * @param configs Configuration entries
     */
    public setConfigs(configs: Record<string, string>): NewTopic {
      for (const [key, value] of Object.entries(configs)) {
        this.configs.set(key, value);
      }
      return this;
    }
    
    /**
     * Get the topic configurations
     */
    public getConfigs(): Map<string, string> {
      return new Map(this.configs);
    }
    
    /**
     * Convert the NewTopic to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      const result: Record<string, any> = {
        name: this.name,
        numPartitions: this.numPartitions,
        replicationFactor: this.replicationFactor,
        configs: Object.fromEntries(this.configs),
      };
      
      if (this.replicaAssignments.size > 0) {
        result.replicaAssignments = Object.fromEntries(this.replicaAssignments);
      }
      
      return result;
    }
  }
  