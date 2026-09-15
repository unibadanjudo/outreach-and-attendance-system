import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsService } from './google-sheets.service';
import {
  GoogleRateLimitException,
  InvalidRangeException,
  SheetNotFoundException,
  SpreadsheetNotFoundException,
} from './errors/google-sheets.exception';

describe('GoogleSheetsService - Errors and Retries', () => {
  let service: GoogleSheetsService;
  let mockSheetsClient: {
    spreadsheets: {
      values: {
        get: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    mockSheetsClient = {
      spreadsheets: {
        values: {
          get: jest.fn(),
        },
      },
    };

    const mockGoogleAuthService = {
      getSheetsClient: jest.fn().mockReturnValue(mockSheetsClient),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'GOOGLE_SHEETS_SPREADSHEET_ID')
          return 'test-spreadsheet-id';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleSheetsService,
        { provide: GoogleAuthService, useValue: mockGoogleAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GoogleSheetsService>(GoogleSheetsService);
  });

  it('should map 404 spreadsheet error to SpreadsheetNotFoundException', async () => {
    mockSheetsClient.spreadsheets.values.get.mockRejectedValueOnce({
      status: 404,
      message: 'Spreadsheet not found',
    });
    await expect(service.readRange('Members!A:Z')).rejects.toThrow(
      SpreadsheetNotFoundException,
    );
  });

  it('should map missing worksheet tab to SheetNotFoundException', async () => {
    mockSheetsClient.spreadsheets.values.get.mockRejectedValueOnce({
      status: 404,
      message: 'Sheet not found',
    });
    await expect(service.readRange('NonExistent!A:Z')).rejects.toThrow(
      SheetNotFoundException,
    );
  });

  it('should map 400 to InvalidRangeException', async () => {
    mockSheetsClient.spreadsheets.values.get.mockRejectedValueOnce({
      status: 400,
      message: 'Unable to parse range',
    });
    await expect(service.readRange('InvalidRange!')).rejects.toThrow(
      InvalidRangeException,
    );
  });

  it('should map 429 to GoogleRateLimitException', async () => {
    mockSheetsClient.spreadsheets.values.get.mockRejectedValue({
      status: 429,
      message: 'Quota exceeded',
    });
    await expect(
      service.executeWithRetry(
        () => service.readRange('Members!A:Z'),
        { range: 'Members!A:Z' },
        2,
        10,
      ),
    ).rejects.toThrow(GoogleRateLimitException);
  });

  it('should retry transient 503 errors and succeed', async () => {
    mockSheetsClient.spreadsheets.values.get
      .mockRejectedValueOnce({ status: 503, message: 'Unavailable' })
      .mockResolvedValueOnce({ data: { values: [['ID'], ['1']] } });

    const result = await service.executeWithRetry<unknown[][]>(
      async () => {
        const res = (await mockSheetsClient.spreadsheets.values.get({
          spreadsheetId: 'test-spreadsheet-id',
          range: 'Members!A:D',
        })) as { data: { values?: unknown[][] } };
        return res.data.values ?? [];
      },
      { range: 'Members!A:D' },
      3,
      10,
    );

    expect(result).toHaveLength(2);
    expect(mockSheetsClient.spreadsheets.values.get).toHaveBeenCalledTimes(2);
  });
});
