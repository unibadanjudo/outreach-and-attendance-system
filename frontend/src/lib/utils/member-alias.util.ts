import type { Member } from '../types/members.types';

/**
 * Normalizes an identifier string (extracts phone digits without country code).
 * Returns all possible variations of the phone number (with/without leading zero, etc).
 */
export function getMemberAliasKeys(memberIdOrPhone: string): string[] {
  const clean = (memberIdOrPhone || '').toLowerCase().trim();
  const keys = new Set<string>();
  if (clean) keys.add(clean);

  const digits = clean.replace(/[^0-9]/g, '');
  if (digits) {
    keys.add(digits);
    keys.add(`mem_${digits}`);
    
    if (digits.startsWith('234') && digits.length >= 13) {
      const local = digits.substring(3);
      keys.add(local);
      keys.add(`0${local}`);
      keys.add(`mem_${local}`);
      keys.add(`mem_0${local}`);
    }

    if (digits.startsWith('0')) {
      const withoutZero = digits.substring(1);
      keys.add(withoutZero);
      keys.add(`mem_${withoutZero}`);
    } else {
      const withZero = `0${digits}`;
      keys.add(withZero);
      keys.add(`mem_${withZero}`);
    }
  }

  return Array.from(keys);
}

/**
 * Returns all alias keys for a full Member object.
 */
export function getAllMemberAliases(member: Member): string[] {
  const keys = new Set<string>();
  
  keys.add(member.id.toLowerCase());
  
  const fullName = `${member.firstName} ${member.lastName}`.toLowerCase().trim();
  if (fullName) keys.add(fullName);
  
  const revName = `${member.lastName} ${member.firstName}`.toLowerCase().trim();
  if (revName) keys.add(revName);
  
  if (member.matricNumber) {
    keys.add(member.matricNumber.toLowerCase().trim());
  }
  
  const pDigits = getMemberAliasKeys(member.phoneNumber || member.id);
  for (const d of pDigits) {
    keys.add(d);
  }
  
  return Array.from(keys);
}
