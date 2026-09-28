import type { Member } from '../types/members.types';
import type { JudokaAttendanceStats, AttendanceSortField, SortDirection } from './attendance-stats.util';
import { getBeltRankWeight } from './belt';
import { getMemberJoinDate } from './member-date.util';

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
