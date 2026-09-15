import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { ATTENDANCE_REPOSITORY } from './repositories/attendance.repository.interface';
import { MembersService } from '../members/members.service';
import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from './models/attendance.model';
import { Member } from '../members/models/member.model';

describe('AttendanceService', () => {
  let service: AttendanceService;

  const mockMember: Member = {
    id: 'mem_1',
    firstName: 'Charity',
    lastName: 'Ayodele',
    otherNames: '',
    nickname: '',
    phoneNumber: '09028872023',
    facultyDepartment: 'Education',
    matricNumber: '238279',
    dateOfBirth: '07/04/2001',
    judoStartDate: '01/12/2024',
    motivation: 'Fitness',
    createdAt: '2026-09-12',
    updatedAt: '2026-09-12',
  };

  const mockAttendance: Attendance = {
    id: 'att_101',
    memberId: 'mem_1',
    attendanceDate: '2026-09-13',
    trainingSession: TrainingSession.GENERAL,
    status: AttendanceStatus.PRESENT,
    recordedBy: 'coach@uijudo.club',
    notes: 'Good energy',
    createdAt: '2026-09-13T09:00:00.000Z',
  };

  const mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByMemberId: jest.fn(),
    findByMemberAndSession: jest.fn(),
    create: jest.fn(),
    batchUpsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMembersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: ATTENDANCE_REPOSITORY, useValue: mockRepository },
        { provide: MembersService, useValue: mockMembersService },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  describe('create', () => {
    it('should create an attendance record successfully', async () => {
      mockMembersService.findById.mockResolvedValue(mockMember);
      mockRepository.findByMemberAndSession.mockResolvedValue(null);
      mockRepository.create.mockImplementation((rec) => Promise.resolve(rec));

      const result = await service.create(
        {
          memberId: 'mem_1',
          attendanceDate: '2026-09-13',
          trainingSession: TrainingSession.GENERAL,
          status: AttendanceStatus.PRESENT,
        },
        'coach@uijudo.club',
      );

      expect(result.memberId).toBe('mem_1');
      expect(result.attendanceDate).toBe('2026-09-13');
      expect(result.recordedBy).toBe('coach@uijudo.club');
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if member does not exist', async () => {
      mockMembersService.findById.mockRejectedValue(new NotFoundException());

      await expect(
        service.create({ memberId: 'unknown_mem' }, 'coach@uijudo.club'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate entry when isCorrection is false', async () => {
      mockMembersService.findById.mockResolvedValue(mockMember);
      mockRepository.findByMemberAndSession.mockResolvedValue(mockAttendance);

      await expect(
        service.create(
          {
            memberId: 'mem_1',
            attendanceDate: '2026-09-13',
            trainingSession: TrainingSession.GENERAL,
            isCorrection: false,
          },
          'coach@uijudo.club',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should update existing record if isCorrection is true', async () => {
      mockMembersService.findById.mockResolvedValue(mockMember);
      mockRepository.findByMemberAndSession.mockResolvedValue(mockAttendance);
      mockRepository.update.mockResolvedValue({
        ...mockAttendance,
        status: AttendanceStatus.EXCUSED,
      });

      const result = await service.create(
        {
          memberId: 'mem_1',
          attendanceDate: '2026-09-13',
          trainingSession: TrainingSession.GENERAL,
          status: AttendanceStatus.EXCUSED,
          isCorrection: true,
        },
        'coach@uijudo.club',
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        mockAttendance.id,
        expect.objectContaining({ status: AttendanceStatus.EXCUSED }),
      );
      expect(result.status).toBe(AttendanceStatus.EXCUSED);
    });
  });

  describe('findAll', () => {
    it('should filter attendance by session and status', async () => {
      mockRepository.findAll.mockResolvedValue([
        mockAttendance,
        {
          ...mockAttendance,
          id: 'att_102',
          trainingSession: TrainingSession.COMPETITION,
          status: AttendanceStatus.ABSENT,
        },
      ]);

      const result = await service.findAll({
        session: TrainingSession.GENERAL,
        status: AttendanceStatus.PRESENT,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('att_101');
      expect(result.meta.total).toBe(1);
    });

    it('should filter attendance by date range', async () => {
      mockRepository.findAll.mockResolvedValue([
        mockAttendance,
        { ...mockAttendance, id: 'att_103', attendanceDate: '2026-09-20' },
        { ...mockAttendance, id: 'att_104', attendanceDate: '2026-10-05' },
      ]);

      const result = await service.findAll({
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      });

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('batchCreate', () => {
    it('should delegate to repository batchUpsert and return records', async () => {
      mockRepository.batchUpsert.mockImplementation(async (recs) => recs);
      const res = await service.batchCreate(
        {
          records: [
            {
              memberId: 'mem_1',
              attendanceDate: '2026-09-13',
              trainingSession: TrainingSession.SATURDAY,
              status: AttendanceStatus.PRESENT,
            },
          ],
        },
        'coach@uijudo.club',
      );
      expect(res).toHaveLength(1);
      expect(mockRepository.batchUpsert).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no records provided', async () => {
      const res = await service.batchCreate({ records: [] }, 'coach@uijudo.club');
      expect(res).toEqual([]);
      expect(mockRepository.batchUpsert).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return record if found', async () => {
      mockRepository.findById.mockResolvedValue(mockAttendance);
      const res = await service.findById('att_101');
      expect(res.id).toBe('att_101');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);
      await expect(service.findById('att_none')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete existing attendance record', async () => {
      mockRepository.findById.mockResolvedValue(mockAttendance);
      mockRepository.delete.mockResolvedValue(true);

      const res = await service.delete('att_101');
      expect(res.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('att_101');
    });
  });
});
