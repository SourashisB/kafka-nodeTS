import { Protocol } from '../Protocol';
import { Buffer } from 'buffer';

/**
 * Request to get metadata about the cluster
 */
export class MetadataRequest extends Protocol {
  constructor(
    public readonly topics: string[] | null = null,
    public readonly allowAutoTopicCreation: boolean = false,
    public readonly includeClusterAuthorizedOperations: boolean = false,
    public readonly includeTopicAuthorizedOperations: boolean = false
  ) {
    super();
  }
  
  /**
   * Encode the request to a buffer
   */
  public encode(): Buffer {
    // Calculate buffer size
    let size = 4; // topics array length
    
    // Add topic string lengths
    if (this.topics !== null) {
      for (const topic of this.topics) {
        size += 2 + Buffer.byteLength(topic); // 2 bytes for length + string bytes
      }
    }
    
    // Add other fields
    size += 1; // allowAutoTopicCreation
    size += 1; // includeClusterAuthorizedOperations
    size += 1; // includeTopicAuthorizedOperations
    
    const buffer = Buffer.alloc(size);
    let offset = 0;
    
    // topics (array of strings)
    if (this.topics === null) {
      buffer.writeInt32BE(-1, offset);
      offset += 4;
    } else {
      buffer.writeInt32BE(this.topics.length, offset);
      offset += 4;
      
      for (const topic of this.topics) {
        const topicLength = Buffer.byteLength(topic);
        buffer.writeInt16BE(topicLength, offset);
        offset += 2;
        buffer.write(topic, offset);
        offset += topicLength;
      }
    }
    
    // allowAutoTopicCreation (boolean)
    Protocol.writeBoolean(buffer, this.allowAutoTopicCreation, offset);
    offset += 1;
    
    // includeClusterAuthorizedOperations (boolean)
    Protocol.writeBoolean(buffer, this.includeClusterAuthorizedOperations, offset);
    offset += 1;
    
    // includeTopicAuthorizedOperations (boolean)
    Protocol.writeBoolean(buffer, this.includeTopicAuthorizedOperations, offset);
    
    return buffer;
  }
  
  /**
   * Create a request for all topics
   */
  public static forAllTopics(
    allowAutoTopicCreation: boolean = false,
    includeClusterAuthorizedOperations: boolean = false,
    includeTopicAuthorizedOperations: boolean = false
  ): MetadataRequest {
    return new MetadataRequest(
      null,
      allowAutoTopicCreation,
      includeClusterAuthorizedOperations,
      includeTopicAuthorizedOperations
    );
  }
  
  /**
   * Create a request for specific topics
   */
  public static forTopics(
    topics: string[],
    allowAutoTopicCreation: boolean = false,
    includeClusterAuthorizedOperations: boolean = false,
    includeTopicAuthorizedOperations: boolean = false
  ): MetadataRequest {
    return new MetadataRequest(
      topics,
      allowAutoTopicCreation,
      includeClusterAuthorizedOperations,
      includeTopicAuthorizedOperations
    );
  }
}
