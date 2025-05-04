export class NewPartitions {
    /**
     * Replica assignment map from partition to replicas
     */
    private assignments: Map<number, number[]> = new Map();
    
    constructor(
      /**
       * The total number of partitions the topic should have
       */
      public readonly totalCount: number
    ) {
      if (totalCount <= 0) {
        throw new Error('totalCount must be positive');
      }
    }
    
    /**
     * Static method to create a new NewPartitions instance
     * @param totalCount The total number of partitions
     */
    public static increaseTo(totalCount: number): NewPartitions {
      return new NewPartitions(totalCount);
    }
    
    /**
     * Set the assignment of replicas to the new partitions
     * @param assignments Array of arrays where each inner array contains the replica assignments for one new partition
     */
    public assignReplicas(assignments: number[][]): NewPartitions {
      // Clear existing assignments
      this.assignments.clear();
      
      for (let i = 0; i < assignments.length; i++) {
        const replicas = assignments[i];
        
        if (!Array.isArray(replicas) || replicas.length === 0) {
          throw new Error(`Invalid replica assignment for new partition ${i}`);
        }
        
        this.assignments.set(i, [...replicas]);
      }
      
      return this;
    }
    
    /**
     * Get the replica assignments for the new partitions
     */
    public getAssignments(): Map<number, number[]> {
      return new Map(this.assignments);
    }
    
    /**
     * Check if this NewPartitions has custom replica assignments
     */
    public hasAssignments(): boolean {
      return this.assignments.size > 0;
    }
    
    /**
     * Convert the NewPartitions to a JSON-serializable object
     */
    public toJSON(): Record<string, any> {
      const result: Record<string, any> = {
        totalCount: this.totalCount
      };
      
      if (this.assignments.size > 0) {
        result.assignments = Array.from(this.assignments.entries())
          .sort(([a], [b]) => a - b)
          .map(([_, replicas]) => replicas);
      }
      
      return result;
    }
  }