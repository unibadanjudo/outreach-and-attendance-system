import type { Attendance, AttendanceStatus } from '../types/attendance.types';
import type { Member } from '../types/members.types';
import { getMemberJoinDate } from './member-date.util';
import { getMemberAliasKeys, getAllMemberAliases } from './member-alias.util';

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
    for (const alias of getAllMemberAliases(m)) {
      memberLookup.set(alias, m.id);
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
    const pDigits = getMemberAliasKeys(memberId);
    for (const d of pDigits) {
      statsMap.set(d, statItem);
    }
  }

  // Ensure every member can be retrieved by their member fields
  for (const m of members) {
    const statItem = statsMap.get(m.id) || statsMap.get(m.id.toLowerCase());
    if (statItem) {
      for (const alias of getAllMemberAliases(m)) {
        statsMap.set(alias, statItem);
      }
    }
  }

  return { statsMap, totalClubSessions };
}
