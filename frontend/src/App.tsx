import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuthStore } from './lib/stores/useAuthStore';
import { AppLayout } from './lib/components/layout/AppLayout';
import { LoginPage } from './pages/Login/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallback/AuthCallbackPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { MembersPage } from './pages/Members/MembersPage';
import { MemberDetailsPage } from './pages/MemberDetails/MemberDetailsPage';
import { AttendancePage } from './pages/Attendance/AttendancePage';
import { OutreachPage } from './pages/Outreach/OutreachPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Dojo Operations Shell */}
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="members/:id" element={<MemberDetailsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="outreach" element={<OutreachPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
