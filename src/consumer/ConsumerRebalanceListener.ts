import { TopicPartition } from './TopicPartition';

/**
 * Interface for partition assignment events.
 * This listener will be called when the consumer's partitions are revoked or assigned.
 */
export interface ConsumerRebalanceListener {
  /**
   * Called when partitions are assigned to the consumer.
   * @param partitions the list of partitions that were assigned
   */
  onPartitionsAssigned(partitions: TopicPartition[]): void | Promise<void>;

  /**
   * Called when partitions are revoked from the consumer.
   * @param partitions the list of partitions that were revoked
   */
  onPartitionsRevoked(partitions: TopicPartition[]): void | Promise<void>;

  /**
   * Called when partitions are lost by the consumer.
   * This is different from revoked as it indicates a failure scenario.
   * @param partitions the list of partitions that were lost
   */
  onPartitionsLost?(partitions: TopicPartition[]): void | Promise<void>;
}