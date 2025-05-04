export interface DeleteTopicsOptions {
    /**
     * The timeout for this operation in milliseconds
     */
    timeoutMs?: number;
    
    /**
     * If true, topic deletion is retried on failure
     */
    retryOnFailure?: boolean;
  }