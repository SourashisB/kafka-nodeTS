export enum ResourceType {
    UNKNOWN = 0,
    TOPIC = 1,
    BROKER = 2,
    BROKER_LOGGER = 3
  }
  
  /**
   * Represents a resource with configuration
   */
  export class ConfigResource {
    constructor(
      /**
       * Type of resource
       */
      public readonly type: ResourceType,
      /**
       * Name of the resource
       */
      public readonly name: string
    ) {}
    
    /**
     * Generate a unique string key for this resource
     */
    public key(): string {
      return `${this.type}:${this.name}`;
    }
    
    /**
     * Convert the ConfigResource to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      return {
        type: this.type,
        name: this.name
      };
    }
  }
  
  /**
   * Configuration entry for a resource
   */
  export class ConfigEntry {
    constructor(
      /**
       * Configuration name
       */
      public readonly name: string,
      /**
       * Configuration value
       */
      public readonly value: string,
      /**
       * Whether this configuration is read-only
       */
      public readonly isReadOnly: boolean = false,
      /**
       * Whether this configuration is sensitive
       */
      public readonly isSensitive: boolean = false,
      /**
       * Whether this configuration is default
       */
      public readonly isDefault: boolean = false
    ) {}
    
    /**
     * Convert the ConfigEntry to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      return {
        name: this.name,
        value: this.value,
        isReadOnly: this.isReadOnly,
        isSensitive: this.isSensitive,
        isDefault: this.isDefault
      };
    }
  }
  
  /**
   * Configuration for a resource
   */
  export class Config {
    private entries: Map<string, ConfigEntry> = new Map();
    
    /**
     * Add a configuration entry
     * @param entry The entry to add
     */
    public addEntry(entry: ConfigEntry): void {
      this.entries.set(entry.name, entry);
    }
    
    /**
     * Get all configuration entries
     */
    public getEntries(): ConfigEntry[] {
      return Array.from(this.entries.values());
    }
    
    /**
     * Get a specific configuration entry
     * @param name The name of the entry
     */
    public getEntry(name: string): ConfigEntry | undefined {
      return this.entries.get(name);
    }
    
    /**
     * Convert the Config to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      return {
        entries: this.getEntries()
      };
    }
  }