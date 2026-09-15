import { OutreachPriorityService } from './outreach-priority.service';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import {
  ContactMethod,
  Outreach,
  OutreachPriority,
  OutreachStatus,
} from '../models/outreach.model';

describe('OutreachPriorityService', () => {
  let service: OutreachPriorityService;
  const refDate = new Date('2026-09-13T10:00:00.000Z');

  beforeEach(() => {
    service = new OutreachPriorityService();
  });

  const baseAnalytics: MemberAttendanceAnalytics = {
    totalAttendance: 10,
    attendanceInLast7Days: 0,
    attendanceInLast30Days: 1,
    attendanceInLast60Days: 4,
    attendanceInLast90Days: 8,
    lastAttendanceDate: '2026-08-20',
    previousAttendanceDate: '2026-08-15',
    daysSinceLastAttendance: 24,
    attendanceFrequency: 0.62,
    recentAttendanceTrend: 'DECLINING',
  };

  describe('computeFollowUpInfo', () => {
    it('should return nulls when member has never been contacted', () => {
      const followUp = service.computeFollowUpInfo(null, refDate);
      expect(followUp.isFollowUpDue).toBe(false);
      expect(followUp.nextFollowUpDate).toBeNull();
      expect(followUp.daysUntilFollowUp).toBeNull();
    });

    it('should mark follow-up due when nextFollowUpDate is today or in the past', () => {
      const lastOutreach: Outreach = {
        id: 'out-1',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-01T10:00:00.000Z',
        contactMethod: ContactMethod.PHONE_CALL,
        status: OutreachStatus.RESPONDED,
        message: 'Checking in',
        nextFollowUpDate: '2026-09-10', // 3 days ago
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-01T10:00:00.000Z',
      };

      const followUp = service.computeFollowUpInfo(lastOutreach, refDate);
      expect(followUp.isFollowUpDue).toBe(true);
      expect(followUp.daysUntilFollowUp).toBeLessThanOrEqual(0);
    });

    it('should not mark follow-up due when nextFollowUpDate is in the future', () => {
      const lastOutreach: Outreach = {
        id: 'out-2',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-10T10:00:00.000Z',
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.RESPONDED,
        message: 'Checking in',
        nextFollowUpDate: '2026-09-20', // 7 days in the future
        createdAt: '2026-09-10T10:00:00.000Z',
        updatedAt: '2026-09-10T10:00:00.000Z',
      };

      const followUp = service.computeFollowUpInfo(lastOutreach, refDate);
      expect(followUp.isFollowUpDue).toBe(false);
      expect(followUp.daysUntilFollowUp).toBe(7);
    });

    it('should automatically mark follow-up due after 7 days if no explicit date set for contacted status', () => {
      const lastOutreach: Outreach = {
        id: 'out-3',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-01T10:00:00.000Z', // 12 days ago
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.CONTACTED,
        message: 'Checking in',
        createdAt: '2026-09-01T10:00:00.000Z',
        updatedAt: '2026-09-01T10:00:00.000Z',
      };

      const followUp = service.computeFollowUpInfo(lastOutreach, refDate);
      expect(followUp.isFollowUpDue).toBe(true);
    });
  });

  describe('calculatePriority', () => {
    it('should return HIGH when follow-up is due', () => {
      const followUp = {
        isFollowUpDue: true,
        nextFollowUpDate: '2026-09-10',
        daysUntilFollowUp: -3,
        lastContactedAt: '2026-09-01',
        lastContactMethod: 'PHONE_CALL',
      };

      const priority = service.calculatePriority(
        ActivityStatus.RECENTLY_INACTIVE,
        baseAnalytics,
        null,
        followUp,
      );
      expect(priority).toBe(OutreachPriority.HIGH);
    });

    it('should return LOW when member was recently contacted and follow-up is not due', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: '2026-09-25',
        daysUntilFollowUp: 12,
        lastContactedAt: '2026-09-10',
        lastContactMethod: 'WHATSAPP',
      };
      const outreach: Outreach = {
        id: 'out-1',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-10',
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.CONTACTED,
        message: 'Hey',
        createdAt: '2026-09-10',
        updatedAt: '2026-09-10',
      };

      const priority = service.calculatePriority(
        ActivityStatus.RECENTLY_INACTIVE,
        baseAnalytics,
        outreach,
        followUp,
      );
      expect(priority).toBe(OutreachPriority.LOW);
    });

    it('should return HIGH for a recently inactive regular attendee who has not been contacted', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };

      const priority = service.calculatePriority(
        ActivityStatus.RECENTLY_INACTIVE,
        { ...baseAnalytics, totalAttendance: 8 },
        null,
        followUp,
      );
      expect(priority).toBe(OutreachPriority.HIGH);
    });

    it('should return MEDIUM for never attended member', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };

      const priority = service.calculatePriority(
        ActivityStatus.NEVER_ATTENDED,
        { ...baseAnalytics, totalAttendance: 0, daysSinceLastAttendance: null },
        null,
        followUp,
      );
      expect(priority).toBe(OutreachPriority.MEDIUM);
    });

    it('should return LOW for active members', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };

      const priority = service.calculatePriority(
        ActivityStatus.ACTIVE,
        baseAnalytics,
        null,
        followUp,
      );
      expect(priority).toBe(OutreachPriority.LOW);
    });
  });

  describe('determineRecommendedAction', () => {
    it('should return "No action required" for active members', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };
      expect(
        service.determineRecommendedAction(
          ActivityStatus.ACTIVE,
          null,
          followUp,
        ),
      ).toBe('No action required');
    });

    it('should return "Contact member" when member has never been contacted', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };
      expect(
        service.determineRecommendedAction(
          ActivityStatus.RECENTLY_INACTIVE,
          null,
          followUp,
        ),
      ).toBe('Contact member');
    });

    it('should return "Follow up with member" when follow-up is due', () => {
      const followUp = {
        isFollowUpDue: true,
        nextFollowUpDate: '2026-09-10',
        daysUntilFollowUp: -3,
        lastContactedAt: '2026-09-01',
        lastContactMethod: 'PHONE_CALL',
      };
      const outreach: Outreach = {
        id: 'out-1',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-01',
        contactMethod: ContactMethod.PHONE_CALL,
        status: OutreachStatus.WILL_RETURN,
        message: 'Plan to return',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      };

      expect(
        service.determineRecommendedAction(
          ActivityStatus.RECENTLY_INACTIVE,
          outreach,
          followUp,
        ),
      ).toBe('Follow up with member');
    });

    it('should return "Member plans to return" when follow-up is not yet due', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: '2026-09-20',
        daysUntilFollowUp: 7,
        lastContactedAt: '2026-09-10',
        lastContactMethod: 'PHONE_CALL',
      };
      const outreach: Outreach = {
        id: 'out-1',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-10',
        contactMethod: ContactMethod.PHONE_CALL,
        status: OutreachStatus.WILL_RETURN,
        message: 'Plan to return',
        nextFollowUpDate: '2026-09-20',
        createdAt: '2026-09-10',
        updatedAt: '2026-09-10',
      };

      expect(
        service.determineRecommendedAction(
          ActivityStatus.RECENTLY_INACTIVE,
          outreach,
          followUp,
        ),
      ).toBe('Member plans to return');
    });

    it('should return "Await response" when contacted recently and no response yet', () => {
      const followUp = {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: '2026-09-12',
        lastContactMethod: 'WHATSAPP',
      };
      const outreach: Outreach = {
        id: 'out-1',
        memberId: 'mem-1',
        contactedBy: 'Coach',
        contactedAt: '2026-09-12',
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.CONTACTED,
        message: 'Checking in',
        createdAt: '2026-09-12',
        updatedAt: '2026-09-12',
      };

      expect(
        service.determineRecommendedAction(
          ActivityStatus.RECENTLY_INACTIVE,
          outreach,
          followUp,
        ),
      ).toBe('Await response');
    });
  });
});
