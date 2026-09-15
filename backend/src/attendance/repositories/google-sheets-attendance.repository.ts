import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { GoogleAuthService } from '../../google/google-auth.service';
import {
  ATTENDANCE_SHEET_HEADERS,
  attendanceToRow,
  mapHeadersToAttendanceKeys,
  rowToAttendance,
} from '../mappers/attendance-row.mapper';
import { Attendance } from '../models/attendance.model';
import { AttendanceRepository } from './attendance.repository.interface';
import {
  buildRowRange,
  parseSheetName,
} from '../../google/mappers/sheet-row.mapper';
import {
  ensureSheetTabExists,
  findAttendanceRowIndex,
  isMemberMatch,
} from '../utils/attendance-sheet.util';
import { executeBatchUpsert } from '../utils/attendance-batch.util';

@Injectable()
export class GoogleSheetsAttendanceRepository implements AttendanceRepository {
  private readonly attendanceRange: string;
  private readonly spreadsheetId: string;
  private isInitialized = false;

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly googleAuthService: GoogleAuthService,
    configService: ConfigService,
  ) {
    this.attendanceRange = configService.get<string>(
      'GOOGLE_SHEETS_ATTENDANCE_RANGE',
      'Attendance!A:Z',
    );
    this.spreadsheetId =
      configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID') || '';
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    await ensureSheetTabExists(
      this.googleAuthService.getSheetsClient(),
      this.googleSheetsService,
      this.spreadsheetId,
      this.attendanceRange,
      ATTENDANCE_SHEET_HEADERS,
    );
    this.isInitialized = true;
  }

  async findAll(): Promise<Attendance[]> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.attendanceRange);
    if (!raw || raw.length <= 1) return [];

    const headerKeys = mapHeadersToAttendanceKeys(raw[0]);
    return raw
      .slice(1)
      .filter((row) => row.some((c) => c && c.trim().length > 0))
      .map((row, i) => rowToAttendance(headerKeys, row, i + 2));
  }

  async findById(id: string): Promise<Attendance | null> {
    const list = await this.findAll();
    return (
      list.find((a) => a.id.toLowerCase() === id.trim().toLowerCase()) || null
    );
  }

  async findByMemberId(memberId: string): Promise<Attendance[]> {
    const list = await this.findAll();
    return list.filter((a) => isMemberMatch(a.memberId, memberId));
  }

  async findByMemberAndSession(
    memberId: string,
    attendanceDate: string,
    trainingSession: string,
  ): Promise<Attendance | null> {
    const list = await this.findAll();
    const s = trainingSession.trim().toLowerCase();
    return (
      list.find(
        (a) =>
          isMemberMatch(a.memberId, memberId) &&
          a.attendanceDate === attendanceDate &&
          a.trainingSession.toLowerCase() === s,
      ) || null
    );
  }

  async create(attendance: Attendance): Promise<Attendance> {
    await this.ensureInitialized();
    await this.googleSheetsService.appendRow(
      this.attendanceRange,
      attendanceToRow(attendance),
    );
    return attendance;
  }

  async batchUpsert(attendances: Attendance[]): Promise<Attendance[]> {
    await this.ensureInitialized();
    return executeBatchUpsert(
      this.googleSheetsService,
      this.attendanceRange,
      attendances,
    );
  }

  async update(id: string, updates: Partial<Attendance>): Promise<Attendance> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.attendanceRange);
    if (!raw || raw.length <= 1)
      throw new NotFoundException(`Attendance ${id} not found`);

    const headerKeys = mapHeadersToAttendanceKeys(raw[0]);
    const { rowIndex, existing } = findAttendanceRowIndex(raw, headerKeys, id);
    if (rowIndex === -1 || !existing)
      throw new NotFoundException(`Attendance record with ID ${id} not found`);

    const updated: Attendance = { ...existing, ...updates, id: existing.id };
    const range = buildRowRange(
      parseSheetName(this.attendanceRange),
      rowIndex,
      ATTENDANCE_SHEET_HEADERS.length,
    );
    await this.googleSheetsService.updateCells(range, [
      attendanceToRow(updated),
    ]);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.attendanceRange);
    if (!raw || raw.length <= 1) return false;

    const headerKeys = mapHeadersToAttendanceKeys(raw[0]);
    const { rowIndex } = findAttendanceRowIndex(raw, headerKeys, id);
    if (rowIndex === -1) return false;

    const blankRow = new Array<string>(ATTENDANCE_SHEET_HEADERS.length).fill('');
    const range = buildRowRange(
      parseSheetName(this.attendanceRange),
      rowIndex,
      ATTENDANCE_SHEET_HEADERS.length,
    );
    await this.googleSheetsService.updateCells(range, [blankRow]);
    return true;
  }
}
