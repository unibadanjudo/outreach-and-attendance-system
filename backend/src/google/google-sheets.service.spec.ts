import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsService } from './google-sheets.service';

interface TestMember {
  id: string;
  fullName: string;
  beltRank: string;
  status: string;
}

describe('GoogleSheetsService - CRUD Operations', () => {
  let service: GoogleSheetsService;
  let mockSheetsClient: {
    spreadsheets: {
      values: { get: jest.Mock; append: jest.Mock; update: jest.Mock };
    };
  };

  const sampleHeaders = ['ID', 'Full Name', 'Belt Rank', 'Status'];
  const sampleDataRows = [
    ['mem_1', 'Kano Jigoro', 'Black', 'ACTIVE'],
    ['mem_2', 'Yamashita Yasuhiro', 'Red', 'ACTIVE'],
    ['mem_3', 'Nomura Tadahiro', 'Brown', 'INACTIVE'],
  ];

  beforeEach(() => {
    mockSheetsClient = {
      spreadsheets: {
        values: { get: jest.fn(), append: jest.fn(), update: jest.fn() },
      },
    };

    service = new GoogleSheetsService(
      { get: () => 'test-spreadsheet-id-123' } as unknown as ConfigService,
      {
        getSheetsClient: () => mockSheetsClient,
      } as unknown as GoogleAuthService,
    );
  });

  describe('readRange & readRows', () => {
    it('should read raw range from spreadsheet', async () => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [sampleHeaders, ...sampleDataRows] },
      });
      const result = await service.readRange('Members!A:D');
      expect(result).toHaveLength(4);
    });

    it('should read rows and map to typed objects using headers', async () => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [sampleHeaders, ...sampleDataRows] },
      });
      const rows = await service.readRows<TestMember>('Members!A:D');
      expect(rows).toHaveLength(3);
      expect(rows[0].fullName).toBe('Kano Jigoro');
    });

    it('should return empty array if sheet contains only headers', async () => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [sampleHeaders] },
      });
      const rows = await service.readRows('Members!A:D');
      expect(rows).toEqual([]);
    });
  });

  describe('findRow & findRows', () => {
    beforeEach(() => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValue({
        data: { values: [sampleHeaders, ...sampleDataRows] },
      });
    });

    it('should find first row matching predicate with 1-based rowIndex', async () => {
      const res = await service.findRow<TestMember>(
        'Members!A:D',
        (m) => m.fullName === 'Yamashita Yasuhiro',
      );
      expect(res?.row.fullName).toBe('Yamashita Yasuhiro');
      expect(res?.rowIndex).toBe(3);
    });

    it('should return null when row not found', async () => {
      const res = await service.findRow<{ id: string }>(
        'Members!A:D',
        (m) => m.id === 'none',
      );
      expect(res).toBeNull();
    });

    it('should find all rows matching predicate', async () => {
      const res = await service.findRows<TestMember>(
        'Members!A:D',
        (m) => m.status === 'ACTIVE',
      );
      expect(res).toHaveLength(2);
    });
  });

  describe('appendRow & updateRow & updateCells', () => {
    it('should append row object aligned with headers', async () => {
      mockSheetsClient.spreadsheets.values.get.mockResolvedValueOnce({
        data: { values: [sampleHeaders] },
      });
      mockSheetsClient.spreadsheets.values.append.mockResolvedValueOnce({
        data: {},
      });
      await service.appendRow('Members!A:D', {
        id: 'mem_4',
        fullName: 'Teddy Riner',
      });
      expect(mockSheetsClient.spreadsheets.values.append).toHaveBeenCalled();
    });

    it('should append raw array directly', async () => {
      mockSheetsClient.spreadsheets.values.append.mockResolvedValueOnce({
        data: {},
      });
      await service.appendRow('Members!A:D', ['mem_5', 'Shohei Ono']);
      expect(mockSheetsClient.spreadsheets.values.append).toHaveBeenCalled();
    });

    it('should update row by index and preserve untouched values', async () => {
      mockSheetsClient.spreadsheets.values.get
        .mockResolvedValueOnce({ data: { values: [sampleHeaders] } })
        .mockResolvedValueOnce({
          data: { values: [['mem_2', 'Yamashita Yasuhiro', 'Red', 'ACTIVE']] },
        });
      mockSheetsClient.spreadsheets.values.update.mockResolvedValueOnce({
        data: {},
      });
      await service.updateRow('Members!A:D', 3, { status: 'INACTIVE' });
      expect(mockSheetsClient.spreadsheets.values.update).toHaveBeenCalled();
    });

    it('should update cells at specified range', async () => {
      mockSheetsClient.spreadsheets.values.update.mockResolvedValueOnce({
        data: {},
      });
      await service.updateCells('Attendance!B2:C2', [['PRESENT']]);
      expect(mockSheetsClient.spreadsheets.values.update).toHaveBeenCalled();
    });
  });
});
