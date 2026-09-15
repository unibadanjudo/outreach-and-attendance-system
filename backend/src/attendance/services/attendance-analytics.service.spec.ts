import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceAnalyticsService } from './attendance-analytics.service';
import { ATTENDANCE_REPOSITORY } from '../repositories/attendance.repository.interface';
import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../models/attendance.model';

describe('AttendanceAnalyticsService', () => {
  let service: AttendanceAnalyticsService;

  const mockAttendanceRepo = {
    findByMemberId: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceAnalyticsService,
        {
          provide: ATTENDANCE_REPOSITORY,
          useValue: mockAttendanceRepo,
        },
      ],
    }).compile();

    service = module.get<AttendanceAnalyticsService>(
      AttendanceAnalyticsService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compute analytics for a member by querying repository', async () => {
    const fixedToday = new Date('2026-09-13T12:00:00+01:00');
    const records: Attendance[] = [
      {
        id: 'att_1',
        memberId: '08012345678',
        attendanceDate: '2026-09-10',
        trainingSession: TrainingSession.MORNING,
        status: AttendanceStatus.PRESENT,
        recordedBy: 'coach@uijudo.club',
        createdAt: '2026-09-10T10:00:00Z',
      },
    ];

    mockAttendanceRepo.findByMemberId.mockResolvedValue(records);

    const analytics = await service.getMemberAnalytics(
      '08012345678',
      fixedToday,
    );
    expect(analytics.totalAttendance).toBe(1);
    expect(analytics.lastAttendanceDate).toBe('2026-09-10');
    expect(analytics.daysSinceLastAttendance).toBe(3);
    expect(analytics.attendanceInLast7Days).toBe(1);
  });

  it('should group records by memberId and compute batch analytics', async () => {
    const fixedToday = new Date('2026-09-13T12:00:00+01:00');
    const allRecords: Attendance[] = [
      {
        id: 'att_1',
        memberId: 'mem_1',
        attendanceDate: '2026-09-12',
        trainingSession: TrainingSession.MORNING,
        status: AttendanceStatus.PRESENT,
        recordedBy: 'coach@uijudo.club',
        createdAt: '2026-09-12T10:00:00Z',
      },
      {
        id: 'att_2',
        memberId: 'mem_2',
        attendanceDate: '2026-08-01',
        trainingSession: TrainingSession.EVENING,
        status: AttendanceStatus.PRESENT,
        recordedBy: 'coach@uijudo.club',
        createdAt: '2026-08-01T10:00:00Z',
      },
    ];

    mockAttendanceRepo.findAll.mockResolvedValue(allRecords);

    const batch = await service.getAllMembersAnalytics(fixedToday);
    expect(batch.has('mem_1')).toBe(true);
    expect(batch.has('mem_2')).toBe(true);
    expect(batch.get('mem_1')?.daysSinceLastAttendance).toBe(1);
    expect(batch.get('mem_2')?.daysSinceLastAttendance).toBe(43);
  });
});
