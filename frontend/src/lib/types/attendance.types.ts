export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED';

export type TrainingSession =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'NO_TRAINING'
  | 'SPECIAL'
  | 'MORNING'
  | 'EVENING'
  | 'WEEKEND'
  | 'GENERAL';

export interface Attendance {
  id: string;
  memberId: string;
  attendanceDate: string;
  trainingSession: TrainingSession | string;
  status: AttendanceStatus;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAttendanceDto {
  memberId: string;
  attendanceDate: string;
  trainingSession: string;
  status: AttendanceStatus;
  notes?: string;
  isCorrection?: boolean;
}

export interface BatchCreateAttendanceDto {
  records: CreateAttendanceDto[];
}

export interface UpdateAttendanceDto {
  status?: AttendanceStatus;
  notes?: string;
}

export interface PaginatedAttendanceResponse {
  items: Attendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AttendanceFilters {
  memberId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  session?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}
