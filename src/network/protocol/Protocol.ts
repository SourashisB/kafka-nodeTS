/**
 * Base class for all protocol message types
 */
import { Buffer } from 'buffer';
export abstract class Protocol {
    /**
     * Encode the message to a buffer
     */
    public abstract encode(): Buffer;
    
    /**
     * Write a boolean to a buffer
     */
    protected static writeBoolean(buffer: Buffer, value: boolean, offset: number): number {
      buffer.writeInt8(value ? 1 : 0, offset);
      return offset + 1;
    }
    
    /**
     * Read a boolean from a buffer
     */
    protected static readBoolean(buffer: Buffer, offset: number): [boolean, number] {
      const value = buffer.readInt8(offset) !== 0;
      return [value, offset + 1];
    }
    
    /**
     * Write a nullable string to a buffer
     */
    protected static writeString(buffer: Buffer, value: string | null, offset: number): number {
      if (value === null) {
        buffer.writeInt16BE(-1, offset);
        return offset + 2;
      }
      
      const length = Buffer.byteLength(value);
      buffer.writeInt16BE(length, offset);
      offset += 2;
      
      if (length > 0) {
        buffer.write(value, offset);
        offset += length;
      }
      
      return offset;
    }
    
    /**
     * Read a nullable string from a buffer
     */
    protected static readString(buffer: Buffer, offset: number): [string | null, number] {
      const length = buffer.readInt16BE(offset);
      offset += 2;
      
      if (length < 0) {
        return [null, offset];
      }
      
      const value = buffer.toString('utf8', offset, offset + length);
      return [value, offset + length];
    }
    
    /**
     * Write an array of items to a buffer
     */
    protected static writeArray<T>(
      buffer: Buffer,
      array: T[] | null,
      offset: number,
      writeItem: (buffer: Buffer, item: T, offset: number) => number
    ): number {
      if (array === null) {
        buffer.writeInt32BE(-1, offset);
        return offset + 4;
      }
      
      buffer.writeInt32BE(array.length, offset);
      offset += 4;
      
      for (const item of array) {
        offset = writeItem(buffer, item, offset);
      }
      
      return offset;
    }
    
    /**
     * Read an array of items from a buffer
     */
    protected static readArray<T>(
      buffer: Buffer,
      offset: number,
      readItem: (buffer: Buffer, offset: number) => [T, number]
    ): [T[] | null, number] {
      const length = buffer.readInt32BE(offset);
      offset += 4;
      
      if (length < 0) {
        return [null, offset];
      }
      
      const array: T[] = [];
      for (let i = 0; i < length; i++) {
        const [item, newOffset] = readItem(buffer, offset);
        array.push(item);
        offset = newOffset;
      }
      
      return [array, offset];
    }
  }