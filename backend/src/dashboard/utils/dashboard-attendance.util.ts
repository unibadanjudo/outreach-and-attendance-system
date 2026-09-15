import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from '../../attendance/models/attendance.model';
import { differenceInCalendarDays } from '../../attendance/utils/attendance-analytics.util';
import { formatToLagosDate } from '../../attendance/utils/attendance-date.util';
import {
  DailyAttendanceItemDto,
  DashboardAttendanceDto,
} from '../dto/dashboard-attendance-response.dto';

export function calculateAttendanceDashboardMetrics(
  records: Attendance[],
  refDate: Date = new Date(),
): DashboardAttendanceDto {
  const todayStr = formatToLagosDate(refDate);
  const totalRecords = records.length;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalExcused = 0;
  let attendanceLast7Days = 0;
  let attendanceLast30Days = 0;

  const sessionBreakdown: Record<string, number> = {};
  for (const s of Object.values(TrainingSession)) sessionBreakdown[s] = 0;

  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    dailyMap.set(formatToLagosDate(d), 0);
  }

  const sessionsCounted = new Set<string>();

  for (const r of records) {
    if (r.status === AttendanceStatus.PRESENT) {
      totalPresent++;
      const days = differenceInCalendarDays(r.attendanceDate, todayStr);
      if (days >= 0 && days <= 7) attendanceLast7Days++;
      if (days >= 0 && days <= 30) attendanceLast30Days++;
      if (dailyMap.has(r.attendanceDate)) {
        dailyMap.set(
          r.attendanceDate,
          (dailyMap.get(r.attendanceDate) || 0) + 1,
        );
      }
      sessionsCounted.add(`${r.attendanceDate}_${r.trainingSession}`);
    } else if (r.status === AttendanceStatus.ABSENT) {
      totalAbsent++;
    } else if (r.status === AttendanceStatus.EXCUSED) {
      totalExcused++;
    }

    const sess = r.trainingSession || TrainingSession.GENERAL;
    sessionBreakdown[sess] = (sessionBreakdown[sess] || 0) + 1;
  }

  const dailyAttendanceLast14Days: DailyAttendanceItemDto[] = Array.from(
    dailyMap.entries(),
  ).map(([date, count]) => ({ date, count }));

  const avgPerSession =
    sessionsCounted.size > 0
      ? Math.round((totalPresent / sessionsCounted.size) * 10) / 10
      : 0;

  return {
    totalRecords,
    totalPresent,
    totalAbsent,
    totalExcused,
    attendanceLast7Days,
    attendanceLast30Days,
    sessionBreakdown,
    dailyAttendanceLast14Days,
    averageAttendancePerSession: avgPerSession,
  };
}
