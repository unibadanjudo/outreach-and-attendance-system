import { Logger } from '@nestjs/common';
import {
  GoogleErrorContext,
  GoogleSheetsException,
  mapGoogleApiError,
} from '../errors/google-sheets.exception';

export interface RetryOptions {
  context?: GoogleErrorContext;
  maxRetries?: number;
  baseDelayMs?: number;
  logger?: Logger;
}

/**
 * Executes an asynchronous operation with exponential backoff for transient failures.
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelayMs = options?.baseDelayMs ?? 100;
  const logger = options?.logger ?? new Logger('RetryUtil');

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (rawError) {
      const mappedError = mapGoogleApiError(rawError, options?.context);

      attempt++;
      if (mappedError.isTransient && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        logger.warn(
          `Transient Google API failure (${mappedError.message}). Retrying attempt ${attempt}/${maxRetries} in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw mappedError;
      }
    }
  }

  throw new GoogleSheetsException('Operation failed after retrying.');
}
