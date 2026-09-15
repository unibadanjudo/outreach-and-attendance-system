import { HttpException, HttpStatus } from '@nestjs/common';

export class GoogleSheetsException extends HttpException {
  constructor(
    message: string,
    public readonly isTransient: boolean = false,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly code: string = 'GOOGLE_SHEETS_ERROR',
  ) {
    super({ success: false, error: { code, message } }, status);
  }
}

export class SpreadsheetNotFoundException extends GoogleSheetsException {
  constructor(spreadsheetId: string) {
    super(
      `Google Spreadsheet with ID "${spreadsheetId}" was not found. Please verify the spreadsheet ID and sharing permissions.`,
      false,
      HttpStatus.NOT_FOUND,
      'SPREADSHEET_NOT_FOUND',
    );
  }
}

export class SheetNotFoundException extends GoogleSheetsException {
  constructor(sheetName: string) {
    super(
      `Worksheet tab "${sheetName}" was not found in the spreadsheet.`,
      false,
      HttpStatus.NOT_FOUND,
      'SHEET_TAB_NOT_FOUND',
    );
  }
}

export class InvalidRangeException extends GoogleSheetsException {
  constructor(range: string, details?: string) {
    super(
      `Invalid Google Sheets range specification "${range}". ${details || ''}`.trim(),
      false,
      HttpStatus.BAD_REQUEST,
      'INVALID_SHEET_RANGE',
    );
  }
}

export class GoogleRateLimitException extends GoogleSheetsException {
  constructor(
    message: string = 'Google Sheets API rate limit exceeded. Please try again later.',
  ) {
    super(message, true, HttpStatus.TOO_MANY_REQUESTS, 'GOOGLE_API_RATE_LIMIT');
  }
}

export class GoogleAuthFailureException extends GoogleSheetsException {
  constructor(
    message: string = 'Failed to authenticate with Google Sheets service account.',
  ) {
    super(message, false, HttpStatus.UNAUTHORIZED, 'GOOGLE_AUTH_FAILURE');
  }
}

export {
  mapGoogleApiError,
  type GoogleErrorContext,
} from './google-error.mapper';
