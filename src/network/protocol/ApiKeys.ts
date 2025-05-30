/**
 * Kafka API request types
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
   * Get the maximum supported API version for a given API key
   */
  export function apiVersion(apiKey: ApiKeys): number {
    // This would ideally be populated from API_VERSIONS response
    // These are example versions for Kafka 3.0
    const versions: Record<ApiKeys, number> = {
      [ApiKeys.PRODUCE]: 9,
      [ApiKeys.FETCH]: 13,
      [ApiKeys.LIST_OFFSETS]: 7,
      [ApiKeys.METADATA]: 12,
      [ApiKeys.LEADER_AND_ISR]: 6,
      [ApiKeys.STOP_REPLICA]: 3,
      [ApiKeys.UPDATE_METADATA]: 7,
      [ApiKeys.CONTROLLED_SHUTDOWN]: 3,
      [ApiKeys.OFFSET_COMMIT]: 8,
      [ApiKeys.OFFSET_FETCH]: 8,
      [ApiKeys.FIND_COORDINATOR]: 4,
      [ApiKeys.JOIN_GROUP]: 9,
      [ApiKeys.HEARTBEAT]: 4,
      [ApiKeys.LEAVE_GROUP]: 5,
      [ApiKeys.SYNC_GROUP]: 5,
      [ApiKeys.DESCRIBE_GROUPS]: 5,
      [ApiKeys.LIST_GROUPS]: 4,
      [ApiKeys.SASL_HANDSHAKE]: 1,
      [ApiKeys.API_VERSIONS]: 3,
      [ApiKeys.CREATE_TOPICS]: 7,
      [ApiKeys.DELETE_TOPICS]: 6,
      [ApiKeys.DELETE_RECORDS]: 2,
      [ApiKeys.INIT_PRODUCER_ID]: 4,
      [ApiKeys.OFFSET_FOR_LEADER_EPOCH]: 4,
      [ApiKeys.ADD_PARTITIONS_TO_TXN]: 3,
      [ApiKeys.ADD_OFFSETS_TO_TXN]: 3,
      [ApiKeys.END_TXN]: 3,
      [ApiKeys.WRITE_TXN_MARKERS]: 1,
      [ApiKeys.TXN_OFFSET_COMMIT]: 3,
      [ApiKeys.DESCRIBE_ACLS]: 3,
      [ApiKeys.CREATE_ACLS]: 3,
      [ApiKeys.DELETE_ACLS]: 3,
      [ApiKeys.DESCRIBE_CONFIGS]: 4,
      [ApiKeys.ALTER_CONFIGS]: 2,
      [ApiKeys.ALTER_REPLICA_LOG_DIRS]: 2,
      [ApiKeys.DESCRIBE_LOG_DIRS]: 4,
      [ApiKeys.SASL_AUTHENTICATE]: 2,
      [ApiKeys.CREATE_PARTITIONS]: 3,
      [ApiKeys.CREATE_DELEGATION_TOKEN]: 3,
      [ApiKeys.RENEW_DELEGATION_TOKEN]: 2,
      [ApiKeys.EXPIRE_DELEGATION_TOKEN]: 2,
      [ApiKeys.DESCRIBE_DELEGATION_TOKEN]: 3,
      [ApiKeys.DELETE_GROUPS]: 2,
      [ApiKeys.ELECT_LEADERS]: 2,
      [ApiKeys.INCREMENTAL_ALTER_CONFIGS]: 1,
      [ApiKeys.ALTER_PARTITION_REASSIGNMENTS]: 0,
      [ApiKeys.LIST_PARTITION_REASSIGNMENTS]: 0,
      [ApiKeys.OFFSET_DELETE]: 0,
      [ApiKeys.DESCRIBE_CLIENT_QUOTAS]: 1,
      [ApiKeys.ALTER_CLIENT_QUOTAS]: 1,
      [ApiKeys.DESCRIBE_USER_SCRAM_CREDENTIALS]: 0,
      [ApiKeys.ALTER_USER_SCRAM_CREDENTIALS]: 0,
      [ApiKeys.VOTE]: 0,
      [ApiKeys.BEGIN_QUORUM_EPOCH]: 0,
      [ApiKeys.END_QUORUM_EPOCH]: 0,
      [ApiKeys.DESCRIBE_QUORUM]: 0,
      [ApiKeys.ALTER_PARTITION]: 0,
      [ApiKeys.UPDATE_FEATURES]: 0,
      [ApiKeys.ENVELOPE]: 0,
      [ApiKeys.FETCH_SNAPSHOT]: 0,
      [ApiKeys.DESCRIBE_CLUSTER]: 0,
      [ApiKeys.DESCRIBE_PRODUCERS]: 0,
      [ApiKeys.BROKER_REGISTRATION]: 0,
      [ApiKeys.BROKER_HEARTBEAT]: 0,
      [ApiKeys.UNREGISTER_BROKER]: 0,
      [ApiKeys.DESCRIBE_TRANSACTIONS]: 0,
      [ApiKeys.LIST_TRANSACTIONS]: 0,
      [ApiKeys.ALLOCATE_PRODUCER_IDS]: 0,
      [ApiKeys.CONSUMER_GROUP_HEARTBEAT]: 0
    };
    
    return versions[apiKey] || 0;
  }
  