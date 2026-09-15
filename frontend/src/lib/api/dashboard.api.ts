import { api } from './client';
import type {
  ConsolidatedDashboard,
  DashboardAttendance,
  DashboardOutreach,
  DashboardSummary,
  PaginatedInactiveMembers,
} from '../types';

export interface InactiveMembersQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  status?: string;
  minDays?: number;
  maxDays?: number;
}

export const dashboardApi = {
  getDashboard: (params?: InactiveMembersQuery) => {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.minDays) query.set('minDays', String(params.minDays));
    if (params?.maxDays) query.set('maxDays', String(params.maxDays));
    const qs = query.toString();
    return api.get<ConsolidatedDashboard>(`/dashboard${qs ? `?${qs}` : ''}`);
  },
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  getAttendance: () => api.get<DashboardAttendance>('/dashboard/attendance'),
  getOutreach: () => api.get<DashboardOutreach>('/dashboard/outreach'),
  getInactiveMembers: (params?: InactiveMembersQuery) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.minDays) query.set('minDays', String(params.minDays));
    if (params?.maxDays) query.set('maxDays', String(params.maxDays));
    const qs = query.toString();
    return api.get<PaginatedInactiveMembers>(
      `/dashboard/inactive-members${qs ? `?${qs}` : ''}`,
    );
  },
};
