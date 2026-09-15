import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ActivityStatus } from '../models/activity-status.enum';
import {
  InactivityThresholds,
  MemberActivityDetails,
  MemberAttendanceAnalytics,
} from '../models/attendance-analytics.model';
import { AttendanceAnalyticsService } from './attendance-analytics.service';

@Injectable()
export class InactivityService {
  constructor(
    private readonly configService: ConfigService,
    private readonly attendanceAnalyticsService: AttendanceAnalyticsService,
  ) {}

  getThresholds(): InactivityThresholds {
    return {
      activeDays: this.configService.get<number>(
        'app.inactivity.activeDays',
        14,
      ),
      recentlyInactiveDays: this.configService.get<number>(
        'app.inactivity.recentlyInactiveDays',
        30,
      ),
      inactiveDays: this.configService.get<number>(
        'app.inactivity.inactiveDays',
        60,
      ),
      longTermInactiveDays: this.configService.get<number>(
        'app.inactivity.longTermInactiveDays',
        90,
      ),
    };
  }

  determineStatus(
    analytics: MemberAttendanceAnalytics,
    customThresholds?: Partial<InactivityThresholds>,
  ): ActivityStatus {
    if (
      analytics.totalAttendance === 0 ||
      analytics.daysSinceLastAttendance === null
    ) {
      return ActivityStatus.NEVER_ATTENDED;
    }

    const t = { ...this.getThresholds(), ...customThresholds };
    const days = analytics.daysSinceLastAttendance;

    if (days <= t.activeDays) {
      return ActivityStatus.ACTIVE;
    }
    if (days <= t.recentlyInactiveDays) {
      return ActivityStatus.RECENTLY_INACTIVE;
    }
    if (days <= t.longTermInactiveDays) {
      return ActivityStatus.INACTIVE;
    }
    return ActivityStatus.LONG_TERM_INACTIVE;
  }

  async getMemberActivityDetails(
    memberId: string,
    referenceDate: Date = new Date(),
    alternativeId?: string,
  ): Promise<MemberActivityDetails> {
    const analytics = await this.attendanceAnalyticsService.getMemberAnalytics(
      memberId,
      referenceDate,
      alternativeId,
    );
    const status = this.determineStatus(analytics);

    return {
      memberId,
      status,
      daysInactive: analytics.daysSinceLastAttendance,
      analytics,
    };
  }

  calculateOutreachPriorityScore(
    status: ActivityStatus,
    totalAttendance: number,
    daysInactive: number | null,
  ): number {
    const days = daysInactive ?? 999;
    switch (status) {
      case ActivityStatus.RECENTLY_INACTIVE:
        return 10000 + totalAttendance * 20 - Math.min(days, 100);
      case ActivityStatus.INACTIVE:
        return 5000 + totalAttendance * 15 - Math.min(days, 200);
      case ActivityStatus.NEVER_ATTENDED:
        return 2500;
      case ActivityStatus.LONG_TERM_INACTIVE:
        return 1000 + totalAttendance * 5 - Math.min(days, 500);
      case ActivityStatus.ACTIVE:
      default:
        return 0;
    }
  }
}
