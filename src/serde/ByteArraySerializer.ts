import { Serializer } from './Serializer';
import Buffer from 'buffer';
/**
 * Serializer for byte arrays (pass-through)
 */
export class ByteArraySerializer implements Serializer<Buffer> {
  /**
   * Serializes byte array data (essentially a pass-through)
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to serialize
   * @returns The same byte array
   */
  serialize(topic: string | null, data: Buffer): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    return Buffer.from(data);
  }
}
