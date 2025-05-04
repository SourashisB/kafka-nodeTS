export interface AlterConfigsOptions {
    /**
     * If true, the request is validated but not executed
     */
    validateOnly?: boolean;
    
    /**
     * The timeout for this operation in milliseconds
     */
    timeoutMs?: number;
  }
  
  /**
   * Increment operation for numeric configs
   */
  export class ConfigIncrement {
    constructor(
      /**
       * The name of the configuration entry
       */
      public readonly name: string,
      /**
       * The amount to increment the value by
       */
      public readonly increment: number
    ) {}
  }
  
  /**
   * Operations that can be performed on configurations
   */
  export enum ConfigOperation {
    SET = 'SET',
    DELETE = 'DELETE',
    APPEND = 'APPEND',
    SUBTRACT = 'SUBTRACT'
  }
  
  /**
   * Entry for altering a configuration
   */
  export class AlterConfigEntry {
    constructor(
      /**
       * The name of the configuration entry
       */
      public readonly name: string,
      /**
       * The value to set, or null to delete the configuration
       */
      public readonly value: string | null,
      /**
       * The operation to perform
       */
      public readonly operation: ConfigOperation = ConfigOperation.SET
    ) {}
    
    /**
     * Convert the AlterConfigEntry to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      const result: Record<string, any> = {
        name: this.name,
        operation: this.operation
      };
      
      if (this.value !== null) {
        result.value = this.value;
      }
      
      return result;
    }
  }