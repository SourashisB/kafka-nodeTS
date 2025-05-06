import { AbstractSerde } from './Serde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { JsonSerializer } from './JsonSerializer';
import { JsonDeserializer } from './JsonDeserializer';

/**
 * Serde for JSON data
 */
export class JsonSerde<T = any> extends AbstractSerde<T> {
  private readonly jsonSerializer: JsonSerializer<T>;
  private readonly jsonDeserializer: JsonDeserializer<T>;
  
  constructor() {
    super();
    this.jsonSerializer = new JsonSerializer<T>();
    this.jsonDeserializer = new JsonDeserializer<T>();
  }
  
  serializer(): Serializer<T> {
    return this.jsonSerializer;
  }
  
  deserializer(): Deserializer<T> {
    return this.jsonDeserializer;
  }
}