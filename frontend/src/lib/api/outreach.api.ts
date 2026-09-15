import { api } from './client';
import type {
  CreateOutreachDto,
  Outreach,
  OutreachQueueResponse,
  UpdateOutreachDto,
} from '../types';

export interface OutreachQueueQuery {
  status?: string;
  minPriority?: number;
  priority?: string;
  onlyDue?: string | boolean;
  isFollowUpDue?: boolean;
  limit?: number;
  page?: number;
  search?: string;
}

export const outreachApi = {
  list: (params?: { memberId?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.memberId) query.set('memberId', params.memberId);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return api.get<Outreach[]>(`/outreach${qs ? `?${qs}` : ''}`);
  },
  getQueue: (params?: OutreachQueueQuery) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.minPriority) query.set('minPriority', String(params.minPriority));
    if (params?.priority) query.set('priority', params.priority);
    if (params?.onlyDue || params?.isFollowUpDue) query.set('onlyDue', 'true');
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.page) query.set('page', String(params.page));
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return api.get<OutreachQueueResponse>(`/outreach/queue${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<Outreach>(`/outreach/${id}`),
  create: (payload: CreateOutreachDto) => api.post<Outreach>('/outreach', payload),
  update: (id: string, payload: UpdateOutreachDto) =>
    api.patch<Outreach>(`/outreach/${id}`, payload),
};
