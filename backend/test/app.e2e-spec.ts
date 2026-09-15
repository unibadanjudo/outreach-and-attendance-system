import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('Application Startup (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Ensure test environment variables are populated
    process.env.NODE_ENV = 'test';
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3000/api/auth/google/callback';
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'test-sheet-id';
    process.env.AUTHORIZED_EMAILS = 'test@uijudo.club';
    process.env.SESSION_SECRET = 'test-session-secret-min-16-chars';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should initialize successfully', () => {
    expect(app).toBeDefined();
  });
});
