import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InactivityService } from './inactivity.service';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { ActivityStatus } from '../models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../models/attendance-analytics.model';

describe('InactivityService', () => {
  let service: InactivityService;

  const mockAnalyticsService = {
    getMemberAnalytics: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: number) => {
      const configMap: Record<string, number> = {
        'app.inactivity.activeDays': 14,
        'app.inactivity.recentlyInactiveDays': 30,
        'app.inactivity.inactiveDays': 60,
        'app.inactivity.longTermInactiveDays': 90,
      };
      return configMap[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InactivityService,
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: AttendanceAnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<InactivityService>(InactivityService);
    jest.clearAllMocks();
  });

  function createAnalytics(
    total: number,
    days: number | null,
  ): MemberAttendanceAnalytics {
    return {
      totalAttendance: total,
      attendanceInLast7Days: 0,
      attendanceInLast30Days: 0,
      attendanceInLast60Days: 0,
      attendanceInLast90Days: 0,
      lastAttendanceDate: days !== null ? '2026-09-01' : null,
      previousAttendanceDate: null,
      daysSinceLastAttendance: days,
      attendanceFrequency: 0,
      recentAttendanceTrend: total === 0 ? 'NO_ATTENDANCE' : 'STABLE',
    };
  }

  describe('determineStatus', () => {
    it('should classify member with 0 attendance as NEVER_ATTENDED', () => {
      const analytics = createAnalytics(0, null);
      expect(service.determineStatus(analytics)).toBe(
        ActivityStatus.NEVER_ATTENDED,
      );
    });

    it('should classify member within ACTIVE_DAYS as ACTIVE', () => {
      expect(service.determineStatus(createAnalytics(5, 0))).toBe(
        ActivityStatus.ACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 7))).toBe(
        ActivityStatus.ACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 14))).toBe(
        ActivityStatus.ACTIVE,
      );
    });

    it('should classify day 15 as RECENTLY_INACTIVE (boundary check)', () => {
      expect(service.determineStatus(createAnalytics(5, 15))).toBe(
        ActivityStatus.RECENTLY_INACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 30))).toBe(
        ActivityStatus.RECENTLY_INACTIVE,
      );
    });

    it('should classify day 31 as INACTIVE (boundary check)', () => {
      expect(service.determineStatus(createAnalytics(5, 31))).toBe(
        ActivityStatus.INACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 60))).toBe(
        ActivityStatus.INACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 90))).toBe(
        ActivityStatus.INACTIVE,
      );
    });

    it('should classify day 91+ as LONG_TERM_INACTIVE (boundary check)', () => {
      expect(service.determineStatus(createAnalytics(5, 91))).toBe(
        ActivityStatus.LONG_TERM_INACTIVE,
      );
      expect(service.determineStatus(createAnalytics(5, 180))).toBe(
        ActivityStatus.LONG_TERM_INACTIVE,
      );
    });

    it('should respect custom threshold overrides', () => {
      const analytics = createAnalytics(5, 20);
      // Default: 20 is RECENTLY_INACTIVE
      expect(service.determineStatus(analytics)).toBe(
        ActivityStatus.RECENTLY_INACTIVE,
      );
      // Custom: activeDays = 21 -> should be ACTIVE
      expect(service.determineStatus(analytics, { activeDays: 21 })).toBe(
        ActivityStatus.ACTIVE,
      );
    });
  });

  describe('calculateOutreachPriorityScore', () => {
    it('should rank RECENTLY_INACTIVE higher than other inactive categories', () => {
      const scoreRecentlyInactive = service.calculateOutreachPriorityScore(
        ActivityStatus.RECENTLY_INACTIVE,
        10,
        20,
      );
      const scoreInactive = service.calculateOutreachPriorityScore(
        ActivityStatus.INACTIVE,
        10,
        45,
      );
      const scoreNeverAttended = service.calculateOutreachPriorityScore(
        ActivityStatus.NEVER_ATTENDED,
        0,
        null,
      );
      const scoreLongTerm = service.calculateOutreachPriorityScore(
        ActivityStatus.LONG_TERM_INACTIVE,
        10,
        120,
      );
      const scoreActive = service.calculateOutreachPriorityScore(
        ActivityStatus.ACTIVE,
        10,
        2,
      );

      expect(scoreRecentlyInactive).toBeGreaterThan(scoreInactive);
      expect(scoreInactive).toBeGreaterThan(scoreNeverAttended);
      expect(scoreNeverAttended).toBeGreaterThan(scoreLongTerm);
      expect(scoreLongTerm).toBeGreaterThan(scoreActive);
    });
  });
});
