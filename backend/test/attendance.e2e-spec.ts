import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { GoogleSheetsService } from '../src/google/google-sheets.service';
import {
  createAuthTestApp,
  ErrorResponse,
  loginAndGetCookie,
} from './helpers/test-auth.helper';
import { Attendance } from '../src/attendance/models/attendance.model';

interface AttendanceListResponse {
  success: boolean;
  data: {
    items: Attendance[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  };
}

interface AttendanceItemResponse {
  success: boolean;
  data: Attendance;
}

describe('Attendance (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  const memberHeaders = [
    'Timestamp',
    'First Name',
    'Last Name',
    'Phone Number',
  ];
  const memberRows = [['2026-01-01', 'Charity', 'Ayodele', '09028872023']];

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

  const storedAttendanceRows: string[][] = [
    [
      'att_init_1',
      'mem_09028872023',
      '2026-09-10',
      'GENERAL',
      'PRESENT',
      'coach@uijudo.club',
      'First training',
      '2026-09-10T18:00:00.000Z',
    ],
  ];

  beforeAll(async () => {
    const mockSheetsService = {
      readRange: jest.fn().mockImplementation((range: string) => {
        if (range.includes('Attendance')) {
          return Promise.resolve([attendanceHeaders, ...storedAttendanceRows]);
        }
        return Promise.resolve([memberHeaders, ...memberRows]);
      }),
      appendRow: jest
        .fn()
        .mockImplementation((_range: string, row: string[]) => {
          storedAttendanceRows.push(row);
          return Promise.resolve();
        }),
      updateCells: jest.fn().mockResolvedValue(undefined),
    };

    app = await createAuthTestApp('3006', (builder) =>
      builder.overrideProvider(GoogleSheetsService).useValue(mockSheetsService),
    );

    authCookie = await loginAndGetCookie(app);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /api/attendance without session should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/attendance')
      .expect(401);

    const body = res.body as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/attendance should record attendance for an existing member', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/attendance')
      .set('Cookie', authCookie)
      .send({
        memberId: 'mem_09028872023',
        attendanceDate: '2026-09-13',
        trainingSession: 'EVENING',
        status: 'PRESENT',
        notes: 'Great throws',
      })
      .expect(201);

    const body = res.body as AttendanceItemResponse;
    expect(body.success).toBe(true);
    expect(body.data.memberId).toBe('mem_09028872023');
    expect(body.data.attendanceDate).toBe('2026-09-13');
    expect(body.data.status).toBe('PRESENT');
  });

  it('POST /api/attendance with duplicate member+date+session should return 409 Conflict', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/attendance')
      .set('Cookie', authCookie)
      .send({
        memberId: 'mem_09028872023',
        attendanceDate: '2026-09-13',
        trainingSession: 'EVENING',
        status: 'PRESENT',
      })
      .expect(409);

    const body = res.body as ErrorResponse;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('GET /api/attendance should list attendance records', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/attendance?page=1&limit=10')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as AttendanceListResponse;
    expect(body.success).toBe(true);
    expect(body.data.items.length).toBeGreaterThan(0);
    expect(body.data.meta.total).toBeGreaterThan(0);
  });

  it('GET /api/attendance/:id should return the record', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/attendance/att_init_1')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as AttendanceItemResponse;
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('att_init_1');
  });

  it('GET /api/members/:id/attendance should return member attendance history', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/members/mem_09028872023/attendance')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as { success: boolean; data: Attendance[] };
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('DELETE /api/attendance/:id should remove the record', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/attendance/att_init_1')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as { success: boolean; data: { success: boolean } };
    expect(body.success).toBe(true);
    expect(body.data.success).toBe(true);
  });
});
