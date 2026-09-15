import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, GoogleProfile } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'AUTHORIZED_EMAILS') {
          return 'coach@uijudo.club, admin@uijudo.club, sensei@uijudo.club';
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isEmailAuthorized', () => {
    it('should return true for authorized email', () => {
      expect(service.isEmailAuthorized('coach@uijudo.club')).toBe(true);
    });

    it('should be case-insensitive and trim spaces', () => {
      expect(service.isEmailAuthorized('  COACH@UIJUDO.CLUB  ')).toBe(true);
    });

    it('should return false for unauthorized email', () => {
      expect(service.isEmailAuthorized('stranger@gmail.com')).toBe(false);
    });

    it('should return false for empty or undefined email', () => {
      expect(service.isEmailAuthorized('')).toBe(false);
    });
  });

  describe('validateGoogleUser', () => {
    it('should return user session object for authorized Google user', () => {
      const profile: GoogleProfile = {
        id: 'google-12345',
        displayName: 'Judo Sensei',
        emails: [{ value: 'Sensei@uijudo.club', verified: true }],
        photos: [{ value: 'https://lh3.googleusercontent.com/photo.jpg' }],
      };

      const user = service.validateGoogleUser(profile);

      expect(user).toEqual({
        email: 'sensei@uijudo.club',
        name: 'Judo Sensei',
        picture: 'https://lh3.googleusercontent.com/photo.jpg',
        role: 'ADMIN',
      });
    });

    it('should throw UnauthorizedException if profile has no emails', () => {
      const profile: GoogleProfile = {
        id: 'google-12345',
        displayName: 'No Email User',
        emails: [],
      };

      expect(() => service.validateGoogleUser(profile)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if email is not in AUTHORIZED_EMAILS', () => {
      const profile: GoogleProfile = {
        id: 'google-999',
        displayName: 'Unauthorized Person',
        emails: [{ value: 'unauthorized@gmail.com', verified: true }],
      };

      expect(() => service.validateGoogleUser(profile)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
