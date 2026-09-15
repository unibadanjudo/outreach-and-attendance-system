import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  isSearchModalOpen: boolean;
  activeQuickSearch: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setActiveQuickSearch: (query: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  isSearchModalOpen: false,
  activeQuickSearch: '',

  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
  setActiveQuickSearch: (activeQuickSearch) => set({ activeQuickSearch }),
}));
