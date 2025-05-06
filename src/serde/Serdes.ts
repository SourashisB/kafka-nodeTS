import { Serde } from './Serde';
import { ByteArraySerde } from './ByteArraySerde';
import { StringSerde } from './StringSerde';
import { IntegerSerde } from './IntegerSerde';
import { LongSerde } from './LongSerde';
import { DoubleSerde } from './DoubleSerde';
import { JsonSerde } from './JsonSerde';
import { Serializer } from './Serializer';
import { Deserializer } from './Deserializer';
import { Buffer } from 'buffer';

/**
 * Factory for common Serde instances
 */
export class Serdes {
  /**
   * Get a serde for byte arrays
   */
  public static ByteArray(): Serde<Buffer> {
    return ByteArraySerde.get();
  }
  
  /**
   * Get a serde for strings
   */
  public static String(): Serde<string> {
    return StringSerde.get();
  }
  
  /**
   * Get a serde for integers
   */
  public static Integer(): Serde<number> {
    return IntegerSerde.get();
  }
  
  /**
   * Get a serde for long integers (bigint)
   */
  public static Long(): Serde<bigint> {
    return LongSerde.get();
  }
  
  /**
   * Get a serde for double-precision floating point values
   */
  public static Double(): Serde<number> {
    return DoubleSerde.get();
  }
  
  /**
   * Get a new serde for JSON data
   */
  public static Json<T = any>(): Serde<T> {
    return new JsonSerde<T>();
  }
  
  /**
   * Create a serde pair from a serializer and a deserializer
   * @param serializer The serializer
   * @param deserializer The deserializer
   */
  public static serdeFrom<T>(
    serializer: Serializer<T>,
    deserializer: Deserializer<T>
  ): Serde<T> {
    return {
      serializer: () => serializer,
      deserializer: () => deserializer,
      configure: (configs: Record<string, any>, isKey: boolean) => {
        if (serializer.configure) {
          serializer.configure(configs, isKey);
        }
        if (deserializer.configure) {
          deserializer.configure(configs, isKey);
        }
      },
      close: () => {
        if (serializer.close) {
          serializer.close();
        }
        if (deserializer.close) {
          deserializer.close();
        }
      }
    };
  }
}