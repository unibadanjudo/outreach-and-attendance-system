import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/useAuthStore';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const status = searchParams.get('status');
      const message = searchParams.get('message');

      if (status === 'error') {
        setErrorMessage(message || 'Authentication was denied or failed.');
        return;
      }

      try {
        await checkAuth();
        if (useAuthStore.getState().isAuthenticated) {
          navigate('/', { replace: true });
        } else {
          setErrorMessage(
            'Session could not be verified. Your account may not be authorized or the session expired.',
          );
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Session verification failed.');
      }
    };

    processCallback();
  }, [searchParams, checkAuth, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container-high p-6 text-center">
        <div className="w-14 h-14 mx-auto mb-4 p-2 bg-surface-container-low rounded-xl flex items-center justify-center">
          <img src="/crest.svg" alt="UI Judo Crest" className="w-full h-full object-contain" />
        </div>

        {errorMessage ? (
          <div>
            <div className="inline-flex p-2 bg-error/10 text-error rounded-full mb-3">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mb-2">
              Authentication Error
            </h2>
            <p className="font-body-sm text-body-sm text-secondary mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-primary text-on-primary py-2.5 rounded-xl font-label-md font-bold"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div>
            <div className="w-8 h-8 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface mb-1">
              Authenticating Staff
            </h2>
            <p className="font-body-sm text-body-sm text-secondary">
              Verifying credentials with Dojo Command...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
