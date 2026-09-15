import { Attendance } from '../models/attendance.model';

export const ATTENDANCE_REPOSITORY = Symbol('ATTENDANCE_REPOSITORY');

export interface AttendanceRepository {
  findAll(): Promise<Attendance[]>;
  findById(id: string): Promise<Attendance | null>;
  findByMemberId(memberId: string): Promise<Attendance[]>;
  findByMemberAndSession(
    memberId: string,
    attendanceDate: string,
    trainingSession: string,
  ): Promise<Attendance | null>;
  create(attendance: Attendance): Promise<Attendance>;
  batchUpsert(attendances: Attendance[]): Promise<Attendance[]>;
  update(id: string, updates: Partial<Attendance>): Promise<Attendance>;
  delete(id: string): Promise<boolean>;
}
