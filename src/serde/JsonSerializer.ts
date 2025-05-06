import { Serializer } from './Serializer';
import { Buffer } from 'buffer';

/**
 * Serializer for JSON data
 */
export class JsonSerializer<T = any> implements Serializer<T> {
  /**
   * Serializes an object to a JSON string and then to a byte array
   * @param topic The topic associated with the data (not used)
   * @param data The object to serialize
   * @returns The serialized byte array
   */
  serialize(topic: string | null, data: T): Buffer {
    if (data === null) {
      return Buffer.alloc(0);
    }
    
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString, 'utf8');
  }
}