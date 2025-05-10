/**
 * Basic protocol types for Kafka protocol serialization and deserialization
 */
export class BasicTypes {
  /**
   * Encodes a boolean value
   */
  static encodeBoolean(value: boolean): Buffer {
    const buffer = Buffer.alloc(1);
    buffer.writeInt8(value ? 1 : 0, 0);
    return buffer;
  }

  /**
   * Decodes a boolean value
   */
  static decodeBoolean(buffer: Buffer, offset = 0): [boolean, number] {
    const value = buffer.readInt8(offset) !== 0;
    return [value, offset + 1];
  }

  /**
   * Encodes an Int8 value
   */
  static encodeInt8(value: number): Buffer {
    const buffer = Buffer.alloc(1);
    buffer.writeInt8(value, 0);
    return buffer;
  }

  /**
   * Decodes an Int8 value
   */
  static decodeInt8(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readInt8(offset);
    return [value, offset + 1];
  }

  /**
   * Encodes an Int16 value
   */
  static encodeInt16(value: number): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an Int16 value
   */
  static decodeInt16(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readInt16BE(offset);
    return [value, offset + 2];
  }

  /**
   * Encodes an Int32 value
   */
  static encodeInt32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an Int32 value
   */
  static decodeInt32(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readInt32BE(offset);
    return [value, offset + 4];
  }

  /**
   * Encodes an Int64 value (uses BigInt)
   */
  static encodeInt64(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an Int64 value (returns BigInt)
   */
  static decodeInt64(buffer: Buffer, offset = 0): [bigint, number] {
    const value = buffer.readBigInt64BE(offset);
    return [value, offset + 8];
  }

  /**
   * Encodes an UInt8 value
   */
  static encodeUInt8(value: number): Buffer {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(value, 0);
    return buffer;
  }

  /**
   * Decodes an UInt8 value
   */
  static decodeUInt8(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readUInt8(offset);
    return [value, offset + 1];
  }

  /**
   * Encodes an UInt16 value
   */
  static encodeUInt16(value: number): Buffer {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an UInt16 value
   */
  static decodeUInt16(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readUInt16BE(offset);
    return [value, offset + 2];
  }

  /**
   * Encodes an UInt32 value
   */
  static encodeUInt32(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeUInt32BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an UInt32 value
   */
  static decodeUInt32(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readUInt32BE(offset);
    return [value, offset + 4];
  }

  /**
   * Encodes an UInt64 value (uses BigInt)
   */
  static encodeUInt64(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(value, 0);
    return buffer;
  }

  /**
   * Decodes an UInt64 value (returns BigInt)
   */
  static decodeUInt64(buffer: Buffer, offset = 0): [bigint, number] {
    const value = buffer.readBigUInt64BE(offset);
    return [value, offset + 8];
  }

  /**
   * Encodes a float value
   */
  static encodeFloat(value: number): Buffer {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatBE(value, 0);
    return buffer;
  }

  /**
   * Decodes a float value
   */
  static decodeFloat(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readFloatBE(offset);
    return [value, offset + 4];
  }

  /**
   * Encodes a double value
   */
  static encodeDouble(value: number): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeDoubleBE(value, 0);
    return buffer;
  }

  /**
   * Decodes a double value
   */
  static decodeDouble(buffer: Buffer, offset = 0): [number, number] {
    const value = buffer.readDoubleBE(offset);
    return [value, offset + 8];
  }

  /**
   * Encodes a string (nullable)
   */
  static encodeString(value: string | null): Buffer {
    if (value === null) {
      return Buffer.from([0xFF, 0xFF]); // -1 as Int16 for null
    }

    const length = Buffer.byteLength(value);
    const buffer = Buffer.alloc(2 + length);
    buffer.writeInt16BE(length, 0);
    buffer.write(value, 2);
    return buffer;
  }

  /**
   * Decodes a string (nullable)
   */
  static decodeString(buffer: Buffer, offset = 0): [string | null, number] {
    const length = buffer.readInt16BE(offset);
    offset += 2;

    if (length < 0) {
      return [null, offset];
    }

    const value = buffer.toString('utf8', offset, offset + length);
    return [value, offset + length];
  }

  /**
   * Encodes a compact string (nullable)
   * Compact strings use a variable-length encoding for the length
   */
  static encodeCompactString(value: string | null): Buffer {
    if (value === null) {
      return Buffer.from([0x00]); // 0 for null
    }

    const length = Buffer.byteLength(value);
    // Compact encoding adds 1 to the actual length
    const encodedLength = length + 1;
    
    // Determine how many bytes we need for the length
    let sizeOfLength = 1;
    let len = encodedLength;
    while (len > 127) {
      sizeOfLength++;
      len = len >> 7;
    }
    
    const buffer = Buffer.alloc(sizeOfLength + length);
    
    // Write the length in a variable-length format
    let idx = 0;
    len = encodedLength;
    while (len > 127) {
      buffer[idx++] = (len & 0x7F) | 0x80;
      len = len >> 7;
    }
    buffer[idx++] = len & 0x7F;
    
    // Write the string data
    buffer.write(value, idx);
    return buffer;
  }

  /**
   * Decodes a compact string (nullable)
   */
  static decodeCompactString(buffer: Buffer, offset = 0): [string | null, number] {
    let length = 0;
    let byteRead = 0;
    let shift = 0;
    
    do {
      byteRead = buffer.readUInt8(offset++);
      length |= (byteRead & 0x7F) << shift;
      shift += 7;
    } while (byteRead & 0x80);
    
    if (length === 0) {
      return [null, offset];
    }
    
    // Subtract 1 to get the actual length (as per Kafka protocol)
    length -= 1;
    
    const value = buffer.toString('utf8', offset, offset + length);
    return [value, offset + length];
  }

  /**
   * Encodes a bytes array (nullable)
   */
  static encodeBytes(value: Buffer | null): Buffer {
    if (value === null) {
      return Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]); // -1 as Int32 for null
    }

    const length = value.length;
    const buffer = Buffer.alloc(4 + length);
    buffer.writeInt32BE(length, 0);
    value.copy(buffer, 4);
    return buffer;
  }

  /**
   * Decodes a bytes array (nullable)
   */
  static decodeBytes(buffer: Buffer, offset = 0): [Buffer | null, number] {
    const length = buffer.readInt32BE(offset);
    offset += 4;

    if (length < 0) {
      return [null, offset];
    }

    const value = Buffer.from(buffer.slice(offset, offset + length));
    return [value, offset + length];
  }

  /**
   * Encodes a compact bytes array (nullable)
   */
  static encodeCompactBytes(value: Buffer | null): Buffer {
    if (value === null) {
      return Buffer.from([0x00]); // 0 for null
    }

    const length = value.length;
    // Compact encoding adds 1 to the actual length
    const encodedLength = length + 1;
    
    // Determine how many bytes we need for the length
    let sizeOfLength = 1;
    let len = encodedLength;
    while (len > 127) {
      sizeOfLength++;
      len = len >> 7;
    }
    
    const buffer = Buffer.alloc(sizeOfLength + length);
    
    // Write the length in a variable-length format
    let idx = 0;
    len = encodedLength;
    while (len > 127) {
      buffer[idx++] = (len & 0x7F) | 0x80;
      len = len >> 7;
    }
    buffer[idx++] = len & 0x7F;
    
    // Write the bytes data
    value.copy(buffer, idx);
    return buffer;
  }

  /**
   * Decodes a compact bytes array (nullable)
   */
  static decodeCompactBytes(buffer: Buffer, offset = 0): [Buffer | null, number] {
    let length = 0;
    let byteRead = 0;
    let shift = 0;
    
    do {
      byteRead = buffer.readUInt8(offset++);
      length |= (byteRead & 0x7F) << shift;
      shift += 7;
    } while (byteRead & 0x80);
    
    if (length === 0) {
      return [null, offset];
    }
    
    // Subtract 1 to get the actual length (as per Kafka protocol)
    length -= 1;
    
    const value = Buffer.from(buffer.slice(offset, offset + length));
    return [value, offset + length];
  }

  /**
   * Encodes an array of values
   */
  static encodeArray<T>(
    values: T[] | null,
    encodeFunc: (value: T) => Buffer
  ): Buffer {
    if (values === null) {
      return Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]); // -1 as Int32 for null
    }

    // First, compute the total size
    let totalSize = 4; // 4 bytes for array length
    const encodedValues: Buffer[] = [];

    for (const value of values) {
      const encoded = encodeFunc(value);
      encodedValues.push(encoded);
      totalSize += encoded.length;
    }

    // Now create the buffer and write the values
    const buffer = Buffer.alloc(totalSize);
    buffer.writeInt32BE(values.length, 0);
    let offset = 4;

    for (const encoded of encodedValues) {
      encoded.copy(buffer, offset);
      offset += encoded.length;
    }

    return buffer;
  }

  /**
   * Decodes an array of values
   */
  static decodeArray<T>(
    buffer: Buffer,
    decodeFunc: (buffer: Buffer, offset: number) => [T, number],
    offset = 0
  ): [T[] | null, number] {
    const length = buffer.readInt32BE(offset);
    offset += 4;

    if (length < 0) {
      return [null, offset];
    }

    const values: T[] = [];
    for (let i = 0; i < length; i++) {
      const [value, newOffset] = decodeFunc(buffer, offset);
      values.push(value);
      offset = newOffset;
    }

    return [values, offset];
  }

  /**
   * Encodes a compact array of values
   */
  static encodeCompactArray<T>(
    values: T[] | null,
    encodeFunc: (value: T) => Buffer
  ): Buffer {
    if (values === null) {
      return Buffer.from([0x00]); // 0 for null
    }

    // Compact encoding adds 1 to the actual length
    const encodedLength = values.length + 1;
    
    // First, compute the total size
    // Determine how many bytes we need for the length
    let sizeOfLength = 1;
    let len = encodedLength;
    while (len > 127) {
      sizeOfLength++;
      len = len >> 7;
    }
    
    let totalSize = sizeOfLength;
    const encodedValues: Buffer[] = [];

    for (const value of values) {
      const encoded = encodeFunc(value);
      encodedValues.push(encoded);
      totalSize += encoded.length;
    }

    // Now create the buffer and write the values
    const buffer = Buffer.alloc(totalSize);
    
    // Write the length in a variable-length format
    let idx = 0;
    len = encodedLength;
    while (len > 127) {
      buffer[idx++] = (len & 0x7F) | 0x80;
      len = len >> 7;
    }
    buffer[idx++] = len & 0x7F;

    for (const encoded of encodedValues) {
      encoded.copy(buffer, idx);
      idx += encoded.length;
    }

    return buffer;
  }

  /**
   * Decodes a compact array of values
   */
  static decodeCompactArray<T>(
    buffer: Buffer,
    decodeFunc: (buffer: Buffer, offset: number) => [T, number],
    offset = 0
  ): [T[] | null, number] {
    let length = 0;
    let byteRead = 0;
    let shift = 0;
    
    do {
      byteRead = buffer.readUInt8(offset++);
      length |= (byteRead & 0x7F) << shift;
      shift += 7;
    } while (byteRead & 0x80);
    
    if (length === 0) {
      return [null, offset];
    }
    
    // Subtract 1 to get the actual length (as per Kafka protocol)
    length -= 1;

    const values: T[] = [];
    for (let i = 0; i < length; i++) {
      const [value, newOffset] = decodeFunc(buffer, offset);
      values.push(value);
      offset = newOffset;
    }

    return [values, offset];
  }
}