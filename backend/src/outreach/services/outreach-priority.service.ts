import { Injectable } from '@nestjs/common';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import { MemberAttendanceAnalytics } from '../../attendance/models/attendance-analytics.model';
import { differenceInCalendarDays } from '../../attendance/utils/attendance-analytics.util';
import { formatToLagosDate } from '../../attendance/utils/attendance-date.util';
import { FollowUpInfo } from '../models/outreach-queue.model';
import {
  Outreach,
  OutreachPriority,
  OutreachStatus,
} from '../models/outreach.model';

@Injectable()
export class OutreachPriorityService {
  computeFollowUpInfo(
    lastOutreach: Outreach | null,
    referenceDate: Date = new Date(),
  ): FollowUpInfo {
    if (!lastOutreach) {
      return {
        isFollowUpDue: false,
        nextFollowUpDate: null,
        daysUntilFollowUp: null,
        lastContactedAt: null,
        lastContactMethod: null,
      };
    }

    const todayStr = formatToLagosDate(referenceDate);
    const nextDate = lastOutreach.nextFollowUpDate;
    let isFollowUpDue = false;
    let daysUntilFollowUp: number | null = null;

    if (nextDate) {
      daysUntilFollowUp = differenceInCalendarDays(todayStr, nextDate);
      isFollowUpDue = daysUntilFollowUp <= 0;
    } else {
      const contactDateStr = lastOutreach.contactedAt
        ? formatToLagosDate(new Date(lastOutreach.contactedAt))
        : todayStr;
      const daysSinceContact = differenceInCalendarDays(
        contactDateStr,
        todayStr,
      );
      const pendingStatuses = [
        OutreachStatus.CONTACTED,
        OutreachStatus.PENDING,
        OutreachStatus.NO_RESPONSE,
      ];
      if (pendingStatuses.includes(lastOutreach.status)) {
        isFollowUpDue = daysSinceContact >= 7;
      }
    }

    return {
      isFollowUpDue,
      nextFollowUpDate: nextDate || null,
      daysUntilFollowUp,
      lastContactedAt: lastOutreach.contactedAt || null,
      lastContactMethod: lastOutreach.contactMethod || null,
    };
  }

  determineRecommendedAction(
    status: ActivityStatus,
    lastOutreach: Outreach | null,
    followUp: FollowUpInfo,
  ): string {
    if (status === ActivityStatus.ACTIVE) return 'No action required';
    if (!lastOutreach) return 'Contact member';

    switch (lastOutreach.status) {
      case OutreachStatus.NOT_INTERESTED:
        return 'No action required';
      case OutreachStatus.WILL_RETURN:
        return followUp.isFollowUpDue
          ? 'Follow up with member'
          : 'Member plans to return';
      case OutreachStatus.TEMPORARILY_UNAVAILABLE:
        return followUp.isFollowUpDue
          ? 'Follow up with member'
          : 'No action required';
      case OutreachStatus.PENDING:
      case OutreachStatus.CONTACTED:
      case OutreachStatus.NO_RESPONSE:
      case OutreachStatus.RESPONDED:
        return followUp.isFollowUpDue
          ? 'Follow up with member'
          : 'Await response';
      default:
        return followUp.isFollowUpDue
          ? 'Follow up with member'
          : 'No action required';
    }
  }

  calculatePriority(
    status: ActivityStatus,
    analytics: MemberAttendanceAnalytics,
    lastOutreach: Outreach | null,
    followUp: FollowUpInfo,
  ): OutreachPriority {
    if (status === ActivityStatus.ACTIVE) return OutreachPriority.LOW;
    if (lastOutreach?.status === OutreachStatus.NOT_INTERESTED)
      return OutreachPriority.LOW;
    if (followUp.isFollowUpDue) return OutreachPriority.HIGH;
    if (lastOutreach && !followUp.isFollowUpDue) return OutreachPriority.LOW;
    if (status === ActivityStatus.NEVER_ATTENDED)
      return OutreachPriority.MEDIUM;

    if (status === ActivityStatus.RECENTLY_INACTIVE) {
      return analytics.totalAttendance >= 5 ||
        analytics.attendanceFrequency >= 1
        ? OutreachPriority.HIGH
        : OutreachPriority.MEDIUM;
    }
    if (status === ActivityStatus.INACTIVE) {
      return analytics.totalAttendance >= 8
        ? OutreachPriority.HIGH
        : OutreachPriority.MEDIUM;
    }
    return OutreachPriority.LOW;
  }
}
