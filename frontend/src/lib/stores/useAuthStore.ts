import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import type { UserSession } from '../types';

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const status = await authApi.getStatus();
      const isAuthed = Boolean(status.isAuthenticated ?? status.authenticated);
      if (isAuthed && status.user) {
        set({
          user: status.user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      isInitialized: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    }),

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout API error:', e);
    } finally {
      set({ user: null, isAuthenticated: false, isInitialized: true });
      window.location.href = '/login';
    }
  },
}));
