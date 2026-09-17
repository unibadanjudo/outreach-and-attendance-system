import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../auth/interfaces/user-session.interface';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: { role?: string }): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access when no roles are required on handler or class', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const context = createMockContext({ role: Role.REACHER });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access when user role matches one of required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.COACH, Role.CAPTAIN]);
    const context = createMockContext({ role: Role.CAPTAIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should be case-insensitive when matching roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.COACH, Role.CAPTAIN]);
    const context = createMockContext({ role: 'coach' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow ADMIN full bypass access', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.COACH, Role.CAPTAIN]);
    const context = createMockContext({ role: Role.ADMIN });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user role does not match required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.COACH, Role.CAPTAIN]);
    const context = createMockContext({ role: Role.REACHER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user or role is missing', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([Role.COACH, Role.CAPTAIN]);
    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
