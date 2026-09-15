import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  createAuthTestApp,
  ErrorResponse,
  StatusResponse,
} from './helpers/test-auth.helper';

describe('Authentication Guards & Authorization (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createAuthTestApp('3002');
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('GET /api/auth/google', () => {
    it('should initiate OAuth flow by redirecting to Google accounts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/google')
        .expect(302);

      expect(response.header.location).toContain('accounts.google.com');
      expect(response.header.location).toContain('client_id=');
      expect(response.header.location).toContain('scope=email%20profile');
    });
  });

  describe('GET /api/auth/google/callback', () => {
    it('should be registered and handled by Google OAuth guard without 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/google/callback')
        .expect(302);

      expect(response.header.location).toContain('accounts.google.com');
      expect(response.header.location).toContain('client_id=');
    });
  });

  describe('Missing session & protected endpoint', () => {
    it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toBe('Authentication required');
    });

    it('GET /api/auth/status should return isAuthenticated false when not logged in', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/status')
        .expect(200);

      const body = response.body as StatusResponse;
      expect(body.success).toBe(true);
      expect(body.data.isAuthenticated).toBe(false);
      expect(body.data.user).toBeNull();
    });
  });

  describe('Unauthorized user', () => {
    it('should reject login for email not in sheet allowlist with 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/test/validate-email')
        .send({ email: 'unauthorized@gmail.com', name: 'Unknown User' })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
      expect(body.error.message).toContain(
        'Email is not authorized to access this system',
      );
    });
  });
});
