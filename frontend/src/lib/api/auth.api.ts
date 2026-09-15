import { api } from './client';
import type { AuthStatusResponse, UserSession } from '../types';

export const authApi = {
  getStatus: () => api.get<AuthStatusResponse>('/auth/status'),
  getProfile: () => api.get<UserSession>('/auth/profile'),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  getGoogleLoginUrl: () => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api';
    return `${base}/auth/google`;
  },
};
