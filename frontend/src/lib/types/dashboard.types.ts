import type { Member } from './members.types';

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  recentlyInactiveMembers: number;
  inactiveMembers: number;
  longTermInactiveMembers: number;
  neverAttendedMembers: number;
  membersRequiringOutreach: number;
  outreachCompleted: number;
  outreachPending: number;
  followUpsDue: number;
  recentAttendance: number;
  attendanceTrends: {
    increasing: number;
    stable: number;
    declining: number;
    noAttendance: number;
  };
}

export interface DashboardAttendance {
  totalRecords: number;
  totalPresent: number;
  attendanceLast7Days: number;
  attendanceLast30Days: number;
  sessionBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  dailyAttendanceLast14Days: Array<{ date: string; count: number }>;
  averageAttendancePerSession: number;
}

export interface DashboardOutreach {
  totalOutreach: number;
  pendingOutreach: number;
  completedOutreach: number;
  followUpsDue: number;
  contactMethodBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  membersReturnedAfterOutreach: number;
  returnConversionRate: number;
}

export interface InactiveMemberItem {
  member: Member;
  lastAttendance: string | null;
  daysInactive: number | null;
  attendanceCount: number;
  activityStatus: string;
  priorityScore: number;
}

export interface PaginatedInactiveMembers {
  items: InactiveMemberItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConsolidatedDashboard {
  summary: DashboardSummary;
  attendance: DashboardAttendance;
  inactiveMembers: InactiveMemberItem[];
  outreach: DashboardOutreach;
}

