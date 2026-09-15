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
  list: (params?: MembersQuery) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    const faculty = params?.facultyDepartment || params?.faculty;
    if (faculty && faculty !== 'ALL') {
      query.set('facultyDepartment', faculty);
    }
    const qs = query.toString();
    return api.get<PaginatedMembers>(`/members${qs ? `?${qs}` : ''}`);
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

