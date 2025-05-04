import {Buffer} from 'buffer';
export class ProducerRecord<K, V> {
    constructor(
      /**
       * The topic to which the record will be sent
       */
      public readonly topic: string,
      /**
       * The record value
       */
      public readonly value: V,
      /**
       * Optional key that can be used for partitioning
       */
      public readonly key?: K,
      /**
       * Optional partition number
       * If not specified, the producer will determine the partition based on the key
       */
      public readonly partition?: number,
      /**
       * Optional timestamp (milliseconds since epoch)
       * If not specified, the current time will be used
       */
      public readonly timestamp?: number,
      /**
       * Optional record headers
       */
      public readonly headers?: Record<string, string | Buffer>
    ) {}
  }
  