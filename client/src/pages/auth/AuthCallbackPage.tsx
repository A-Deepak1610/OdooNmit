import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../services/api-client';
import { getDefaultRole, ROLE_DEFAULT_PATHS } from '../../config/roles';
import { User } from '../../types';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(`OAuth provider error: ${error}`);
        return;
      }

      if (!accessToken) {
        setStatus('error');
        setErrorMessage('Authentication token missing from provider handoff.');
        return;
      }

      try {
        // Query backend /auth/me with the new access token to fetch authenticated profile and assigned roles
        const profileRes = await apiClient.get<{
          status: string;
          data: { user: User };
        }>('/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const verifiedUser = profileRes.data.data.user;

        // Persist session into global Zustand auth store
        setAuthSession({
          user: verifiedUser,
          token: accessToken,
          refreshToken: refreshToken || undefined,
        });

        setStatus('success');

        // Determine appropriate default landing page based on user's highest role
        const activeRole = getDefaultRole(verifiedUser.roles || []);
        const targetPath = ROLE_DEFAULT_PATHS[activeRole] || '/student/dashboard';

        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 600);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err?.message || 'Failed to verify authenticated session with backend API.'
        );
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate, setAuthSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="CampusMitra Logo"
            className="w-16 h-16 object-contain drop-shadow-md mx-auto"
          />
        </div>
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-lg font-semibold text-white">Verifying Identity</h2>
            <p className="text-xs text-slate-400">
              Securing connection and loading your campus role workspace...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <h2 className="text-lg font-semibold text-white">Signed in successfully</h2>
            <p className="text-xs text-slate-400">
              Welcome to CampusMitra. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h2 className="text-lg font-semibold text-white">Sign-in Failed</h2>
            <p className="text-xs text-rose-300/90">{errorMessage}</p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login', { replace: true })}
              >
                Back to Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
