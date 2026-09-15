import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api/auth.api';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
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

        {/* Status Badge */}
        <span className="font-label-caps uppercase bg-error/15 text-error px-3 py-0.5 rounded font-bold tracking-wider mb-3">
          ACCESS RESTRICTED
        </span>

        <h1 className="font-headline-lg text-headline-lg uppercase text-on-surface tracking-tight m-0">
          Unauthorized Account
        </h1>

        <p className="font-body-sm text-body-sm text-secondary mt-2 mb-6 max-w-sm">
          Your Google account is not authorized to access the Dojo Command system.
          Access is strictly restricted to active staff, coaches, and administrators listed in the club directory.
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleTryAgain}
            className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary/90 px-4 py-3 rounded-xl font-label-lg text-label-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">switch_account</span>
            <span>Try Another Account</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 bg-surface-container-high hover:bg-surface-container text-on-surface px-4 py-2.5 rounded-xl font-label-md text-label-md transition-colors cursor-pointer"
          >
            <span>Back to Sign In</span>
          </button>
        </div>

        {/* Help text */}
        <p className="font-body-xs text-xs text-on-surface-variant mt-5">
          Need access? Contact the Chief Coach or Dojo Administrator to add your email to the Allowed Users registry.
        </p>

        {/* Motto */}
        <div className="mt-6 pt-4 border-t border-surface-container-high w-full">
          <p className="font-label-caps text-secondary text-xs m-0">精力善用 • 自他共栄</p>
          <p className="font-label-caps text-[10px] text-on-surface-variant italic mt-1 m-0">
            Maximum Efficiency — Mutual Welfare &amp; Benefit
          </p>
        </div>
      </div>
    </div>
  );
};
