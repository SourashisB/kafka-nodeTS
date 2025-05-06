import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';

/**
 * Deserializer for JSON data
 */
export class JsonDeserializer<T = any> implements Deserializer<T> {
  /**
   * Deserializes a byte array to a JSON string and then to an object
   * @param topic The topic associated with the data (not used)
   * @param data The byte array to deserialize
   * @returns The deserialized object
   */
  deserialize(topic: string | null, data: Buffer): T {
    if (data === null || data.length === 0) {
      return null as unknown as T;
    }
    
    const jsonString = data.toString('utf8');
    return JSON.parse(jsonString) as T;
  }
}