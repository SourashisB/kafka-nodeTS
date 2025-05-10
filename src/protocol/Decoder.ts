import { BasicTypes } from './types/BasicTypes';

/**
 * A class for decoding Kafka protocol data
 */
export class Decoder {
  private buffer: Buffer;
  private offset: number;

  /**
   * Creates a new decoder
   */
  constructor(buffer: Buffer) {
    this.buffer = buffer;
    this.offset = 0;
  }

  /**
   * Gets the current offset
   */
  public getOffset(): number {
    return this.offset;
  }

  /**
   * Gets the remaining bytes
   */
  public remaining(): number {
    return this.buffer.length - this.offset;
  }

  /**
   * Reads a boolean
   */
  public readBoolean(): boolean {
    const [value, newOffset] = BasicTypes.decodeBoolean(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an Int8
   */
  public readInt8(): number {
    const [value, newOffset] = BasicTypes.decodeInt8(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an Int16
   */
  public readInt16(): number {
    const [value, newOffset] = BasicTypes.decodeInt16(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an Int32
   */
  public readInt32(): number {
    const [value, newOffset] = BasicTypes.decodeInt32(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an Int64
   */
  public readInt64(): bigint {
    const [value, newOffset] = BasicTypes.decodeInt64(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an UInt8
   */
  public readUInt8(): number {
    const [value, newOffset] = BasicTypes.decodeUInt8(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an UInt16
   */
  public readUInt16(): number {
    const [value, newOffset] = BasicTypes.decodeUInt16(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an UInt32
   */
  public readUInt32(): number {
    const [value, newOffset] = BasicTypes.decodeUInt32(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an UInt64
   */
  public readUInt64(): bigint {
    const [value, newOffset] = BasicTypes.decodeUInt64(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads a float
   */
  public readFloat(): number {
    const [value, newOffset] = BasicTypes.decodeFloat(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads a double
   */
  public readDouble(): number {
    const [value, newOffset] = BasicTypes.decodeDouble(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads a string
   */
  public readString(): string | null {
    const [value, newOffset] = BasicTypes.decodeString(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads a compact string
   */
  public readCompactString(): string | null {
    const [value, newOffset] = BasicTypes.decodeCompactString(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads bytes
   */
  public readBytes(): Buffer | null {
    const [value, newOffset] = BasicTypes.decodeBytes(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads compact bytes
   */
  public readCompactBytes(): Buffer | null {
    const [value, newOffset] = BasicTypes.decodeCompactBytes(this.buffer, this.offset);
    this.offset = newOffset;
    return value;
  }

  /**
   * Reads an array
   */
  public readArray<T>(readElement: (decoder: Decoder) => T): T[] | null {
    const length = this.readInt32();
    if (length < 0) {
      return null;
    }

    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      result.push(readElement(this));
    }
    return result;
  }

  /**
   * Reads a compact array
   */
  public readCompactArray<T>(readElement: (decoder: Decoder) => T): T[] | null {
    let length = 0;
    let byteRead = 0;
    let shift = 0;
    
    do {
      byteRead = this.readUInt8();
      length |= (byteRead & 0x7F) << shift;
      shift += 7;
    } while (byteRead & 0x80);
    
    if (length === 0) {
      return null;
    }
    
    // Subtract 1 to get the actual length (as per Kafka protocol)
    length -= 1;

    const result: T[] = [];
    for (let i = 0; i < length; i++) {
      result.push(readElement(this));
    }
    return result;
  }

  /**
   * Reads raw bytes without changing the offset
   */
  public peek(length: number): Buffer {
    return this.buffer.slice(this.offset, this.offset + length);
  }

  /**
   * Skips a number of bytes
   */
  public skip(length: number): void {
    this.offset += length;
  }

  /**
   * Returns the raw buffer
   */
  public getBuffer(): Buffer {
    return this.buffer;
  }
}
