import { Encoder } from './Encoder';
import { Decoder } from './Decoder';

/**
 * Base class for all Kafka protocol messages
 */
export abstract class Message {
  /**
   * Encodes the message to a buffer
   */
  public abstract encode(encoder?: Encoder): Buffer;

  /**
   * Decodes the message from a decoder
   */
  public abstract decode(decoder: Decoder): void;
}

// src/protocol/ApiVersions.ts
/**
 * Defines Kafka API keys
 */
export enum ApiKeys {
  PRODUCE = 0,
  FETCH = 1,
  LIST_OFFSETS = 2,
  METADATA = 3,
  LEADER_AND_ISR = 4,
  STOP_REPLICA = 5,
  UPDATE_METADATA = 6,
  CONTROLLED_SHUTDOWN = 7,
  OFFSET_COMMIT = 8,
  OFFSET_FETCH = 9,
  FIND_COORDINATOR = 10,
  JOIN_GROUP = 11,
  HEARTBEAT = 12,
  LEAVE_GROUP = 13,
  SYNC_GROUP = 14,
  DESCRIBE_GROUPS = 15,
  LIST_GROUPS = 16,
  SASL_HANDSHAKE = 17,
  API_VERSIONS = 18,
  CREATE_TOPICS = 19,
  DELETE_TOPICS = 20,
  DELETE_RECORDS = 21,
  INIT_PRODUCER_ID = 22,
  OFFSET_FOR_LEADER_EPOCH = 23,
  ADD_PARTITIONS_TO_TXN = 24,
  ADD_OFFSETS_TO_TXN = 25,
  END_TXN = 26,
  WRITE_TXN_MARKERS = 27,
  TXN_OFFSET_COMMIT = 28,
  DESCRIBE_ACLS = 29,
  CREATE_ACLS = 30,
  DELETE_ACLS = 31,
  DESCRIBE_CONFIGS = 32,
  ALTER_CONFIGS = 33,
  ALTER_REPLICA_LOG_DIRS = 34,
  DESCRIBE_LOG_DIRS = 35,
  SASL_AUTHENTICATE = 36,
  CREATE_PARTITIONS = 37,
  CREATE_DELEGATION_TOKEN = 38,
  RENEW_DELEGATION_TOKEN = 39,
  EXPIRE_DELEGATION_TOKEN = 40,
  DESCRIBE_DELEGATION_TOKEN = 41,
  DELETE_GROUPS = 42,
  ELECT_LEADERS = 43,
  INCREMENTAL_ALTER_CONFIGS = 44,
  ALTER_PARTITION_REASSIGNMENTS = 45,
  LIST_PARTITION_REASSIGNMENTS = 46,
  OFFSET_DELETE = 47,
  DESCRIBE_CLIENT_QUOTAS = 48,
  ALTER_CLIENT_QUOTAS = 49,
  DESCRIBE_USER_SCRAM_CREDENTIALS = 50,
  ALTER_USER_SCRAM_CREDENTIALS = 51,
  VOTE = 52,
  BEGIN_QUORUM_EPOCH = 53,
  END_QUORUM_EPOCH = 54,
  DESCRIBE_QUORUM = 55,
  ALTER_PARTITION = 56,
  UPDATE_FEATURES = 57,
  ENVELOPE = 58,
  FETCH_SNAPSHOT = 59,
  DESCRIBE_CLUSTER = 60,
  DESCRIBE_PRODUCERS = 61,
  BROKER_REGISTRATION = 62,
  BROKER_HEARTBEAT = 63,
  UNREGISTER_BROKER = 64,
  DESCRIBE_TRANSACTIONS = 65,
  LIST_TRANSACTIONS = 66,
  ALLOCATE_PRODUCER_IDS = 67,
  CONSUMER_GROUP_HEARTBEAT = 68
}

/**
 * Defines the version range for an API
 */
export interface ApiVersionRange {
  apiKey: ApiKeys;
  minVersion: number;
  maxVersion: number;
}

/**
 * Manager for API versions
 */
export class ApiVersions {
  private versionRanges: Map<ApiKeys, ApiVersionRange> = new Map();
  private defaultMinVersion: number = 0;
  private defaultMaxVersion: number = 0;

  /**
   * Creates a new API versions manager
   * @param defaultMaxVersion The default maximum version to use if not specified
   */
  constructor(defaultMaxVersion: number = 0) {
    this.defaultMaxVersion = defaultMaxVersion;
  }

  /**
   * Updates the version ranges from a broker response
   */
  public update(versionRanges: ApiVersionRange[]): void {
    for (const range of versionRanges) {
      this.versionRanges.set(range.apiKey, range);
    }
  }

  /**
   * Gets the version range for an API
   */
  public getVersionRange(apiKey: ApiKeys): ApiVersionRange {
    const range = this.versionRanges.get(apiKey);
    if (!range) {
      return {
        apiKey,
        minVersion: this.defaultMinVersion,
        maxVersion: this.defaultMaxVersion
      };
    }
    return range;
  }

  /**
   * Gets the maximum supported version for an API
   */
  public maxVersion(apiKey: ApiKeys): number {
    return this.getVersionRange(apiKey).maxVersion;
  }

  /**
   * Gets the minimum supported version for an API
   */
  public minVersion(apiKey: ApiKeys): number {
    return this.getVersionRange(apiKey).minVersion;
  }

  /**
   * Checks if a specific API version is supported
   */
  public isVersionSupported(apiKey: ApiKeys, apiVersion: number): boolean {
    const range = this.getVersionRange(apiKey);
    return apiVersion >= range.minVersion && apiVersion <= range.maxVersion;
  }

  /**
   * Selects the best version to use for an API
   * @param apiKey The API key
   * @param preferredVersion The preferred version to use
   * @param fallbackVersion The fallback version to use if preferred is not supported
   */
  public selectVersion(
    apiKey: ApiKeys,
    preferredVersion?: number,
    fallbackVersion?: number
  ): number {
    const range = this.getVersionRange(apiKey);

    // If preferred version is specified and supported, use it
    if (
      preferredVersion !== undefined &&
      preferredVersion >= range.minVersion &&
      preferredVersion <= range.maxVersion
    ) {
      return preferredVersion;
    }

    // If fallback version is specified and supported, use it
    if (
      fallbackVersion !== undefined &&
      fallbackVersion >= range.minVersion &&
      fallbackVersion <= range.maxVersion
    ) {
      return fallbackVersion;
    }

    // Otherwise, use the highest supported version
    return range.maxVersion;
  }
}