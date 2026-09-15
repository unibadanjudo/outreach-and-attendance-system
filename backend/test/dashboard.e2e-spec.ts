import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GoogleSheetsService } from '../src/google/google-sheets.service';
import {
  createAuthTestApp,
  loginAndGetCookie,
} from './helpers/test-auth.helper';
import { DashboardSummaryDto } from '../src/dashboard/dto/dashboard-summary-response.dto';
import { DashboardAttendanceDto } from '../src/dashboard/dto/dashboard-attendance-response.dto';
import { DashboardOutreachDto } from '../src/dashboard/dto/dashboard-outreach-response.dto';
import { PaginatedInactiveMembersDto } from '../src/dashboard/dto/inactive-members-response.dto';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

describe('Dashboard (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  const memberHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Phone Number',
  ];
  const memberRows = [
    ['2026-01-01', 'Active', 'Member', '08011111111'],
    ['2026-01-02', 'Recent', 'Dropout', '08022222222'],
    ['2026-01-03', 'Never', 'Joined', '08033333333'],
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
  const attendanceRows = [
    [
      'att_1',
      '08011111111',
      '2026-09-12',
      'MORNING',
      'PRESENT',
      'coach@uijudo.club',
      '',
      '2026-09-12T10:00:00.000Z',
    ],
    [
      'att_2',
      '08022222222',
      '2026-08-20',
      'EVENING',
      'PRESENT',
      'coach@uijudo.club',
      '',
      '2026-08-20T10:00:00.000Z',
    ],
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
  const outreachRows = [
    [
      'out_1',
      '08022222222',
      'coach@uijudo.club',
      '2026-08-25T10:00:00.000Z',
      'WHATSAPP',
      'RESPONDED',
      'Checking in',
      'Returning soon',
      '2026-09-01',
      '2026-08-25T10:00:00.000Z',
      '2026-08-25T10:00:00.000Z',
    ],
  ];

  beforeAll(async () => {
    const mockSheetsService = {
      readRange: jest.fn().mockImplementation((range: string) => {
        if (range.includes('Outreach')) {
          return Promise.resolve([outreachHeaders, ...outreachRows]);
        }
        if (range.includes('Attendance')) {
          return Promise.resolve([attendanceHeaders, ...attendanceRows]);
        }
        return Promise.resolve([memberHeaders, ...memberRows]);
      }),
      appendRow: jest.fn().mockResolvedValue(undefined),
      updateCells: jest.fn().mockResolvedValue(undefined),
    };

    app = await createAuthTestApp('3009', (builder) =>
      builder.overrideProvider(GoogleSheetsService).useValue(mockSheetsService),
    );
    authCookie = await loginAndGetCookie(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Guard', () => {
    it('GET /api/dashboard/summary should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .expect(401);
    });

    it('GET /api/dashboard/attendance should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/attendance')
        .expect(401);
    });

    it('GET /api/dashboard/outreach should return 401 without auth', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/outreach')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return executive summary metrics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/summary')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ApiResponse<DashboardSummaryDto>;
      expect(body.success).toBe(true);
      expect(body.data.totalMembers).toBe(3);
      expect(body.data.activeMembers).toBe(1);
      expect(body.data.recentlyInactiveMembers).toBe(1);
      expect(body.data.neverAttendedMembers).toBe(1);
      expect(body.data.attendanceTrends).toBeDefined();
    });
  });

  describe('GET /api/dashboard/attendance', () => {
    it('should return attendance metrics breakdown and timeline', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/attendance')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ApiResponse<DashboardAttendanceDto>;
      expect(body.success).toBe(true);
      expect(body.data.totalRecords).toBe(2);
      expect(body.data.totalPresent).toBe(2);
      expect(body.data.dailyAttendanceLast14Days).toHaveLength(14);
      expect(body.data.sessionBreakdown).toBeDefined();
    });
  });

  describe('GET /api/dashboard/outreach', () => {
    it('should return outreach channels, statuses, and conversion stats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/outreach')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ApiResponse<DashboardOutreachDto>;
      expect(body.success).toBe(true);
      expect(body.data.totalOutreach).toBe(1);
      expect(body.data.contactMethodBreakdown.WHATSAPP).toBe(1);
      expect(body.data.statusBreakdown.RESPONDED).toBe(1);
      expect(body.data.followUpsDue).toBe(1);
    });
  });

  describe('GET /api/dashboard/inactive-members', () => {
    it('should return paginated inactive members list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/inactive-members')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ApiResponse<PaginatedInactiveMembersDto>;
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBeGreaterThanOrEqual(2);
    });
  });
});
