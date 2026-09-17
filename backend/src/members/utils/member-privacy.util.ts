import { Member } from '../models/member.model';
import { Role } from '../../auth/interfaces/user-session.interface';

/**
 * Masks the year of birth, returning only Day and Month (DD/MM).
 */
export function maskDateOfBirth(dob?: string): string {
  if (!dob || !dob.trim()) return '';
  const trimmed = dob.trim();

  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const [, day, month] = dmyMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
  }

  // Match YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (ymdMatch) {
    const [, , month, day] = ymdMatch;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
  }

  // Fallback: try parsing as Date
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch {
    // Ignore error
  }

  return trimmed;
}

/**
 * Sanitizes member data based on requester's role.
 * REACHER cannot view the year of birth for members (only month and day).
 */
export function sanitizeMemberForRole(
  member: Member,
  role?: string,
): Member {
  if (!role) return member;
  if (role.toUpperCase() === Role.REACHER) {
    return {
      ...member,
      dateOfBirth: maskDateOfBirth(member.dateOfBirth),
    };
  }
  return member;
}
