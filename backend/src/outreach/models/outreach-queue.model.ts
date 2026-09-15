import { Member } from '../../members/models/member.model';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import { Outreach, OutreachPriority } from './outreach.model';

export interface FollowUpInfo {
  isFollowUpDue: boolean;
  nextFollowUpDate: string | null;
  daysUntilFollowUp: number | null;
  lastContactedAt: string | null;
  lastContactMethod: string | null;
}

export interface OutreachQueueItem {
  member: Member;
  attendance: MemberAttendanceAnalytics;
  activityStatus: ActivityStatus;
  lastOutreach: Outreach | null;
  followUp: FollowUpInfo;
  priority: OutreachPriority;
  recommendedAction: string;
}
