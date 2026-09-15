import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AllowedUsersService } from '../allowed-users/allowed-users.service';
import { UserStatus } from '../allowed-users/models/allowed-user.model';
import { AuthService, GoogleProfile } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockAllowedUsersService: Partial<AllowedUsersService>;

  beforeEach(async () => {
    mockAllowedUsersService = {
      isAllowed: jest.fn(async (email: string) => {
        const normalized = email?.trim().toLowerCase();
        return ['coach@uijudo.club', 'sensei@uijudo.club'].includes(
          normalized,
        );
      }),
      getAccess: jest.fn(async (email: string) => {
        const normalized = email?.trim().toLowerCase();
        if (normalized === 'sensei@uijudo.club') {
          return {
            email: 'sensei@uijudo.club',
            name: 'Judo Sensei',
            role: 'ADMIN',
            rank: 'Sandan (3rd Dan)',
            status: UserStatus.ACTIVE,
            addedAt: '2026-09-01',
            profileUrl: 'https://lh3.googleusercontent.com/photo.jpg',
          };
        }
        if (normalized === 'inactive@uijudo.club') {
          return {
            email: 'inactive@uijudo.club',
            name: 'Inactive User',
            role: 'MEMBER',
            status: UserStatus.INACTIVE,
            addedAt: '2026-09-01',
          };
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AllowedUsersService,
          useValue: mockAllowedUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isEmailAuthorized', () => {
    it('should return true for authorized email', async () => {
      await expect(
        service.isEmailAuthorized('coach@uijudo.club'),
      ).resolves.toBe(true);
    });

    it('should return false for unauthorized email', async () => {
      await expect(
        service.isEmailAuthorized('stranger@gmail.com'),
      ).resolves.toBe(false);
    });

    it('should return false for empty or undefined email', async () => {
      await expect(service.isEmailAuthorized('')).resolves.toBe(false);
    });
  });

  describe('validateGoogleUser', () => {
    it('should return user session object for authorized Google user', async () => {
      const profile: GoogleProfile = {
        id: 'google-12345',
        displayName: 'Judo Sensei',
        emails: [{ value: 'Sensei@uijudo.club', verified: true }],
        photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
      };

      const user = await service.validateGoogleUser(profile);

      expect(user).toEqual({
        email: 'sensei@uijudo.club',
        name: 'Judo Sensei',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
        role: 'ADMIN',
        rank: 'Sandan (3rd Dan)',
      });
    });

    it('should throw UnauthorizedException if profile has no emails', async () => {
      const profile: GoogleProfile = {
        id: 'google-12345',
        displayName: 'No Email User',
        emails: [],
      };

      await expect(service.validateGoogleUser(profile)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if email is not allowed in sheet', async () => {
      const profile: GoogleProfile = {
        id: 'google-999',
        displayName: 'Unauthorized Person',
        emails: [{ value: 'unauthorized@gmail.com', verified: true }],
      };

      await expect(service.validateGoogleUser(profile)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user status is inactive', async () => {
      const profile: GoogleProfile = {
        id: 'google-888',
        displayName: 'Inactive Person',
        emails: [{ value: 'inactive@uijudo.club', verified: true }],
      };

      await expect(service.validateGoogleUser(profile)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
