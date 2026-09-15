import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import { GoogleAuthService } from '../../google/google-auth.service';
import {
  OUTREACH_SHEET_HEADERS,
  mapHeadersToOutreachKeys,
  outreachToRow,
  rowToOutreach,
} from '../mappers/outreach-row.mapper';
import { Outreach } from '../models/outreach.model';
import { OutreachRepository } from './outreach.repository.interface';
import {
  buildRowRange,
  parseSheetName,
} from '../../google/mappers/sheet-row.mapper';
import {
  ensureOutreachTabExists,
  findOutreachRowIndex,
} from '../utils/outreach-sheet.util';

@Injectable()
export class GoogleSheetsOutreachRepository implements OutreachRepository {
  private readonly outreachRange: string;
  private readonly spreadsheetId: string;
  private isInitialized = false;

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly googleAuthService: GoogleAuthService,
    configService: ConfigService,
  ) {
    this.outreachRange = configService.get<string>(
      'GOOGLE_SHEETS_OUTREACH_RANGE',
      'Outreach!A:Z',
    );
    this.spreadsheetId =
      configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID') || '';
  }

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    await ensureOutreachTabExists(
      this.googleAuthService.getSheetsClient(),
      this.googleSheetsService,
      this.spreadsheetId,
      this.outreachRange,
      OUTREACH_SHEET_HEADERS,
    );
    this.isInitialized = true;
  }

  async findAll(): Promise<Outreach[]> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.outreachRange);
    if (!raw || raw.length <= 1) return [];

    const headerKeys = mapHeadersToOutreachKeys(raw[0]);
    return raw
      .slice(1)
      .filter((row) => row.some((c) => c && c.trim().length > 0))
      .map((row, i) => rowToOutreach(headerKeys, row, i + 2));
  }

  async findById(id: string): Promise<Outreach | null> {
    const list = await this.findAll();
    return (
      list.find((o) => o.id.toLowerCase() === id.trim().toLowerCase()) || null
    );
  }

  async findByMemberId(memberId: string): Promise<Outreach[]> {
    const list = await this.findAll();
    const cleanId = memberId.trim().toLowerCase();
    return list.filter((o) => o.memberId.toLowerCase() === cleanId);
  }

  async create(outreach: Outreach): Promise<Outreach> {
    await this.ensureInitialized();
    await this.googleSheetsService.appendRow(
      this.outreachRange,
      outreachToRow(outreach),
    );
    return outreach;
  }

  async update(id: string, updates: Partial<Outreach>): Promise<Outreach> {
    await this.ensureInitialized();
    const raw = await this.googleSheetsService.readRange(this.outreachRange);
    if (!raw || raw.length <= 1) {
      throw new NotFoundException(`Outreach record with ID ${id} not found`);
    }

    const headerKeys = mapHeadersToOutreachKeys(raw[0]);
    const { rowIndex, existing } = findOutreachRowIndex(raw, headerKeys, id);

    if (rowIndex === -1 || !existing) {
      throw new NotFoundException(`Outreach record with ID ${id} not found`);
    }

    const updated: Outreach = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    const sheet = parseSheetName(this.outreachRange);
    const range = buildRowRange(sheet, rowIndex, OUTREACH_SHEET_HEADERS.length);
    await this.googleSheetsService.updateCells(range, [outreachToRow(updated)]);
    return updated;
  }
}
