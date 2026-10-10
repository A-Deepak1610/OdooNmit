import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Lock, User, AlertCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

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
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080d1a',
        fontFamily: 'var(--font-family-body)',
        padding: '24px',
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
          maxWidth: '460px',
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
              marginBottom: '14px',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>CM</span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#f8fafc',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px',
            }}
          >
            CampusMitra
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Student Organization & Campus Ecosystem
          </p>

          {/* Feature Pills (Part 5.13) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
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
              <span>OAuth 2.0 Secure</span>
            </div>
          </div>
        </div>

        {/* OAuth Error Alert Banner */}
        {oauthError && (
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
                {oauthError === 'access_denied'
                  ? 'Google sign-in was cancelled or access was denied.'
                  : `Authentication failed: ${oauthError}`}
              </div>
            </div>
          </div>
        )}

        {/* Primary Action: Google Sign-In */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            type="button"
            id="google-signin-btn"
            onClick={handleGoogleSignIn}
            disabled={isRedirecting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '14px',
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
            <span>{isRedirecting ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <div style={{ position: 'relative', margin: '8px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: '50% 0 auto 0', borderTop: '1px solid #334155' }} />
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
              Or Credentials
            </span>
          </div>

          {/* Username/Password placeholder form: clearly labeled Coming Soon */}
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Username or Email</label>
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
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  disabled
                  placeholder="student@campus.edu"
                  style={disabledInputStyle}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>Password</label>
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
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  disabled
                  placeholder="••••••••••••"
                  style={disabledInputStyle}
                />
              </div>
            </div>

            <button
              type="button"
              disabled
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid #1e293b',
                color: '#64748b',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>Password Sign-in (Available in next release)</span>
              <ArrowRight size={12} />
            </button>
          </form>
        </div>

        {/* Footer Information */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
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
            <span>CampusMitra automatically assigns student membership upon first login.</span>
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
  padding: '6px 13px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 100,
  fontSize: '11px',
  color: '#94a3b8',
  backdropFilter: 'blur(8px)',
};

const disabledInputStyle: React.CSSProperties = {
  width: '100%',
  height: '40px',
  paddingLeft: '38px',
  paddingRight: '12px',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid #334155',
  color: '#64748b',
  fontSize: '13px',
  cursor: 'not-allowed',
  outline: 'none',
};

