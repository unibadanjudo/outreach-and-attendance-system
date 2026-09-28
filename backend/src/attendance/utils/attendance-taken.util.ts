import { Attendance, AttendanceStatus } from '../models/attendance.model';

/**
 * Resolves the `attendanceTaken` status for attendance records.
 *
 * Rules:
 * 1. If a record has an explicit `attendanceTaken` boolean, respect it.
 * 2. For historical logs where `attendanceTaken` is undefined:
 *    - If any candidate in that session was marked PRESENT, the session attendance was taken (true).
 *    - If all candidates in that session were ABSENT, attendance was not taken (false).
 */
export function resolveAttendanceTakenList(records: Attendance[]): Attendance[] {
  const sessionHasPresent = new Map<string, boolean>();
  const sessionHasExplicitTaken = new Map<string, boolean>();

  for (const r of records) {
    const key = `${r.attendanceDate}_${r.trainingSession}`;
    if (r.status === AttendanceStatus.PRESENT) {
      sessionHasPresent.set(key, true);
    }
    if (r.attendanceTaken === true) {
      sessionHasExplicitTaken.set(key, true);
    }
  }

  return records.map((r) => {
    const key = `${r.attendanceDate}_${r.trainingSession}`;
    let isTaken: boolean;

    if (typeof r.attendanceTaken === 'boolean') {
      isTaken = r.attendanceTaken;
    } else {
      const hasPresent = sessionHasPresent.get(key) === true;
      const hasExplicit = sessionHasExplicitTaken.get(key) === true;
      isTaken = hasPresent || hasExplicit;
    }

    return {
      ...r,
      attendanceTaken: isTaken,
    };
  });
}
