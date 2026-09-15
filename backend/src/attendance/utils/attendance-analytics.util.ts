import { AttendanceStatus } from '../models/attendance.model';
import {
  AttendanceTrend,
  MemberAttendanceAnalytics,
} from '../models/attendance-analytics.model';
import { formatToLagosDate } from './attendance-date.util';

interface AttendanceRecordLike {
  attendanceDate: string;
  status: AttendanceStatus;
}

export function differenceInCalendarDays(
  earlierDateStr: string,
  laterDateStr: string,
): number {
  const [y1, m1, d1] = earlierDateStr.split('-').map(Number);
  const [y2, m2, d2] = laterDateStr.split('-').map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}

export function computeAttendanceTrend(
  totalAttendance: number,
  last30DaysCount: number,
  prev30DaysCount: number,
): AttendanceTrend {
  if (totalAttendance === 0) return 'NO_ATTENDANCE';
  if (last30DaysCount > prev30DaysCount) return 'INCREASING';
  if (last30DaysCount < prev30DaysCount) return 'DECLINING';
  if (last30DaysCount === 0 && totalAttendance > 0) return 'DECLINING';
  return 'STABLE';
}

export function computeAttendanceFrequency(last90DaysCount: number): number {
  const weeksIn90Days = 90 / 7; // ~12.857 weeks
  const avg = last90DaysCount / weeksIn90Days;
  return Math.round(avg * 100) / 100;
}

export function computeMemberAttendanceAnalytics(
  attendances: AttendanceRecordLike[],
  referenceDate: Date = new Date(),
): MemberAttendanceAnalytics {
  const todayLagos = formatToLagosDate(referenceDate);

  const presentRecords = attendances
    .filter((a) => a.status === AttendanceStatus.PRESENT)
    .sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));

  const totalAttendance = presentRecords.length;

  if (totalAttendance === 0) {
    return {
      totalAttendance: 0,
      attendanceInLast7Days: 0,
      attendanceInLast30Days: 0,
      attendanceInLast60Days: 0,
      attendanceInLast90Days: 0,
      lastAttendanceDate: null,
      previousAttendanceDate: null,
      daysSinceLastAttendance: null,
      attendanceFrequency: 0,
      recentAttendanceTrend: 'NO_ATTENDANCE',
    };
  }

  const lastAttendanceDate = presentRecords[0].attendanceDate;
  const previousAttendanceDate =
    presentRecords.length > 1 ? presentRecords[1].attendanceDate : null;
  const daysSinceLastAttendance = Math.max(
    0,
    differenceInCalendarDays(lastAttendanceDate, todayLagos),
  );

  let last7 = 0;
  let last30 = 0;
  let prev30 = 0; // days 31 to 60
  let last60 = 0;
  let last90 = 0;

  for (const record of presentRecords) {
    const daysAgo = differenceInCalendarDays(record.attendanceDate, todayLagos);
    if (daysAgo >= 0 && daysAgo <= 7) last7++;
    if (daysAgo >= 0 && daysAgo <= 30) last30++;
    if (daysAgo > 30 && daysAgo <= 60) prev30++;
    if (daysAgo >= 0 && daysAgo <= 60) last60++;
    if (daysAgo >= 0 && daysAgo <= 90) last90++;
  }

  return {
    totalAttendance,
    attendanceInLast7Days: last7,
    attendanceInLast30Days: last30,
    attendanceInLast60Days: last60,
    attendanceInLast90Days: last90,
    lastAttendanceDate,
    previousAttendanceDate,
    daysSinceLastAttendance,
    attendanceFrequency: computeAttendanceFrequency(last90),
    recentAttendanceTrend: computeAttendanceTrend(
      totalAttendance,
      last30,
      prev30,
    ),
  };
}
