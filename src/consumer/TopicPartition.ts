export class TopicPartition {
    constructor(
      /**
       * The topic name
       */
      public readonly topic: string,
      /**
       * The partition number
       */
      public readonly partition: number
    ) {}
  
    /**
     * Returns a string representation of this topic-partition
     */
    public toString(): string {
      return `${this.topic}-${this.partition}`;
    }
  }
  