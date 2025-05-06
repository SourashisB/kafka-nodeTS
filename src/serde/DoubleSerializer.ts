import { Serializer } from './Serializer';
import { Buffer } from 'buffer';

/**
 * Serializer for double-precision floating point data
 */
export class DoubleSerializer implements Serializer<number> {
  /**
   * Serializes a double to an 8-byte array
   * @param topic The topic associated with the data (not used)
   * @param data The double to serialize
   * @returns The serialized byte array
   */
  serialize(topic: string | null, data: number): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleBE(data, 0);
    return buffer;
  }
}