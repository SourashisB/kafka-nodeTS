import { Message } from './Message';
import { Encoder } from './Encoder';
import { Decoder } from './Decoder';

/**
 * Header for Kafka protocol responses
 */
export class ResponseHeader extends Message {
  private correlationId: number;

  /**
   * Creates a new response header
   */
  constructor(correlationId: number = 0) {
    super();
    this.correlationId = correlationId;
  }

  /**
   * Gets the correlation ID
   */
  public getCorrelationId(): number {
    return this.correlationId;
  }

  /**
   * Sets the correlation ID
   */
  public setCorrelationId(correlationId: number): void {
    this.correlationId = correlationId;
  }

  /**
   * Encodes the header to a buffer
   */
  public encode(encoder?: Encoder): Buffer {
    const enc = encoder || new Encoder();
    enc.writeInt32(this.correlationId);
    return encoder ? enc.build() : enc.build();
  }

  /**
   * Decodes the header from a decoder
   */
  public decode(decoder: Decoder): void {
    this.correlationId = decoder.readInt32();
  }

  /**
   * Gets the size of the header in bytes
   */
  public size(): number {
    return 4; // correlationId(4)
  }
}