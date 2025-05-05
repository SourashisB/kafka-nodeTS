import { Serializer } from './Serializer';
import { Buffer, BufferEncoding } from 'buffer';
/**
 * Serializer for string data
 */
export class StringSerializer implements Serializer<string> {
  private encoding: BufferEncoding = 'utf8';
  
  /**
   * Configure this serializer
   * @param configs Configuration settings
   * @param isKey Whether this serializer is for keys
   */
  configure(configs: Record<string, any>, isKey: boolean): void {
    // Check if an encoding is specified in the configs
    const encodingConfig = isKey ? configs['key.serializer.encoding'] : configs['value.serializer.encoding'];
    if (encodingConfig) {
      this.encoding = encodingConfig as BufferEncoding;
    }
  }
  
  /**
   * Serializes string data to a byte array
   * @param topic The topic associated with the data (not used)
   * @param data The string to serialize
   * @returns The serialized byte array
   */
  serialize(topic: string | null, data: string): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    return Buffer.from(data, this.encoding);
  }
}