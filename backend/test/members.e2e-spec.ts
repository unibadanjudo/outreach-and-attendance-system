import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GoogleSheetsService } from '../src/google/google-sheets.service';
import {
  createAuthTestApp,
  ErrorResponse,
  loginAndGetCookie,
} from './helpers/test-auth.helper';
import { Member } from '../src/members/models/member.model';

interface MembersListResponse {
  success: boolean;
  data: {
    items: Member[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface MemberDetailResponse {
  success: boolean;
  data: Member;
}

describe('Members (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  const sampleHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Phone Number',
    'Faculty-Department',
    'Matric',
  ];
  const sampleRows = [
    ['2026-01-01', 'Jigoro', 'Kano', '08011112222', 'Education', '111111'],
    ['2026-01-02', 'Yasuhiro', 'Yamashita', '08033334444', 'Science', '222222'],
  ];

  beforeAll(async () => {
    const mockSheetsService = {
      readRange: jest.fn().mockImplementation((range: string) => {
        if (range.includes('Attendance')) {
          return Promise.resolve([
            [
              'Attendance ID',
              'Member ID',
              'Attendance Date',
              'Session',
              'Status',
              'Recorded By',
              'Notes',
              'Created At',
            ],
          ]);
        }
        return Promise.resolve([sampleHeaders, ...sampleRows]);
      }),
    };

    app = await createAuthTestApp('3004', (builder) =>
      builder.overrideProvider(GoogleSheetsService).useValue(mockSheetsService),
    );

    authCookie = await loginAndGetCookie(app);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/members without authentication should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members')
      .expect(401);
    const body = res.body as ErrorResponse;
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/members with session should return paginated members', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members?page=1&limit=10')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as MembersListResponse;
    expect(body.success).toBe(true);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.meta.total).toBe(2);
    expect(body.data.items[0].id).toBe('mem_08011112222');
  });

  it('GET /api/members?search=Yamashita should return matching member', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members?search=Yamashita')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as MembersListResponse;
    expect(body.data.items).toHaveLength(1);
    expect(body.data.items[0].lastName).toBe('Yamashita');
  });

  it('GET /api/members/:id should lookup by phone number', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members/08011112222')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as MemberDetailResponse;
    expect(body.data.firstName).toBe('Jigoro');
  });

  it('GET /api/members/:id should lookup by matric number', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members/222222')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as MemberDetailResponse;
    expect(body.data.lastName).toBe('Yamashita');
  });

  it('GET /api/members/:id/summary should return member summary', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members/mem_08011112222/summary')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as {
      data: { member: Member; attendanceCount: number };
    };
    expect(body.data.member.firstName).toBe('Jigoro');
    expect(body.data.attendanceCount).toBe(0);
  });

  it('GET /api/members/:id should return 404 when member not found', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members/nonexistent')
      .set('Cookie', authCookie)
      .expect(404);

    const body = res.body as ErrorResponse;
    expect(body.error.code).toBe('MEMBER_NOT_FOUND');
  });
});
