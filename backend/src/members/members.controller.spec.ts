import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member } from './models/member.model';

describe('MembersController', () => {
  let controller: MembersController;
  let mockService: Partial<MembersService>;

  const mockMember: Member = {
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
  };

  beforeEach(() => {
    mockService = {
      findAll: jest.fn().mockResolvedValue({
        items: [mockMember],
        meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }),
      findById: jest.fn().mockResolvedValue(mockMember),
      getMemberSummary: jest.fn().mockResolvedValue({
        member: mockMember,
        attendanceCount: 0,
        lastAttendedDate: null,
        outreachCount: 0,
        lastOutreachDate: null,
      }),
    };

    controller = new MembersController(mockService as MembersService);
  });

  const coachUser = { email: 'coach@uijudo.club', role: 'COACH' };
  const reacherUser = { email: 'reacher@uijudo.club', role: 'REACHER' };

  it('findAll should return members list', async () => {
    const result = await controller.findAll({ page: 1, limit: 50 }, coachUser);
    expect(result.items).toHaveLength(1);
    expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 50 });
    expect(result.items[0].dateOfBirth).toBe('1860-10-28');
  });

  it('findAll should mask year of birth for REACHER role', async () => {
    const result = await controller.findAll({ page: 1, limit: 50 }, reacherUser);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].dateOfBirth).toBe('28/10');
  });

  it('findById should return a single member', async () => {
    const result = await controller.findById('mem_08011112222', coachUser);
    expect(result.id).toBe('mem_08011112222');
    expect(result.dateOfBirth).toBe('1860-10-28');
    expect(mockService.findById).toHaveBeenCalledWith('mem_08011112222');
  });

  it('findById should mask year of birth for REACHER role', async () => {
    const result = await controller.findById('mem_08011112222', reacherUser);
    expect(result.id).toBe('mem_08011112222');
    expect(result.dateOfBirth).toBe('28/10');
  });

  it('getMemberSummary should return member summary', async () => {
    const result = await controller.getMemberSummary('mem_08011112222', coachUser);
    expect(result.member.id).toBe('mem_08011112222');
    expect(mockService.getMemberSummary).toHaveBeenCalledWith('mem_08011112222');
  });

  it('getMemberSummary should mask year of birth for REACHER role', async () => {
    const result = await controller.getMemberSummary('mem_08011112222', reacherUser);
    expect(result.member.dateOfBirth).toBe('28/10');
  });

  it('getMemberActivity should return member activity details', async () => {
    (mockService.getMemberActivity as jest.Mock) = jest.fn().mockResolvedValue({
      memberId: 'mem_08011112222',
      status: 'ACTIVE',
      daysInactive: 2,
    });

    const result = await controller.getMemberActivity('mem_08011112222');
    expect(result.status).toBe('ACTIVE');
    expect(mockService.getMemberActivity).toHaveBeenCalledWith(
      'mem_08011112222',
    );
  });
});
