import type { Attendance, AttendanceStatus } from '../types/attendance.types';
import type { Member } from '../types/members.types';
import { parseBeltRank } from './belt';

export interface JudokaAttendanceStats {
  memberId: string;
  daysPresent: number;
  daysExcused: number;
  daysAbsent: number;
  totalTakenDays: number;
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
 * Calculates member attendance statistics.
 *
 * Important rules:
 * - A session is considered "attendance taken" if at least one judoka was marked PRESENT
 *   or if attendanceTaken is explicitly true.
 * - Sessions where all judokas are ABSENT (and attendance was not taken) are excluded.
 * - totalTakenDays only counts days where attendance was taken.
 * - Formats ratio string e.g. "13days/40".
 */
export function calculateAttendanceStats(
  records: Attendance[],
  members: Member[],
): {
  statsMap: Map<string, JudokaAttendanceStats>;
  totalTakenDays: number;
} {
  // 1. Group records by session: `${attendanceDate}_${trainingSession}`
  const sessionRecords = new Map<string, Attendance[]>();
  for (const r of records) {
    if (!r.attendanceDate) continue;
    const sess = r.trainingSession || 'GENERAL';
    const key = `${r.attendanceDate}_${sess}`;
    const list = sessionRecords.get(key) || [];
    list.push(r);
    sessionRecords.set(key, list);
  }

  // 2. Identify sessions where attendance was actually taken
  const takenSessions = new Set<string>();
  for (const [key, sessionList] of sessionRecords.entries()) {
    const hasPresent = sessionList.some(
      (r) => String(r.status || '').toUpperCase() === 'PRESENT',
    );
    const hasExplicitTaken = sessionList.some((r) => r.attendanceTaken === true);
    if (hasPresent || hasExplicitTaken) {
      takenSessions.add(key);
    }
  }

  const totalTakenDays = takenSessions.size;

  // 3. Prepare counters for all members
  const memberStats = new Map<
    string,
    { daysPresent: number; daysExcused: number; daysAbsent: number }
  >();

  for (const m of members) {
    memberStats.set(m.id, { daysPresent: 0, daysExcused: 0, daysAbsent: 0 });
  }

  // Helper to find matching member ID from record memberId
  const memberLookup = new Map<string, string>();
  for (const m of members) {
    memberLookup.set(m.id.toLowerCase(), m.id);
    const digits = (m.phoneNumber || m.id).replace(/[^0-9]/g, '');
    if (digits) {
      memberLookup.set(digits, m.id);
      memberLookup.set(`mem_${digits}`, m.id);
      if (digits.startsWith('0')) {
        memberLookup.set(`mem_${digits.substring(1)}`, m.id);
        memberLookup.set(digits.substring(1), m.id);
      } else {
        memberLookup.set(`mem_0${digits}`, m.id);
        memberLookup.set(`0${digits}`, m.id);
      }
    }
  }

  // 4. Aggregate counts across taken sessions only
  for (const sessionKey of takenSessions) {
    const sessionList = sessionRecords.get(sessionKey) || [];
    for (const r of sessionList) {
      const cleanId = (r.memberId || '').toLowerCase().trim();
      const targetMemberId =
        memberLookup.get(cleanId) ||
        memberLookup.get(cleanId.replace(/[^0-9]/g, '')) ||
        r.memberId;

      let counts = memberStats.get(targetMemberId);
      if (!counts) {
        counts = { daysPresent: 0, daysExcused: 0, daysAbsent: 0 };
        memberStats.set(targetMemberId, counts);
      }

      const st = String(r.status || '').toUpperCase();
      if (st === 'PRESENT') counts.daysPresent++;
      else if (st === 'EXCUSED') counts.daysExcused++;
      else if (st === 'ABSENT') counts.daysAbsent++;
    }
  }

  // 5. Build final map with alias keys for easy lookup
  const statsMap = new Map<string, JudokaAttendanceStats>();
  for (const [memberId, counts] of memberStats.entries()) {
    const percentage =
      totalTakenDays > 0
        ? Math.round((counts.daysPresent / totalTakenDays) * 100)
        : 0;
    const statItem: JudokaAttendanceStats = {
      memberId,
      daysPresent: counts.daysPresent,
      daysExcused: counts.daysExcused,
      daysAbsent: counts.daysAbsent,
      totalTakenDays,
      ratioString: `${counts.daysPresent}days/${totalTakenDays}`,
      percentage,
    };

    statsMap.set(memberId, statItem);
    statsMap.set(memberId.toLowerCase(), statItem);
    const digits = memberId.replace(/[^0-9]/g, '');
    if (digits) {
      statsMap.set(digits, statItem);
      statsMap.set(`mem_${digits}`, statItem);
    }
  }

  return { statsMap, totalTakenDays };
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
      daysPresent: 0,
      daysExcused: 0,
      daysAbsent: 0,
      totalTakenDays: 0,
      ratioString: '0days/0',
      percentage: 0,
    };
    if (!statsMap) return defaultStats;
    const cleanId = m.id.toLowerCase();
    const digits = (m.phoneNumber || m.id).replace(/[^0-9]/g, '');
    return (
      statsMap.get(m.id) ||
      statsMap.get(cleanId) ||
      (digits ? statsMap.get(digits) : undefined) ||
      (digits ? statsMap.get(`mem_${digits}`) : undefined) ||
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
