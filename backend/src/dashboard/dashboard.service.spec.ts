import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { MEMBER_REPOSITORY } from '../members/repositories/member.repository.interface';
import { ATTENDANCE_REPOSITORY } from '../attendance/repositories/attendance.repository.interface';
import { OUTREACH_REPOSITORY } from '../outreach/repositories/outreach.repository.interface';
import { AttendanceAnalyticsService } from '../attendance/services/attendance-analytics.service';
import { InactivityService } from '../attendance/services/inactivity.service';
import { OutreachQueueService } from '../outreach/services/outreach-queue.service';
import { ActivityStatus } from '../attendance/models/activity-status.enum';
import { Member } from '../members/models/member.model';
import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../attendance/models/attendance.model';
import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from '../outreach/models/outreach.model';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockMembers: Member[] = [
    {
      id: 'mem_active',
      firstName: 'Active',
      lastName: 'Member',
      otherNames: '',
      nickname: '',
      phoneNumber: '08011111111',
      facultyDepartment: 'Education',
      matricNumber: '111111',
      dateOfBirth: '2000-01-01',
      judoStartDate: '2024-01-01',
      motivation: 'Sport',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'mem_recently_inactive',
      firstName: 'Recent',
      lastName: 'Inactive',
      otherNames: '',
      nickname: '',
      phoneNumber: '08022222222',
      facultyDepartment: 'Science',
      matricNumber: '222222',
      dateOfBirth: '2000-01-01',
      judoStartDate: '2024-01-01',
      motivation: 'Self Defense',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'mem_never',
      firstName: 'Never',
      lastName: 'Attended',
      otherNames: '',
      nickname: '',
      phoneNumber: '08033333333',
      facultyDepartment: 'Arts',
      matricNumber: '333333',
      dateOfBirth: '2000-01-01',
      judoStartDate: '2024-01-01',
      motivation: 'Fitness',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockAttendances: Attendance[] = [
    {
      id: 'att-1',
      memberId: 'mem_active',
      attendanceDate: '2026-09-12',
      trainingSession: TrainingSession.MORNING,
      status: AttendanceStatus.PRESENT,
      recordedBy: 'Coach',
      createdAt: '2026-09-12',
    },
    {
      id: 'att-2',
      memberId: 'mem_recently_inactive',
      attendanceDate: '2026-08-20',
      trainingSession: TrainingSession.EVENING,
      status: AttendanceStatus.PRESENT,
      recordedBy: 'Coach',
      createdAt: '2026-08-20',
    },
  ];

  const mockOutreaches: Outreach[] = [
    {
      id: 'out-1',
      memberId: 'mem_recently_inactive',
      contactedBy: 'Coach',
      contactedAt: '2026-08-25T10:00:00.000Z',
      contactMethod: ContactMethod.PHONE_CALL,
      status: OutreachStatus.RESPONDED,
      message: 'Checking in',
      nextFollowUpDate: '2026-09-01',
      createdAt: '2026-08-25T10:00:00.000Z',
      updatedAt: '2026-08-25T10:00:00.000Z',
    },
  ];

  const mockAnalyticsMap = new Map();
  mockAnalyticsMap.set('mem_active', {
    totalAttendance: 10,
    daysSinceLastAttendance: 2,
    lastAttendanceDate: '2026-09-11',
    recentAttendanceTrend: 'INCREASING',
  });
  mockAnalyticsMap.set('mem_recently_inactive', {
    totalAttendance: 15,
    daysSinceLastAttendance: 20,
    lastAttendanceDate: '2026-08-24',
    recentAttendanceTrend: 'DECLINING',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: MEMBER_REPOSITORY,
          useValue: { findAll: jest.fn().mockResolvedValue(mockMembers) },
        },
        {
          provide: ATTENDANCE_REPOSITORY,
          useValue: { findAll: jest.fn().mockResolvedValue(mockAttendances) },
        },
        {
          provide: OUTREACH_REPOSITORY,
          useValue: { findAll: jest.fn().mockResolvedValue(mockOutreaches) },
        },
        {
          provide: AttendanceAnalyticsService,
          useValue: {
            getAllMembersAnalytics: jest
              .fn()
              .mockResolvedValue(mockAnalyticsMap),
            calculateForRecords: jest.fn().mockReturnValue({
              totalAttendance: 0,
              daysSinceLastAttendance: null,
              lastAttendanceDate: null,
              recentAttendanceTrend: 'NO_ATTENDANCE',
            }),
          },
        },
        {
          provide: InactivityService,
          useValue: {
            determineStatus: jest.fn(
              (an: {
                totalAttendance: number;
                daysSinceLastAttendance: number | null;
              }) => {
                if (an.totalAttendance === 0)
                  return ActivityStatus.NEVER_ATTENDED;
                if ((an.daysSinceLastAttendance ?? 999) <= 14)
                  return ActivityStatus.ACTIVE;
                if ((an.daysSinceLastAttendance ?? 999) <= 30)
                  return ActivityStatus.RECENTLY_INACTIVE;
                return ActivityStatus.INACTIVE;
              },
            ),
            calculateOutreachPriorityScore: jest.fn(
              (status: ActivityStatus) => {
                if (status === ActivityStatus.RECENTLY_INACTIVE) return 10000;
                if (status === ActivityStatus.NEVER_ATTENDED) return 2500;
                return 0;
              },
            ),
          },
        },
        {
          provide: OutreachQueueService,
          useValue: {
            getQueue: jest.fn().mockResolvedValue({
              summary: { totalInQueue: 2, followUpDueCount: 1 },
              items: [],
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('getSummary should return aggregate executive summary metrics', async () => {
    const summary = await service.getSummary();
    expect(summary.totalMembers).toBe(3);
    expect(summary.activeMembers).toBe(1);
    expect(summary.recentlyInactiveMembers).toBe(1);
    expect(summary.neverAttendedMembers).toBe(1);
    expect(summary.membersRequiringOutreach).toBe(2);
    expect(summary.followUpsDue).toBe(1);
    expect(summary.outreachCompleted).toBe(1);
  });

  it('getAttendanceMetrics should return session and volume metrics', async () => {
    const att = await service.getAttendanceMetrics();
    expect(att.totalRecords).toBe(2);
    expect(att.totalPresent).toBe(2);
    expect(att.sessionBreakdown[TrainingSession.MORNING]).toBe(1);
  });

  it('getOutreachMetrics should calculate outreach channel distribution', async () => {
    const out = await service.getOutreachMetrics();
    expect(out.totalOutreach).toBe(1);
    expect(out.contactMethodBreakdown[ContactMethod.PHONE_CALL]).toBe(1);
    expect(out.statusBreakdown[OutreachStatus.RESPONDED]).toBe(1);
  });

  it('getInactiveMembers should return only inactive members', async () => {
    const result = await service.getInactiveMembers();
    expect(result.items).toHaveLength(2);
    const ids = result.items.map((i) => i.member.id);
    expect(ids).toContain('mem_recently_inactive');
    expect(ids).toContain('mem_never');
    expect(ids).not.toContain('mem_active');
  });

  it('getDashboard should return all 4 consolidated metric blocks in one request', async () => {
    const dashboard = await service.getDashboard();
    expect(dashboard).toHaveProperty('summary');
    expect(dashboard).toHaveProperty('attendance');
    expect(dashboard).toHaveProperty('inactiveMembers');
    expect(dashboard).toHaveProperty('outreach');

    expect(dashboard.summary.totalMembers).toBe(3);
    expect(dashboard.attendance.totalRecords).toBe(2);
    expect(Array.isArray(dashboard.inactiveMembers)).toBe(true);
    expect(dashboard.inactiveMembers).toHaveLength(2);
    expect(dashboard.outreach.totalOutreach).toBe(1);
  });
});

