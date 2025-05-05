import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { IntegerSerializer } from './IntegerSerializer';
import { IntegerDeserializer } from './IntegerDeserializer';

/**
 * Serde for integer data
 */
export class IntegerSerde extends AbstractSerde<number> {
  private static instance: IntegerSerde;
  private readonly integerSerializer: IntegerSerializer;
  private readonly integerDeserializer: IntegerDeserializer;
  
  constructor() {
    super();
    this.integerSerializer = new IntegerSerializer();
    this.integerDeserializer = new IntegerDeserializer();
  }
  
  /**
   * Gets the singleton instance of this serde
   */
  public static get(): IntegerSerde {
    if (!IntegerSerde.instance) {
      IntegerSerde.instance = new IntegerSerde();
    }
    return IntegerSerde.instance;
  }
  
  serializer(): Serializer<number> {
    return this.integerSerializer;
  }
  
  deserializer(): Deserializer<number> {
    return this.integerDeserializer;
  }
}
