export class TopicDescription {
    constructor(
      /**
       * The name of the topic
       */
      public readonly name: string,
      /**
       * The topic partitions
       */
      public readonly partitions: PartitionInfo[],
      /**
       * Whether the topic is internal
       */
      public readonly isInternal: boolean,
      /**
       * The authorized operations for this topic, if requested
       */
      public readonly authorizedOperations?: string[]
    ) {}
    
    /**
     * Convert the TopicDescription to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      const result: Record<string, any> = {
        name: this.name,
        partitions: this.partitions,
        isInternal: this.isInternal
      };
      
      if (this.authorizedOperations) {
        result.authorizedOperations = this.authorizedOperations;
      }
      
      return result;
    }
  }
  
  /**
   * Information about a partition
   */
  export class PartitionInfo {
    constructor(
      /**
       * The topic name
       */
      public readonly topic: string,
      /**
       * The partition number
       */
      public readonly partition: number,
      /**
       * The leader broker
       */
      public readonly leader: Node,
      /**
       * List of all replicas for this partition
       */
      public readonly replicas: Node[],
      /**
       * List of in-sync replicas for this partition
       */
      public readonly isr: Node[]
    ) {}
    
    /**
     * Convert the PartitionInfo to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      return {
        topic: this.topic,
        partition: this.partition,
        leader: this.leader,
        replicas: this.replicas,
        isr: this.isr
      };
    }
  }
  
  /**
   * Information about a Kafka broker node
   */
  export class Node {
    constructor(
      /**
       * The node id
       */
      public readonly id: number,
      /**
       * The host name
       */
      public readonly host: string,
      /**
       * The port
       */
      public readonly port: number,
      /**
       * The rack the node belongs to
       */
      public readonly rack?: string
    ) {}
    
    /**
     * Convert the Node to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      const result: Record<string, any> = {
        id: this.id,
        host: this.host,
        port: this.port
      };
      
      if (this.rack) {
        result.rack = this.rack;
      }
      
      return result;
    }
  }
  