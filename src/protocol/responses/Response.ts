import { Message } from '../Message';
import { ResponseHeader } from '../ResponseHeader';
import { Decoder } from '../Decoder';

/**
 * Base class for all Kafka responses
 */
export abstract class Response extends Message {
  protected header: ResponseHeader | null = null;
  
  /**
   * Parses a complete response including header
   */
  public static parse<T extends Response>(
    responseType: new () => T,
    buffer: Buffer
  ): T {
    const response = new responseType();
    
    // Skip the size field
    const decoder = new Decoder(buffer.slice(4));
    
    // Parse the header
    const header = new ResponseHeader();
    header.decode(decoder);
    response.header = header;
    
    // Parse the body
    response.decode(decoder);
    
    return response;
  }
  
  /**
   * Gets the correlation ID from the header
   */
  public correlationId(): number {
    return this.header ? this.header.getCorrelationId() : -1;
  }
  
  /**
   * Sets the header
   */
  public setHeader(header: ResponseHeader): void {
    this.header = header;
  }
  
  /**
   * Gets the header
   */
  public getHeader(): ResponseHeader | null {
    return this.header;
  }
}
