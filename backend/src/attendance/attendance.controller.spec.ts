import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './models/attendance.model';
import { UserSession } from '../auth/interfaces/user-session.interface';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let mockService: Partial<AttendanceService>;

  const mockUser: UserSession = {
    email: 'coach@uijudo.club',
    role: 'COACH',
  };

  const mockRecord: Attendance = {
    id: 'att_123',
    memberId: 'mem_08011112222',
    attendanceDate: '2026-09-15',
    trainingSession: 'TUESDAY',
    status: 'PRESENT',
    markedBy: 'coach@uijudo.club',
    isCorrection: false,
    createdAt: '2026-09-15T17:00:00.000Z',
    updatedAt: '2026-09-15T17:00:00.000Z',
  };

  beforeEach(() => {
    mockService = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockRecord],
        meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }),
      findById: jest.fn().mockResolvedValue(mockRecord),
      create: jest.fn().mockResolvedValue(mockRecord),
      batchCreate: jest.fn().mockResolvedValue([mockRecord]),
      update: jest.fn().mockResolvedValue(mockRecord),
      delete: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      findByMemberId: jest.fn().mockResolvedValue([mockRecord]),
    };

    controller = new AttendanceController(mockService as AttendanceService);
  });

  it('findAll should return paginated attendance list', async () => {
    const result = await controller.findAll({ page: 1, limit: 50 });
    expect(result.items).toHaveLength(1);
    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 50 });
  });

  it('findById should return a single attendance record', async () => {
    const result = await controller.findById('att_123');
    expect(result.id).toBe('att_123');
    expect(mockService.findById).toHaveBeenCalledWith('att_123');
  });

  it('create should call service with dto and user email', async () => {
    const dto = {
      memberId: 'mem_08011112222',
      attendanceDate: '2026-09-15',
      trainingSession: 'TUESDAY' as const,
      status: 'PRESENT' as const,
    };
    const result = await controller.create(dto, mockUser);
    expect(result.id).toBe('att_123');
    expect(mockService.create).toHaveBeenCalledWith(dto, 'coach@uijudo.club');
  });

  it('createBatch should call batchCreate with user email', async () => {
    const dto = {
      records: [
        {
          memberId: 'mem_08011112222',
          attendanceDate: '2026-09-15',
          trainingSession: 'TUESDAY' as const,
          status: 'PRESENT' as const,
        },
      ],
    };
    const result = await controller.createBatch(dto, mockUser);
    expect(result).toHaveLength(1);
    expect(mockService.batchCreate).toHaveBeenCalledWith(dto, 'coach@uijudo.club');
  });

  it('update should call service update with id, dto, and user email', async () => {
    const dto = { status: 'EXCUSED' as const };
    const result = await controller.update('att_123', dto, mockUser);
    expect(result.id).toBe('att_123');
    expect(mockService.update).toHaveBeenCalledWith('att_123', dto, 'coach@uijudo.club');
  });

  it('delete should call service delete with id', async () => {
    const result = await controller.delete('att_123');
    expect(result.success).toBe(true);
    expect(mockService.delete).toHaveBeenCalledWith('att_123');
  });

  it('getMemberAttendance should return member attendance history', async () => {
    const result = await controller.getMemberAttendance('mem_08011112222');
    expect(result).toHaveLength(1);
    expect(mockService.findByMemberId).toHaveBeenCalledWith('mem_08011112222');
  });
});
