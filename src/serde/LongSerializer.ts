import { Serializer } from './Serializer';
import { Buffer } from 'buffer';
/**
 * Serializer for long (bigint) data
 */
export class LongSerializer implements Serializer<bigint> {
  /**
   * Serializes a long/bigint to an 8-byte array
   * @param topic The topic associated with the data (not used)
   * @param data The long to serialize
   * @returns The serialized byte array
   */
  serialize(topic: string | null, data: bigint): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(data, 0);
    return buffer;
  }
}
