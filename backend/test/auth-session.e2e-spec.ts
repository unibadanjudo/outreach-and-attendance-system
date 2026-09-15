import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  AuthResponse,
  createAuthTestApp,
  ErrorResponse,
  StatusResponse,
} from './helpers/test-auth.helper';

describe('Auth Session Lifecycle (e2e)', () => {
  let app: INestApplication<App>;
  let authCookie: string;

  beforeAll(async () => {
    app = await createAuthTestApp('3003');
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should authenticate authorized email and issue session cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/test/simulate-login')
      .send({ email: 'coach@uijudo.club', name: 'UI Coach' })
      .expect(201);

    const loginBody = res.body as { success: boolean };
    expect(loginBody.success).toBe(true);
    const cookies = res.header['set-cookie'];
    const sid = (cookies as string[]).find((c) => c.startsWith('uijudo.sid='));
    expect(sid).toBeDefined();
    authCookie = sid!;
  });

  it('GET /api/auth/status should reflect authenticated state', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/status')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as StatusResponse;
    expect(body.data.isAuthenticated).toBe(true);
    expect(body.data.user?.email).toBe('coach@uijudo.club');
  });

  it('GET /api/auth/me should return current user profile with valid cookie', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', authCookie)
      .expect(200);

    const body = res.body as AuthResponse;
    expect(body.data.email).toBe('coach@uijudo.club');
    expect(body.data.role).toBe('ADMIN');
  });

  it('POST /api/auth/logout should clear session', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', authCookie)
      .expect(200);

    const logoutBody = res.body as { data: { message: string } };
    expect(logoutBody.data.message).toBe('Logged out successfully');
  });

  it('GET /api/auth/me after logout should return 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', authCookie)
      .expect(401);

    const errorBody = res.body as ErrorResponse;
    expect(errorBody.error.code).toBe('UNAUTHORIZED');
  });
});
