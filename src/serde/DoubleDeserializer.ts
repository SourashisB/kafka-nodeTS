import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';

/**
 * Deserializer for double-precision floating point data
 */
export class DoubleDeserializer implements Deserializer<number> {
  /**
   * Deserializes an 8-byte array to a double
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The deserialized double
   */
  deserialize(topic: string | null, data: Buffer): number {
    if (data === null || data.length === 0) {
      return 0;
    }
    
    if (data.length !== 8) {
      throw new Error(`Size of data received by DoubleDeserializer is not 8 bytes (got ${data.length} bytes)`);
    }
    
    return data.readDoubleBE(0);
  }
}