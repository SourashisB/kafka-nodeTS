/**
 * Version range for an API
 */
import { ApiKeys } from '../ApiKeys';
import {Buffer} from 'buffer';

export interface ApiVersionRange {
    apiKey: ApiKeys;
    minVersion: number;
    maxVersion: number;
  }
  
  /**
   * Response from the ApiVersions request
   */
  export class ApiVersionsResponse {
    constructor(
      public readonly errorCode: number,
      public readonly apiVersions: ApiVersionRange[],
      public readonly throttleTimeMs: number = 0
    ) {}
    
    /**
     * Parse the response from a buffer
     */
    public static parse(buffer: Buffer): ApiVersionsResponse {
      let offset = 0;
      
      // errorCode (int16)
      const errorCode = buffer.readInt16BE(offset);
      offset += 2;
      
      let throttleTimeMs = 0;
      
      // Starting from version 1, there's a throttleTimeMs field
      // Assuming this is version 1 or later
      throttleTimeMs = buffer.readInt32BE(offset);
      offset += 4;
      
      // apiVersions (array)
      const apiVersionsLength = buffer.readInt32BE(offset);
      offset += 4;
      
      const apiVersions: ApiVersionRange[] = [];
      for (let i = 0; i < apiVersionsLength; i++) {
        // apiKey (int16)
        const apiKey = buffer.readInt16BE(offset) as ApiKeys;
        offset += 2;
        
        // minVersion (int16)
        const minVersion = buffer.readInt16BE(offset);
        offset += 2;
        
        // maxVersion (int16)
        const maxVersion = buffer.readInt16BE(offset);
        offset += 2;
        
        apiVersions.push({ apiKey, minVersion, maxVersion });
      }
      
      // Version 3+ has tagged fields which we would need to skip
      
      return new ApiVersionsResponse(errorCode, apiVersions, throttleTimeMs);
    }
  }