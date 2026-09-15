export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  otherNames?: string;
  nickname?: string;
  phoneNumber: string;
  facultyDepartment: string;
  matricNumber?: string;
  dateOfBirth?: string;
  judoStartDate?: string;
  motivation?: string;
  beltRank?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberAttendanceStats {
  totalAttendance: number;
  attendanceLast7Days: number;
  attendanceLast30Days: number;
  attendanceLast60Days: number;
  attendanceLast90Days: number;
  attendanceFrequency: number;
  daysSinceLastAttendance?: number | null;
}

export interface MemberSummary {
  member: Member;
  attendanceStats?: MemberAttendanceStats;
  attendanceTrend?: string;
  lastAttendance: string | null;
  activityStatus: string;
  outreachHistory?: any[];
  lastOutreach?: any | null;
  nextFollowUp?: string | null;
  recommendedAction?: string;
  attendanceCount: number;
  lastAttendedDate: string | null;
  outreachCount: number;
  lastOutreachDate: string | null;
}

export type MemberSummaryResponse = MemberSummary;

export interface PaginatedMembers {
  items: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
