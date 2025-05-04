import { TopicDescription } from "./TopicDescription";
import { ConfigResource, Config } from "./ConfigResource";

export abstract class AdminResult {
    constructor(
      /**
       * Error that occurred during the operation, if any
       */
      public readonly error?: Error
    ) {}
    
    /**
     * Returns true if the operation was successful
     */
    public isSuccess(): boolean {
      return !this.error;
    }
  }
  
  /**
   * Result of a create topics operation
   */
  export class CreateTopicsResult extends AdminResult {
    constructor(
      /**
       * The name of the topic
       */
      public readonly name: string,
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of a delete topics operation
   */
  export class DeleteTopicsResult extends AdminResult {
    constructor(
      /**
       * The name of the topic
       */
      public readonly name: string,
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of a create partitions operation
   */
  export class CreatePartitionsResult extends AdminResult {
    constructor(
      /**
       * The name of the topic
       */
      public readonly name: string,
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of a describe topics operation
   */
  export class DescribeTopicsResult extends AdminResult {
    constructor(
      /**
       * The topic description
       */
      public readonly description?: TopicDescription,
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of a list topics operation
   */
  export class ListTopicsResult extends AdminResult {
    constructor(
      /**
       * The list of topic names
       */
      public readonly topics: string[],
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of an alter configs operation
   */
  export class AlterConfigsResult extends AdminResult {
    constructor(
      /**
       * The config resource
       */
      public readonly resource: ConfigResource,
      error?: Error
    ) {
      super(error);
    }
  }
  
  /**
   * Result of a describe configs operation
   */
  export class DescribeConfigsResult extends AdminResult {
    constructor(
      /**
       * The config resource
       */
      public readonly resource: ConfigResource,
      /**
       * The configuration
       */
      public readonly config?: Config,
      error?: Error
    ) {
      super(error);
    }
  }
  