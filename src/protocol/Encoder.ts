import { BasicTypes } from './types/BasicTypes';
import { Buffer } from 'buffer';

/**
 * A class for encoding Kafka protocol data
 */
export class Encoder {
  private buffers: Buffer[] = [];
  private size: number = 0;

  /**
   * Writes a boolean
   */
  public writeBoolean(value: boolean): this {
    const buffer = BasicTypes.encodeBoolean(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an Int8
   */
  public writeInt8(value: number): this {
    const buffer = BasicTypes.encodeInt8(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an Int16
   */
  public writeInt16(value: number): this {
    const buffer = BasicTypes.encodeInt16(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an Int32
   */
  public writeInt32(value: number): this {
    const buffer = BasicTypes.encodeInt32(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an Int64
   */
  public writeInt64(value: bigint): this {
    const buffer = BasicTypes.encodeInt64(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an UInt8
   */
  public writeUInt8(value: number): this {
    const buffer = BasicTypes.encodeUInt8(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an UInt16
   */
  public writeUInt16(value: number): this {
    const buffer = BasicTypes.encodeUInt16(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an UInt32
   */
  public writeUInt32(value: number): this {
    const buffer = BasicTypes.encodeUInt32(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an UInt64
   */
  public writeUInt64(value: bigint): this {
    const buffer = BasicTypes.encodeUInt64(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes a float
   */
  public writeFloat(value: number): this {
    const buffer = BasicTypes.encodeFloat(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes a double
   */
  public writeDouble(value: number): this {
    const buffer = BasicTypes.encodeDouble(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes a string
   */
  public writeString(value: string | null): this {
    const buffer = BasicTypes.encodeString(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes a compact string
   */
  public writeCompactString(value: string | null): this {
    const buffer = BasicTypes.encodeCompactString(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes bytes
   */
  public writeBytes(value: Buffer | null): this {
    const buffer = BasicTypes.encodeBytes(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes compact bytes
   */
  public writeCompactBytes(value: Buffer | null): this {
    const buffer = BasicTypes.encodeCompactBytes(value);
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Writes an array
   */
  public writeArray<T>(
    values: T[] | null,
    writeElement: (encoder: Encoder, value: T) => void
  ): this {
    if (values === null) {
      this.writeInt32(-1);
      return this;
    }

    this.writeInt32(values.length);
    for (const value of values) {
      writeElement(this, value);
    }
    return this;
  }

  /**
   * Writes a compact array
   */
  public writeCompactArray<T>(
    values: T[] | null,
    writeElement: (encoder: Encoder, value: T) => void
  ): this {
    if (values === null) {
      this.writeUInt8(0);
      return this;
    }

    // Compact encoding adds 1 to the actual length
    const encodedLength = values.length + 1;
    
    // Write the length in a variable-length format
    let len = encodedLength;
    while (len > 127) {
      this.writeUInt8((len & 0x7F) | 0x80);
      len = len >> 7;
    }
    this.writeUInt8(len & 0x7F);

    for (const value of values) {
      writeElement(this, value);
    }
    return this;
  }

  /**
   * Writes raw bytes
   */
  public writeBuffer(buffer: Buffer): this {
    this.buffers.push(buffer);
    this.size += buffer.length;
    return this;
  }

  /**
   * Gets the size of the encoded data
   */
  public getSize(): number {
    return this.size;
  }

  /**
   * Builds the final buffer
   */
  public build(): Buffer {
    return Buffer.concat(this.buffers, this.size);
  }
}
