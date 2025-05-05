import { Buffer } from 'buffer';
/**
 * A Kafka serializer interface for converting objects to byte arrays
 */
export interface Serializer<T> {
    /**
     * Convert an object to a byte array
     * @param topic The topic associated with the data (can be null)
     * @param data The object to convert
     * @returns The serialized byte array
     */
    serialize(topic: string | null, data: T): Buffer;
    
    /**
     * Configure this serializer
     * @param configs Configuration settings
     * @param isKey Whether the serializer is for keys or values
     */
    configure?(configs: Record<string, any>, isKey: boolean): void;
    
    /**
     * Close this serializer
     */
    close?(): void;
  }