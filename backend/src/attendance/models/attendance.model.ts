export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
}

export enum TrainingSession {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  NO_TRAINING = 'NO_TRAINING',
  SPECIAL = 'SPECIAL',
  MORNING = 'MORNING',
  EVENING = 'EVENING',
  WEEKEND = 'WEEKEND',
  COMPETITION = 'COMPETITION',
  GENERAL = 'GENERAL',
}

export interface Attendance {
  id: string;
  memberId: string;
  attendanceDate: string; // YYYY-MM-DD
  trainingSession: TrainingSession;
  status: AttendanceStatus;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}
