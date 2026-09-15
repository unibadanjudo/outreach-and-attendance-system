import { NotFoundException } from '@nestjs/common';
import { OutreachService } from './outreach.service';
import { OutreachQueueService } from './outreach-queue.service';
import { OutreachRepository } from '../repositories/outreach.repository.interface';
import { MemberRepository } from '../../members/repositories/member.repository.interface';
import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from '../models/outreach.model';
import { Member } from '../../members/models/member.model';

describe('OutreachService', () => {
  let service: OutreachService;
  let mockFindAll: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByMemberId: jest.Mock;
  let mockRepoCreate: jest.Mock;
  let mockRepoUpdate: jest.Mock;
  let mockMemberRepo: jest.Mocked<MemberRepository>;
  let mockQueueService: jest.Mocked<OutreachQueueService>;

  const mockMember: Member = {
    id: 'mem-100',
    firstName: 'Jane',
    lastName: 'Doe',
    otherNames: '',
    nickname: '',
    phoneNumber: '08012345678',
    facultyDepartment: 'Science',
    matricNumber: 'SCI100',
    dateOfBirth: '2000-01-01',
    judoStartDate: '2025-01-01',
    motivation: 'Sport',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  const sampleOutreach: Outreach = {
    id: 'out-001',
    memberId: 'mem-100',
    contactedBy: 'Coach Jane',
    contactedAt: '2026-09-12T10:00:00.000Z',
    contactMethod: ContactMethod.PHONE_CALL,
    status: OutreachStatus.CONTACTED,
    message: 'Called member',
    nextFollowUpDate: '2026-09-19',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
  };

  beforeEach(() => {
    mockFindAll = jest.fn().mockResolvedValue([sampleOutreach]);
    mockFindById = jest.fn().mockResolvedValue(sampleOutreach);
    mockFindByMemberId = jest.fn().mockResolvedValue([sampleOutreach]);
    mockRepoCreate = jest
      .fn()
      .mockImplementation((r: Outreach) => Promise.resolve(r));
    mockRepoUpdate = jest
      .fn()
      .mockImplementation((id: string, u: Partial<Outreach>) =>
        Promise.resolve({ ...sampleOutreach, ...u }),
      );

    const mockOutreachRepo: OutreachRepository = {
      findAll: mockFindAll,
      findById: mockFindById,
      findByMemberId: mockFindByMemberId,
      create: mockRepoCreate,
      update: mockRepoUpdate,
    };

    mockMemberRepo = {
      findAll: jest.fn().mockResolvedValue([mockMember]),
      findById: jest.fn().mockResolvedValue(mockMember),
      findByPhone: jest.fn().mockResolvedValue(mockMember),
      findByMatric: jest.fn().mockResolvedValue(mockMember),
      search: jest.fn().mockResolvedValue([mockMember]),
    };

    mockQueueService = {
      getQueue: jest.fn().mockResolvedValue({
        summary: {
          totalInQueue: 1,
          highPriorityCount: 1,
          mediumPriorityCount: 0,
          lowPriorityCount: 0,
          followUpDueCount: 0,
        },
        items: [],
        meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }),
    } as unknown as jest.Mocked<OutreachQueueService>;

    service = new OutreachService(
      mockOutreachRepo,
      mockMemberRepo,
      mockQueueService,
    );
  });

  describe('findAll', () => {
    it('should return paginated outreach list', async () => {
      const result = await service.findAll({});
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by memberId and status', async () => {
      const result = await service.findAll({
        memberId: 'mem-100',
        status: OutreachStatus.CONTACTED,
      });
      expect(result.items).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return outreach if exists', async () => {
      const item = await service.findById('out-001');
      expect(item.id).toBe('out-001');
    });

    it('should throw NotFoundException if not found', async () => {
      mockFindById.mockResolvedValueOnce(null);
      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create outreach when member exists', async () => {
      const created = await service.create({
        memberId: 'mem-100',
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.PENDING,
        message: 'Sent WhatsApp check-in',
      });
      expect(created.memberId).toBe('mem-100');
      expect(created.contactedBy).toBe('Staff');
      expect(mockRepoCreate).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when member does not exist', async () => {
      mockMemberRepo.findById.mockResolvedValueOnce(null);
      await expect(
        service.create({
          memberId: 'unknown',
          contactMethod: ContactMethod.EMAIL,
          status: OutreachStatus.PENDING,
          message: 'Hello',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing outreach record', async () => {
      const updated = await service.update('out-001', {
        status: OutreachStatus.RESPONDED,
        response: 'Member is eager to return',
      });
      expect(updated.status).toBe(OutreachStatus.RESPONDED);
      expect(mockRepoUpdate).toHaveBeenCalledWith('out-001', {
        status: OutreachStatus.RESPONDED,
        response: 'Member is eager to return',
      });
    });
  });

  describe('findByMemberId', () => {
    it('should return member outreach history', async () => {
      const history = await service.findByMemberId('mem-100');
      expect(history.memberId).toBe('mem-100');
      expect(history.totalOutreach).toBe(1);
      expect(history.items).toHaveLength(1);
    });
  });
});
