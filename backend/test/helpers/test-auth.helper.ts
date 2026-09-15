import {
  Body,
  Controller,
  INestApplication,
  Module,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import session from 'express-session';
import passport from 'passport';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AuthModule } from '../../src/auth/auth.module';
import { AuthService } from '../../src/auth/auth.service';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';

import { ALLOWED_USERS_REPOSITORY } from '../../src/allowed-users/repositories/allowed-users.repository.interface';
import { UserStatus } from '../../src/allowed-users/models/allowed-user.model';

export interface AuthResponse {
  success: boolean;
  data: { email: string; name: string; role: string };
}

export interface StatusResponse {
  success: boolean;
  data: {
    isAuthenticated: boolean;
    user: { email: string; name?: string } | null;
  };
}

export interface ErrorResponse {
  success: boolean;
  error: { code: string; message: string };
}

@Controller('auth/test')
export class TestAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-email')
  async validateEmail(@Body() body: { email: string; name?: string }) {
    return await this.authService.validateGoogleUser({
      displayName: body.name || 'Test User',
      emails: [{ value: body.email, verified: true }],
    });
  }

  @Post('simulate-login')
  async simulateLogin(
    @Body() body: { email: string; name?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateGoogleUser({
      displayName: body.name || 'Test User',
      emails: [{ value: body.email, verified: true }],
    });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      return res.json({ success: true, data: user });
    });
  }
}

@Module({
  imports: [AuthModule],
  controllers: [TestAuthController],
})
export class TestHelperModule {}

export async function createAuthTestApp(
  port = '3002',
  customize?: (
    builder: ReturnType<typeof Test.createTestingModule>,
  ) => ReturnType<typeof Test.createTestingModule>,
): Promise<INestApplication<App>> {
  Object.assign(process.env, {
    NODE_ENV: 'test',
    PORT: port,
    FRONTEND_URL: 'http://localhost:5173',
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GOOGLE_CALLBACK_URL: `http://localhost:${port}/api/auth/google/callback`,
    GOOGLE_SHEETS_SPREADSHEET_ID: 'test-sheets-id',
    GOOGLE_SHEETS_ALLOWED_USERS_RANGE: 'AllowedUsers!A:F',
    SESSION_SECRET: 'test-session-secret-min-16-characters',
  });

  const mockUsers = [
    {
      email: 'coach@uijudo.club',
      name: 'UI Coach',
      role: 'ADMIN',
      status: UserStatus.ACTIVE,
      addedAt: '2026-09-01',
    },
    {
      email: 'admin@uijudo.club',
      name: 'UI Admin',
      role: 'ADMIN',
      status: UserStatus.ACTIVE,
      addedAt: '2026-09-01',
    },
  ];

  let builder = Test.createTestingModule({
    imports: [AppModule, TestHelperModule],
  }).overrideProvider(ALLOWED_USERS_REPOSITORY).useValue({
    findAll: jest.fn().mockResolvedValue(mockUsers),
    findByEmail: jest.fn(async (email: string) => {
      const normalized = email?.trim().toLowerCase();
      return mockUsers.find((u) => u.email.toLowerCase() === normalized) || null;
    }),
  });
  if (customize) {
    builder = customize(builder);
  }
  const moduleFixture = await builder.compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.use(
    session({
      name: 'uijudo.sid',
      secret: 'test-session-secret-min-16-characters',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: false, sameSite: 'lax' },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.init();
  return app;
}

export async function loginAndGetCookie(
  app: INestApplication<App>,
  email = 'coach@uijudo.club',
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/test/simulate-login')
    .send({ email, name: 'UI Coach' });
  const cookies = res.header['set-cookie'] as string[];
  return cookies.find((c) => c.startsWith('uijudo.sid=')) || '';
}
