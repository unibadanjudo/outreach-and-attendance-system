import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { QueryInactiveMembersDto } from '../dto/query-inactive-members.dto';
import {
  InactiveMemberItemDto,
  PaginatedInactiveMembersDto,
} from '../dto/inactive-members-response.dto';

export function filterAndPaginateInactiveMembers(
  items: InactiveMemberItemDto[],
  query: QueryInactiveMembersDto,
): PaginatedInactiveMembersDto {
  let filtered = items.filter(
    (i) => i.activityStatus !== ActivityStatus.ACTIVE,
  );
  if (query.status)
    filtered = filtered.filter((i) => i.activityStatus === query.status);
  if (query.minDays !== undefined) {
    filtered = filtered.filter(
      (i) => i.daysInactive !== null && i.daysInactive >= query.minDays!,
    );
  }
  if (query.maxDays !== undefined) {
    filtered = filtered.filter(
      (i) => i.daysInactive !== null && i.daysInactive <= query.maxDays!,
    );
  }

  filtered.sort((a, b) => {
    if (query.sortBy === 'daysInactive')
      return (b.daysInactive ?? -1) - (a.daysInactive ?? -1);
    if (query.sortBy === 'attendanceCount')
      return b.attendanceCount - a.attendanceCount;
    return b.priorityScore - a.priorityScore;
  });

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  return {
    items: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  };
}

export function buildInactiveMemberItems(
  members: Array<any>,
  analyticsMap: Map<string, any>,
  inactivityService: any,
): InactiveMemberItemDto[] {
  return members.map((member) => {
    const idKey = member.id.trim().toLowerCase();
    const phoneKey = member.phoneNumber
      ? member.phoneNumber.trim().toLowerCase()
      : '';
    const an =
      analyticsMap.get(idKey) ||
      (phoneKey ? analyticsMap.get(phoneKey) : undefined) || {
        totalAttendance: 0,
        daysSinceLastAttendance: null,
        lastAttendanceDate: null,
      };
    const status = inactivityService.determineStatus(an);
    return {
      member,
      lastAttendance: an.lastAttendanceDate ?? null,
      daysInactive: an.daysSinceLastAttendance ?? null,
      attendanceCount: an.totalAttendance ?? 0,
      activityStatus: status,
      priorityScore: inactivityService.calculateOutreachPriorityScore(
        status,
        an.totalAttendance ?? 0,
        an.daysSinceLastAttendance ?? null,
      ),
    };
  });
}
