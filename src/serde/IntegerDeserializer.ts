import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';

/**
 * Deserializer for integer data
 */
export class IntegerDeserializer implements Deserializer<number> {
  /**
   * Deserializes a 4-byte array to an integer
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The deserialized integer
   */
  deserialize(topic: string | null, data: Buffer): number {
    if (data === null || data.length === 0) {
      return 0;
    }
    
    if (data.length !== 4) {
      throw new Error(`Size of data received by IntegerDeserializer is not 4 bytes (got ${data.length} bytes)`);
    }
    
    return data.readInt32BE(0);
  }
}