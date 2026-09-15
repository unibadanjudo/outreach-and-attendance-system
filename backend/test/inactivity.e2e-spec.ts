import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GoogleSheetsService } from '../src/google/google-sheets.service';
import {
  createAuthTestApp,
  loginAndGetCookie,
} from './helpers/test-auth.helper';
import { ActivityStatus } from '../src/attendance/models/activity-status.enum';
import { formatToLagosDate } from '../src/attendance/utils/attendance-date.util';

interface SummaryResponse {
  success: boolean;
  data: {
    member: { phoneNumber: string; id: string };
    attendanceCount: number;
    lastAttendedDate: string | null;
    activityStatus: ActivityStatus;
  };
}

interface ActivityResponse {
  success: boolean;
  data: {
    status: ActivityStatus;
    daysInactive: number | null;
    analytics: {
      totalAttendance: number;
      attendanceInLast7Days: number;
      attendanceInLast30Days: number;
      lastAttendanceDate: string | null;
      previousAttendanceDate: string | null;
    };
  };
}

interface InactiveMembersResponse {
  success: boolean;
  data: {
    items: Array<{
      activityStatus: ActivityStatus;
      member: { phoneNumber: string };
    }>;
  };
}

describe('Attendance Analytics & Inactivity (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  const today = new Date();

  // Helper for date N days ago
  function getDaysAgoStr(days: number): string {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return formatToLagosDate(d);
  }

  const memberHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Phone Number',
    'Faculty-Department',
    'Matric',
  ];
  const memberRows = [
    ['2026-01-01', 'Active', 'Kano', '08011112222', 'Education', '111111'],
    ['2026-01-01', 'Recent', 'Yamashita', '08022222222', 'Science', '222222'],
    ['2026-01-01', 'Never', 'Inoue', '08033333333', 'Arts', '333333'],
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
    // Active member attended 2 days ago and 5 days ago
    [
      'att_1',
      '08011112222',
      getDaysAgoStr(2),
      'Morning',
      'PRESENT',
      'coach@uijudo.club',
      '',
      '2026-01-01',
    ],
    [
      'att_2',
      '08011112222',
      getDaysAgoStr(5),
      'Evening',
      'PRESENT',
      'coach@uijudo.club',
      '',
      '2026-01-01',
    ],
    // Recently inactive attended 20 days ago
    [
      'att_3',
      '08022222222',
      getDaysAgoStr(20),
      'Morning',
      'PRESENT',
      'coach@uijudo.club',
      '',
      '2026-01-01',
    ],
    // Never attended member only has an ABSENT record
    [
      'att_4',
      '08033333333',
      getDaysAgoStr(10),
      'Morning',
      'ABSENT',
      'coach@uijudo.club',
      '',
      '2026-01-01',
    ],
  ];

  beforeAll(async () => {
    const mockSheetsService = {
      readRange: jest.fn().mockImplementation((range: string) => {
        if (range.includes('Attendance')) {
          return Promise.resolve([attendanceHeaders, ...attendanceRows]);
        }
        return Promise.resolve([memberHeaders, ...memberRows]);
      }),
    };

    app = await createAuthTestApp('3008', (builder) =>
      builder.overrideProvider(GoogleSheetsService).useValue(mockSheetsService),
    );

    authCookie = await loginAndGetCookie(app);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('Authentication Guards', () => {
    it('GET /api/members/:id/activity without auth should return 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/08011112222/activity')
        .expect(401);
      const body = res.body as { success: boolean };
      expect(body.success).toBe(false);
    });

    it('GET /api/dashboard/inactive-members without auth should return 401', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/inactive-members')
        .expect(401);
      const body = res.body as { success: boolean };
      expect(body.success).toBe(false);
    });
  });

  describe('GET /api/members/:id/summary', () => {
    it('should return member summary with actual attendance count and status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/08011112222/summary')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as SummaryResponse;
      expect(body.success).toBe(true);
      expect(body.data.member.phoneNumber).toBe('08011112222');
      expect(body.data.attendanceCount).toBe(2);
      expect(body.data.lastAttendedDate).toBe(getDaysAgoStr(2));
      expect(body.data.activityStatus).toBe(ActivityStatus.ACTIVE);
    });

    it('should return NEVER_ATTENDED and 0 attendance for member with only ABSENT', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/08033333333/summary')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as SummaryResponse;
      expect(body.success).toBe(true);
      expect(body.data.attendanceCount).toBe(0);
      expect(body.data.lastAttendedDate).toBeNull();
      expect(body.data.activityStatus).toBe(ActivityStatus.NEVER_ATTENDED);
    });
  });

  describe('GET /api/members/:id/activity', () => {
    it('should return complete activity breakdown for active member', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/08011112222/activity')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ActivityResponse;
      expect(body.success).toBe(true);
      expect(body.data.status).toBe(ActivityStatus.ACTIVE);
      expect(body.data.daysInactive).toBe(2);
      expect(body.data.analytics.totalAttendance).toBe(2);
      expect(body.data.analytics.attendanceInLast7Days).toBe(2);
      expect(body.data.analytics.attendanceInLast30Days).toBe(2);
      expect(body.data.analytics.lastAttendanceDate).toBe(getDaysAgoStr(2));
      expect(body.data.analytics.previousAttendanceDate).toBe(getDaysAgoStr(5));
    });

    it('should return RECENTLY_INACTIVE for member who attended 20 days ago', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/members/08022222222/activity')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as ActivityResponse;
      expect(body.success).toBe(true);
      expect(body.data.status).toBe(ActivityStatus.RECENTLY_INACTIVE);
      expect(body.data.daysInactive).toBe(20);
      expect(body.data.analytics.totalAttendance).toBe(1);
      expect(body.data.analytics.attendanceInLast7Days).toBe(0);
      expect(body.data.analytics.attendanceInLast30Days).toBe(1);
    });
  });

  describe('GET /api/dashboard/inactive-members', () => {
    it('should return only inactive members ranked by outreach relevance', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/dashboard/inactive-members')
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as InactiveMembersResponse;
      expect(body.success).toBe(true);
      const items = body.data.items;
      expect(items.length).toBe(2);

      // Active member should not be in inactive members list
      const phones = items.map((i) => i.member.phoneNumber);
      expect(phones).not.toContain('08011112222');

      // First should be RECENTLY_INACTIVE (highest priority), second NEVER_ATTENDED
      expect(items[0].activityStatus).toBe(ActivityStatus.RECENTLY_INACTIVE);
      expect(items[0].member.phoneNumber).toBe('08022222222');

      expect(items[1].activityStatus).toBe(ActivityStatus.NEVER_ATTENDED);
      expect(items[1].member.phoneNumber).toBe('08033333333');
    });

    it('should filter inactive members by status query', async () => {
      const res = await request(app.getHttpServer())
        .get(
          `/api/dashboard/inactive-members?status=${ActivityStatus.NEVER_ATTENDED}`,
        )
        .set('Cookie', authCookie)
        .expect(200);

      const body = res.body as InactiveMembersResponse;
      expect(body.success).toBe(true);
      expect(body.data.items).toHaveLength(1);
      expect(body.data.items[0].member.phoneNumber).toBe('08033333333');
    });
  });
});
