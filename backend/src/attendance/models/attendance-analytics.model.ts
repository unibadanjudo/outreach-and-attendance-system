import { ActivityStatus } from './activity-status.enum';

export type AttendanceTrend =
  'INCREASING' | 'STABLE' | 'DECLINING' | 'NO_ATTENDANCE';

export interface InactivityThresholds {
  activeDays: number;
  recentlyInactiveDays: number;
  inactiveDays: number;
  longTermInactiveDays: number;
}

export interface MemberAttendanceAnalytics {
  totalAttendance: number;
  attendanceInLast7Days: number;
  attendanceInLast30Days: number;
  attendanceInLast60Days: number;
  attendanceInLast90Days: number;
  lastAttendanceDate: string | null;
  previousAttendanceDate: string | null;
  daysSinceLastAttendance: number | null;
  attendanceFrequency: number;
  recentAttendanceTrend: AttendanceTrend;
}

export interface MemberActivityDetails {
  memberId: string;
  status: ActivityStatus;
  daysInactive: number | null;
  analytics: MemberAttendanceAnalytics;
}
