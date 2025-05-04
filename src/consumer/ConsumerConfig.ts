export interface ConsumerConfig {
    /**
     * A list of host/port pairs to use for establishing the initial connection to the Kafka cluster
     * Format: 'host1:port1,host2:port2,...'
     */
    bootstrapServers: string;
    
    /**
     * A unique string that identifies this consumer instance
     */
    groupId: string;
    
    /**
     * An optional unique identifier for this client
     */
    clientId?: string;
    
    /**
     * Maximum amount of time the client will wait for the response of a request
     */
    requestTimeout?: number;
    
    /**
     * If true, the consumer's offset will be periodically committed in the background
     */
    enableAutoCommit?: boolean;
    
    /**
     * The frequency in milliseconds that the consumer offsets are auto-committed to Kafka if enableAutoCommit is true
     */
    autoCommitIntervalMs?: number;
    
    /**
     * What to do when there is no initial offset in Kafka or if an offset is out of range
     */
    autoOffsetReset?: 'earliest' | 'latest' | 'none';
    
    /**
     * The maximum number of records returned in a single call to poll()
     */
    maxPollRecords?: number;
    
    /**
     * The timeout used to detect consumer failures when using Kafka's group management facility
     */
    sessionTimeoutMs?: number;
    
    /**
     * The expected time between heartbeats to the consumer coordinator
     */
    heartbeatIntervalMs?: number;
    
    /**
     * How long to wait before attempting to retry a failed fetch request to a given topic partition
     */
    retryBackoffMs?: number;
    
    /**
     * Controls how to read messages written transactionally
     */
    isolationLevel?: 'read_uncommitted' | 'read_committed';
  }
  