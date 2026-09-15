import { AttendanceStatus } from '../models/attendance.model';
import {
  computeAttendanceFrequency,
  computeAttendanceTrend,
  computeMemberAttendanceAnalytics,
  differenceInCalendarDays,
} from './attendance-analytics.util';

describe('attendance-analytics.util', () => {
  describe('differenceInCalendarDays', () => {
    it('should return 0 for identical dates', () => {
      expect(differenceInCalendarDays('2026-09-13', '2026-09-13')).toBe(0);
    });

    it('should calculate difference across months accurately', () => {
      expect(differenceInCalendarDays('2026-08-31', '2026-09-01')).toBe(1);
      expect(differenceInCalendarDays('2026-08-14', '2026-09-13')).toBe(30);
    });

    it('should calculate leap year differences if applicable', () => {
      expect(differenceInCalendarDays('2024-02-28', '2024-03-01')).toBe(2);
    });
  });

  describe('computeAttendanceTrend', () => {
    it('should return NO_ATTENDANCE when total attendance is 0', () => {
      expect(computeAttendanceTrend(0, 0, 0)).toBe('NO_ATTENDANCE');
    });

    it('should return INCREASING when last30Days > prev30Days', () => {
      expect(computeAttendanceTrend(10, 6, 2)).toBe('INCREASING');
    });

    it('should return DECLINING when last30Days < prev30Days', () => {
      expect(computeAttendanceTrend(10, 1, 4)).toBe('DECLINING');
    });

    it('should return DECLINING when last30Days is 0 but member attended in the past', () => {
      expect(computeAttendanceTrend(5, 0, 0)).toBe('DECLINING');
    });

    it('should return STABLE when last30Days equals prev30Days and > 0', () => {
      expect(computeAttendanceTrend(8, 4, 4)).toBe('STABLE');
    });
  });

  describe('computeAttendanceFrequency', () => {
    it('should return 0 when 90-day count is 0', () => {
      expect(computeAttendanceFrequency(0)).toBe(0);
    });

    it('should return average sessions per week over 90 days', () => {
      // 13 sessions over ~12.857 weeks = ~1.01 sessions/week
      expect(computeAttendanceFrequency(13)).toBe(1.01);
      // 26 sessions over ~12.857 weeks = ~2.02 sessions/week
      expect(computeAttendanceFrequency(26)).toBe(2.02);
    });
  });

  describe('computeMemberAttendanceAnalytics', () => {
    const fixedToday = new Date('2026-09-13T12:00:00+01:00'); // Lagos local date is 2026-09-13

    it('should handle member with NO attendance records', () => {
      const result = computeMemberAttendanceAnalytics([], fixedToday);
      expect(result.totalAttendance).toBe(0);
      expect(result.lastAttendanceDate).toBeNull();
      expect(result.previousAttendanceDate).toBeNull();
      expect(result.daysSinceLastAttendance).toBeNull();
      expect(result.recentAttendanceTrend).toBe('NO_ATTENDANCE');
      expect(result.attendanceInLast7Days).toBe(0);
      expect(result.attendanceInLast30Days).toBe(0);
      expect(result.attendanceInLast60Days).toBe(0);
      expect(result.attendanceInLast90Days).toBe(0);
    });

    it('should ignore ABSENT and EXCUSED records', () => {
      const records = [
        { attendanceDate: '2026-09-12', status: AttendanceStatus.ABSENT },
        { attendanceDate: '2026-09-10', status: AttendanceStatus.EXCUSED },
      ];
      const result = computeMemberAttendanceAnalytics(records, fixedToday);
      expect(result.totalAttendance).toBe(0);
      expect(result.lastAttendanceDate).toBeNull();
      expect(result.daysSinceLastAttendance).toBeNull();
      expect(result.recentAttendanceTrend).toBe('NO_ATTENDANCE');
    });

    it('should calculate accurate metrics for an active member with multiple sessions', () => {
      const records = [
        { attendanceDate: '2026-09-13', status: AttendanceStatus.PRESENT }, // 0 days ago (today)
        { attendanceDate: '2026-09-08', status: AttendanceStatus.PRESENT }, // 5 days ago (in 7d)
        { attendanceDate: '2026-09-01', status: AttendanceStatus.PRESENT }, // 12 days ago (in 30d)
        { attendanceDate: '2026-08-10', status: AttendanceStatus.PRESENT }, // 34 days ago (in prev30 & 60d)
        { attendanceDate: '2026-07-15', status: AttendanceStatus.PRESENT }, // 60 days ago (in 60d & 90d)
        { attendanceDate: '2026-06-20', status: AttendanceStatus.PRESENT }, // 85 days ago (in 90d)
      ];

      const result = computeMemberAttendanceAnalytics(records, fixedToday);
      expect(result.totalAttendance).toBe(6);
      expect(result.lastAttendanceDate).toBe('2026-09-13');
      expect(result.previousAttendanceDate).toBe('2026-09-08');
      expect(result.daysSinceLastAttendance).toBe(0);
      expect(result.attendanceInLast7Days).toBe(2);
      expect(result.attendanceInLast30Days).toBe(3);
      expect(result.attendanceInLast60Days).toBe(5);
      expect(result.attendanceInLast90Days).toBe(6);
      // last30 is 3, prev30 (days 31-60) is 2 -> INCREASING
      expect(result.recentAttendanceTrend).toBe('INCREASING');
    });

    it('should test exact day boundaries (day 7, day 30, day 60, day 90)', () => {
      // today is 2026-09-13
      // 7 days ago: 2026-09-06
      // 30 days ago: 2026-08-14
      // 60 days ago: 2026-07-15
      // 90 days ago: 2026-06-15
      // 91 days ago: 2026-06-14
      const records = [
        { attendanceDate: '2026-09-06', status: AttendanceStatus.PRESENT }, // exactly 7 days
        { attendanceDate: '2026-08-14', status: AttendanceStatus.PRESENT }, // exactly 30 days
        { attendanceDate: '2026-07-15', status: AttendanceStatus.PRESENT }, // exactly 60 days
        { attendanceDate: '2026-06-15', status: AttendanceStatus.PRESENT }, // exactly 90 days
        { attendanceDate: '2026-06-14', status: AttendanceStatus.PRESENT }, // 91 days (outside 90)
      ];

      const result = computeMemberAttendanceAnalytics(records, fixedToday);
      expect(result.totalAttendance).toBe(5);
      expect(result.attendanceInLast7Days).toBe(1);
      expect(result.attendanceInLast30Days).toBe(2);
      expect(result.attendanceInLast60Days).toBe(3);
      expect(result.attendanceInLast90Days).toBe(4);
      expect(result.daysSinceLastAttendance).toBe(7);
    });
  });
});
