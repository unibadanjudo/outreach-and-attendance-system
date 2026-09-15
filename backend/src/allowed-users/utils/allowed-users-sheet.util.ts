import { sheets_v4 } from 'googleapis';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { parseSheetName } from '../../google/mappers/sheet-row.mapper';
import {
  ALLOWED_USERS_HEADERS,
  allowedUserToRow,
} from '../mappers/allowed-user-row.mapper';
import { AllowedUser, UserStatus } from '../models/allowed-user.model';

const INITIAL_ACTIVE_USERS: AllowedUser[] = [
  {
    email: 'jide.bello15@gmail.com',
    name: 'Bello Olajide (Admin)',
    role: 'ADMIN',
    rank: 'ADMIN',
    status: UserStatus.ACTIVE,
    addedAt: '2026-09-15',
  },
  {
    email: 'coach@uijudo.club',
    name: 'Chief Coach',
    role: 'COACH',
    rank: 'COACH',
    status: UserStatus.ACTIVE,
    addedAt: '2026-09-15',
  },
  {
    email: 'admin@uijudo.club',
    name: 'UI Judo Admin',
    role: 'ADMIN',
    rank: 'ADMIN',
    status: UserStatus.ACTIVE,
    addedAt: '2026-09-15',
  },
];

export async function ensureAllowedUsersTabExists(
  sheetsClient: sheets_v4.Sheets,
  googleSheetsService: GoogleSheetsService,
  spreadsheetId: string,
  range: string,
): Promise<void> {
  const sheetName = parseSheetName(range);
  try {
    const rows = await googleSheetsService.readRange(`${sheetName}!A1:Z1`);
    if (!rows || rows.length === 0 || rows[0].length === 0) {
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, ALLOWED_USERS_HEADERS);
      const initialRows = INITIAL_ACTIVE_USERS.map(allowedUserToRow);
      await googleSheetsService.appendRows(range, initialRows);
    }
  } catch {
    try {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, ALLOWED_USERS_HEADERS);
      const initialRows = INITIAL_ACTIVE_USERS.map(allowedUserToRow);
      await googleSheetsService.appendRows(range, initialRows);
    } catch {
      // Ignored if tab was created concurrently
    }
  }
}
