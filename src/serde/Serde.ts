import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';

/**
 * A serializer/deserializer pair for a specific data type
 */
export interface Serde<T> {
  /**
   * The serializer for converting objects to byte arrays
   */
  serializer(): Serializer<T>;
  
  /**
   * The deserializer for converting byte arrays back to objects
   */
  deserializer(): Deserializer<T>;
  
  /**
   * Configure this serde
   * @param configs Configuration settings
   * @param isKey Whether the serde is for keys or values
   */
  configure?(configs: Record<string, any>, isKey: boolean): void;
  
  /**
   * Close this serde
   */
  close?(): void;
}

/**
 * Base implementation of Serde interface
 */
export abstract class AbstractSerde<T> implements Serde<T> {
  abstract serializer(): Serializer<T>;
  abstract deserializer(): Deserializer<T>;
  
  configure(configs: Record<string, any>, isKey: boolean): void {
    const serializer = this.serializer();
    if (serializer.configure) {
      serializer.configure(configs, isKey);
    }
    
    const deserializer = this.deserializer();
    if (deserializer.configure) {
      deserializer.configure(configs, isKey);
    }
  }
  
  close(): void {
    const serializer = this.serializer();
    if (serializer.close) {
      serializer.close();
    }
    
    const deserializer = this.deserializer();
    if (deserializer.close) {
      deserializer.close();
    }
  }
}
