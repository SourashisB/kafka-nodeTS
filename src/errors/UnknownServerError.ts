import { KafkaError } from './KafkaError';
import { KafkaErrorCode } from './KafkaErrorCodes';
/**
 * Error thrown when the server returns an unknown error
 */
export class UnknownServerError extends KafkaError {
  constructor(message: string = 'The server experienced an unexpected error') {
    super(message, KafkaErrorCode.UNKNOWN_SERVER_ERROR, true);
    this.name = 'UnknownServerError';

    // Restore prototype chain
    Object.setPrototypeOf(this, UnknownServerError.prototype);
  }
}

