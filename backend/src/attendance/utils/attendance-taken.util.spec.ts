import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../models/attendance.model';
import { resolveAttendanceTakenList } from './attendance-taken.util';

describe('resolveAttendanceTakenList', () => {
  it('should mark attendanceTaken as true when someone was present in the session', () => {
    const records: Attendance[] = [
      {
        id: '1',
        memberId: 'mem_1',
        attendanceDate: '2026-09-10',
        trainingSession: TrainingSession.GENERAL,
        status: AttendanceStatus.PRESENT,
        recordedBy: 'coach',
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        id: '2',
        memberId: 'mem_2',
        attendanceDate: '2026-09-10',
        trainingSession: TrainingSession.GENERAL,
        status: AttendanceStatus.ABSENT,
        recordedBy: 'coach',
        createdAt: '2026-09-10T10:00:00Z',
      },
    ];

    const resolved = resolveAttendanceTakenList(records);
    expect(resolved[0].attendanceTaken).toBe(true);
    expect(resolved[1].attendanceTaken).toBe(true);
  });

  it('should mark attendanceTaken as false when all members in the session are absent', () => {
    const records: Attendance[] = [
      {
        id: '1',
        memberId: 'mem_1',
        attendanceDate: '2026-09-11',
        trainingSession: TrainingSession.EVENING,
        status: AttendanceStatus.ABSENT,
        recordedBy: 'system',
        createdAt: '2026-09-11T10:00:00Z',
      },
      {
        id: '2',
        memberId: 'mem_2',
        attendanceDate: '2026-09-11',
        trainingSession: TrainingSession.EVENING,
        status: AttendanceStatus.ABSENT,
        recordedBy: 'system',
        createdAt: '2026-09-11T10:00:00Z',
      },
    ];

    const resolved = resolveAttendanceTakenList(records);
    expect(resolved[0].attendanceTaken).toBe(false);
    expect(resolved[1].attendanceTaken).toBe(false);
  });

  it('should preserve explicit attendanceTaken boolean values', () => {
    const records: Attendance[] = [
      {
        id: '1',
        memberId: 'mem_1',
        attendanceDate: '2026-09-12',
        trainingSession: TrainingSession.GENERAL,
        status: AttendanceStatus.ABSENT,
        recordedBy: 'coach',
        createdAt: '2026-09-12T10:00:00Z',
        attendanceTaken: true,
      },
    ];

    const resolved = resolveAttendanceTakenList(records);
    expect(resolved[0].attendanceTaken).toBe(true);
  });
});
