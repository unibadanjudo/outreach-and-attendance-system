import { QueryAttendanceDto } from '../dto/query-attendance.dto';
import { PaginatedAttendanceDto } from '../dto/attendance-response.dto';
import { Attendance } from '../models/attendance.model';
import { isDateInRange } from './attendance-date.util';

export function filterAndPaginateAttendance(
  allRecords: Attendance[],
  query: QueryAttendanceDto,
): PaginatedAttendanceDto {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(500, Math.max(1, Number(query.limit) || 50));
  let records = allRecords;

  if (query.memberId) {
    const cleanMember = query.memberId.trim().toLowerCase();
    records = records.filter((r) =>
      r.memberId.toLowerCase().includes(cleanMember),
    );
  }
  if (query.date) {
    records = records.filter((r) => r.attendanceDate === query.date);
  }
  if (query.startDate || query.endDate) {
    records = records.filter((r) =>
      isDateInRange(r.attendanceDate, query.startDate, query.endDate),
    );
  }
  if (query.session) {
    records = records.filter((r) => r.trainingSession === query.session);
  }
  if (query.status) {
    records = records.filter((r) => r.status === query.status);
  }

  records.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
  const total = records.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const items = records.slice((page - 1) * limit, page * limit);

  return { items, meta: { total, page, limit, totalPages } };
}
