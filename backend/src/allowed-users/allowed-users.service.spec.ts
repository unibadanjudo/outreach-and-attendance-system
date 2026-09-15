import { Test, TestingModule } from '@nestjs/testing';
import { AllowedUsersService } from './allowed-users.service';
import { ALLOWED_USERS_REPOSITORY } from './repositories/allowed-users.repository.interface';
import { AllowedUser, UserStatus } from './models/allowed-user.model';

describe('AllowedUsersService', () => {
  let service: AllowedUsersService;

  const mockUsers: AllowedUser[] = [
    {
      email: 'admin@uijudo.club',
      name: 'Admin User',
      role: 'ADMIN',
      status: UserStatus.ACTIVE,
      addedAt: '2026-09-15',
    },
    {
      email: 'coach@uijudo.club',
      name: 'Coach User',
      role: 'COACH',
      status: UserStatus.ACTIVE,
      addedAt: '2026-09-15',
    },
    {
      email: 'former@uijudo.club',
      name: 'Former Staff',
      role: 'COACH',
      status: UserStatus.INACTIVE,
      addedAt: '2026-09-15',
    },
  ];

  const mockRepository = {
    findAll: jest.fn().mockImplementation(async () => [...mockUsers]),
    findByEmail: jest.fn().mockImplementation(async (email: string) => {
      const clean = email.trim().toLowerCase();
      return mockUsers.find((u) => u.email.toLowerCase() === clean) || null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllowedUsersService,
        {
          provide: ALLOWED_USERS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AllowedUsersService>(AllowedUsersService);
  });

  describe('isAllowed', () => {
    it('should return true for an active authorized user', async () => {
      const allowed = await service.isAllowed('coach@uijudo.club');
      expect(allowed).toBe(true);
    });

    it('should return false for an inactive user', async () => {
      const allowed = await service.isAllowed('former@uijudo.club');
      expect(allowed).toBe(false);
    });

    it('should return false for an unknown email', async () => {
      const allowed = await service.isAllowed('stranger@example.com');
      expect(allowed).toBe(false);
    });

    it('should be case-insensitive', async () => {
      const allowed = await service.isAllowed('COACH@UIJUDO.CLUB');
      expect(allowed).toBe(true);
    });

    it('should be whitespace-tolerant', async () => {
      const allowed = await service.isAllowed('  coach@uijudo.club  ');
      expect(allowed).toBe(true);
    });

    it('should fail closed (return false) if repository throws an error', async () => {
      mockRepository.findByEmail.mockRejectedValueOnce(new Error('Google Sheets API unavailable'));
      const allowed = await service.isAllowed('coach@uijudo.club');
      expect(allowed).toBe(false);
    });
  });

  describe('getAccess', () => {
    it('should return the user record with role for an active user', async () => {
      const access = await service.getAccess('admin@uijudo.club');
      expect(access).not.toBeNull();
      expect(access?.role).toBe('ADMIN');
      expect(access?.status).toBe(UserStatus.ACTIVE);
    });

    it('should return null for an inactive user', async () => {
      const access = await service.getAccess('former@uijudo.club');
      expect(access).toBeNull();
    });
  });
});
