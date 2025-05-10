import { Message } from '../Message';
import { RequestHeader } from '../RequestHeader';
import { Encoder } from '../Encoder';

/**
 * Base class for all Kafka requests
 */
export abstract class Request extends Message {
  public abstract apiKey(): number;
  public abstract apiName(): string;
  
  /**
   * Gets the expected response for this request
   */
  public abstract expectedResponse(): Message;

  /**
   * Constructs a complete request with header and body
   */
  public toBuffer(
    apiVersion: number,
    correlationId: number,
    clientId: string | null = null
  ): Buffer {
    const header = new RequestHeader(
      this.apiKey(),
      apiVersion,
      correlationId,
      clientId
    );

    const encoder = new Encoder();
    
    // First, write the size (we'll update it later)
    encoder.writeInt32(0);
    
    // Then write the header and body
    header.encode(encoder);
    this.encode(encoder);
    
    // Get the full buffer
    const buffer = encoder.build();
    
    // Update the size field
    buffer.writeInt32BE(buffer.length - 4, 0);
    
    return buffer;
  }
}