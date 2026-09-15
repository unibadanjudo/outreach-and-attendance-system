import {
  findMemberRow,
  ensureColumnForField,
  updateMemberInSheet,
} from './member-sheet.util';
import { mapHeadersToMemberKeys } from '../mappers/member-row.mapper';

describe('member-sheet.util', () => {
  const sampleHeaders = ['Timestamp', 'First Name', 'Last Name', 'Phone Number', 'Matric'];
  const sampleRows = [
    sampleHeaders,
    ['2026-01-01', 'Jigoro', 'Kano', '08011112222', '111111'],
    ['2026-01-02', 'Keiko', 'Fukuda', '08022223333', '222222'],
  ];

  describe('findMemberRow', () => {
    const headerKeys = mapHeadersToMemberKeys(sampleHeaders);

    it('should find member row by ID, phone, or matric', () => {
      const foundByPhone = findMemberRow(sampleRows, headerKeys, '08011112222');
      expect(foundByPhone).not.toBeNull();
      expect(foundByPhone?.rowIndex).toBe(2);
      expect(foundByPhone?.member.firstName).toBe('Jigoro');

      const foundByMatric = findMemberRow(sampleRows, headerKeys, '222222');
      expect(foundByMatric).not.toBeNull();
      expect(foundByMatric?.rowIndex).toBe(3);
      expect(foundByMatric?.member.firstName).toBe('Keiko');
    });

    it('should return null when member does not exist', () => {
      const found = findMemberRow(sampleRows, headerKeys, '08099999999');
      expect(found).toBeNull();
    });
  });

  describe('ensureColumnForField', () => {
    it('should return existing column index if already present', async () => {
      const mockSheetsService = { updateCells: jest.fn() } as any;
      const headers = [...sampleHeaders, 'Belt Rank'];
      const idx = await ensureColumnForField(mockSheetsService, 'Members', headers, 'beltRank');
      expect(idx).toBe(5);
      expect(mockSheetsService.updateCells).not.toHaveBeenCalled();
    });

    it('should append header to sheet if missing and return new column index', async () => {
      const mockSheetsService = { updateCells: jest.fn().mockResolvedValue(undefined) } as any;
      const headers = [...sampleHeaders];
      const idx = await ensureColumnForField(mockSheetsService, 'Members', headers, 'beltRank');
      expect(idx).toBe(5);
      expect(mockSheetsService.updateCells).toHaveBeenCalledWith('Members!F1', [['Belt Rank']]);
      expect(headers).toContain('Belt Rank');
    });
  });

  describe('updateMemberInSheet', () => {
    it('should update member cells and return updated member object', async () => {
      const currentRows = [
        [...sampleHeaders],
        ['2026-01-01', 'Jigoro', 'Kano', '08011112222', '111111'],
      ];

      const mockSheetsService = {
        readRange: jest.fn().mockResolvedValue(currentRows),
        updateCells: jest.fn().mockResolvedValue(undefined),
      } as any;

      const updated = await updateMemberInSheet(
        mockSheetsService,
        'Members!A:Z',
        '08011112222',
        {
          nickname: 'Sensei',
          beltRank: 'Black Belt (10th Dan - Judan)',
        },
      );

      expect(mockSheetsService.updateCells).toHaveBeenCalled();
      expect(updated.nickname).toBe('Sensei');
      expect(updated.beltRank).toBe('Black Belt (10th Dan - Judan)');
    });
  });
});
