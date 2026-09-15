import {
  generateMemberId,
  mapHeadersToMemberKeys,
  rowToMember,
  sanitizePhoneNumber,
} from './member-row.mapper';

describe('MemberRowMapper', () => {
  describe('sanitizePhoneNumber', () => {
    it('should strip non-digits from phone number', () => {
      expect(sanitizePhoneNumber('+234 803 123 4567')).toBe('2348031234567');
      expect(sanitizePhoneNumber('080-1234-5678')).toBe('08012345678');
    });
  });

  describe('generateMemberId (Identity Hierarchy)', () => {
    it('should prefer phone number as Priority 1 identifier', () => {
      const id = generateMemberId('08012345678', '218492', 'explicit_id_99');
      expect(id).toBe('mem_08012345678');
    });

    it('should fall back to matric number as Priority 2 if phone is absent', () => {
      const id = generateMemberId('', '218492', 'explicit_id_99');
      expect(id).toBe('mem_218492');
    });

    it('should fall back to explicit ID if phone and matric are absent', () => {
      const id = generateMemberId('', '', 'custom_id_101');
      expect(id).toBe('custom_id_101');
    });

    it('should generate fallback ID when all identifiers are absent', () => {
      const id = generateMemberId('', '', '', 5);
      expect(id).toContain('mem_gen_5_');
    });
  });

  describe('mapHeadersToMemberKeys', () => {
    it('should map various Google Form header styles correctly', () => {
      const headers = [
        'Timestamp',
        'First Name',
        'Last Name',
        'Other Names',
        'Nick Name',
        'Phone Number',
        'Faculty-Department',
        'Matric',
        'Date Of Birth',
        'Date You Started Judo',
        'Primary Motivation for Training Judo',
      ];

      const keys = mapHeadersToMemberKeys(headers);
      expect(keys).toEqual([
        'createdAt',
        'firstName',
        'lastName',
        'otherNames',
        'nickname',
        'phoneNumber',
        'facultyDepartment',
        'matricNumber',
        'dateOfBirth',
        'judoStartDate',
        'motivation',
      ]);
    });

    it('should support alternative header spellings', () => {
      const headers = ['WhatsApp Number', 'DOB', 'Matric No', 'Department'];
      const keys = mapHeadersToMemberKeys(headers);
      expect(keys).toEqual([
        'phoneNumber',
        'dateOfBirth',
        'matricNumber',
        'facultyDepartment',
      ]);
    });
  });

  describe('rowToMember', () => {
    it('should map row values to a complete Member object', () => {
      const headers = [
        'Timestamp',
        'First Name',
        'Last Name',
        'Phone Number',
        'Matric',
        'Faculty-Department',
      ];
      const headerKeys = mapHeadersToMemberKeys(headers);
      const rowValues = [
        '2026-01-15 10:00:00',
        'Jigoro',
        'Kano',
        '08012345678',
        '218492',
        'Education - Physical & Health',
      ];

      const member = rowToMember(headerKeys, rowValues, 2);
      expect(member.id).toBe('mem_08012345678');
      expect(member.firstName).toBe('Jigoro');
      expect(member.lastName).toBe('Kano');
      expect(member.phoneNumber).toBe('08012345678');
      expect(member.matricNumber).toBe('218492');
      expect(member.facultyDepartment).toBe('Education - Physical & Health');
      expect(member.createdAt).toBe('2026-01-15 10:00:00');
      expect(member.beltRank).toBe('Unranked');
    });

    it('should map Belt Rank header when present', () => {
      const headers = ['First Name', 'Last Name', 'Phone', 'Belt Rank'];
      const headerKeys = mapHeadersToMemberKeys(headers);
      const rowValues = ['Keiko', 'Fukuda', '08099998888', 'Black Belt (10th Dan - Judan)'];

      const member = rowToMember(headerKeys, rowValues, 2);
      expect(member.beltRank).toBe('Black Belt (10th Dan - Judan)');
    });
  });
});
