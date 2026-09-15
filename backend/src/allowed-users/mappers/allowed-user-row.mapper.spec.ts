import {
  mapHeadersToAllowedUserKeys,
  rowToAllowedUser,
  allowedUserToRow,
} from './allowed-user-row.mapper';
import { UserStatus } from '../models/allowed-user.model';

describe('AllowedUserRowMapper', () => {
  describe('mapHeadersToAllowedUserKeys', () => {
    it('should map headers case-insensitively and ignore symbols/whitespace', () => {
      const headers = ['Email Address', 'Full Name', 'Role', 'Status', 'Date Added', 'Profile URL'];
      const keys = mapHeadersToAllowedUserKeys(headers);
      expect(keys).toEqual(['email', 'name', 'role', 'status', 'addedAt', 'profileUrl']);
    });

    it('should support Rank as an alias for Role', () => {
      const headers = ['Email', 'Name', 'Rank', 'Status'];
      const keys = mapHeadersToAllowedUserKeys(headers);
      expect(keys).toEqual(['email', 'name', 'role', 'status']);
    });
  });

  describe('rowToAllowedUser', () => {
    it('should parse a valid active user row', () => {
      const headers = ['Email', 'Name', 'Role', 'Status', 'Added At', 'Profile URL'];
      const headerKeys = mapHeadersToAllowedUserKeys(headers);
      const row = ['Coach@UIJudo.club', 'Chief Coach', 'coach', 'active', '2026-09-15', 'https://example.com/photo.jpg'];

      const user = rowToAllowedUser(headerKeys, row);
      expect(user).not.toBeNull();
      expect(user?.email).toBe('coach@uijudo.club');
      expect(user?.name).toBe('Chief Coach');
      expect(user?.role).toBe('COACH');
      expect(user?.status).toBe(UserStatus.ACTIVE);
      expect(user?.profileUrl).toBe('https://example.com/photo.jpg');
    });

    it('should parse an inactive user correctly', () => {
      const headers = ['Email', 'Name', 'Role', 'Status'];
      const headerKeys = mapHeadersToAllowedUserKeys(headers);
      const row = ['retired@uijudo.club', 'Old Coach', 'coach', 'inactive'];

      const user = rowToAllowedUser(headerKeys, row);
      expect(user?.status).toBe(UserStatus.INACTIVE);
    });

    it('should return null if email is missing', () => {
      const headers = ['Email', 'Name'];
      const headerKeys = mapHeadersToAllowedUserKeys(headers);
      const row = ['', 'No Email User'];

      const user = rowToAllowedUser(headerKeys, row);
      expect(user).toBeNull();
    });
  });

  describe('allowedUserToRow', () => {
    it('should format an AllowedUser into a spreadsheet row', () => {
      const user = {
        email: 'coach@uijudo.club',
        name: 'Chief Coach',
        role: 'COACH',
        status: UserStatus.ACTIVE,
        addedAt: '2026-09-15',
        profileUrl: 'https://example.com/photo.jpg',
      };

      const row = allowedUserToRow(user);
      expect(row).toEqual([
        'coach@uijudo.club',
        'Chief Coach',
        'COACH',
        UserStatus.ACTIVE,
        '2026-09-15',
        'https://example.com/photo.jpg',
      ]);
    });
  });
});
