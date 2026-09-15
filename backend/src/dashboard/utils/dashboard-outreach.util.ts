import {
  Attendance,
  AttendanceStatus,
} from '../../attendance/models/attendance.model';
import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from '../../outreach/models/outreach.model';
import { differenceInCalendarDays } from '../../attendance/utils/attendance-analytics.util';
import { formatToLagosDate } from '../../attendance/utils/attendance-date.util';
import { DashboardOutreachDto } from '../dto/dashboard-outreach-response.dto';

export function calculateOutreachDashboardMetrics(
  outreaches: Outreach[],
  attendances: Attendance[],
  refDate: Date = new Date(),
): DashboardOutreachDto {
  const todayStr = formatToLagosDate(refDate);
  const totalOutreach = outreaches.length;

  const contactMethodBreakdown: Record<string, number> = {};
  for (const m of Object.values(ContactMethod)) contactMethodBreakdown[m] = 0;

  const statusBreakdown: Record<string, number> = {};
  for (const s of Object.values(OutreachStatus)) statusBreakdown[s] = 0;

  let pendingFollowUps = 0;
  let followUpsDue = 0;

  const outreachesByMember = new Map<string, Outreach[]>();
  for (const o of outreaches) {
    const method = o.contactMethod || ContactMethod.OTHER;
    contactMethodBreakdown[method] = (contactMethodBreakdown[method] || 0) + 1;

    const st = o.status || OutreachStatus.PENDING;
    statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;

    if (o.nextFollowUpDate) {
      const diff = differenceInCalendarDays(todayStr, o.nextFollowUpDate);
      if (diff <= 0) followUpsDue++;
      else pendingFollowUps++;
    }

    const mid = o.memberId.trim().toLowerCase();
    const existing = outreachesByMember.get(mid) || [];
    existing.push(o);
    outreachesByMember.set(mid, existing);
  }

  const presentAttendancesByMember = new Map<string, string[]>();
  for (const a of attendances) {
    if (a.status === AttendanceStatus.PRESENT) {
      const mid = a.memberId.trim().toLowerCase();
      const existing = presentAttendancesByMember.get(mid) || [];
      existing.push(a.attendanceDate);
      presentAttendancesByMember.set(mid, existing);
    }
  }

  let returnedAfterOutreach = 0;
  for (const [mid, memberOutreaches] of outreachesByMember.entries()) {
    memberOutreaches.sort((a, b) => a.contactedAt.localeCompare(b.contactedAt));
    const earliestContact = memberOutreaches[0].contactedAt;
    const contactDate = earliestContact
      ? formatToLagosDate(new Date(earliestContact))
      : todayStr;

    const attendDates = presentAttendancesByMember.get(mid) || [];
    const hasReturned = attendDates.some((ad) => ad >= contactDate);
    if (hasReturned) returnedAfterOutreach++;
  }

  const uniqueContacted = outreachesByMember.size;
  const returnRatePercentage =
    uniqueContacted > 0
      ? Math.round((returnedAfterOutreach / uniqueContacted) * 1000) / 10
      : 0;

  return {
    totalOutreach,
    contactMethodBreakdown,
    statusBreakdown,
    pendingFollowUps,
    followUpsDue,
    returnedAfterOutreach,
    returnRatePercentage,
  };
}
