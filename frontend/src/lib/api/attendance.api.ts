import { api } from './client';
import type {
  Attendance,
  AttendanceFilters,
  CreateAttendanceDto,
  PaginatedAttendanceResponse,
  UpdateAttendanceDto,
} from '../types';

export const attendanceApi = {
  list: (filters?: AttendanceFilters) => {
    const query = new URLSearchParams();
    if (filters?.memberId) query.set('memberId', filters.memberId);
    if (filters?.date) query.set('date', filters.date);
    if (filters?.startDate) query.set('startDate', filters.startDate);
    if (filters?.endDate) query.set('endDate', filters.endDate);
    if (filters?.session && filters.session !== 'ALL') query.set('session', filters.session);
    if (filters?.status && filters.status !== ('ALL' as any)) query.set('status', filters.status);
    if (filters?.limit) query.set('limit', String(filters.limit));
    if (filters?.page) query.set('page', String(filters.page));
    const qs = query.toString();
    return api.get<PaginatedAttendanceResponse>(`/attendance${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<Attendance>(`/attendance/${id}`),
  create: (payload: CreateAttendanceDto) =>
    api.post<Attendance>('/attendance', payload),
  update: (id: string, payload: UpdateAttendanceDto) =>
    api.patch<Attendance>(`/attendance/${id}`, payload),
  delete: (id: string) =>
    api.delete<{ deleted: boolean }>(`/attendance/${id}`),
  recordBatch: (records: CreateAttendanceDto[]) =>
    api.post<Attendance[]>('/attendance/batch', { records }),
};
