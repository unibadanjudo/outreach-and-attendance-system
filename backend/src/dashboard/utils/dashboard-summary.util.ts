import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import { Attendance } from '../../attendance/models/attendance.model';
import { InactivityService } from '../../attendance/services/inactivity.service';
import { Member } from '../../members/models/member.model';
import { Outreach, OutreachStatus } from '../../outreach/models/outreach.model';
import { DashboardSummaryDto } from '../dto/dashboard-summary-response.dto';
import { calculateAttendanceDashboardMetrics } from './dashboard-attendance.util';

export function calculateSummaryMetrics(
  members: Member[],
  attendances: Attendance[],
  outreaches: Outreach[],
  analyticsMap: Map<string, MemberAttendanceAnalytics>,
  queue: { summary: { totalInQueue: number; followUpDueCount: number } },
  inactivityService: InactivityService,
  refDate: Date = new Date(),
): DashboardSummaryDto {
  const summary: DashboardSummaryDto = {
    totalMembers: members.length,
    activeMembers: 0,
    recentlyInactiveMembers: 0,
    inactiveMembers: 0,
    longTermInactiveMembers: 0,
    neverAttendedMembers: 0,
    membersRequiringOutreach: queue.summary.totalInQueue,
    outreachCompleted: 0,
    outreachPending: 0,
    followUpsDue: queue.summary.followUpDueCount,
    recentAttendance: 0,
    attendanceTrends: {
      increasing: 0,
      stable: 0,
      declining: 0,
      noAttendance: 0,
    },
  };

  for (const m of members) {
    const idKey = m.id.trim().toLowerCase();
    const phoneKey = m.phoneNumber ? m.phoneNumber.trim().toLowerCase() : '';
    const an =
      analyticsMap.get(idKey) ||
      (phoneKey ? analyticsMap.get(phoneKey) : undefined) ||
      ({
        totalAttendance: 0,
        attendanceInLast7Days: 0,
        attendanceInLast30Days: 0,
        attendanceInLast60Days: 0,
        attendanceInLast90Days: 0,
        lastAttendanceDate: null,
        previousAttendanceDate: null,
        daysSinceLastAttendance: null,
        attendanceFrequency: 0,
        recentAttendanceTrend: 'NO_ATTENDANCE',
      } as MemberAttendanceAnalytics);

    const status = inactivityService.determineStatus(an);
    if (status === ActivityStatus.ACTIVE) summary.activeMembers++;
    else if (status === ActivityStatus.RECENTLY_INACTIVE)
      summary.recentlyInactiveMembers++;
    else if (status === ActivityStatus.INACTIVE) summary.inactiveMembers++;
    else if (status === ActivityStatus.LONG_TERM_INACTIVE)
      summary.longTermInactiveMembers++;
    else summary.neverAttendedMembers++;

    const tr = an.recentAttendanceTrend;
    if (tr === 'INCREASING') summary.attendanceTrends.increasing++;
    else if (tr === 'STABLE') summary.attendanceTrends.stable++;
    else if (tr === 'DECLINING') summary.attendanceTrends.declining++;
    else summary.attendanceTrends.noAttendance++;
  }

  const completed = [
    OutreachStatus.RESPONDED,
    OutreachStatus.WILL_RETURN,
    OutreachStatus.NOT_INTERESTED,
  ];
  for (const o of outreaches) {
    if (completed.includes(o.status)) summary.outreachCompleted++;
    else summary.outreachPending++;
  }

  summary.recentAttendance = calculateAttendanceDashboardMetrics(
    attendances,
    refDate,
  ).attendanceLast30Days;

  return summary;
}
