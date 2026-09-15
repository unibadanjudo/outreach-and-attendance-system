import 'reflect-metadata';
import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const validConfig = {
    PORT: '3000',
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:5173',
    CLUB_TIMEZONE: 'Africa/Lagos',
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GOOGLE_CALLBACK_URL: 'http://localhost:3000/api/auth/google/callback',
    GOOGLE_SHEETS_SPREADSHEET_ID: 'sheets-spreadsheet-id',
    AUTHORIZED_EMAILS: 'admin@uijudo.club',
    SESSION_SECRET: 'secure-session-secret-string',
  };

  it('should pass with valid environment config', () => {
    const result = validateEnvironment(validConfig);
    expect(result.PORT).toBe(3000);
    expect(result.CLUB_TIMEZONE).toBe('Africa/Lagos');
    expect(result.SESSION_SECRET).toBe('secure-session-secret-string');
  });

  it('should throw an error if required environment variables are missing', () => {
    const invalidConfig = {
      PORT: '3000',
      NODE_ENV: 'development',
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      'Environment configuration validation failed',
    );
  });

  it('should throw an error if NODE_ENV has an invalid enum value', () => {
    const invalidConfig = {
      ...validConfig,
      NODE_ENV: 'staging',
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      'Environment configuration validation failed',
    );
  });
});
