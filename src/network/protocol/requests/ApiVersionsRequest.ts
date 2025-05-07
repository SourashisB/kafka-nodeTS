import { Protocol } from '../Protocol';
import {Buffer} from 'buffer';
/**
 * Request to discover API versions supported by a broker
 */
export class ApiVersionsRequest extends Protocol {
  constructor(
    public readonly clientSoftwareName: string = 'node-kafka-client',
    public readonly clientSoftwareVersion: string = '1.0.0'
  ) {
    super();
  }
  
  /**
   * Encode the request to a buffer
   */
  public encode(): Buffer {
    // In version 0, there's no body
    // In version 1-2, there's clientSoftwareName and clientSoftwareVersion
    // In version 3+, there are additional fields
    
    // This implements version 3
    const nameLength = Buffer.byteLength(this.clientSoftwareName);
    const versionLength = Buffer.byteLength(this.clientSoftwareVersion);
    
    const size = 2 + nameLength + 2 + versionLength + 4; // name + version + taggedFields
    const buffer = Buffer.alloc(size);
    let offset = 0;
    
    // clientSoftwareName (string)
    buffer.writeInt16BE(nameLength, offset);
    offset += 2;
    buffer.write(this.clientSoftwareName, offset);
    offset += nameLength;
    
    // clientSoftwareVersion (string)
    buffer.writeInt16BE(versionLength, offset);
    offset += 2;
    buffer.write(this.clientSoftwareVersion, offset);
    offset += versionLength;
    
    // taggedFields (empty compact array) - version 3+
    buffer.writeUInt8(0, offset); // 0 tagged fields
    
    return buffer;
  }
  
  /**
   * Create the request object
   */
  public static create(
    clientSoftwareName: string = 'node-kafka-client',
    clientSoftwareVersion: string = '1.0.0'
  ): ApiVersionsRequest {
    return new ApiVersionsRequest(clientSoftwareName, clientSoftwareVersion);
  }
}