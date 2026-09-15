import { ExecutionContext, HttpException } from '@nestjs/common';
import { RateLimiterGuard } from './rate-limiter.guard';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  function createMockContext(ip = '127.0.0.1'): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          socket: { remoteAddress: ip },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow requests in test environment', () => {
    process.env.NODE_ENV = 'test';
    guard = new RateLimiterGuard(1000, 2);
    const ctx = createMockContext();
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should block requests exceeding the rate limit in non-test environment', () => {
    process.env.NODE_ENV = 'production';
    guard = new RateLimiterGuard(60000, 2);
    const ctx = createMockContext('192.168.1.1');

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });

  it('should extract forwarded IP from x-forwarded-for header', () => {
    process.env.NODE_ENV = 'production';
    guard = new RateLimiterGuard(60000, 1);
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
          socket: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });
});
