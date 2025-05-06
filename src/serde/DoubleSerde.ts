import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { DoubleSerializer } from './DoubleSerializer';
import { DoubleDeserializer } from './DoubleDeserializer';

/**
 * Serde for double-precision floating point data
 */
export class DoubleSerde extends AbstractSerde<number> {
  private static instance: DoubleSerde;
  private readonly doubleSerializer: DoubleSerializer;
  private readonly doubleDeserializer: DoubleDeserializer;
  
  constructor() {
    super();
    this.doubleSerializer = new DoubleSerializer();
    this.doubleDeserializer = new DoubleDeserializer();
  }
  
  /**
   * Gets the singleton instance of this serde
   */
  public static get(): DoubleSerde {
    if (!DoubleSerde.instance) {
      DoubleSerde.instance = new DoubleSerde();
    }
    return DoubleSerde.instance;
  }
  
  serializer(): Serializer<number> {
    return this.doubleSerializer;
  }
  
  deserializer(): Deserializer<number> {
    return this.doubleDeserializer;
  }
}