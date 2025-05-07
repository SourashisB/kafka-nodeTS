/**
 * Base error class for Kafka errors
 */
export class KafkaError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'KafkaError';
    }
  }
  
  /**
   * Error thrown when a connection is disconnected
   */
  export class DisconnectedError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'DisconnectedError';
    }
  }
  
  /**
   * Error thrown when an operation times out
   */
  export class TimeoutError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  }
  
  /**
   * Error thrown when a broker returns an error code
   */
  export class BrokerError extends KafkaError {
    constructor(public readonly errorCode: number, message: string) {
      super(message);
      this.name = 'BrokerError';
    }
  }
  
  /**
   * Error thrown when a leader is not available for a partition
   */
  export class LeaderNotAvailableError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'LeaderNotAvailableError';
    }
  }
  
  /**
   * Error thrown when a topic does not exist
   */
  export class TopicNotExistsError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'TopicNotExistsError';
    }
  }
  
  /**
   * Error thrown when a partition does not exist
   */
  export class PartitionNotExistsError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'PartitionNotExistsError';
    }
  }
  
  /**
   * Error thrown when an offset is out of range
   */
  export class OffsetOutOfRangeError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'OffsetOutOfRangeError';
    }
  }
  
  /**
   * Error thrown when a group coordinator is not available
   */
  export class GroupCoordinatorNotAvailableError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'GroupCoordinatorNotAvailableError';
    }
  }
  
  /**
   * Error thrown when a group is rebalancing
   */
  export class RebalanceInProgressError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'RebalanceInProgressError';
    }
  }
  
  /**
   * Error thrown when an operation is not authorized
   */
  export class AuthorizationError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'AuthorizationError';
    }
  }
  
  /**
   * Error thrown when authentication fails
   */
  export class AuthenticationError extends KafkaError {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  }
  
  /**
   * Translate a Kafka error code to an Error object
   */
  export function fromErrorCode(errorCode: number, message?: string): Error | null {
    if (errorCode === 0) {
      return null; // No error
    }
    
    // Based on Kafka error codes
    switch (errorCode) {
      case 1: return new Error(message || 'Unknown Server Error'); // UNKNOWN_SERVER_ERROR
      case 2: return new OffsetOutOfRangeError(message || 'Offset out of range'); // OFFSET_OUT_OF_RANGE
      case 3: return new KafkaError(message || 'Corrupt message'); // CORRUPT_MESSAGE
      case 4: return new KafkaError(message || 'Unknown topic or partition'); // UNKNOWN_TOPIC_OR_PARTITION
      case 5: return new KafkaError(message || 'Invalid message'); // INVALID_MESSAGE
      case 6: return new LeaderNotAvailableError(message || 'Leader not available'); // LEADER_NOT_AVAILABLE
      case 7: return new KafkaError(message || 'Request timed out'); // REQUEST_TIMED_OUT
      case 8: return new KafkaError(message || 'Broker not available'); // BROKER_NOT_AVAILABLE
      case 9: return new KafkaError(message || 'Replica not available'); // REPLICA_NOT_AVAILABLE
      case 10: return new KafkaError(message || 'Message too large'); // MESSAGE_TOO_LARGE
      case 11: return new KafkaError(message || 'Stale controller epoch'); // STALE_CONTROLLER_EPOCH
      case 12: return new KafkaError(message || 'Offset metadata too large'); // OFFSET_METADATA_TOO_LARGE
      case 13: return new KafkaError(message || 'Network exception'); // NETWORK_EXCEPTION
      case 14: return new KafkaError(message || 'Coordinator load in progress'); // COORDINATOR_LOAD_IN_PROGRESS
      case 15: return new GroupCoordinatorNotAvailableError(message || 'Coordinator not available'); // COORDINATOR_NOT_AVAILABLE
      case 16: return new KafkaError(message || 'Not coordinator'); // NOT_COORDINATOR
      case 17: return new KafkaError(message || 'Invalid topic exception'); // INVALID_TOPIC_EXCEPTION
      case 18: return new KafkaError(message || 'Record list too large'); // RECORD_LIST_TOO_LARGE
      case 19: return new KafkaError(message || 'Not enough replicas'); // NOT_ENOUGH_REPLICAS
      case 20: return new KafkaError(message || 'Not enough replicas after append'); // NOT_ENOUGH_REPLICAS_AFTER_APPEND
      case 21: return new KafkaError(message || 'Invalid required acks'); // INVALID_REQUIRED_ACKS
      case 22: return new KafkaError(message || 'Illegal generation'); // ILLEGAL_GENERATION
      case 23: return new KafkaError(message || 'Inconsistent group protocol'); // INCONSISTENT_GROUP_PROTOCOL
      case 24: return new KafkaError(message || 'Invalid group id'); // INVALID_GROUP_ID
      case 25: return new KafkaError(message || 'Unknown member id'); // UNKNOWN_MEMBER_ID
      case 26: return new KafkaError(message || 'Invalid session timeout'); // INVALID_SESSION_TIMEOUT
      case 27: return new RebalanceInProgressError(message || 'Rebalance in progress'); // REBALANCE_IN_PROGRESS
      case 28: return new KafkaError(message || 'Invalid commit offset size'); // INVALID_COMMIT_OFFSET_SIZE
      case 29: return new KafkaError(message || 'Topic authorization failed'); // TOPIC_AUTHORIZATION_FAILED
      case 30: return new KafkaError(message || 'Group authorization failed'); // GROUP_AUTHORIZATION_FAILED
      case 31: return new KafkaError(message || 'Cluster authorization failed'); // CLUSTER_AUTHORIZATION_FAILED
      case 32: return new KafkaError(message || 'Invalid timestamp'); // INVALID_TIMESTAMP
      case 33: return new KafkaError(message || 'Unsupported SASL mechanism'); // UNSUPPORTED_SASL_MECHANISM
      case 34: return new KafkaError(message || 'Illegal SASL state'); // ILLEGAL_SASL_STATE
      case 35: return new KafkaError(message || 'Unsupported version'); // UNSUPPORTED_VERSION
      case 36: return new TopicNotExistsError(message || 'Topic does not exist'); // TOPIC_NOT_EXISTS
      case 37: return new KafkaError(message || 'Unknown topic ID'); // UNKNOWN_TOPIC_ID
      default: return new BrokerError(errorCode, message || `Unknown error code: ${errorCode}`);
    }
  }
  