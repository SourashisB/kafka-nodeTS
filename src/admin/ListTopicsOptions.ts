export interface ListTopicsOptions {
    /**
     * If true, only list internal topics created by Kafka
     */
    listInternal?: boolean;
    
    /**
     * The timeout for this operation in milliseconds
     */
    timeoutMs?: number;
  }
  