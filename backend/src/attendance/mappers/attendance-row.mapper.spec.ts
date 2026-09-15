import {
  ATTENDANCE_SHEET_HEADERS,
  attendanceToRow,
  mapHeadersToAttendanceKeys,
  rowToAttendance,
} from './attendance-row.mapper';
import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../models/attendance.model';

describe('AttendanceRowMapper', () => {
  const headers = ATTENDANCE_SHEET_HEADERS;
  const headerKeys = mapHeadersToAttendanceKeys(headers);

  it('should map headers to attendance keys correctly', () => {
    expect(headerKeys).toEqual([
      'id',
      'memberId',
      'attendanceDate',
      'trainingSession',
      'status',
      'recordedBy',
      'notes',
      'createdAt',
    ]);
  });

  it('should parse a complete row into an Attendance model', () => {
    const row = [
      'att_12345',
      'mem_09028872023',
      '2026-09-13',
      'EVENING',
      'PRESENT',
      'coach@uijudo.club',
      'Great randori session',
      '2026-09-13T18:00:00.000Z',
    ];

    const result = rowToAttendance(headerKeys, row, 2);

    expect(result).toEqual({
      id: 'att_12345',
      memberId: 'mem_09028872023',
      attendanceDate: '2026-09-13',
      trainingSession: TrainingSession.EVENING,
      status: AttendanceStatus.PRESENT,
      recordedBy: 'coach@uijudo.club',
      notes: 'Great randori session',
      createdAt: '2026-09-13T18:00:00.000Z',
    });
  });

  it('should fallback gracefully for missing values and unknown statuses', () => {
    const row = [
      '',
      'mem_1',
      '2026-09-13',
      'UNKNOWN_SESSION',
      'UNKNOWN_STATUS',
    ];
    const result = rowToAttendance(headerKeys, row, 5);

    expect(result.id).toBe('att_row_5');
    expect(result.trainingSession).toBe(TrainingSession.GENERAL);
    expect(result.status).toBe(AttendanceStatus.PRESENT);
    expect(result.recordedBy).toBe('system');
  });

  it('should serialize an Attendance model into a spreadsheet row array', () => {
    const attendance: Attendance = {
      id: 'att_999',
      memberId: 'mem_2',
      attendanceDate: '2026-09-14',
      trainingSession: TrainingSession.COMPETITION,
      status: AttendanceStatus.EXCUSED,
      recordedBy: 'admin@uijudo.club',
      notes: 'Injured finger',
      createdAt: '2026-09-14T09:00:00.000Z',
    };

    const row = attendanceToRow(attendance);
    expect(row).toEqual([
      'att_999',
      'mem_2',
      '2026-09-14',
      'COMPETITION',
      'EXCUSED',
      'admin@uijudo.club',
      'Injured finger',
      '2026-09-14T09:00:00.000Z',
    ]);
  });
});
