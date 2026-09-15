import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { GoogleAuthService } from '../../google/google-auth.service';
import {
  mapHeadersToAllowedUserKeys,
  rowToAllowedUser,
} from '../mappers/allowed-user-row.mapper';
import { AllowedUser } from '../models/allowed-user.model';
import { AllowedUsersRepository } from './allowed-users.repository.interface';
import { ensureAllowedUsersTabExists } from '../utils/allowed-users-sheet.util';

@Injectable()
export class GoogleSheetsAllowedUsersRepository
  implements AllowedUsersRepository
{
  private readonly logger = new Logger(
    GoogleSheetsAllowedUsersRepository.name,
  );
  private readonly range: string;
  private readonly spreadsheetId: string;
  private isInitialized = false;

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly googleAuthService: GoogleAuthService,
    configService: ConfigService,
  ) {
    this.range = configService.get<string>(
      'GOOGLE_SHEETS_ALLOWED_USERS_RANGE',
      'AllowedUsers!A:F',
    );
    this.spreadsheetId =
      configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID') || '';
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    await ensureAllowedUsersTabExists(
      this.googleAuthService.getSheetsClient(),
      this.googleSheetsService,
      this.spreadsheetId,
      this.range,
    );
    this.isInitialized = true;
  }

  async findAll(): Promise<AllowedUser[]> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.range);
    if (!raw || raw.length <= 1) return [];

    const headerKeys = mapHeadersToAllowedUserKeys(raw[0]);
    const users: AllowedUser[] = [];

    for (let i = 1; i < raw.length; i++) {
      const user = rowToAllowedUser(headerKeys, raw[i]);
      if (user) users.push(user);
    }

    return users;
  }

  async findByEmail(email: string): Promise<AllowedUser | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const all = await this.findAll();
    return (
      all.find((u) => u.email.trim().toLowerCase() === cleanEmail) ?? null
    );
  }
}
