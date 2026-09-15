import {
  cellToString,
  columnIndexToLetter,
  entityToRow,
  findMatchingRows,
  mapHeaders,
  normalizeHeaderKey,
  prepareMergedRow,
  rowToEntity,
} from './sheet-row.mapper';

describe('SheetRowMapper', () => {
  const sampleHeaders = ['ID', 'Full Name', 'Belt Rank', 'Status'];

  describe('columnIndexToLetter', () => {
    it('should convert 0-based column indexes to A1 letters', () => {
      expect(columnIndexToLetter(0)).toBe('A');
      expect(columnIndexToLetter(3)).toBe('D');
      expect(columnIndexToLetter(25)).toBe('Z');
      expect(columnIndexToLetter(26)).toBe('AA');
    });
  });

  describe('normalizeHeaderKey', () => {
    it('should normalize header strings to camelCase properties', () => {
      expect(normalizeHeaderKey('Full Name')).toBe('fullName');
      expect(normalizeHeaderKey('belt_rank')).toBe('beltRank');
      expect(normalizeHeaderKey('Session-Date')).toBe('sessionDate');
      expect(normalizeHeaderKey('ID')).toBe('id');
      expect(normalizeHeaderKey('')).toBe('');
    });
  });

  describe('cellToString', () => {
    it('should safely convert unknown cell values to trimmed strings', () => {
      expect(cellToString(null)).toBe('');
      expect(cellToString(undefined)).toBe('');
      expect(cellToString('  hello ')).toBe('hello');
      expect(cellToString(42)).toBe('42');
      expect(cellToString(true)).toBe('true');
    });
  });

  describe('mapHeaders', () => {
    it('should map headers to column indexes', () => {
      const map = mapHeaders(['ID', 'Full Name', 'Belt Rank']);
      expect(map.get('id')).toBe(0);
      expect(map.get('fullName')).toBe(1);
      expect(map.get('beltRank')).toBe(2);
    });
  });

  describe('rowToEntity & entityToRow', () => {
    it('should convert row cell array to typed entity', () => {
      const entity = rowToEntity<{
        id: string;
        fullName: string;
        beltRank: string;
      }>(sampleHeaders, ['mem_1', 'Kano Jigoro', 'Black', 'ACTIVE']);

      expect(entity.id).toBe('mem_1');
      expect(entity.fullName).toBe('Kano Jigoro');
      expect(entity.beltRank).toBe('Black');
    });

    it('should convert entity to row values aligned with sheet headers', () => {
      const row = entityToRow(sampleHeaders, {
        id: 'mem_99',
        fullName: 'New Athlete',
        beltRank: 'Yellow',
        status: 'ACTIVE',
      });

      expect(row).toEqual(['mem_99', 'New Athlete', 'Yellow', 'ACTIVE']);
    });
  });

  describe('findMatchingRows & prepareMergedRow', () => {
    const dataRows = [
      ['mem_1', 'Kano Jigoro', 'Black', 'ACTIVE'],
      ['mem_2', 'Yamashita Yasuhiro', 'Red', 'ACTIVE'],
    ];

    it('should find rows matching predicate and calculate 1-based sheet row index', () => {
      const matches = findMatchingRows<{ id: string; status: string }>(
        sampleHeaders,
        dataRows,
        (r) => r.status === 'ACTIVE',
      );

      expect(matches).toHaveLength(2);
      expect(matches[0].rowIndex).toBe(2);
      expect(matches[1].rowIndex).toBe(3);
    });

    it('should merge existing row values with updates', () => {
      const existing = ['mem_1', 'Kano Jigoro', 'Black', 'ACTIVE'];
      const updated = prepareMergedRow(sampleHeaders, existing, {
        status: 'INACTIVE',
      });

      expect(updated).toEqual(['mem_1', 'Kano Jigoro', 'Black', 'INACTIVE']);
    });
  });
});
