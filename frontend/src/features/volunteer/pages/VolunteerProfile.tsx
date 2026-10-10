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
    <div className="space-y-6 max-w-4xl">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Volunteer Profile & Credentials
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Identity, club association credentials, and active system authorizations.
        </p>
      </div>

      {/* ── Main Profile Card ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || 'Volunteer'}
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800 shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {user?.name || 'Volunteer User'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Active Volunteer
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email || 'volunteer@campusmitra.edu'}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{collegeName || 'Dr.SNS Rajalakshmi College Of Arts and Science'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors self-start md:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Digital Membership Pass ─────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-md flex flex-col justify-between h-52">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold tracking-wider uppercase">
                Skyline Student Association
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {membership.status}
              </span>
            </div>
            <div className="text-sm font-bold text-white mt-3">
              Official Volunteer Pass
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-mono tracking-widest">
              PASS ID: {membership.membershipNumber}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block">CARD HOLDER</span>
                <span className="font-semibold">{user?.name || 'RITHISH S'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">ROLE TIER</span>
                <span className="font-semibold">VOLUNTEER (Dues Exempt)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── System Roles & Authorizations ───────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Assigned Security Roles
            </h3>
          </div>

          <div className="space-y-2">
            {roles.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      r === 'VOLUNTEER'
                        ? 'bg-emerald-500'
                        : r === 'MEMBER'
                        ? 'bg-blue-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {r}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {r === 'VOLUNTEER'
                    ? 'Primary Active Role'
                    : 'Authorized Persona'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300">
            ℹ️ As a Volunteer, you are granted authorization to execute allocated event tasks and file personal reimbursement claims. Organization-wide financial accounting is restricted to the Treasurer Office.
          </div>
        </div>
      </div>
    </div>
  );
};
