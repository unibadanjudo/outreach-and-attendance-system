import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../models/attendance.model';

export const ATTENDANCE_SHEET_HEADERS = [
  'Attendance ID',
  'Member ID',
  'Attendance Date',
  'Session',
  'Status',
  'Recorded By',
  'Notes',
  'Created At',
];

export type AttendanceField = keyof Attendance;

export const HEADER_ALIASES: Record<string, AttendanceField> = {
  attendanceid: 'id',
  id: 'id',
  memberid: 'memberId',
  member: 'memberId',
  phonenumber: 'memberId',
  attendancedate: 'attendanceDate',
  date: 'attendanceDate',
  session: 'trainingSession',
  trainingsession: 'trainingSession',
  status: 'status',
  attendance: 'status',
  recordedby: 'recordedBy',
  recorder: 'recordedBy',
  coach: 'recordedBy',
  notes: 'notes',
  note: 'notes',
  createdat: 'createdAt',
  timestamp: 'createdAt',
};

export function mapHeadersToAttendanceKeys(
  headers: string[],
): (AttendanceField | null)[] {
  return headers.map((h) => {
    if (!h) return null;
    const clean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    return HEADER_ALIASES[clean] || null;
  });
}

export function rowToAttendance(
  headerKeys: (AttendanceField | null)[],
  row: string[],
  rowIndex: number,
): Attendance {
  const record: Partial<Attendance> = {};

  headerKeys.forEach((key, index) => {
    if (!key) return;
    const value = row[index]?.trim() || '';
    if (key === 'status') {
      const upper = value.toUpperCase();
      record.status =
        upper === 'ABSENT'
          ? AttendanceStatus.ABSENT
          : upper === 'EXCUSED'
            ? AttendanceStatus.EXCUSED
            : AttendanceStatus.PRESENT;
    } else if (key === 'trainingSession') {
      const upper = value.toUpperCase();
      record.trainingSession = Object.values(TrainingSession).includes(
        upper as TrainingSession,
      )
        ? (upper as TrainingSession)
        : TrainingSession.GENERAL;
    } else {
      (record as Record<string, unknown>)[key] = value;
    }
  });

  return {
    id: record.id || `att_row_${rowIndex}`,
    memberId: record.memberId || '',
    attendanceDate: record.attendanceDate || '',
    trainingSession: record.trainingSession || TrainingSession.GENERAL,
    status: record.status || AttendanceStatus.PRESENT,
    recordedBy: record.recordedBy || 'system',
    notes: record.notes || '',
    createdAt: record.createdAt || new Date().toISOString(),
  };
}

export function attendanceToRow(attendance: Attendance): string[] {
  return [
    attendance.id,
    attendance.memberId,
    attendance.attendanceDate,
    attendance.trainingSession,
    attendance.status,
    attendance.recordedBy,
    attendance.notes || '',
    attendance.createdAt,
  ];
}
