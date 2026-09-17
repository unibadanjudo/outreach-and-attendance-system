import { api } from './client';
import type {
  Attendance,
  Member,
  MemberSummary,
  Outreach,
  PaginatedMembers,
} from '../types';

export interface MembersQuery {
  page?: number;
  limit?: number;
  search?: string;
  facultyDepartment?: string;
  faculty?: string;
  status?: string;
}

export const membersApi = {
  list: async (params?: MembersQuery): Promise<PaginatedMembers> => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    const faculty = params?.facultyDepartment || params?.faculty;
    if (faculty && faculty !== 'ALL') {
      query.set('facultyDepartment', faculty);
    }
    if (params?.status && params.status !== 'ALL') {
      query.set('status', params.status);
    }
    const qs = query.toString();
    const res = await api.get<any>(`/members${qs ? `?${qs}` : ''}`);
    const meta = res?.meta || {};
    const total =
      typeof meta.total === 'number'
        ? meta.total
        : typeof res?.total === 'number'
        ? res.total
        : res?.items?.length || 0;
    const limit =
      typeof meta.limit === 'number'
        ? meta.limit
        : typeof res?.limit === 'number'
        ? res.limit
        : params?.limit || 25;
    const page =
      typeof meta.page === 'number'
        ? meta.page
        : typeof res?.page === 'number'
        ? res.page
        : params?.page || 1;
    const totalPages =
      typeof meta.totalPages === 'number'
        ? meta.totalPages
        : typeof res?.totalPages === 'number'
        ? res.totalPages
        : Math.ceil(total / limit) || 1;

    return {
      items: res?.items || [],
      total,
      page,
      limit,
      totalPages,
      meta: { total, page, limit, totalPages },
    };
  },
  getById: (id: string) => api.get<Member>(`/members/${id}`),
  getSummary: (id: string) => api.get<MemberSummary>(`/members/${id}/summary`),
  getActivity: (id: string) => api.get<any>(`/members/${id}/activity`),
  getAttendance: (id: string) => api.get<Attendance[]>(`/members/${id}/attendance`),
  getOutreach: (id: string) => api.get<Outreach[]>(`/members/${id}/outreach`),
  update: (id: string, data: Partial<Member>) =>
    api.patch<Member>(`/members/${id}`, data),
  updateBeltRank: (id: string, beltRank: string) =>
    api.patch<Member>(`/members/${id}/belt-rank`, { beltRank }),
};

