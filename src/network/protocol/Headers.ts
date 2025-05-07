/**
 * Represents a Kafka request header
 */
import {Buffer} from 'buffer';
import {ApiKeys} from './ApiKeys.js';
export class RequestHeader {
    constructor(
      public readonly apiKey: ApiKeys,
      public readonly apiVersion: number,
      public readonly correlationId: number,
      public readonly clientId: string
    ) {}
    
    /**
     * Encode the header to a buffer
     */
    public encode(): Buffer {
      // clientId is a nullable string
      const clientIdLength = this.clientId ? Buffer.byteLength(this.clientId) : -1;
      
      // Calculate the size: 2(apiKey) + 2(apiVersion) + 4(correlationId) + 2(clientIdLength) + clientId
      const size = 2 + 2 + 4 + 2 + (clientIdLength > 0 ? clientIdLength : 0);
      
      const buffer = Buffer.alloc(size);
      let offset = 0;
      
      // apiKey (int16)
      buffer.writeInt16BE(this.apiKey, offset);
      offset += 2;
      
      // apiVersion (int16)
      buffer.writeInt16BE(this.apiVersion, offset);
      offset += 2;
      
      // correlationId (int32)
      buffer.writeInt32BE(this.correlationId, offset);
      offset += 4;
      
      // clientId (nullable string)
      if (this.clientId) {
        buffer.writeInt16BE(clientIdLength, offset);
        offset += 2;
        buffer.write(this.clientId, offset);
      } else {
        buffer.writeInt16BE(-1, offset);
      }
      
      return buffer;
    }
    
    /**
     * Decode a buffer to a RequestHeader
     */
    public static decode(buffer: Buffer): RequestHeader {
      let offset = 0;
      
      // apiKey (int16)
      const apiKey = buffer.readInt16BE(offset) as ApiKeys;
      offset += 2;
      
      // apiVersion (int16)
      const apiVersion = buffer.readInt16BE(offset);
      offset += 2;
      
      // correlationId (int32)
      const correlationId = buffer.readInt32BE(offset);
      offset += 4;
      
      // clientId (nullable string)
      const clientIdLength = buffer.readInt16BE(offset);
      offset += 2;
      
      let clientId = '';
      if (clientIdLength >= 0) {
        clientId = buffer.toString('utf8', offset, offset + clientIdLength);
      }
      
      return new RequestHeader(apiKey, apiVersion, correlationId, clientId);
    }
  }
  
  /**
   * Represents a Kafka response header
   */
  export class ResponseHeader {
    constructor(
      public readonly correlationId: number,
      public readonly size: number // Size of the header in bytes
    ) {}
    
    /**
     * Decode a buffer to a ResponseHeader
     * @returns The decoded header and the size of the header in bytes
     */
    public static decode(buffer: Buffer): ResponseHeader {
      let offset = 0;
      
      // correlationId (int32)
      const correlationId = buffer.readInt32BE(offset);
      offset += 4;
      
      return new ResponseHeader(correlationId, offset);
    }
  }