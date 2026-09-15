import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GoogleSheetsService } from '../src/google/google-sheets.service';
import {
  createAuthTestApp,
  loginAndGetCookie,
} from './helpers/test-auth.helper';
import {
  ContactMethod,
  Outreach,
  OutreachPriority,
  OutreachStatus,
} from '../src/outreach/models/outreach.model';
import { OutreachQueueItem } from '../src/outreach/models/outreach-queue.model';

interface OutreachListResponse {
  success: boolean;
  data: {
    items: Outreach[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface OutreachQueueResponse {
  success: boolean;
  data: {
    summary: {
      totalInQueue: number;
      highPriorityCount: number;
      mediumPriorityCount: number;
      lowPriorityCount: number;
      followUpDueCount: number;
    };
    items: OutreachQueueItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface OutreachItemResponse {
  success: boolean;
  data: Outreach;
}

interface MemberOutreachHistoryResponse {
  success: boolean;
  data: {
    memberId: string;
    totalOutreach: number;
    lastContactedAt: string | null;
    items: Outreach[];
  };
}

describe('Outreach (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  const memberHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Phone Number',
  ];
  const memberRows = [
    ['2026-01-01', 'Charity', 'Ayodele', '09028872023'],
    ['2026-01-02', 'Victor', 'Oladokun', '08033334444'],
    ['2026-01-03', 'John', 'Doe', '07011112222'],
  ];

  const attendanceHeaders = [
    'Attendance ID',
    'Member ID',
    'Attendance Date',
    'Session',
    'Status',
    'Recorded By',
    'Notes',
    'Created At',
  ];

  const attendanceRows: string[][] = [
    // Charity attended once long ago
    [
      'att_1',
      'mem_09028872023',
      '2026-07-01',
      'GENERAL',
      'PRESENT',
      'coach@uijudo.club',
      'Past session',
      '2026-07-01T18:00:00.000Z',
    ],
    // Victor attended regularly (8 sessions)
    ...Array.from({ length: 8 }, (_, i) => [
      `att_v_${i}`,
      'mem_08033334444',
      '2026-08-20',
      'GENERAL',
      'PRESENT',
      'coach@uijudo.club',
      'Regular session',
      '2026-08-20T18:00:00.000Z',
    ]),
  ];

  const outreachHeaders = [
    'Outreach ID',
    'Member ID',
    'Contacted By',
    'Contacted At',
    'Contact Method',
    'Status',
    'Message',
    'Response',
    'Next Follow Up Date',
    'Created At',
    'Updated At',
  ];

  const storedOutreachRows: string[][] = [
    [
      'out_init_1',
      'mem_09028872023',
      'coach@uijudo.club',
      '2026-08-25T10:00:00.000Z',
      'PHONE_CALL',
      'RESPONDED',
      'Called Charity to check in',
      'She said she would be back in September',
      '2026-09-01', // Follow-up is now due
      '2026-08-25T10:00:00.000Z',
      '2026-08-25T10:00:00.000Z',
    ],
  ];

  beforeAll(async () => {
    const mockSheetsService = {
      readRange: jest.fn().mockImplementation((range: string) => {
        if (range.includes('Outreach')) {
          return Promise.resolve([outreachHeaders, ...storedOutreachRows]);
        }
        if (range.includes('Attendance')) {
          return Promise.resolve([attendanceHeaders, ...attendanceRows]);
        }
        return Promise.resolve([memberHeaders, ...memberRows]);
      }),
      appendRow: jest
        .fn()
        .mockImplementation((range: string, row: string[]) => {
          if (range.includes('Outreach')) {
            storedOutreachRows.push(row);
          }
          return Promise.resolve();
        }),
      updateCells: jest
        .fn()
        .mockImplementation((range: string, rows: string[][]) => {
          if (range.includes('Outreach') && rows.length > 0) {
            const updatedRow = rows[0];
            const id = updatedRow[0];
            const index = storedOutreachRows.findIndex((r) => r[0] === id);
            if (index !== -1) {
              storedOutreachRows[index] = updatedRow;
            }
          }
          return Promise.resolve();
        }),
    };

    app = await createAuthTestApp('3007', (builder) =>
      builder.overrideProvider(GoogleSheetsService).useValue(mockSheetsService),
    );
    authCookie = await loginAndGetCookie(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Security Checks', () => {
    it('GET /api/outreach should return 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/outreach').expect(401);
    });

    it('GET /api/outreach/queue should return 401 when unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/outreach/queue').expect(401);
    });
  });

  describe('GET /api/outreach/queue', () => {
    it('should return prioritized queue identifying members who need attention', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/outreach/queue')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as OutreachQueueResponse;
      expect(body.success).toBe(true);
      expect(body.data.summary.totalInQueue).toBeGreaterThanOrEqual(3);
      expect(body.data.items.length).toBeGreaterThanOrEqual(3);

      // Verify follow-up due is high priority for Charity
      const charityItem = body.data.items.find(
        (i) => i.member.id === 'mem_09028872023',
      );
      expect(charityItem).toBeDefined();
      expect(charityItem?.followUp.isFollowUpDue).toBe(true);
      expect(charityItem?.priority).toBe(OutreachPriority.HIGH);
      expect(charityItem?.recommendedAction).toBe('Follow up with member');

      // Verify Victor is high priority because he was a regular attendee who is recently inactive
      const victorItem = body.data.items.find(
        (i) => i.member.id === 'mem_08033334444',
      );
      expect(victorItem).toBeDefined();
      expect(victorItem?.priority).toBe(OutreachPriority.HIGH);
      expect(victorItem?.recommendedAction).toBe('Contact member');

      // Verify John Doe who never attended is medium priority
      const johnItem = body.data.items.find(
        (i) => i.member.id === 'mem_07011112222',
      );
      expect(johnItem).toBeDefined();
      expect(johnItem?.priority).toBe(OutreachPriority.MEDIUM);
      expect(johnItem?.recommendedAction).toBe('Contact member');
    });

    it('should filter queue by priority and search query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/outreach/queue?priority=HIGH&search=Victor')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as OutreachQueueResponse;
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].member.lastName).toBe('Oladokun');
    });
  });

  describe('POST /api/outreach & GET /api/outreach/:id', () => {
    let createdId: string;

    it('should record an outreach contact', async () => {
      const payload = {
        memberId: 'mem_08033334444',
        contactMethod: ContactMethod.WHATSAPP,
        status: OutreachStatus.CONTACTED,
        message: 'Sent WhatsApp check-in to Victor',
        nextFollowUpDate: '2026-09-25',
      };

      const res = await request(app.getHttpServer())
        .post('/api/outreach')
        .set('Cookie', authCookie)
        .send(payload)
        .expect(201);

      const body = res.body as OutreachItemResponse;
      expect(body.success).toBe(true);
      expect(body.data.memberId).toBe('mem_08033334444');
      expect(body.data.contactMethod).toBe(ContactMethod.WHATSAPP);
      expect(body.data.status).toBe(OutreachStatus.CONTACTED);
      createdId = body.data.id;
    });

    it('GET /api/outreach/:id should return the created outreach record', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/outreach/${createdId}`)
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as OutreachItemResponse;
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(createdId);
      expect(body.data.memberId).toBe('mem_08033334444');
    });

    it('PATCH /api/outreach/:id should update status and response', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/outreach/${createdId}`)
        .set('Cookie', authCookie)
        .send({
          status: OutreachStatus.WILL_RETURN,
          response: 'Victor responded: Returning for next session!',
        })
        .expect(200);

      const body = res.body as OutreachItemResponse;
      expect(body.success).toBe(true);
      expect(body.data.status).toBe(OutreachStatus.WILL_RETURN);
      expect(body.data.response).toBe(
        'Victor responded: Returning for next session!',
      );
    });
  });

  describe('GET /api/outreach', () => {
    it('should list outreach records with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/outreach')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as OutreachListResponse;
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/members/:id/outreach', () => {
    it('should return outreach history for a member', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/mem_09028872023/outreach')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as MemberOutreachHistoryResponse;
      expect(body.success).toBe(true);
      expect(body.data.memberId).toBe('mem_09028872023');
      expect(body.data.totalOutreach).toBeGreaterThanOrEqual(1);
      expect(body.data.items[0].contactMethod).toBe(ContactMethod.PHONE_CALL);
    });

    it('should return 404 for unknown member', async () => {
      await request(app.getHttpServer())
        .get('/api/members/non-existent-member/outreach')
        .set('Cookie', authCookie)
        .expect(404);
    });
  });
});
