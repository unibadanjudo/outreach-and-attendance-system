import {
  formatToLagosDate,
  getLagosCurrentDate,
  isDateInRange,
  isValidDateString,
} from './attendance-date.util';

describe('AttendanceDateUtil', () => {
  describe('formatToLagosDate', () => {
    it('should format UTC midnight correctly without day shift', () => {
      // 2026-09-13T00:00:00Z in Lagos (UTC+1) is 2026-09-13 01:00:00
      const date = new Date('2026-09-13T00:00:00Z');
      expect(formatToLagosDate(date)).toBe('2026-09-13');
    });

    it('should handle late evening UTC transitioning to next day in Lagos', () => {
      // 2026-09-13T23:30:00Z is 2026-09-14 00:30:00 in Lagos (UTC+1)
      const date = new Date('2026-09-13T23:30:00Z');
      expect(formatToLagosDate(date)).toBe('2026-09-14');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatToLagosDate('invalid-date')).toThrow();
    });
  });

  describe('getLagosCurrentDate', () => {
    it('should return valid YYYY-MM-DD format', () => {
      const today = getLagosCurrentDate();
      expect(isValidDateString(today)).toBe(true);
    });
  });

  describe('isValidDateString', () => {
    it('should return true for valid YYYY-MM-DD', () => {
      expect(isValidDateString('2026-09-13')).toBe(true);
      expect(isValidDateString('2024-02-29')).toBe(true); // Leap year
    });

    it('should return false for invalid formats', () => {
      expect(isValidDateString('13/09/2026')).toBe(false);
      expect(isValidDateString('2026-9-13')).toBe(false);
      expect(isValidDateString('2023-02-29')).toBe(false); // Non-leap year
      expect(isValidDateString('random')).toBe(false);
    });
  });

  describe('isDateInRange', () => {
    it('should correctly evaluate date boundaries', () => {
      expect(isDateInRange('2026-09-15', '2026-09-01', '2026-09-30')).toBe(
        true,
      );
      expect(isDateInRange('2026-09-01', '2026-09-01', '2026-09-30')).toBe(
        true,
      );
      expect(isDateInRange('2026-09-30', '2026-09-01', '2026-09-30')).toBe(
        true,
      );
      expect(isDateInRange('2026-08-31', '2026-09-01', '2026-09-30')).toBe(
        false,
      );
      expect(isDateInRange('2026-10-01', '2026-09-01', '2026-09-30')).toBe(
        false,
      );
    });
  });
});
