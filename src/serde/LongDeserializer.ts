import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';
/**
 * Deserializer for long (bigint) data
 */
export class LongDeserializer implements Deserializer<bigint> {
  /**
   * Deserializes an 8-byte array to a long/bigint
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The deserialized long/bigint
   */
  deserialize(topic: string | null, data: Buffer): bigint {
    if (data === null || data.length === 0) {
      return BigInt(0);
    }
    
    if (data.length !== 8) {
      throw new Error(`Size of data received by LongDeserializer is not 8 bytes (got ${data.length} bytes)`);
    }
    
    return data.readBigInt64BE(0);
  }
}
