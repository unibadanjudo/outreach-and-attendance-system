import { maskDateOfBirth, sanitizeMemberForRole } from './member-privacy.util';
import { Member } from '../models/member.model';
import { Role } from '../../auth/interfaces/user-session.interface';

describe('MemberPrivacyUtil', () => {
  const baseMember: Member = {
    id: 'mem_1',
    firstName: 'Taro',
    lastName: 'Yamada',
    otherNames: '',
    nickname: '',
    phoneNumber: '08012345678',
    facultyDepartment: 'Education',
    matricNumber: '123456',
    dateOfBirth: '07/04/2001',
    judoStartDate: '01/12/2024',
    motivation: 'Fitness',
    beltRank: 'White Belt',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  describe('maskDateOfBirth', () => {
    it('should extract only day and month from DD/MM/YYYY', () => {
      expect(maskDateOfBirth('07/04/2001')).toBe('07/04');
      expect(maskDateOfBirth('25-12-1999')).toBe('25/12');
    });

    it('should extract only day and month from YYYY-MM-DD', () => {
      expect(maskDateOfBirth('2001-04-07')).toBe('07/04');
    });

    it('should handle empty or undefined input', () => {
      expect(maskDateOfBirth('')).toBe('');
      expect(maskDateOfBirth(undefined)).toBe('');
    });
  });

  describe('sanitizeMemberForRole', () => {
    it('should mask year of birth when role is REACHER', () => {
      const sanitized = sanitizeMemberForRole(baseMember, Role.REACHER);
      expect(sanitized.dateOfBirth).toBe('07/04');
      expect(sanitized.firstName).toBe('Taro');
    });

    it('should keep full date of birth for COACH', () => {
      const sanitized = sanitizeMemberForRole(baseMember, Role.COACH);
      expect(sanitized.dateOfBirth).toBe('07/04/2001');
    });

    it('should keep full date of birth for CAPTAIN', () => {
      const sanitized = sanitizeMemberForRole(baseMember, Role.CAPTAIN);
      expect(sanitized.dateOfBirth).toBe('07/04/2001');
    });

    it('should keep full date of birth for ADMIN', () => {
      const sanitized = sanitizeMemberForRole(baseMember, Role.ADMIN);
      expect(sanitized.dateOfBirth).toBe('07/04/2001');
    });
  });
});
