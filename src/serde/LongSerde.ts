import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { LongSerializer } from './LongSerializer';
import { LongDeserializer } from './LongDeserializer';

/**
 * Serde for long (bigint) data
 */
export class LongSerde extends AbstractSerde<bigint> {
  private static instance: LongSerde;
  private readonly longSerializer: LongSerializer;
  private readonly longDeserializer: LongDeserializer;
  
  constructor() {
    super();
    this.longSerializer = new LongSerializer();
    this.longDeserializer = new LongDeserializer();
  }
  
  /**
   * Gets the singleton instance of this serde
   */
  public static get(): LongSerde {
    if (!LongSerde.instance) {
      LongSerde.instance = new LongSerde();
    }
    return LongSerde.instance;
  }
  
  serializer(): Serializer<bigint> {
    return this.longSerializer;
  }
  
  deserializer(): Deserializer<bigint> {
    return this.longDeserializer;
  }
}