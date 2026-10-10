import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Shield,
  Crown,
  DollarSign,
  Calendar,
  HeartHandshake,
  Award,
  GraduationCap,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { authService } from '../../../modules/auth/services/auth.service';
import { ROLE_DEFAULT_PATHS } from '../../../config/roles';

// Preset test accounts seeded in database
const SEED_ROLE_ACCOUNTS = [
  {
    roleKey: 'ADMIN',
    name: 'Super Admin',
    desc: 'Platform governance, organization & role setup',
    username: 'admin',
    password: 'Admin@123',
    icon: Shield,
    color: 'border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/15',
    badge: 'System Admin',
  },
  {
    roleKey: 'PRESIDENT',
    name: 'Club President',
    desc: 'Club announcements, events & leadership management',
    username: 'president',
    password: 'President@123',
    icon: Crown,
    color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/15',
    badge: 'Organization Admin',
  },
  {
    roleKey: 'TREASURER',
    name: 'Treasurer',
    desc: 'Dues, ticketing ledger, reimbursements & audits',
    username: 'treasurer',
    password: 'Treasurer@123',
    icon: DollarSign,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15',
    badge: 'Finances',
  },
  {
    roleKey: 'EVENT_ORGANIZER',
    name: 'Event Organizer',
    desc: 'Ticketing tiers, capacity quotas & door QR verify',
    username: 'organizer',
    password: 'Organizer@123',
    icon: Calendar,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-700 hover:bg-purple-500/15',
    badge: 'Operations',
  },
  {
    roleKey: 'VOLUNTEER',
    name: 'Volunteer',
    desc: 'Task progress (To do, In progress, Done) & duties',
    username: 'volunteer',
    password: 'Volunteer@123',
    icon: HeartHandshake,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15',
    badge: 'Active Operations',
  },
  {
    roleKey: 'MEMBER',
    name: 'Club Member',
    desc: 'Member announcements & 60% discounted tickets',
    username: 'member',
    password: 'Member@123',
    icon: Award,
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/15',
    badge: 'Approved Member',
  },
  {
    roleKey: 'STUDENT',
    name: 'Student',
    desc: 'Default platform role: explore clubs & open events',
    username: 'student',
    password: 'Student@123',
    icon: GraduationCap,
    color: 'border-slate-500/30 bg-slate-500/10 text-slate-700 hover:bg-slate-500/15',
    badge: 'Default User',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { setAuthSession } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Perform login and navigate to respective role landing path
  const executeLogin = async (loginId: string, pass: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      const { user, token } = await authService.login({
        identifier: loginId,
        password: pass,
      });

      setAuthSession({ user, token });
      const currentRole = user.activeRole || user.role || 'STUDENT';
      const displayName = user.fullName || user.name || user.username || 'User';
      setSuccessNotice(`Authenticated as ${displayName} (${currentRole})`);

      // Determine destination route based on user active role
      const roleLandingPath = ROLE_DEFAULT_PATHS[currentRole] || '/student/dashboard';
      const targetPath = redirectParam || roleLandingPath;

      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }
    await executeLogin(identifier, password);
  };

  const handleQuickRoleSelect = async (account: (typeof SEED_ROLE_ACCOUNTS)[0]) => {
    setIdentifier(account.username);
    setPassword(account.password);
    setLoadingRole(account.roleKey);
    await executeLogin(account.username, account.password);
  };

  const handleGoogleLogin = () => {
    setErrorMessage(null);
    // Google OAuth Direct Redirect flow
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Glow Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* App Branding */}
        <div className="flex justify-center mb-3">
          <Link to="/" className="inline-block group transition-transform duration-200 hover:scale-105" title="CampusMitra Home">
            <img
              src="/logo.png"
              alt="CampusMitra Logo"
              className="w-16 h-16 object-contain drop-shadow-md mx-auto"
            />
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>CampusMitra • Student Organization Platform</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Sign In to Portal
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Access your club leadership, organizer duties, member benefits, or student catalog
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 relative z-10">
        <div className="bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 text-slate-800">
          {/* Notifications */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold">Sign in error: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-semibold">{successNotice}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Username or Campus Email
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. president or president@campusmitra.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <span className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer">
                  Default: Role@123
                </span>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading && !loadingRole ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials & Session...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Credentials</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              or continue with
            </span>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-xs hover:border-slate-400 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.39 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.29 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google Workspace</span>
          </button>

          {/* Quick 1-Click Role Presets */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1-Click Demo Accounts (Seeded in DB)
              </span>
              <span className="text-xs text-indigo-600 font-medium">Click to login directly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SEED_ROLE_ACCOUNTS.map((account) => {
                const IconComponent = account.icon;
                const isSelectedLoading = loadingRole === account.roleKey;

                return (
                  <button
                    key={account.roleKey}
                    type="button"
                    onClick={() => handleQuickRoleSelect(account)}
                    disabled={isLoading}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${account.color} disabled:opacity-50`}
                  >
                    <div className="p-2 rounded-lg bg-white/80 shadow-xs flex-shrink-0">
                      {isSelectedLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate text-slate-900">
                          {account.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-white/90 text-slate-700">
                          {account.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                        {account.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          CampusMitra Unified RBAC • Token refreshed via server-side database records
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
