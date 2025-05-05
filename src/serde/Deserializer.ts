import { Buffer } from 'buffer';
/**
 * A Kafka deserializer interface for converting byte arrays back to objects
 */
export interface Deserializer<T> {
    /**
     * Convert a byte array to an object
     * @param topic The topic associated with the data (can be null)
     * @param data The byte array to convert
     * @returns The deserialized object
     */
    deserialize(topic: string | null, data: Buffer): T;
    
    /**
     * Configure this deserializer
     * @param configs Configuration settings
     * @param isKey Whether the deserializer is for keys or values
     */
    configure?(configs: Record<string, any>, isKey: boolean): void;
    
    /**
     * Close this deserializer
     */
    close?(): void;
  }