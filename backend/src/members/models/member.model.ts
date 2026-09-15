export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  otherNames: string;
  nickname: string;
  phoneNumber: string;
  facultyDepartment: string;
  matricNumber: string;
  dateOfBirth: string;
  judoStartDate: string;
  motivation: string;
  beltRank?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberSummary {
  member: Member;
  attendanceCount: number;
  lastAttendedDate: string | null;
  outreachCount: number;
  lastOutreachDate: string | null;
}
