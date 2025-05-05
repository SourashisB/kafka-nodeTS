import { Serializer } from './Serializer';
import { Buffer } from 'buffer';

/**
 * Serializer for integer data
 */
export class IntegerSerializer implements Serializer<number> {
  /**
   * Serializes an integer to a 4-byte array
   * @param topic The topic associated with the data (not used)
   * @param data The integer to serialize
   * @returns The serialized byte array
   */
  serialize(topic: string | null, data: number): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(data, 0);
    return buffer;
  }
}
