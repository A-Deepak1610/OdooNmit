import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Trophy,
  Landmark,
  Calendar,
  CheckSquare,
  Award,
  GraduationCap,
  Shield,
  Loader2,
  LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_DEFAULT_PATHS, UserRole } from '../../config/roles';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface RoleOption {
  key: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  borderHover: string;
}

const PREDEFINED_ROLES: RoleOption[] = [
  {
    key: 'ADMIN',
    label: 'Campus Administrator',
    subtitle: 'Institutional Charters & Audit',
    icon: Shield,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    borderHover: '#3b82f6',
  },
  {
    key: 'PRESIDENT',
    label: 'Club President',
    subtitle: 'Broadcasts & Executive Oversight',
    icon: Trophy,
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.12)',
    borderHover: '#8b5cf6',
  },
  {
    key: 'TREASURER',
    label: 'Treasurer',
    subtitle: 'Closing the Books & Claims',
    icon: Landmark,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    borderHover: '#10b981',
  },
  {
    key: 'EVENT_ORGANIZER',
    label: 'Event Organizer',
    subtitle: 'Spring Gala Tickets & Check-in',
    icon: Calendar,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    borderHover: '#f59e0b',
  },
  {
    key: 'VOLUNTEER',
    label: 'Volunteer',
    subtitle: 'Bake Sale Tasks & Receipts',
    icon: CheckSquare,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.12)',
    borderHover: '#06b6d4',
  },
  {
    key: 'MEMBER',
    label: 'Club Member',
    subtitle: 'Digital Pass & 60% Discounts',
    icon: Award,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.12)',
    borderHover: '#6366f1',
  },
  {
    key: 'STUDENT',
    label: 'Campus Student',
    subtitle: 'Table Sign-up & Merch Store',
    icon: GraduationCap,
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    borderHover: '#94a3b8',
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oauthError = searchParams.get('error');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [authenticatingRole, setAuthenticatingRole] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setIsRedirecting(true);
    // Connects directly to backend OAuth entry point with redirect flow
    window.location.href = `${API_BASE}/auth/google?redirect=true`;
  };

  const handlePredefinedRoleLogin = async (roleKey: string) => {
    setErrorNotice(null);
    setAuthenticatingRole(roleKey);

    try {
      const response = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: roleKey }),
      });

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        const { accessToken, refreshToken, user } = data.data;

        // Persist session into global auth store
        useAuthStore.getState().setAuthSession({
          user,
          token: accessToken,
          refreshToken,
        });

        // Redirect directly to the chosen role workspace
        const targetPath = ROLE_DEFAULT_PATHS[roleKey as UserRole] || '/student/dashboard';
        navigate(targetPath, { replace: true });
      } else {
        setErrorNotice(data.message || 'Authentication failed. Please try again.');
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Unable to connect to authentication server.');
    } finally {
      setAuthenticatingRole(null);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080d1a',
        fontFamily: 'var(--font-family-body)',
        padding: '32px 20px',
        overflow: 'hidden',
      }}
    >
      {/* ── Declarative SVG Constellation Background (Part 11) ── */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      >
        <line x1="15%" y1="20%" x2="35%" y2="45%" stroke="#312e81" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="35%" y1="45%" x2="65%" y2="30%" stroke="#312e81" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="65%" y1="30%" x2="85%" y2="60%" stroke="#312e81" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="35%" y1="45%" x2="50%" y2="80%" stroke="#312e81" strokeWidth="1" strokeDasharray="3 3" />

        <circle cx="15%" cy="20%" r="3" fill="#818cf8">
          <animate attributeName="opacity" values="0.2;0.8;0.2" dur="4.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="35%" cy="45%" r="4" fill="#a5b4fc">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="65%" cy="30%" r="3.5" fill="#818cf8">
          <animate attributeName="opacity" values="0.1;0.7;0.1" dur="6.1s" repeatCount="indefinite" />
        </circle>
        <circle cx="85%" cy="60%" r="4" fill="#6366f1">
          <animate attributeName="opacity" values="0.25;0.85;0.25" dur="4.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="50%" cy="80%" r="3" fill="#818cf8">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="5.2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Background Soft Glow */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '540px',
          height: '540px',
          background: 'rgba(99, 102, 241, 0.12)',
          borderRadius: '50%',
          filter: 'blur(120px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Container Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: '#2b4ed6',
              boxShadow: '0 6px 18px rgba(99,102,241,0.36)',
              marginBottom: '12px',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>CF</span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 4px 0',
              letterSpacing: '-0.5px',
            }}
          >
            CampusFlow
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Unified Student Organization Management System
          </p>

          {/* Feature Pills (Part 5.13) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={featurePill}>
              <Users size={12} color="#818cf8" />
              <span>Multi-Role Access</span>
            </div>
            <div style={featurePill}>
              <Zap size={12} color="#818cf8" />
              <span>Instant Dues & Events</span>
            </div>
            <div style={featurePill}>
              <ShieldCheck size={12} color="#818cf8" />
              <span>Database Seeded</span>
            </div>
          </div>
        </div>

        {/* Error Alert Banner */}
        {(oauthError || errorNotice) && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              fontSize: '12px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600 }}>Authentication Notice</div>
              <div style={{ opacity: 0.9, marginTop: '2px' }}>
                {errorNotice ||
                  (oauthError === 'access_denied'
                    ? 'Google sign-in was cancelled or access was denied.'
                    : `Authentication error: ${oauthError}`)}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 1: PREDEFINED DEMO ROLES (1-CLICK DIRECT ACCESS) ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#818cf8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              1-Click Role Login (Predefined Demo Accounts)
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Seeded in TiDB
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '10px',
            }}
          >
            {PREDEFINED_ROLES.map((role) => {
              const IconComponent = role.icon;
              const isLoading = authenticatingRole === role.key;

              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handlePredefinedRoleLogin(role.key)}
                  disabled={authenticatingRole !== null}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #1e293b',
                    background: 'rgba(255, 255, 255, 0.03)',
                    cursor: authenticatingRole !== null ? 'wait' : 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (!authenticatingRole) {
                      e.currentTarget.style.borderColor = role.borderHover;
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                      e.currentTarget.style.transform = 'translateX(3px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#1e293b';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: role.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isLoading ? (
                      <Loader2 size={16} color={role.color} className="animate-spin" />
                    ) : (
                      <IconComponent size={18} color={role.color} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.label}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        marginTop: '1px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isLoading ? 'Authenticating...' : role.subtitle}
                    </div>
                  </div>

                  <ArrowRight size={14} color="#475569" style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: GOOGLE SIGN-IN & ALTERNATIVES ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative', margin: '4px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: '50% 0 auto 0', borderTop: '1px solid #1e293b' }} />
            <span
              style={{
                position: 'relative',
                background: '#0f172a',
                padding: '0 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Or Continue with Google OAuth
            </span>
          </div>

          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isRedirecting || authenticatingRole !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '11px 16px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#818cf8';
              e.currentTarget.style.backgroundColor = '#243247';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.backgroundColor = '#1e293b';
            }}
          >
            {/* Google Brand SVG */}
            <svg style={{ width: '18px', height: '18px', flexShrink: 0 }} viewBox="0 0 24 24">
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
            <span>{isRedirecting ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
          </button>

          {/* Username/Password placeholder form: clearly labeled Coming Soon */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#64748b' }}>Custom Username / Password Login</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#818cf8',
                background: 'rgba(99, 102, 241, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>

        {/* Footer Information */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #1e293b',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: '#94a3b8',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={13} color="#818cf8" />
            <span>CampusFlow assigns student membership automatically upon first sign-in.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── MODULE-SCOPE STYLES ───────────────────────────────── */
const featurePill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '5px 12px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 100,
  fontSize: '11px',
  color: '#94a3b8',
  backdropFilter: 'blur(8px)',
};


