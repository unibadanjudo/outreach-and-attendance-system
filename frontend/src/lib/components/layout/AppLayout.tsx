import React, { useEffect } from 'react';
import { Outlet, useNavigate, Navigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { QuickSearchModal } from './QuickSearchModal';
import { useUiStore } from '../../stores/useUiStore';
import { useAuthStore } from '../../stores/useAuthStore';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, setSidebarOpen, setSearchModalOpen } = useUiStore();
  const { isAuthenticated, isInitialized, isLoading, clearAuth } = useAuthStore();

  useEffect(() => {
    // ⌘K shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Global unauthorized event handler
    const handleUnauthorized = () => {
      clearAuth();
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [setSearchModalOpen, navigate, clearAuth]);

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 p-2 bg-surface-container-low rounded-2xl flex items-center justify-center shadow-xs mb-4">
          <img
            src="/crest.svg"
            alt="UI Judo Crest"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-label-caps text-secondary text-xs uppercase tracking-wider font-bold">
          Verifying Dojo Command Access...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col selection:bg-primary selection:text-on-primary">
      <Header />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 pt-16 flex-1 flex flex-col pb-20 lg:pb-8">
        <main className="w-full flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <MobileNav />
      <QuickSearchModal />
    </div>
  );
};
