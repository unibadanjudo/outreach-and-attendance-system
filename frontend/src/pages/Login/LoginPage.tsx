import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { authApi } from '../../lib/api/auth.api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = authApi.getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 selection:bg-primary selection:text-on-primary">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container-high p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Crest */}
        <div className="w-20 h-20 mb-4 p-2 bg-surface-container-low rounded-2xl flex items-center justify-center shadow-xs">
          <img
            src="/crest.svg"
            alt="University of Ibadan Judo Club"
            className="w-full h-full object-contain"
          />
        </div>

        <span className="font-label-caps uppercase bg-primary-container text-on-primary px-3 py-0.5 rounded font-bold tracking-wider mb-2">
          DOJO COMMAND HQ
        </span>

        <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
          UI Judo Club Portal
        </h1>

        <p className="font-body-sm text-body-sm text-secondary mt-1 mb-6 max-w-xs">
          Attendance tracking, member retention triage, and rapid outreach response for the University of Ibadan.
        </p>

        {/* Primary Action: Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-neutral-800 border border-neutral-300 hover:bg-neutral-50 px-4 py-3 rounded-xl font-label-lg text-label-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Motto */}
        <div className="mt-8">
          <p className="font-label-caps text-secondary text-xs m-0">精力善用 • 自他共栄</p>
          <p className="font-label-caps text-[10px] text-on-surface-variant italic mt-1 m-0">
            Maximum Efficiency — Mutual Welfare &amp; Benefit
          </p>
        </div>
      </div>
    </div>
  );
};
