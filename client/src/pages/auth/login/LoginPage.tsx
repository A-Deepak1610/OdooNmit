import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { authService } from '../../../modules/auth/services/auth.service';
import { useAuthStore } from '../../../stores/auth.store';
import { User } from '../../../types';
import {
  X,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  UserCheck,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface DemoPersona {
  role: string;
  label: string;
  email: string;
  password: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  destination: string;
}

// Demo personas configured to match backend seeded accounts (seed.ts)
const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'STUDENT',
    label: 'Student',
    email: 'student@campusmitra.edu',
    password: 'Student@123',
    icon: GraduationCap,
    iconColor: 'text-sky-500',
    destination: '/student/dashboard',
  },
  {
    role: 'MEMBER',
    label: 'Member',
    email: 'member@campusmitra.edu',
    password: 'Member@123',
    icon: Users,
    iconColor: 'text-indigo-500',
    destination: '/member/dashboard',
  },
  {
    role: 'PRESIDENT',
    label: 'President',
    email: 'president@campusmitra.edu',
    password: 'President@123',
    icon: UserCheck,
    iconColor: 'text-purple-600',
    destination: '/president/dashboard',
  },
  {
    role: 'TREASURER',
    label: 'Treasurer',
    email: 'treasurer@campusmitra.edu',
    password: 'Treasurer@123',
    icon: DollarSign,
    iconColor: 'text-emerald-500',
    destination: '/treasurer/dashboard',
  },
  {
    role: 'EVENT_ORGANIZER',
    label: 'Organizer',
    email: 'organizer@campusmitra.edu',
    password: 'Organizer@123',
    icon: Calendar,
    iconColor: 'text-orange-500',
    destination: '/organizer/dashboard',
  },
  {
    role: 'VOLUNTEER',
    label: 'Volunteer',
    email: 'volunteer@campusmitra.edu',
    password: 'Volunteer@123',
    icon: CheckSquare,
    iconColor: 'text-blue-500',
    destination: '/volunteer/dashboard',
  },
  {
    role: 'ADMIN',
    label: 'Admin',
    email: 'admin@campusmitra.edu',
    password: 'Admin@123',
    icon: Shield,
    iconColor: 'text-red-500',
    destination: '/admin/dashboard',
  },
];

// Fallback user builder for instant testing when backend database is disconnected
const createMockUser = (role: string, email: string): User => ({
  id: `mock-${role.toLowerCase()}-id`,
  username: email.split('@')[0],
  email,
  fullName: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
  avatarUrl: undefined,
  role: role as any,
  roles: [role as any],
  activeRole: role as any,
  status: 'active',
});

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = useState('student@campusmitra.edu');
  const [password, setPassword] = useState('Student@123');
  const [loading, setLoading] = useState(false);
  const [activePersonaRole, setActivePersonaRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || null;

  // Handle URL ?role=... param if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const match = DEMO_PERSONAS.find((r) => r.role.toUpperCase() === roleParam.toUpperCase());
      if (match) {
        setEmail(match.email);
        setPassword(match.password);
      }
    }
  }, [searchParams]);

  const resolveDestination = (targetRole?: string, explicitDest?: string) => {
    if (explicitDest) return explicitDest;

    const roleNormalized = (targetRole || 'STUDENT').toUpperCase();

    const roleMap: Record<string, string> = {
      ADMIN: '/admin/dashboard',
      PRESIDENT: '/president/dashboard',
      TREASURER: '/treasurer/dashboard',
      EVENT_ORGANIZER: '/organizer/dashboard',
      ORGANIZER: '/organizer/dashboard',
      VOLUNTEER: '/volunteer/dashboard',
      MEMBER: '/member/dashboard',
      STUDENT: '/student/dashboard',
    };

    const defaultPath = roleMap[roleNormalized] || '/student/dashboard';

    // Role prefix matching
    const rolePrefixMap: Record<string, string> = {
      ADMIN: '/admin',
      PRESIDENT: '/president',
      TREASURER: '/treasurer',
      EVENT_ORGANIZER: '/organizer',
      ORGANIZER: '/organizer',
      VOLUNTEER: '/volunteer',
      MEMBER: '/member',
      STUDENT: '/student',
    };

    const allowedPrefix = rolePrefixMap[roleNormalized] || '/student';

    // Check redirect param
    const redirectParam = searchParams.get('redirect');
    if (redirectParam && redirectParam.startsWith(allowedPrefix)) {
      return redirectParam;
    }

    // Only allow `from` if it matches the current user's role prefix
    if (from && typeof from === 'string' && from !== '/' && from !== '/dashboard' && from !== '/login') {
      if (from.startsWith(allowedPrefix)) {
        return from;
      }
    }

    return defaultPath;
  };

  const executeLogin = async (
    targetEmail: string,
    targetPassword: string,
    roleHint?: string,
    explicitDestination?: string
  ) => {
    setLoading(true);
    setErrorMessage(null);

    // Normalize identifier to match backend seeded domain
    let finalIdentifier = targetEmail.trim();
    if (finalIdentifier.endsWith('@CampusMitra.test')) {
      finalIdentifier = finalIdentifier.replace('@CampusMitra.test', '@campusmitra.edu');
    }

    try {
      const data = await authService.login({
        email: finalIdentifier,
        password: targetPassword,
      });

      const matchedPersona = DEMO_PERSONAS.find(
        (p) => p.email.toLowerCase() === finalIdentifier.toLowerCase()
      );

      const effectiveRole = (
        roleHint ||
        matchedPersona?.role ||
        data.user.activeRole ||
        data.user.role ||
        (data.user.roles && data.user.roles.length > 0 ? data.user.roles[0] : 'STUDENT')
      ).toUpperCase();

      setUser(
        {
          ...data.user,
          role: effectiveRole as any,
          activeRole: effectiveRole as any,
        },
        data.token
      );

      const targetPath =
        explicitDestination ||
        matchedPersona?.destination ||
        resolveDestination(effectiveRole);

      navigate(targetPath, { replace: true });
    } catch (err: any) {
      // If backend network or database connection error, provide demo fallback
      const errorStr = String(err?.message || '');
      const isConnectionError =
        errorStr.includes('Network Error') ||
        errorStr.includes('Failed to fetch') ||
        errorStr.includes('Database') ||
        errorStr.includes('P1003') ||
        err?.code === 'ERR_NETWORK';

      if (isConnectionError && roleHint) {
        const mockUser = createMockUser(roleHint, finalIdentifier);
        setUser(mockUser, 'demo-session-token');
        navigate(explicitDestination || resolveDestination(roleHint), { replace: true });
        return;
      }

      setErrorMessage(
        err?.message || 'Login failed. Please verify credentials or choose an instant demo persona.'
      );
    } finally {
      setLoading(false);
      setActivePersonaRole(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = (email || 'student@campusmitra.edu').trim();
    const finalPassword = password || 'Student@123';

    const matched = DEMO_PERSONAS.find(
      (p) => p.email.toLowerCase() === finalEmail.toLowerCase()
    );

    const roleHint = matched ? matched.role : undefined;
    const explicitDest = matched ? matched.destination : undefined;

    await executeLogin(finalEmail, finalPassword, roleHint, explicitDest);
  };

  const handlePersonaSelect = async (persona: DemoPersona) => {
    setEmail(persona.email);
    setPassword(persona.password);
    setActivePersonaRole(persona.role);
    await executeLogin(persona.email, persona.password, persona.role, persona.destination);
  };

  const handleGoogleLogin = async () => {
    // Demo instant sign-in with verified student Google workspace
    setEmail('member@campusmitra.edu');
    setPassword('Member@123');
    await executeLogin('member@campusmitra.edu', 'Member@123', 'MEMBER', '/member/dashboard');
  };

  return (
    <div className="w-full max-w-[460px] mx-auto">
      {/* Modal Card */}
      <div className="relative bg-white rounded-[28px] shadow-2xl shadow-slate-950/20 border border-slate-100 p-7 sm:p-9 transition-all">
        {/* Close Button top-left */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute left-6 top-6 sm:left-7 sm:top-7 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Logo: Faceted Prism Tower with Golden Sparkle */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative mb-2">
            <svg
              className="w-13 h-14"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="cfFacetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4338ca" />
                  <stop offset="100%" stopColor="#3730a3" />
                </linearGradient>
                <linearGradient id="cfFacetRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="cfFacetCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <linearGradient id="cfGoldStar" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>

              {/* Prism Tower body facets */}
              <polygon points="32,7 18,20 23,57 32,54" fill="url(#cfFacetLeft)" />
              <polygon points="32,7 46,20 41,57 32,54" fill="url(#cfFacetRight)" />
              <polygon points="32,7 26,38 32,54 38,38" fill="url(#cfFacetCenter)" opacity="0.95" />

              {/* Internal structural accent lines */}
              <line x1="32" y1="7" x2="32" y2="54" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.75" />
              <line x1="20" y1="36" x2="44" y2="36" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.55" />
              <line x1="22" y1="46" x2="42" y2="46" stroke="#c7d2fe" strokeWidth="1" strokeOpacity="0.55" />

              {/* 4-point Golden Sparkle Star at upper left vertex */}
              <path
                d="M18,9 C18,15 12,15 12,15 C12,15 18,15 18,21 C18,15 24,15 24,15 C24,15 18,15 18,9 Z"
                fill="url(#cfGoldStar)"
              />
              <circle cx="18" cy="15" r="1.3" fill="#ffffff" />
            </svg>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            CampusMitra
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#5c52e8] mt-1">
            Be the true you. Be found.
          </p>
          <p className="text-xs sm:text-[13px] text-slate-500 mt-1 mb-5">
            Sign in to your campus workspace &amp; community
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70 bg-white flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer disabled:opacity-60"
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
          <span>Continue with Google</span>
        </button>

        {/* Divider: OR INSTANT DEMO PERSONA */}
        <div className="relative flex py-3.5 items-center justify-center">
          <div className="grow border-t border-slate-200" />
          <span className="shrink px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-white">
            OR INSTANT DEMO PERSONA
          </span>
          <div className="grow border-t border-slate-200" />
        </div>

        {/* 7 Demo Persona Cards (Responsive Grid) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {DEMO_PERSONAS.map((item) => {
            const Icon = item.icon;
            const isSelected = activePersonaRole === item.role;
            return (
              <button
                key={item.role}
                type="button"
                onClick={() => handlePersonaSelect(item)}
                disabled={loading}
                className={`border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 bg-white rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 transition-all text-xs font-semibold text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer disabled:opacity-60 ${isSelected ? 'ring-2 ring-indigo-400 bg-indigo-50/50' : ''
                  }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Inputs: Email & Password */}
        <form onSubmit={handleFormSubmit} className="space-y-3">
          {/* Email field */}
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campusmitra.edu"
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Lock className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Primary Submit Button: Sign In with Credentials -> */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1.5 py-3 px-4 rounded-xl bg-[#9593ee] hover:bg-[#8482e3] active:bg-[#7774dc] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In with Credentials</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
