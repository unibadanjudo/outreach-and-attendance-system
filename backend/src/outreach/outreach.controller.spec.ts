import { OutreachController } from './outreach.controller';
import { OutreachService } from './services/outreach.service';
import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from './models/outreach.model';
import { UserSession } from '../auth/interfaces/user-session.interface';

describe('OutreachController', () => {
  let controller: OutreachController;
  let mockFindAll: jest.Mock;
  let mockGetQueue: jest.Mock;
  let mockFindById: jest.Mock;
  let mockFindByMemberId: jest.Mock;
  let mockCreate: jest.Mock;
  let mockUpdate: jest.Mock;

  const mockUser: UserSession = {
    email: 'coach@uijudo.org',
    name: 'Coach Test',
    role: 'COACH',
  };

  const sampleOutreach: Outreach = {
    id: 'out-001',
    memberId: 'mem-1',
    contactedBy: 'Coach Test',
    contactedAt: '2026-09-12T10:00:00.000Z',
    contactMethod: ContactMethod.PHONE_CALL,
    status: OutreachStatus.CONTACTED,
    message: 'Checking in',
    createdAt: '2026-09-12T10:00:00.000Z',
    updatedAt: '2026-09-12T10:00:00.000Z',
  };

  beforeEach(() => {
    mockFindAll = jest.fn().mockResolvedValue({
      items: [sampleOutreach],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
    mockGetQueue = jest.fn().mockResolvedValue({
      summary: { totalInQueue: 1 },
      items: [],
      meta: { total: 1, page: 1, limit: 50, totalPages: 1 },
    });
    mockFindById = jest.fn().mockResolvedValue(sampleOutreach);
    mockFindByMemberId = jest.fn().mockResolvedValue({
      memberId: 'mem-1',
      totalOutreach: 1,
      lastContactedAt: '2026-09-12T10:00:00.000Z',
      items: [sampleOutreach],
    });
    mockCreate = jest.fn().mockResolvedValue(sampleOutreach);
    mockUpdate = jest.fn().mockResolvedValue({
      ...sampleOutreach,
      status: OutreachStatus.RESPONDED,
    });

    const mockService = {
      findAll: mockFindAll,
      getQueue: mockGetQueue,
      findById: mockFindById,
      findByMemberId: mockFindByMemberId,
      create: mockCreate,
      update: mockUpdate,
    } as unknown as OutreachService;

    controller = new OutreachController(mockService);
  });

  it('should return paginated outreach logs', async () => {
    const res = await controller.findAll({});
    expect(res.items).toHaveLength(1);
    expect(mockFindAll).toHaveBeenCalled();
  });

  it('should return outreach queue', async () => {
    const res = await controller.getQueue({});
    expect(res.summary.totalInQueue).toBe(1);
    expect(mockGetQueue).toHaveBeenCalled();
  });

  it('should return outreach by ID', async () => {
    const res = await controller.findById('out-001');
    expect(res.id).toBe('out-001');
  });

  it('should record an outreach contact', async () => {
    const res = await controller.create(
      {
        memberId: 'mem-1',
        contactMethod: ContactMethod.PHONE_CALL,
        status: OutreachStatus.CONTACTED,
        message: 'Checking in',
      },
      mockUser,
    );
    expect(res.id).toBe('out-001');
    expect(mockCreate).toHaveBeenCalledWith(expect.anything(), 'Coach Test');
  });

  it('should update an outreach record', async () => {
    const res = await controller.update('out-001', {
      status: OutreachStatus.RESPONDED,
    });
    expect(res.status).toBe(OutreachStatus.RESPONDED);
  });

  it('should return member outreach history', async () => {
    const res = await controller.getMemberOutreach('mem-1');
    expect(res.memberId).toBe('mem-1');
    expect(res.totalOutreach).toBe(1);
  });
});
