import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { ByteArraySerializer } from './ByteArraySerializer';
import { ByteArrayDeserializer } from './ByteArrayDeserializer';
import { Buffer } from 'buffer';

/**
 * Serde for byte arrays
 */
export class ByteArraySerde extends AbstractSerde<Buffer> {
  private static instance: ByteArraySerde;
  private readonly byteArraySerializer: ByteArraySerializer;
  private readonly byteArrayDeserializer: ByteArrayDeserializer;
  
  constructor() {
    super();
    this.byteArraySerializer = new ByteArraySerializer();
    this.byteArrayDeserializer = new ByteArrayDeserializer();
  }
  
  /**
   * Gets the singleton instance of this serde
   */
  public static get(): ByteArraySerde {
    if (!ByteArraySerde.instance) {
      ByteArraySerde.instance = new ByteArraySerde();
    }
    return ByteArraySerde.instance;
  }
  
  serializer(): Serializer<Buffer> {
    return this.byteArraySerializer;
  }
  
  deserializer(): Deserializer<Buffer> {
    return this.byteArrayDeserializer;
  }
}