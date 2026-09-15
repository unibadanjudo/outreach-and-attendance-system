import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';
import { GoogleAuthFailureException } from './errors/google-sheets.exception';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private sheetsClient: sheets_v4.Sheets | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Allows injecting a custom or mocked sheets client (e.g. in unit tests).
   */
  setSheetsClient(client: sheets_v4.Sheets): void {
    this.sheetsClient = client;
  }

  /**
   * Obtains an authenticated Google Sheets v4 API client.
   */
  getSheetsClient(): sheets_v4.Sheets {
    if (this.sheetsClient) {
      return this.sheetsClient;
    }

    const email = this.configService.get<string>(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    );
    const privateKey = this.configService
      .get<string>('GOOGLE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!email || !privateKey) {
      this.logger.warn(
        'Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY) are missing. Sheets API calls may fail unless mocked or configured.',
      );
    }

    try {
      const auth = new google.auth.JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheetsClient = google.sheets({
        version: 'v4',
        auth,
      });

      return this.sheetsClient;
    } catch (error) {
      this.logger.error('Failed to initialize Google Auth JWT client', error);
      throw new GoogleAuthFailureException();
    }
  }
}
