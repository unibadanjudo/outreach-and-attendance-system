import { Member } from '../models/member.model';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { Outreach } from '../../outreach/models/outreach.model';
import { OutreachPriorityService } from '../../outreach/services/outreach-priority.service';
import { MemberSummaryDto } from '../dto/member-response.dto';

export function buildMemberSummaryDto(
  member: Member,
  analytics: MemberAttendanceAnalytics,
  activityStatus: ActivityStatus,
  outreaches: Outreach[],
  outreachPriorityService?: OutreachPriorityService,
  now: Date = new Date(),
): MemberSummaryDto {
  const outreachHistory = [...outreaches].sort((a, b) =>
    b.contactedAt.localeCompare(a.contactedAt),
  );
  const outreachCount = outreachHistory.length;
  const lastOutreach = outreachCount > 0 ? outreachHistory[0] : null;
  const lastOutreachDate = lastOutreach ? lastOutreach.contactedAt : null;
  const nextFollowUp = lastOutreach?.nextFollowUpDate || null;

  let recommendedAction = 'No action required';
  if (outreachPriorityService) {
    const followUp = outreachPriorityService.computeFollowUpInfo(
      lastOutreach,
      now,
    );
    recommendedAction = outreachPriorityService.determineRecommendedAction(
      activityStatus,
      lastOutreach,
      followUp,
    );
  } else if (activityStatus !== ActivityStatus.ACTIVE) {
    recommendedAction = lastOutreach
      ? 'Follow up with member'
      : 'Contact member';
  }

  return {
    member,
    attendanceCount: analytics.totalAttendance,
    lastAttendedDate: analytics.lastAttendanceDate,
    lastAttendance: analytics.lastAttendanceDate,
    activityStatus,
    attendanceTrend: analytics.recentAttendanceTrend,
    attendanceStats: {
      totalAttendance: analytics.totalAttendance,
      attendanceInLast7Days: analytics.attendanceInLast7Days,
      attendanceInLast30Days: analytics.attendanceInLast30Days,
      attendanceInLast60Days: analytics.attendanceInLast60Days,
      attendanceInLast90Days: analytics.attendanceInLast90Days,
      daysSinceLastAttendance: analytics.daysSinceLastAttendance,
      attendanceFrequency: analytics.attendanceFrequency,
    },
    outreachCount,
    lastOutreachDate,
    lastOutreach,
    nextFollowUp,
    outreachHistory,
    recommendedAction,
  };
}
