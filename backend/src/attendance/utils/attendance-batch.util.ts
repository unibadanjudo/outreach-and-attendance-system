import { GoogleSheetsService } from '../../google/google-sheets.service';
import {
  buildRowRange,
  parseSheetName,
} from '../../google/mappers/sheet-row.mapper';
import {
  ATTENDANCE_SHEET_HEADERS,
  attendanceToRow,
  mapHeadersToAttendanceKeys,
  rowToAttendance,
} from '../mappers/attendance-row.mapper';
import { Attendance } from '../models/attendance.model';

export async function executeBatchUpsert(
  googleSheetsService: GoogleSheetsService,
  attendanceRange: string,
  records: Attendance[],
): Promise<Attendance[]> {
  if (!records.length) return [];

  const raw = await googleSheetsService.readRange(attendanceRange);
  const sheetName = parseSheetName(attendanceRange);

  if (!raw || raw.length <= 1) {
    await googleSheetsService.appendRows(
      attendanceRange,
      records.map(attendanceToRow),
    );
    return records;
  }

  const headerKeys = mapHeadersToAttendanceKeys(raw[0]);
  const keyToRowIndex = new Map<
    string,
    { rowIndex: number; existing: Attendance }
  >();

  for (let i = 1; i < raw.length; i++) {
    const item = rowToAttendance(headerKeys, raw[i], i + 1);
    const dateSess = `${item.attendanceDate}_${item.trainingSession.trim().toLowerCase()}`;
    const compositeKey = `${item.memberId.trim().toLowerCase()}_${dateSess}`;
    const matchInfo = { rowIndex: i + 1, existing: item };
    keyToRowIndex.set(compositeKey, matchInfo);
    keyToRowIndex.set(item.id.trim().toLowerCase(), matchInfo);

    const digits = item.memberId.replace(/[^0-9]/g, '');
    if (digits) {
      keyToRowIndex.set(`${digits}_${dateSess}`, matchInfo);
      if (digits.startsWith('0')) {
        keyToRowIndex.set(`mem_${digits.substring(1)}_${dateSess}`, matchInfo);
      } else {
        keyToRowIndex.set(`mem_0${digits}_${dateSess}`, matchInfo);
      }
    }
  }

  const updateRanges: Array<{ range: string; values: (string | number)[][] }> =
    [];
  const appendList: (string | number)[][] = [];
  const result: Attendance[] = [];

  for (const rec of records) {
    const dateSess = `${rec.attendanceDate}_${rec.trainingSession.trim().toLowerCase()}`;
    const compositeKey = `${rec.memberId.trim().toLowerCase()}_${dateSess}`;
    const recDigits = rec.memberId.replace(/[^0-9]/g, '');
    const altKey = recDigits ? `${recDigits}_${dateSess}` : '';
    const match =
      keyToRowIndex.get(compositeKey) ||
      (altKey ? keyToRowIndex.get(altKey) : undefined) ||
      keyToRowIndex.get(rec.id.trim().toLowerCase());

    if (match) {
      const merged: Attendance = {
        ...match.existing,
        ...rec,
        id: match.existing.id,
      };
      const range = buildRowRange(
        sheetName,
        match.rowIndex,
        ATTENDANCE_SHEET_HEADERS.length,
      );
      updateRanges.push({ range, values: [attendanceToRow(merged)] });
      result.push(merged);
    } else {
      appendList.push(attendanceToRow(rec));
      result.push(rec);
    }
  }

  if (updateRanges.length > 0) {
    await googleSheetsService.batchUpdateRanges(updateRanges);
  }

  if (appendList.length > 0) {
    await googleSheetsService.appendRows(attendanceRange, appendList);
  }

  return result;
}
