import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';

/**
 * Deserializer for byte arrays (pass-through)
 */
export class ByteArrayDeserializer implements Deserializer<Buffer> {
  /**
   * Deserializes byte array data (essentially a pass-through)
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The same byte array
   */
  deserialize(topic: string | null, data: Buffer): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    return Buffer.from(data);
  }
}
