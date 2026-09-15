import { HttpStatus } from '@nestjs/common';
import {
  GoogleAuthFailureException,
  GoogleRateLimitException,
  GoogleSheetsException,
  InvalidRangeException,
  SheetNotFoundException,
  SpreadsheetNotFoundException,
} from './google-sheets.exception';

export interface GoogleErrorContext {
  spreadsheetId?: string;
  range?: string;
}

/**
 * Maps raw Google API errors into standardized domain exceptions.
 */
export function mapGoogleApiError(
  error: unknown,
  context?: GoogleErrorContext,
): GoogleSheetsException {
  if (error instanceof GoogleSheetsException) {
    return error;
  }

  const err = error as {
    code?: number | string;
    status?: number;
    message?: string;
    errors?: Array<{ reason?: string; message?: string }>;
  };

  const statusCode = Number(err.status || err.code || 500);
  const message = err.message || 'Unknown Google API error';
  const reason = err.errors?.[0]?.reason || '';

  if (
    statusCode === 404 ||
    message.includes('Requested entity was not found') ||
    message.includes('not found')
  ) {
    if (context?.spreadsheetId && message.includes('Spreadsheet')) {
      return new SpreadsheetNotFoundException(context.spreadsheetId);
    }
    if (context?.range) {
      const sheetName = context.range.split('!')[0];
      return new SheetNotFoundException(sheetName);
    }
    return new SpreadsheetNotFoundException(
      context?.spreadsheetId || 'unknown',
    );
  }

  if (
    statusCode === 400 ||
    message.includes('Unable to parse range') ||
    reason === 'badRequest'
  ) {
    return new InvalidRangeException(context?.range || 'unknown', message);
  }

  if (
    statusCode === 429 ||
    reason === 'rateLimitExceeded' ||
    reason === 'userRateLimitExceeded' ||
    message.includes('Quota exceeded')
  ) {
    return new GoogleRateLimitException();
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    reason === 'forbidden' ||
    reason === 'unauthorized'
  ) {
    return new GoogleAuthFailureException(
      'Access to the Google Spreadsheet was denied. Ensure the service account email is granted "Editor" access to the spreadsheet.',
    );
  }

  const isTransient =
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504;

  return new GoogleSheetsException(
    isTransient
      ? 'Google Sheets service is temporarily unavailable. Please retry.'
      : 'Failed to communicate with Google Sheets service.',
    isTransient,
    HttpStatus.BAD_GATEWAY,
    'GOOGLE_API_COMMUNICATION_ERROR',
  );
}
