import type { Attendance, AttendanceStatus } from '../types/attendance.types';
import type { Member } from '../types/members.types';
import { parseBeltRank } from './belt';

export interface JudokaAttendanceStats {
  memberId: string;
  joinDate: string;
  daysPresent: number;
  daysExcused: number;
  daysAbsent: number;
  daysNotJoined: number;
  totalTakenDays: number; // Member's eligible taken sessions since join date
  totalClubSessions: number; // Total taken club sessions
  ratioString: string;
  percentage: number;
}

export type AttendanceSortField =
  | 'name'
  | 'startDate'
  | 'belt'
  | 'daysPresent'
  | 'daysExcused'
  | 'daysAbsent';

export type SortDirection = 'asc' | 'desc';

const BELT_WEIGHTS: Record<string, number> = {
  unranked: 0,
  white: 1,
  yellow: 2,
  orange: 3,
  green: 4,
  blue: 5,
  brown: 6,
  black: 7,
};

export function getBeltRankWeight(beltRank?: string): number {
  const { baseId, dan } = parseBeltRank(beltRank);
  const baseWeight = BELT_WEIGHTS[baseId] ?? 0;
  if (baseId === 'black') {
    return baseWeight + (dan || 1) * 0.1;
  }
  return baseWeight;
}

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

/**
 * Normalizes an identifier string (extracts phone digits without country code).
 */
function getPhoneDigits(val?: string): string[] {
  if (!val) return [];
  const digits = val.replace(/[^0-9]/g, '');
  if (!digits) return [];
  const results = [digits];
  if (digits.startsWith('234') && digits.length >= 13) {
    const local = digits.substring(3);
    results.push(local);
    results.push(`0${local}`);
  }
  if (digits.startsWith('0')) {
    results.push(digits.substring(1));
  } else {
    results.push(`0${digits}`);
  }
  return Array.from(new Set(results));
}

/**
 * Calculates member attendance statistics starting from their join/created date.
 *
 * Rules:
 * - A session is considered "attendance taken" if at least one judoka was marked PRESENT
 *   or if attendanceTaken is explicitly true.
 * - Sessions where all judokas are ABSENT (and attendance was not taken) are excluded.
 * - For each member, only taken sessions held ON OR AFTER their join/created date
 *   are counted in their denominator.
 * - Sessions held BEFORE their join date are classified as NOT_JOINED and excluded from absences.
 * - Formats ratio string e.g. "13days/15".
 */
export function calculateAttendanceStats(
  records: Attendance[],
  members: Member[],
): {
  statsMap: Map<string, JudokaAttendanceStats>;
  totalClubSessions: number;
} {
  // 1. Group records by session: `${attendanceDate}_${trainingSession}`
  const sessionMap = new Map<
    string,
    { date: string; session: string; records: Attendance[] }
  >();

  for (const r of records) {
    if (!r.attendanceDate) continue;
    const sess = r.trainingSession || 'GENERAL';
    const key = `${r.attendanceDate}_${sess}`;
    let item = sessionMap.get(key);
    if (!item) {
      item = { date: r.attendanceDate, session: sess, records: [] };
      sessionMap.set(key, item);
    }
    item.records.push(r);
  }

  // 2. Identify sessions where attendance was actually taken
  const takenSessions: { date: string; session: string; records: Attendance[] }[] = [];
  for (const item of sessionMap.values()) {
    const hasPresent = item.records.some((r) => {
      const st = String(r.status || '').toUpperCase().trim();
      return st === 'PRESENT' || st === 'P';
    });
    const hasExplicitTaken = item.records.some((r) => r.attendanceTaken === true);
    if (hasPresent || hasExplicitTaken) {
      takenSessions.push(item);
    }
  }

  const totalClubSessions = takenSessions.length;

  // 3. Prepare counters and join dates for all members
  const memberStats = new Map<
    string,
    {
      daysPresent: number;
      daysExcused: number;
      daysAbsent: number;
      daysNotJoined: number;
      eligibleTakenDays: number;
      joinDate: string;
    }
  >();

  for (const m of members) {
    const joinDate = getMemberJoinDate(m);
    const eligibleCount = joinDate
      ? takenSessions.filter((s) => s.date >= joinDate).length
      : totalClubSessions;
    const notJoinedCount = joinDate
      ? takenSessions.filter((s) => s.date < joinDate).length
      : 0;

    memberStats.set(m.id, {
      daysPresent: 0,
      daysExcused: 0,
      daysAbsent: 0,
      daysNotJoined: notJoinedCount,
      eligibleTakenDays: eligibleCount,
      joinDate,
    });
  }

  // Helper to map any record memberId alias to target member.id
  const memberLookup = new Map<string, string>();
  for (const m of members) {
    memberLookup.set(m.id.toLowerCase(), m.id);
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase().trim();
    if (fullName) memberLookup.set(fullName, m.id);
    const revName = `${m.lastName} ${m.firstName}`.toLowerCase().trim();
    if (revName) memberLookup.set(revName, m.id);
    if (m.matricNumber) {
      memberLookup.set(m.matricNumber.toLowerCase().trim(), m.id);
    }

    const pDigits = getPhoneDigits(m.phoneNumber || m.id);
    for (const d of pDigits) {
      memberLookup.set(d, m.id);
      memberLookup.set(`mem_${d}`, m.id);
    }
  }

  // 4. Aggregate counts across taken sessions only
  for (const session of takenSessions) {
    for (const r of session.records) {
      const cleanId = (r.memberId || '').toLowerCase().trim();
      const targetMemberId =
        memberLookup.get(cleanId) ||
        memberLookup.get(cleanId.replace(/[^0-9]/g, '')) ||
        r.memberId;

      let counts = memberStats.get(targetMemberId);
      if (!counts) {
        counts = {
          daysPresent: 0,
          daysExcused: 0,
          daysAbsent: 0,
          daysNotJoined: 0,
          eligibleTakenDays: totalClubSessions,
          joinDate: '',
        };
        memberStats.set(targetMemberId, counts);
      }

      // If session occurred before member's join date, ignore as NOT_JOINED
      if (counts.joinDate && session.date < counts.joinDate) {
        continue;
      }

      const st = String(r.status || '').toUpperCase().trim();
      if (st === 'PRESENT' || st === 'P') counts.daysPresent++;
      else if (st === 'EXCUSED' || st === 'E') counts.daysExcused++;
      else if (st === 'ABSENT' || st === 'A') counts.daysAbsent++;
    }
  }

  // 5. Build final map with alias keys for easy lookup
  const statsMap = new Map<string, JudokaAttendanceStats>();
  for (const [memberId, counts] of memberStats.entries()) {
    const eligibleDays = counts.eligibleTakenDays;
    const percentage =
      eligibleDays > 0
        ? Math.round((counts.daysPresent / eligibleDays) * 100)
        : 0;
    const statItem: JudokaAttendanceStats = {
      memberId,
      joinDate: counts.joinDate,
      daysPresent: counts.daysPresent,
      daysExcused: counts.daysExcused,
      daysAbsent: counts.daysAbsent,
      daysNotJoined: counts.daysNotJoined,
      totalTakenDays: eligibleDays,
      totalClubSessions,
      ratioString: `${counts.daysPresent}days/${eligibleDays}`,
      percentage,
    };

    statsMap.set(memberId, statItem);
    statsMap.set(memberId.toLowerCase(), statItem);
    const pDigits = getPhoneDigits(memberId);
    for (const d of pDigits) {
      statsMap.set(d, statItem);
      statsMap.set(`mem_${d}`, statItem);
    }
  }

  // Ensure every member can be retrieved by their member fields
  for (const m of members) {
    const statItem = statsMap.get(m.id) || statsMap.get(m.id.toLowerCase());
    if (statItem) {
      if (m.phoneNumber) {
        statsMap.set(m.phoneNumber, statItem);
        for (const d of getPhoneDigits(m.phoneNumber)) {
          statsMap.set(d, statItem);
          statsMap.set(`mem_${d}`, statItem);
        }
      }
      if (m.matricNumber) {
        statsMap.set(m.matricNumber.toLowerCase(), statItem);
      }
    }
  }

  return { statsMap, totalClubSessions };
}

/**
 * Sorts judokas according to the selected criterion.
 */
export function sortJudokas<T extends { member: Member }>(
  items: T[],
  sortBy: AttendanceSortField,
  direction: SortDirection = 'asc',
  statsMap?: Map<string, JudokaAttendanceStats>,
): T[] {
  const getStats = (m: Member): JudokaAttendanceStats => {
    const defaultStats: JudokaAttendanceStats = {
      memberId: m.id,
      joinDate: getMemberJoinDate(m),
      daysPresent: 0,
      daysExcused: 0,
      daysAbsent: 0,
      daysNotJoined: 0,
      totalTakenDays: 0,
      totalClubSessions: 0,
      ratioString: '0days/0',
      percentage: 0,
    };
    if (!statsMap) return defaultStats;
    const cleanId = m.id.toLowerCase();
    const digits = (m.phoneNumber || m.id).replace(/[^0-9]/g, '');
    return (
      statsMap.get(m.id) ||
      statsMap.get(cleanId) ||
      (m.phoneNumber ? statsMap.get(m.phoneNumber) : undefined) ||
      (digits ? statsMap.get(digits) : undefined) ||
      (digits ? statsMap.get(`mem_${digits}`) : undefined) ||
      (m.matricNumber ? statsMap.get(m.matricNumber.toLowerCase()) : undefined) ||
      defaultStats
    );
  };

  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name': {
        const nameA = `${a.member.firstName} ${a.member.lastName}`.trim().toLowerCase();
        const nameB = `${b.member.firstName} ${b.member.lastName}`.trim().toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
      }
      case 'startDate': {
        const dateA = a.member.judoStartDate || a.member.createdAt || '';
        const dateB = b.member.judoStartDate || b.member.createdAt || '';
        comparison = dateA.localeCompare(dateB);
        break;
      }
      case 'belt': {
        const weightA = getBeltRankWeight(a.member.beltRank);
        const weightB = getBeltRankWeight(b.member.beltRank);
        comparison = weightA - weightB;
        break;
      }
      case 'daysPresent': {
        const pA = getStats(a.member).daysPresent;
        const pB = getStats(b.member).daysPresent;
        comparison = pA - pB;
        break;
      }
      case 'daysExcused': {
        const eA = getStats(a.member).daysExcused;
        const eB = getStats(b.member).daysExcused;
        comparison = eA - eB;
        break;
      }
      case 'daysAbsent': {
        const abA = getStats(a.member).daysAbsent;
        const abB = getStats(b.member).daysAbsent;
        comparison = abA - abB;
        break;
      }
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}
