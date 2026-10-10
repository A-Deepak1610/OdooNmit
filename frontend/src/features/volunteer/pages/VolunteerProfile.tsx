import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../stores/auth.store';
import { volunteerApi } from '../services/volunteerApi';
import {
  User,
  Mail,
  Shield,
  Building2,
  CheckCircle2,
  LogOut,
  Award,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ClubMembershipInfo {
  id: string;
  clubName?: string;
  clubSlug?: string;
  membershipNumber: string;
  tier: string;
  status: string;
  duesPaid: boolean;
  joinedAt?: string;
}

export const VolunteerProfile: React.FC = () => {
  const { user, roles, logout, collegeName } = useAuthStore();
  const [profileData, setProfileData] = useState<{
    clubMemberships?: ClubMembershipInfo[];
    [key: string]: unknown;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await volunteerApi.getProfile();
        setProfileData(data);
      } catch (err) {
        console.warn('Could not load extra profile details:', err);
      }
    }
    loadProfile();
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  const membership = profileData?.clubMemberships?.[0] || {
    membershipNumber: 'SSA-2026-VOL-01',
    clubName: 'Skyline Student Association',
    tier: 'STANDARD',
    status: 'ACTIVE',
    duesPaid: true,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── 1. Master Page Header ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              className="dark:bg-blue-950"
            >
              <User style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                margin: 0,
                color: 'var(--foreground, #1e293b)',
                letterSpacing: '-0.3px',
              }}
              className="text-slate-900 dark:text-slate-100"
            >
              Volunteer Profile & Verified Credentials
            </h1>
          </div>
          <p
            style={{ fontSize: '14px', color: '#64748b', margin: 0 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Verified institutional identity, digital volunteer pass, logged service hours, and assigned security roles.
          </p>
        </div>

        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          className="dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400 hover:bg-rose-100"
        >
          <LogOut style={{ width: '15px', height: '15px' }} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* ── 2. Identity Hero Card ────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '28px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || 'Volunteer'}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #eff6ff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
              }}
            />
          ) : (
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--foreground, #1e293b)',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
                className="text-slate-900 dark:text-slate-100"
              >
                {user?.name || 'Rithish S (Volunteer)'}
              </h2>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                }}
                className="dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
              >
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                Active Volunteer
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '18px', fontSize: '13px', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
                <span>{user?.email || 'rithishs.cs24@bitsathy.ac.in'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
                <span>{collegeName || 'Dr.SNS Rajalakshmi College Of Arts and Science'}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              textAlign: 'center',
            }}
            className="dark:bg-blue-950/40 dark:border-blue-900"
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1e3a8a', textTransform: 'uppercase' }} className="dark:text-blue-300">
              Assigned Squad
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }} className="dark:text-slate-100">
              Bake Sale & Logistics
            </div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              textAlign: 'center',
            }}
            className="dark:bg-emerald-950/40 dark:border-emerald-900"
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#065f46', textTransform: 'uppercase' }} className="dark:text-emerald-300">
              Logged Service
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }} className="dark:text-slate-100">
              14.5 Hours
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Credentials Grid ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Skyline Digital Volunteer Pass */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '260px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle watermark badge */}
          <div
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
                  CAMPUSFlow ACCREDITATION
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0 0', color: '#ffffff' }}>
                  Skyline Student Association
                </h3>
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 700,
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  letterSpacing: '0.5px',
                }}
              >
                {membership.status}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 500 }}>
              Official Volunteer Access Card & Service Credential
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace', letterSpacing: '2px', marginBottom: '12px' }}>
              PASS ID: {membership.membershipNumber}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                  Cardholder
                </span>
                <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>
                  {user?.name || 'Rithish S'}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                  Role Tier
                </span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontSize: '14px' }}>
                  VOLUNTEER (Dues Exempt)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Security Roles & Permissions */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            padding: '28px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '18px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingBottom: '14px',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                marginBottom: '16px',
              }}
              className="border-slate-100 dark:border-slate-800"
            >
              <Shield style={{ width: '20px', height: '20px', color: '#1e3a8a' }} className="dark:text-blue-400" />
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--foreground, #1e293b)',
                  margin: 0,
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}
                className="text-slate-900 dark:text-slate-100"
              >
                Security Roles & RBAC Authorizations
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {roles.map((r) => (
                <div
                  key={r}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'var(--muted, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    fontSize: '13px',
                  }}
                  className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: r === 'VOLUNTEER' ? '#10b981' : r === 'MEMBER' ? '#3b82f6' : '#94a3b8',
                      }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-800 dark:text-slate-200">
                      {r}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {r === 'VOLUNTEER' ? 'Active Volunteer Portal' : 'Authorized Role Persona'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              fontSize: '12px',
              color: '#1e3a8a',
              lineHeight: 1.5,
            }}
            className="dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-300"
          >
            ℹ️ <strong>RBAC Policy Notice:</strong> As a verified volunteer, you hold access to volunteer task assignments, shift coordination, and personal reimbursement filing. Overall organization budget approvals, bank disbursements, and ticket pricing controls remain restricted to the Treasurer & Executive Board.
          </div>
        </div>
      </div>

      {/* ── 4. Volunteer Milestones & Recognition ────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '24px 28px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Award style={{ width: '20px', height: '20px', color: '#b45309' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
            Active Semester Badges & Service Accomplishments
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            className="dark:bg-amber-950/30 dark:border-amber-900"
          >
            <Sparkles style={{ width: '20px', height: '20px', color: '#b45309', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e' }} className="dark:text-amber-300">
                Bake Sale Squad Coordinator
              </div>
              <p style={{ fontSize: '12px', color: '#78350f', margin: '4px 0 0 0' }} className="dark:text-amber-400">
                Led recipe batch planning, table signage design, and ingredient procurement for the May 2 charity fundraiser.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
            className="dark:bg-blue-950/30 dark:border-blue-900"
          >
            <Clock style={{ width: '20px', height: '20px', color: '#1e3a8a', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }} className="dark:text-blue-300">
                Spring Gala Entrance Marshal
              </div>
              <p style={{ fontSize: '12px', color: '#1e40af', margin: '4px 0 0 0' }} className="dark:text-blue-400">
                Confirmed shift for May 16 gala door scanner & badge check-in desk at the Main Auditorium East Gate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
