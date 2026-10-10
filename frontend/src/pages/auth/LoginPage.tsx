import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Flame, Lock, User, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    // Connects directly to backend OAuth entry point with redirect flow
    window.location.href = `${API_BASE}/auth/google?redirect=true`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-stone-950 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Background glowing warm orange light orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-orange-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] bg-amber-500/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Glassmorphic Glowing Card */}
      <div className="relative w-full max-w-md">
        {/* Glow border gradient effect in warm orange/amber */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-2xl blur-sm opacity-50 transition duration-1000 group-hover:opacity-100 animate-pulse" />

        <div className="relative bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-2xl p-8 sm:p-10 shadow-2xl">
          {/* Brand Logo & Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-500/30">
              <Flame className="h-8 w-8 fill-orange-200/30" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                CampusMitra
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Student Organization & Campus Ecosystem
              </p>
            </div>
          </div>

          {/* OAuth Error Alert Banner */}
          {oauthError && (
            <div className="mt-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Notice</p>
                <p className="text-rose-300/80 mt-0.5">
                  {oauthError === 'access_denied'
                    ? 'Google sign-in was cancelled or access was denied.'
                    : `Authentication failed: ${oauthError}`}
                </p>
              </div>
            </div>
          )}

          {/* Primary Authentication Option: Google Sign-In */}
          <div className="mt-8 space-y-4">
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleGoogleSignIn}
              disabled={isRedirecting}
              className="w-full flex items-center justify-center gap-3.5 px-4 py-3.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-750 hover:border-stone-600 text-white font-medium text-sm transition-all duration-200 shadow-md hover:shadow-orange-500/10 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60 cursor-pointer"
            >
              {/* Google Brand SVG */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{isRedirecting ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-stone-900 px-3 text-stone-500 uppercase tracking-wider font-semibold">
                  Or Credentials
                </span>
              </div>
            </div>

            {/* Username/Password placeholder form: clearly labeled Coming Soon */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-300">Username or Email</label>
                  <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Coming Soon
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    disabled
                    placeholder="student@campus.edu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-stone-500 text-sm cursor-not-allowed placeholder-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-300">Password</label>
                  <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                    Coming Soon
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    disabled
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-800/40 border border-stone-800 text-stone-500 text-sm cursor-not-allowed placeholder-stone-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl bg-stone-800/50 text-stone-500 font-medium text-xs border border-stone-800/80 cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <span>Password Sign-in (Available in next release)</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </form>
          </div>

          {/* Footer Information */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 text-center">
            <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span>CampusMitra automatically assigns student membership upon first login.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
