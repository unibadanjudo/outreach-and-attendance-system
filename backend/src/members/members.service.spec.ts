import { NotFoundException } from '@nestjs/common';
import { MembersService } from './members.service';
import { MemberRepository } from './repositories/member.repository.interface';
import { Member } from './models/member.model';
import { AttendanceAnalyticsService } from '../attendance/services/attendance-analytics.service';
import { InactivityService } from '../attendance/services/inactivity.service';

describe('MembersService', () => {
  let service: MembersService;
  let mockRepository: jest.Mocked<MemberRepository>;

  const mockMembers: Member[] = [
    {
      id: 'mem_08011112222',
      firstName: 'Jigoro',
      lastName: 'Kano',
      otherNames: '',
      nickname: '',
      phoneNumber: '08011112222',
      facultyDepartment: 'Education',
      matricNumber: '111111',
      dateOfBirth: '1860-10-28',
      judoStartDate: '1882-05-01',
      motivation: 'Education',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'mem_08033334444',
      firstName: 'Yasuhiro',
      lastName: 'Yamashita',
      otherNames: '',
      nickname: '',
      phoneNumber: '08033334444',
      facultyDepartment: 'Science',
      matricNumber: '222222',
      dateOfBirth: '1957-06-01',
      judoStartDate: '1970-01-01',
      motivation: 'Sport',
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
    },
  ];

  let searchMock: jest.Mock;
  let mockAnalyticsService: {
    getMemberAnalytics: jest.Mock;
  };
  let mockInactivityService: {
    determineStatus: jest.Mock;
    getMemberActivityDetails: jest.Mock;
  };

  beforeEach(() => {
    searchMock = jest.fn();
    mockRepository = {
      findAll: jest.fn().mockResolvedValue(mockMembers),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      findByMatric: jest.fn(),
      search: searchMock,
      update: jest.fn().mockImplementation((id, updates) =>
        Promise.resolve({ ...mockMembers[0], ...updates }),
      ),
    };

    mockAnalyticsService = {
      getMemberAnalytics: jest.fn().mockResolvedValue({
        totalAttendance: 5,
        attendanceInLast7Days: 2,
        attendanceInLast30Days: 4,
        attendanceInLast60Days: 5,
        attendanceInLast90Days: 5,
        lastAttendanceDate: '2026-09-10',
        previousAttendanceDate: '2026-09-08',
        daysSinceLastAttendance: 3,
        attendanceFrequency: 0.39,
        recentAttendanceTrend: 'INCREASING',
      }),
    };

    mockInactivityService = {
      determineStatus: jest.fn().mockReturnValue('ACTIVE'),
      getMemberActivityDetails: jest.fn().mockResolvedValue({
        memberId: 'mem_08011112222',
        status: 'ACTIVE',
        daysInactive: 3,
        analytics: {
          totalAttendance: 5,
        },
      }),
    };

    service = new MembersService(
      mockRepository,
      mockAnalyticsService as unknown as AttendanceAnalyticsService,
      mockInactivityService as unknown as InactivityService,
    );
  });

  describe('findAll', () => {
    it('should return paginated members with metadata', async () => {
      const result = await service.findAll({ page: 1, limit: 1 });
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should delegate to search when search query is provided', async () => {
      searchMock.mockResolvedValueOnce([mockMembers[0]]);
      const result = await service.findAll({
        search: 'Kano',
        page: 1,
        limit: 50,
      });
      expect(searchMock).toHaveBeenCalledWith('Kano');
      expect(result.items).toHaveLength(1);
    });

    it('should filter members by faculty/department', async () => {
      const result = await service.findAll({
        facultyDepartment: 'Science',
        page: 1,
        limit: 50,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0].lastName).toBe('Yamashita');
    });
  });

  describe('findById', () => {
    it('should return member when found', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockMembers[0]);
      const member = await service.findById('mem_08011112222');
      expect(member.firstName).toBe('Jigoro');
    });

    it('should throw NotFoundException when member does not exist', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);
      await expect(service.findById('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMemberSummary', () => {
    it('should return summary with member and engagement stats', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockMembers[0]);
      const summary = await service.getMemberSummary('mem_08011112222');
      expect(summary.member.id).toBe('mem_08011112222');
      expect(summary.attendanceCount).toBe(5);
      expect(summary.lastAttendedDate).toBe('2026-09-10');
      expect(summary.activityStatus).toBe('ACTIVE');
      expect(summary.outreachCount).toBe(0);
      expect(summary.attendanceStats.totalAttendance).toBe(5);
      expect(summary.recommendedAction).toBe('No action required');
      expect(summary.outreachHistory).toEqual([]);
    });
  });

  describe('getMemberActivity', () => {
    it('should return member activity details', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockMembers[0]);
      const activity = await service.getMemberActivity('mem_08011112222');
      expect(activity.memberId).toBe('mem_08011112222');
      expect(activity.status).toBe('ACTIVE');
      expect(mockInactivityService.getMemberActivityDetails).toHaveBeenCalled();
    });
  });

  describe('update and updateBeltRank', () => {
    it('should update member information', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockMembers[0]);
      const updated = await service.update('mem_08011112222', {
        nickname: 'Sensei Kano',
        beltRank: 'Black Belt (10th Dan - Judan)',
      });
      expect(mockRepository.update).toHaveBeenCalledWith('mem_08011112222', {
        nickname: 'Sensei Kano',
        beltRank: 'Black Belt (10th Dan - Judan)',
      });
      expect(updated.nickname).toBe('Sensei Kano');
      expect(updated.beltRank).toBe('Black Belt (10th Dan - Judan)');
    });

    it('should update belt rank directly', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockMembers[0]);
      const updated = await service.updateBeltRank(
        'mem_08011112222',
        'Brown Belt (1st Kyu)',
      );
      expect(mockRepository.update).toHaveBeenCalledWith('mem_08011112222', {
        beltRank: 'Brown Belt (1st Kyu)',
      });
      expect(updated.beltRank).toBe('Brown Belt (1st Kyu)');
    });
  });
});

