import { sheets_v4 } from 'googleapis';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { parseSheetName } from '../../google/mappers/sheet-row.mapper';
import {
  OutreachHeaderKey,
  rowToOutreach,
} from '../mappers/outreach-row.mapper';
import { Outreach } from '../models/outreach.model';

export async function ensureOutreachTabExists(
  sheetsClient: sheets_v4.Sheets,
  googleSheetsService: GoogleSheetsService,
  spreadsheetId: string,
  range: string,
  headers: readonly string[],
): Promise<void> {
  const sheetName = parseSheetName(range);
  try {
    const rows = await googleSheetsService.readRange(`${sheetName}!A1:Z1`);
    if (!rows || rows.length === 0 || rows[0].length === 0) {
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, [...headers]);
    }
  } catch {
    try {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, [...headers]);
    } catch {
      // Tab may already exist or error handled by mock/sheets
    }
  }
}

export function findOutreachRowIndex(
  raw: string[][],
  headerKeys: OutreachHeaderKey[],
  id: string,
): { rowIndex: number; existing: Outreach | null } {
  const cleanId = id.trim().toLowerCase();
  for (let i = 1; i < raw.length; i++) {
    const item = rowToOutreach(headerKeys, raw[i], i + 1);
    if (item.id.toLowerCase() === cleanId) {
      return { rowIndex: i + 1, existing: item };
    }
  }
  return { rowIndex: -1, existing: null };
}
