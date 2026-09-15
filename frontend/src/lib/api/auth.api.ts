import { api, BASE_URL } from './client';
import type { AuthStatusResponse, UserSession } from '../types';

export const authApi = {
  getStatus: () => api.get<AuthStatusResponse>('/auth/status'),
  getProfile: () => api.get<UserSession>('/auth/profile'),
  logout: () => api.post<{ message: string }>('/auth/logout'),
  getGoogleLoginUrl: () => {
    return `${BASE_URL}/auth/google`;
  },
};
