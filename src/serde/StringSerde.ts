import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { StringSerializer } from './StringSerializer';
import { StringDeserializer } from './StringDeserializer';

/**
 * Serde for string data
 */
export class StringSerde extends AbstractSerde<string> {
  private static instance: StringSerde;
  private readonly stringSerializer: StringSerializer;
  private readonly stringDeserializer: StringDeserializer;
  
  constructor() {
    super();
    this.stringSerializer = new StringSerializer();
    this.stringDeserializer = new StringDeserializer();
  }
  
  /**
   * Gets the singleton instance of this serde
   */
  public static get(): StringSerde {
    if (!StringSerde.instance) {
      StringSerde.instance = new StringSerde();
    }
    return StringSerde.instance;
  }
  
  serializer(): Serializer<string> {
    return this.stringSerializer;
  }
  
  deserializer(): Deserializer<string> {
    return this.stringDeserializer;
  }
  
  configure(configs: Record<string, any>, isKey: boolean): void {
    this.stringSerializer.configure(configs, isKey);
    this.stringDeserializer.configure(configs, isKey);
  }
}
