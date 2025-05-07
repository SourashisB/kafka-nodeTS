import {Buffer} from 'buffer';
export interface Broker {
  nodeId: number;
  host: string;
  port: number;
  rack: string | null;
}

/**
 * Partition information
 */
export interface PartitionMetadata {
  errorCode: number;
  partitionIndex: number;
  leaderId: number;
  leaderEpoch: number;
  replicaNodes: number[];
  isrNodes: number[];
  offlineReplicas: number[];
}

/**
 * Topic metadata
 */
export interface TopicMetadata {
  errorCode: number;
  name: string;
  isInternal: boolean;
  partitions: PartitionMetadata[];
  topicAuthorizedOperations: number;
}

/**
 * Response from the Metadata request
 */
export class MetadataResponse {
  constructor(
    public readonly throttleTimeMs: number,
    public readonly brokers: Broker[],
    public readonly clusterId: string | null,
    public readonly controllerId: number,
    public readonly topics: TopicMetadata[],
    public readonly clusterAuthorizedOperations: number
  ) {}
  
  /**
   * Parse the response from a buffer
   */
  public static parse(buffer: Buffer): MetadataResponse {
    let offset = 0;
    
    // throttleTimeMs (int32) - added in v3
    const throttleTimeMs = buffer.readInt32BE(offset);
    offset += 4;
    
    // brokers (array)
    const brokersLength = buffer.readInt32BE(offset);
    offset += 4;
    
    const brokers: Broker[] = [];
    for (let i = 0; i < brokersLength; i++) {
      // nodeId (int32)
      const nodeId = buffer.readInt32BE(offset);
      offset += 4;
      
      // host (string)
      const hostLength = buffer.readInt16BE(offset);
      offset += 2;
      const host = buffer.toString('utf8', offset, offset + hostLength);
      offset += hostLength;
      
      // port (int32)
      const port = buffer.readInt32BE(offset);
      offset += 4;
      
      // rack (nullable string) - added in v1
      const rackLength = buffer.readInt16BE(offset);
      offset += 2;
      let rack: string | null = null;
      if (rackLength >= 0) {
        rack = buffer.toString('utf8', offset, offset + rackLength);
        offset += rackLength;
      }
      
      brokers.push({ nodeId, host, port, rack });
    }
    
    // clusterId (nullable string) - added in v2
    const clusterIdLength = buffer.readInt16BE(offset);
    offset += 2;
    let clusterId: string | null = null;
    if (clusterIdLength >= 0) {
      clusterId = buffer.toString('utf8', offset, offset + clusterIdLength);
      offset += clusterIdLength;
    }
    
    // controllerId (int32) - added in v1
    const controllerId = buffer.readInt32BE(offset);
    offset += 4;
    
    // topics (array)
    const topicsLength = buffer.readInt32BE(offset);
    offset += 4;
    
    const topics: TopicMetadata[] = [];
    for (let i = 0; i < topicsLength; i++) {
      // errorCode (int16)
      const errorCode = buffer.readInt16BE(offset);
      offset += 2;
      
      // name (string)
      const nameLength = buffer.readInt16BE(offset);
      offset += 2;
      const name = buffer.toString('utf8', offset, offset + nameLength);
      offset += nameLength;
      
      // isInternal (boolean) - added in v1
      const isInternal = buffer.readInt8(offset) !== 0;
      offset += 1;
      
      // partitions (array)
      const partitionsLength = buffer.readInt32BE(offset);
      offset += 4;
      
      const partitions: PartitionMetadata[] = [];
      for (let j = 0; j < partitionsLength; j++) {
        // errorCode (int16)
        const partErrorCode = buffer.readInt16BE(offset);
        offset += 2;
        
        // partitionIndex (int32)
        const partitionIndex = buffer.readInt32BE(offset);
        offset += 4;
        
        // leaderId (int32)
        const leaderId = buffer.readInt32BE(offset);
        offset += 4;
        
        // leaderEpoch (int32) - added in v7
        const leaderEpoch = buffer.readInt32BE(offset);
        offset += 4;
        
        // replicaNodes (array of int32)
        const replicasLength = buffer.readInt32BE(offset);
        offset += 4;
        const replicaNodes: number[] = [];
        for (let k = 0; k < replicasLength; k++) {
          replicaNodes.push(buffer.readInt32BE(offset));
          offset += 4;
        }
        
        // isrNodes (array of int32)
        const isrLength = buffer.readInt32BE(offset);
        offset += 4;
        const isrNodes: number[] = [];
        for (let k = 0; k < isrLength; k++) {
          isrNodes.push(buffer.readInt32BE(offset));
          offset += 4;
        }
        
        // offlineReplicas (array of int32) - added in v5
        const offlineLength = buffer.readInt32BE(offset);
        offset += 4;
        const offlineReplicas: number[] = [];
        for (let k = 0; k < offlineLength; k++) {
          offlineReplicas.push(buffer.readInt32BE(offset));
          offset += 4;
        }
        
        partitions.push({
          errorCode: partErrorCode,
          partitionIndex,
          leaderId,
          leaderEpoch,
          replicaNodes,
          isrNodes,
          offlineReplicas
        });
      }
      
      // topicAuthorizedOperations (int32) - added in v8
      const topicAuthorizedOperations = buffer.readInt32BE(offset);
      offset += 4;
      
      topics.push({
        errorCode,
        name,
        isInternal,
        partitions,
        topicAuthorizedOperations
      });
    }
    
    // clusterAuthorizedOperations (int32) - added in v8
    const clusterAuthorizedOperations = buffer.readInt32BE(offset);
    
    return new MetadataResponse(
      throttleTimeMs,
      brokers,
      clusterId,
      controllerId,
      topics,
      clusterAuthorizedOperations
    );
  }
}