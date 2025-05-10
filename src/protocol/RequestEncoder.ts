import { ApiKeys } from '../network/protocol/ApiKeys';
import { Message } from './Message';
import { Encoder } from './Encoder';
import { Decoder } from './Decoder';

/**
 * Header for Kafka protocol requests
 */
export class RequestHeader extends Message {
  private apiKey: ApiKeys;
  private apiVersion: number;
  private correlationId: number;
  private clientId: string | null;
  private tag: number = 0;

  /**
   * Creates a new request header
   */
  constructor(
    apiKey: ApiKeys,
    apiVersion: number,
    correlationId: number,
    clientId: string | null = null
  ) {
    super();
    this.apiKey = apiKey;
    this.apiVersion = apiVersion;
    this.correlationId = correlationId;
    this.clientId = clientId;
  }

  /**
   * Gets the API key
   */
  public getApiKey(): ApiKeys {
    return this.apiKey;
  }

  /**
   * Gets the API version
   */
  public getApiVersion(): number {
    return this.apiVersion;
  }

  /**
   * Gets the correlation ID
   */
  public getCorrelationId(): number {
    return this.correlationId;
  }

  /**
   * Gets the client ID
   */
  public getClientId(): string | null {
    return this.clientId;
  }

  /**
   * Encodes the header to a buffer
   */
  public encode(encoder?: Encoder): Buffer {
    const enc = encoder || new Encoder();

    enc.writeInt16(this.apiKey);
    enc.writeInt16(this.apiVersion);
    enc.writeInt32(this.correlationId);
    enc.writeString(this.clientId);

    if (this.apiVersion >= 2) {
      // Starting with version 2, there's a tag field
      enc.writeUInt16(this.tag);
    }

    return encoder ? enc.build() : enc.build();
  }

  /**
   * Decodes the header from a decoder
   */
  public decode(decoder: Decoder): void {
    this.apiKey = decoder.readInt16() as ApiKeys;
    this.apiVersion = decoder.readInt16();
    this.correlationId = decoder.readInt32();
    this.clientId = decoder.readString();

    if (this.apiVersion >= 2) {
      // Starting with version 2, there's a tag field
      this.tag = decoder.readUInt16();
    }
  }

  /**
   * Gets the size of the header in bytes
   */
  public size(): number {
    let size = 2 + 2 + 4; // apiKey(2) + apiVersion(2) + correlationId(4)
    
    // clientId
    size += 2; // string length
    if (this.clientId !== null) {
      size += Buffer.byteLength(this.clientId);
    }
    
    // tag field in version 2+
    if (this.apiVersion >= 2) {
      size += 2;
    }
    
    return size;
  }
}