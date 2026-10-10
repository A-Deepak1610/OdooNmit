import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  X,
  Shield,
  UserCheck,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  Lock,
  Mail,
} from 'lucide-react';
import { LandingPage } from '../LandingPage';
import { useAuthStore } from '../../stores/auth.store';
import { authService } from '../../modules/auth/services/auth.service';
import { Badge } from '../../components/ui/Badge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oauthError = searchParams.get('error');
  const roleParam = searchParams.get('role');

  const { setUser } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    // Connects directly to backend OAuth entry point with redirect flow
    window.location.href = `${API_BASE}/auth/google?redirect=true`;
  };

  const handleRoleQuickLaunch = async (email: string, roleName: string) => {
    setLoadingRole(roleName);
    try {
      const data = await authService.login({ email, password: 'Password123!' });
      setUser(data.user, data.token);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setLoadingRole('custom');
    try {
      const data = await authService.login({ email: emailInput, password: passwordInput || 'Password123!' });
      setUser(data.user, data.token);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoadingRole(null);
    }
  };

  const closeModal = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex items-center justify-center select-none z-50">
      {/* 1. BLURRED LANDING PAGE BACKGROUND */}
      <div 
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none filter blur-md sm:blur-lg scale-[1.02] opacity-75 select-none z-0 overflow-hidden"
      >
        <LandingPage />
      </div>

      {/* 2. BACKDROP OVERLAY WITH BLUR & DISMISS ON OUTSIDE CLICK */}
      <div
        className="fixed inset-0 bg-surface-900/30 backdrop-blur-xs z-10 transition-opacity animate-in fade-in duration-150"
        onClick={closeModal}
      />

      {/* 3. CENTERED THEMED LOGIN CARD (Fixed, Non-scrollable, Balanced Height & Sharper Radius) */}
      <div className="relative z-20 w-full max-w-[460px] mx-4 animate-in zoom-in-95 fade-in duration-150">
        <div className="relative bg-white/95 backdrop-blur-2xl border border-surface-200/90 rounded-2xl p-7 sm:p-9 shadow-2xl shadow-indigo-950/15">
          {/* Close Modal Button */}
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-4.5 right-4.5 p-2 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition-colors cursor-pointer"
            aria-label="Close login dialog and return to landing page"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Brand Logo & Header matching Landing Page */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <svg
                className="h-11 w-11 shrink-0 drop-shadow-xs group-hover:scale-105 transition-transform"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 4L42 16L34 44H14L6 16L24 4Z" fill="url(#loginGemGradTall)" />
                <path
                  d="M24 4L34 44M24 4L14 44M6 16H42M14 44L24 16L34 44"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeOpacity="0.4"
                />
                <path
                  d="M11 6L12.8 11.2L18 13L12.8 14.8L11 20L9.2 14.8L4 13L9.2 11.2L11 6Z"
                  fill="#FBBF24"
                />
                <defs>
                  <linearGradient id="loginGemGradTall" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="0.5" stopColor="#4F46E5" />
                    <stop offset="1" stopColor="#3730A3" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex flex-col items-center leading-none">
                <span className="text-2xl font-black tracking-tight text-surface-900">
                  CampusFlow
                </span>
                <span className="text-[11px] font-semibold text-brand-600 tracking-wider mt-1">
                  Be the true you. Be found.
                </span>
              </div>
            </Link>
            <p className="text-xs text-surface-500 pt-0.5">
              Sign in to your campus workspace & community
            </p>
          </div>

          {/* Requested Role Notice */}
          {roleParam && (
            <div className="mt-3.5 p-2 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <span>Accessing role workspace: <strong>{roleParam}</strong></span>
              <Badge variant="outline" className="text-[10px] py-0.5 px-1.5 bg-white">{roleParam}</Badge>
            </div>
          )}

          {/* OAuth Error Alert Banner */}
          {oauthError && (
            <div className="mt-3.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>
                {oauthError === 'access_denied'
                  ? 'Google sign-in was cancelled.'
                  : `Authentication failed: ${oauthError}`}
              </span>
            </div>
          )}

          {/* Primary Authentication Option: Google Sign-In (h-10 and rounded-lg) */}
          <div className="mt-5 space-y-3.5">
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isRedirecting}
              className="w-full h-10 flex items-center justify-center gap-2.5 px-4 rounded-lg border border-surface-300 bg-white hover:bg-surface-50 hover:border-surface-400 text-surface-800 font-semibold text-xs sm:text-[13px] transition-all shadow-xs cursor-pointer disabled:opacity-60"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
              <span>{isRedirecting ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white/95 px-3 text-surface-400 font-semibold uppercase tracking-wider">
                  Or Instant Demo Persona
                </span>
              </div>
            </div>

            {/* Quick 1-Click Persona Access Buttons (rounded-lg) */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('president@campusflow.test', 'PRESIDENT')}
                disabled={loadingRole === 'PRESIDENT'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                <span className="truncate">President</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('treasurer@campusflow.test', 'TREASURER')}
                disabled={loadingRole === 'TREASURER'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Treasurer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('organizer@campusflow.test', 'EVENT_ORGANIZER')}
                disabled={loadingRole === 'EVENT_ORGANIZER'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Organizer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('volunteer@campusflow.test', 'VOLUNTEER')}
                disabled={loadingRole === 'VOLUNTEER'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <CheckSquare className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">Volunteer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('member@campusflow.test', 'MEMBER')}
                disabled={loadingRole === 'MEMBER'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <Users className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Member</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickLaunch('admin@campusflow.test', 'ADMIN')}
                disabled={loadingRole === 'ADMIN'}
                className="h-9 px-2 rounded-lg border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 text-surface-800 hover:text-brand-700 flex items-center justify-center gap-1.5 font-medium transition-all cursor-pointer"
              >
                <Shield className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                <span className="truncate">Admin</span>
              </button>
            </div>

            {/* Email / Password Sign In Form (h-10 and rounded-lg) */}
            <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-surface-700 mb-1.5 block">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@campusflow.test"
                    className="w-full pl-11 pr-3.5 h-10 rounded-lg bg-surface-50 border border-surface-200 text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-surface-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-3.5 h-10 rounded-lg bg-surface-50 border border-surface-200 text-surface-900 text-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* SIGN IN WITH CREDENTIALS BUTTON (rounded-lg) */}
              <button
                type="submit"
                disabled={!emailInput || loadingRole === 'custom'}
                className="w-full h-11.5 sm:h-12 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-2.5 select-none"
              >
                <span className="leading-none">{loadingRole === 'custom' ? 'Signing in...' : 'Sign In with Credentials'}</span>
                <ArrowRight className="h-4 w-4 shrink-0 self-center" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
