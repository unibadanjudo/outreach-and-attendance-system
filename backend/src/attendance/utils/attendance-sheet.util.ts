import { sheets_v4 } from 'googleapis';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { parseSheetName } from '../../google/mappers/sheet-row.mapper';
import {
  AttendanceField,
  rowToAttendance,
} from '../mappers/attendance-row.mapper';
import { Attendance } from '../models/attendance.model';

export async function ensureSheetTabExists(
  sheetsClient: sheets_v4.Sheets,
  googleSheetsService: GoogleSheetsService,
  spreadsheetId: string,
  range: string,
  headers: string[],
): Promise<void> {
  const sheetName = parseSheetName(range);
  try {
    const rows = await googleSheetsService.readRange(`${sheetName}!A1:Z1`);
    if (!rows || rows.length === 0 || rows[0].length === 0) {
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, headers);
    }
  } catch {
    try {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
      await googleSheetsService.appendRow(`${sheetName}!A1:Z1`, headers);
    } catch {
      // Ignored if sheet already existed
    }
  }
}

export function findAttendanceRowIndex(
  raw: string[][],
  headerKeys: (AttendanceField | null)[],
  id: string,
): { rowIndex: number; existing: Attendance | null } {
  const cleanId = id.trim().toLowerCase();
  for (let i = 1; i < raw.length; i++) {
    const item = rowToAttendance(headerKeys, raw[i], i + 1);
    if (item.id.toLowerCase() === cleanId) {
      return { rowIndex: i + 1, existing: item };
    }
  }
  return { rowIndex: -1, existing: null };
}

export function isMemberMatch(id1: string, id2: string): boolean {
  const c1 = id1.trim().toLowerCase();
  const c2 = id2.trim().toLowerCase();
  if (c1 === c2) return true;
  const d1 = c1.replace(/[^0-9]/g, '');
  const d2 = c2.replace(/[^0-9]/g, '');
  if (!d1 || !d2) return false;
  if (d1 === d2) return true;
  if (d1.length === 10 && `0${d1}` === d2) return true;
  if (d2.length === 10 && `0${d2}` === d1) return true;
  return false;
}

