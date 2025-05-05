import { Deserializer } from './Deserializer';
import { Buffer, BufferEncoding } from 'buffer';

/**
 * Deserializer for string data
 */
export class StringDeserializer implements Deserializer<string> {
  private encoding: BufferEncoding = 'utf8';
  
  /**
   * Configure this deserializer
   * @param configs Configuration settings
   * @param isKey Whether this deserializer is for keys
   */
  configure(configs: Record<string, any>, isKey: boolean): void {
    // Check if an encoding is specified in the configs
    const encodingConfig = isKey ? configs['key.deserializer.encoding'] : configs['value.deserializer.encoding'];
    if (encodingConfig) {
      this.encoding = encodingConfig as BufferEncoding;
    }
  }
  
  /**
   * Deserializes a byte array to a string
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The deserialized string
   */
  deserialize(topic: string | null, data: Buffer): string {
    if (data === null || data.length === 0) {
      return '';
    }
    
    return data.toString(this.encoding);
  }
}