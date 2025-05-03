export interface Callback {
    /**
     * Called when the send operation completes.
     * @param error The error that occurred, if any
     * @param result The result of the send operation
     */
    onCompletion(error: Error | null, result: RecordMetadata | null): void;
  }
  
  /**
   * Metadata for a record that has been sent to Kafka
   */
  export class RecordMetadata {
    constructor(
      /**
       * The topic the record was sent to
       */
      public readonly topic: string,
      /**
       * The partition the record was sent to
       */
      public readonly partition: number,
      /**
       * The offset of the record in the partition
       */
      public readonly offset: number,
      /**
       * The timestamp of the record
       */
      public readonly timestamp: number
    ) {}
  }
  