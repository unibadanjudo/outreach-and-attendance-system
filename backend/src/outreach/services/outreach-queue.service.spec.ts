import { OutreachQueueService } from './outreach-queue.service';
import { OutreachPriorityService } from './outreach-priority.service';
import { OutreachRepository } from '../repositories/outreach.repository.interface';
import { MemberRepository } from '../../members/repositories/member.repository.interface';
import { AttendanceAnalyticsService } from '../../attendance/services/attendance-analytics.service';
import { InactivityService } from '../../attendance/services/inactivity.service';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import {
  ContactMethod,
  Outreach,
  OutreachPriority,
  OutreachStatus,
} from '../models/outreach.model';

describe('OutreachQueueService', () => {
  let service: OutreachQueueService;
  let mockOutreachRepo: jest.Mocked<OutreachRepository>;
  let mockMemberRepo: jest.Mocked<MemberRepository>;
  let mockAnalyticsService: jest.Mocked<AttendanceAnalyticsService>;
  let mockInactivityService: jest.Mocked<InactivityService>;
  let priorityService: OutreachPriorityService;

  const sampleMembers = [
    {
      id: 'mem-1',
      firstName: 'Taro',
      lastName: 'Yamada',
      otherNames: '',
      nickname: 'Taro',
      phoneNumber: '08011111111',
      facultyDepartment: 'Law',
      matricNumber: 'LAW001',
      dateOfBirth: '2000-01-01',
      judoStartDate: '2025-01-01',
      motivation: 'Fitness',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
    {
      id: 'mem-2',
      firstName: 'Kenji',
      lastName: 'Sato',
      otherNames: '',
      nickname: '',
      phoneNumber: '08022222222',
      facultyDepartment: 'Engineering',
      matricNumber: 'ENG002',
      dateOfBirth: '2001-02-02',
      judoStartDate: '2025-02-01',
      motivation: 'Competition',
      createdAt: '2025-02-01',
      updatedAt: '2025-02-01',
    },
  ];

  beforeEach(() => {
    mockOutreachRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      findByMemberId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockMemberRepo = {
      findAll: jest.fn().mockResolvedValue(sampleMembers),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      findByMatric: jest.fn(),
      search: jest.fn(),
    };

    mockAnalyticsService = {
      getMemberAnalytics: jest.fn().mockImplementation((id: string) => {
        if (id === 'mem-1') {
          return Promise.resolve({
            totalAttendance: 8,
            attendanceInLast7Days: 0,
            attendanceInLast30Days: 0,
            attendanceInLast60Days: 2,
            attendanceInLast90Days: 6,
            lastAttendanceDate: '2026-08-01',
            previousAttendanceDate: '2026-07-20',
            daysSinceLastAttendance: 43,
            attendanceFrequency: 0.46,
            recentAttendanceTrend: 'DECLINING',
          });
        }
        return Promise.resolve({
          totalAttendance: 0,
          attendanceInLast7Days: 0,
          attendanceInLast30Days: 0,
          attendanceInLast60Days: 0,
          attendanceInLast90Days: 0,
          lastAttendanceDate: null,
          previousAttendanceDate: null,
          daysSinceLastAttendance: null,
          attendanceFrequency: 0,
          recentAttendanceTrend: 'NO_ATTENDANCE',
        });
      }),
    } as unknown as jest.Mocked<AttendanceAnalyticsService>;

    mockInactivityService = {
      determineStatus: jest
        .fn()
        .mockImplementation((analytics: MemberAttendanceAnalytics) => {
          if (analytics.totalAttendance === 0) {
            return ActivityStatus.NEVER_ATTENDED;
          }
          return ActivityStatus.RECENTLY_INACTIVE;
        }),
    } as unknown as jest.Mocked<InactivityService>;

    priorityService = new OutreachPriorityService();

    service = new OutreachQueueService(
      mockOutreachRepo,
      mockMemberRepo,
      mockAnalyticsService,
      mockInactivityService,
      priorityService,
    );
  });

  it('should generate a prioritized outreach queue and summary stats', async () => {
    const queue = await service.getQueue({});
    expect(queue.items).toHaveLength(2);
    expect(queue.summary.totalInQueue).toBe(2);
    // mem-1 has totalAttendance=8 and RECENTLY_INACTIVE => HIGH
    expect(queue.items[0].member.id).toBe('mem-1');
    expect(queue.items[0].priority).toBe(OutreachPriority.HIGH);
    expect(queue.items[0].recommendedAction).toBe('Contact member');

    // mem-2 is NEVER_ATTENDED => MEDIUM
    expect(queue.items[1].member.id).toBe('mem-2');
    expect(queue.items[1].priority).toBe(OutreachPriority.MEDIUM);
  });

  it('should prioritize members whose follow-up is due above non-due members', async () => {
    const pastOutreach: Outreach = {
      id: 'out-1',
      memberId: 'mem-2',
      contactedBy: 'Coach',
      contactedAt: '2026-09-01T09:00:00.000Z',
      contactMethod: ContactMethod.PHONE_CALL,
      status: OutreachStatus.RESPONDED,
      message: 'Spoke with Taro',
      nextFollowUpDate: '2026-09-10', // Due
      createdAt: '2026-09-01T09:00:00.000Z',
      updatedAt: '2026-09-01T09:00:00.000Z',
    };
    mockOutreachRepo.findAll.mockResolvedValueOnce([pastOutreach]);

    const queue = await service.getQueue({});
    expect(queue.items[0].member.id).toBe('mem-2');
    expect(queue.items[0].followUp.isFollowUpDue).toBe(true);
    expect(queue.items[0].recommendedAction).toBe('Follow up with member');
  });

  it('should filter queue by priority', async () => {
    const queue = await service.getQueue({ priority: OutreachPriority.HIGH });
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0].member.id).toBe('mem-1');
  });

  it('should filter queue by search term', async () => {
    const queue = await service.getQueue({ search: 'Kenji' });
    expect(queue.items).toHaveLength(1);
    expect(queue.items[0].member.id).toBe('mem-2');
  });
});
