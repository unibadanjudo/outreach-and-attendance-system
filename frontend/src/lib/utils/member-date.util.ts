import type { Member } from '../types/members.types';

/**
 * Resolves the date a member joined / their record was created (YYYY-MM-DD).
 * Uses createdAt date with fallback to judoStartDate.
 */
export function getMemberJoinDate(member?: Member | null): string {
  if (!member) return '';
  if (member.createdAt) {
    const raw = member.createdAt.trim();
    const datePart = raw.split(/[T\s]/)[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }
    const slashParts = datePart.split(/[-/]/);
    if (slashParts.length === 3) {
      if (slashParts[0].length === 4) {
        return `${slashParts[0]}-${slashParts[1].padStart(2, '0')}-${slashParts[2].padStart(2, '0')}`;
      }
      if (slashParts[2].length === 4) {
        return `${slashParts[2]}-${slashParts[1].padStart(2, '0')}-${slashParts[0].padStart(2, '0')}`;
      }
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  }
  if (member.judoStartDate) {
    const raw = member.judoStartDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const slashParts = raw.split(/[-/]/);
    if (slashParts.length === 3) {
      if (slashParts[0].length === 4) {
        return `${slashParts[0]}-${slashParts[1].padStart(2, '0')}-${slashParts[2].padStart(2, '0')}`;
      }
      if (slashParts[2].length === 4) {
        return `${slashParts[2]}-${slashParts[1].padStart(2, '0')}-${slashParts[0].padStart(2, '0')}`;
      }
    }
  }
  return '';
}

/**
 * Checks if a member had not yet joined as of a given session date.
 */
export function isMemberNotJoinedOnDate(member: Member, sessionDate?: string): boolean {
  if (!sessionDate) return false;
  const joinDate = getMemberJoinDate(member);
  if (!joinDate) return false;
  return sessionDate < joinDate;
}
