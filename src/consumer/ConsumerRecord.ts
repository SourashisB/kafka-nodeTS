import {Buffer} from 'buffer';
export class ConsumerRecord<K, V> {
    constructor(
      /**
       * The topic this record is received from
       */
      public readonly topic: string,
      /**
       * The partition from which this record is received
       */
      public readonly partition: number,
      /**
       * The position of this record in the corresponding Kafka partition
       */
      public readonly offset: number,
      /**
       * The record timestamp
       */
      public readonly timestamp: number,
      /**
       * The timestamp type (CreateTime or LogAppendTime)
       */
      public readonly timestampType: 'CreateTime' | 'LogAppendTime',
      /**
       * The record key (can be null)
       */
      public readonly key: K | null,
      /**
       * The record value (can be null)
       */
      public readonly value: V | null,
      /**
       * The CRC32 checksum for the record
       */
      public readonly checksum?: number,
      /**
       * Additional headers associated with the record
       */
      public readonly headers?: Record<string, string | Buffer>
    ) {}
  }