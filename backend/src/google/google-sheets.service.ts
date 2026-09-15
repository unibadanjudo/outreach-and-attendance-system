import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsException } from './errors/google-sheets.exception';
import {
  buildRowRange,
  cellToString,
  entityToRow,
  findMatchingRows,
  parseSheetName,
  prepareMergedRow,
  rowToEntity,
} from './mappers/sheet-row.mapper';
import { executeWithRetry } from './utils/retry.util';

@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private readonly spreadsheetId: string;

  constructor(
    configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
  ) {
    this.spreadsheetId =
      configService.get<string>('GOOGLE_SHEETS_SPREADSHEET_ID') || '';
  }

  private get client() {
    return this.googleAuthService.getSheetsClient();
  }

  private readonly cache = new Map<string, { data: string[][]; expiry: number }>();
  private readonly CACHE_TTL_MS = 15_000; // 15 seconds TTL absorbs parallel dashboard loads

  clearCache(): void {
    this.cache.clear();
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: { range?: string; spreadsheetId?: string },
    maxRetries = 3,
    baseDelayMs = 100,
  ): Promise<T> {
    return executeWithRetry(operation, {
      context: { spreadsheetId: this.spreadsheetId, ...context },
      maxRetries,
      baseDelayMs,
      logger: this.logger,
    });
  }

  async readRange(range: string): Promise<string[][]> {
    const now = Date.now();
    const cached = this.cache.get(range);
    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const res = await this.executeWithRetry(
      () =>
        this.client.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range,
        }),
      { range },
    );
    const rows = (res?.data?.values || []) as unknown[][];
    const data = rows.map((r) => r.map((c) => cellToString(c)));
    this.cache.set(range, { data, expiry: now + this.CACHE_TTL_MS });
    return data;
  }

  async readRows<T>(range: string): Promise<T[]> {
    const data = await this.readRange(range);
    return data?.length > 1
      ? data.slice(1).map((row) => rowToEntity<T>(data[0], row))
      : [];
  }

  async findRows<T>(
    range: string,
    predicate: (row: T) => boolean,
  ): Promise<Array<{ row: T; rowIndex: number }>> {
    const data = await this.readRange(range);
    if (!data || data.length <= 1) return [];
    return findMatchingRows<T>(data[0], data.slice(1), predicate);
  }

  async findRow<T>(range: string, predicate: (row: T) => boolean) {
    return (await this.findRows<T>(range, predicate))[0] ?? null;
  }

  async appendRows(
    range: string,
    rows: (string | number)[][],
  ): Promise<void> {
    if (!rows.length) return;
    this.clearCache();
    await this.executeWithRetry(
      () =>
        this.client.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: rows },
        }),
      { range },
    );
  }

  async appendRow(
    range: string,
    rowData: Record<string, unknown> | (string | number)[],
  ): Promise<void> {
    let values: (string | number)[];
    if (Array.isArray(rowData)) {
      values = rowData;
    } else {
      const sheet = parseSheetName(range);
      const headers = (await this.readRange(`${sheet}!1:1`))?.[0] || [];
      values = entityToRow(headers, rowData);
    }
    await this.appendRows(range, [values]);
  }

  async updateRow(
    range: string,
    rowIndex: number,
    rowData: Record<string, unknown>,
  ): Promise<void> {
    this.clearCache();
    const sheet = parseSheetName(range);
    const headers = (await this.readRange(`${sheet}!1:1`))?.[0] || [];
    if (!headers.length) {
      throw new GoogleSheetsException(`No headers found in "${sheet}".`);
    }

    const rowRange = buildRowRange(sheet, rowIndex, headers.length);
    const existing = (await this.readRange(rowRange))?.[0] || [];
    const values = prepareMergedRow(headers, existing, rowData);

    await this.executeWithRetry(
      () =>
        this.client.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: rowRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [values] },
        }),
      { range },
    );
  }

  async updateCells(
    range: string,
    values: (string | number)[][],
  ): Promise<void> {
    this.clearCache();
    await this.executeWithRetry(
      () =>
        this.client.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values },
        }),
      { range },
    );
  }

  async batchUpdateRanges(
    data: Array<{ range: string; values: (string | number)[][] }>,
  ): Promise<void> {
    if (!data.length) return;
    this.clearCache();
    await this.executeWithRetry(
      () =>
        this.client.spreadsheets.values.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data,
          },
        }),
    );
  }
}

