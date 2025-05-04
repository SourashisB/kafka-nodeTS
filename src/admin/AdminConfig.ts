export interface AdminConfig {
    /**
     * A list of host/port pairs to use for establishing the initial connection to the Kafka cluster
     * Format: 'host1:port1,host2:port2,...'
     */
    bootstrapServers: string;
    
    /**
     * An optional unique identifier for this client
     */
    clientId?: string;
    
    /**
     * Maximum amount of time the client will wait for the response of a request
     */
    requestTimeout?: number;
    
    /**
     * The timeout used for connections to the Kafka cluster
     */
    connectionTimeout?: number;
    
    /**
     * The maximum amount of time to wait for an operation to complete
     */
    defaultApiTimeout?: number;
    
    /**
     * The maximum number of attempts to retry a request to the Kafka cluster
     */
    retries?: number;
    
    /**
     * How long to wait before attempting to retry a failed request
     */
    retryBackoffMs?: number;
  }
  