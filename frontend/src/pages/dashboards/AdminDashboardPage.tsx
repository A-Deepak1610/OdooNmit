import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  History,
  Plus,
  Search,
  CheckCircle2,
  Settings,
  UserCheck,
} from 'lucide-react';

interface OrganizationItem {
  id: string;
  name: string;
  slug: string;
  presidentName: string;
  treasurerName: string;
  memberCount: number;
  status: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
}

const INITIAL_ORGANIZATIONS: OrganizationItem[] = [
  {
    id: 'org-01',
    name: 'Skyline Student Association',
    slug: 'skyline-sa',
    presidentName: 'Elena Rostova',
    treasurerName: 'Deepak A',
    memberCount: 248,
    status: 'ACTIVE',
    createdAt: '2025-08-15',
  },
  {
    id: 'org-02',
    name: 'Campus Robotics & AI Society',
    slug: 'robotics-ai',
    presidentName: 'Aarav Patel',
    treasurerName: 'Sneha Rao',
    memberCount: 184,
    status: 'ACTIVE',
    createdAt: '2025-09-01',
  },
  {
    id: 'org-03',
    name: 'IEEE Student Chapter',
    slug: 'ieee-student',
    presidentName: 'Karthik Raja',
    treasurerName: 'Priya Iyer',
    memberCount: 310,
    status: 'ACTIVE',
    createdAt: '2025-07-20',
  },
  {
    id: 'org-04',
    name: 'Literary & Debating Union',
    slug: 'literary-union',
    presidentName: 'Meera Nair',
    treasurerName: 'Rohan Mehra',
    memberCount: 142,
    status: 'ACTIVE',
    createdAt: '2025-10-10',
  },
  {
    id: 'org-05',
    name: 'Aeromodelling Club',
    slug: 'aeromodelling',
    presidentName: 'Vikram Singh',
    treasurerName: 'Ananya Roy',
    memberCount: 129,
    status: 'DEACTIVATED',
    createdAt: '2025-06-12',
  },
];

interface AuditEntry {
  id: string;
  action: string;
  performedBy: string;
  target: string;
  timestamp: string;
  type: 'ROLE' | 'ORG' | 'AUTH' | 'SETTINGS';
}

const INITIAL_AUDITS: AuditEntry[] = [
  {
    id: 'aud-01',
    action: 'Assigned Role: TREASURER',
    performedBy: 'Super Admin (System)',
    target: 'Deepak A -> Skyline Student Association',
    timestamp: 'Today at 02:15 PM',
    type: 'ROLE',
  },
  {
    id: 'aud-02',
    action: 'Activated Organization Tenant',
    performedBy: 'Super Admin',
    target: 'Campus Robotics & AI Society',
    timestamp: 'Today at 11:30 AM',
    type: 'ORG',
  },
  {
    id: 'aud-03',
    action: 'Access Recovery Initiated',
    performedBy: 'Elena Rostova (Self)',
    target: 'Account 2FA Reset Verified',
    timestamp: 'Yesterday at 04:45 PM',
    type: 'AUTH',
  },
  {
    id: 'aud-04',
    action: 'Platform Dues Configuration',
    performedBy: 'Super Admin',
    target: 'Global Payment Gateway Sandbox Mode',
    timestamp: '2 days ago',
    type: 'SETTINGS',
  },
];

export const AdminDashboardPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>(INITIAL_ORGANIZATIONS);
  const [audits] = useState<AuditEntry[]>(INITIAL_AUDITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // New Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgPresident, setNewOrgPresident] = useState('');
  const [newOrgTreasurer, setNewOrgTreasurer] = useState('');

  // Role Assignment Form State
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [selectedClub, setSelectedClub] = useState('Skyline Student Association');
  const [selectedRole, setSelectedRole] = useState('PRESIDENT');
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  const stats = [
    {
      label: 'Campus Organizations',
      value: `${organizations.filter((o) => o.status === 'ACTIVE').length} Active`,
      subtitle: `${organizations.length} total registered charters`,
      color: '#1e3a8a',
      bg: '#eff6ff',
      icon: Building2,
    },
    {
      label: 'Appointed Club Leaders',
      value: '24 Officers',
      subtitle: 'Presidents, Treasurers & Leads',
      color: '#15803d',
      bg: '#dcfce7',
      icon: UserCheck,
    },
    {
      label: 'Total User Accounts',
      value: '1,013 Users',
      subtitle: 'Students, Members & Staff',
      color: '#b45309',
      bg: '#fef3c7',
      icon: Users,
    },
    {
      label: 'Security & Access Control',
      value: '100% Verified',
      subtitle: 'Role permissions enforced',
      color: '#7c3aed',
      bg: '#f3e8ff',
      icon: ShieldCheck,
    },
  ];

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    const newOrg: OrganizationItem = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      slug: newOrgSlug.trim() || newOrgName.toLowerCase().replace(/\s+/g, '-'),
      presidentName: newOrgPresident.trim() || 'Unassigned',
      treasurerName: newOrgTreasurer.trim() || 'Unassigned',
      memberCount: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setOrganizations([newOrg, ...organizations]);
    setNewOrgName('');
    setNewOrgSlug('');
    setNewOrgPresident('');
    setNewOrgTreasurer('');
    setShowOrgModal(false);
  };

  const handleToggleOrgStatus = (id: string) => {
    setOrganizations(
      organizations.map((org) => {
        if (org.id === id) {
          return {
            ...org,
            status: org.status === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE',
          };
        }
        return org;
      })
    );
  };

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail.trim()) return;
    setAssignmentSuccess(`Successfully assigned ${selectedRole} of ${selectedClub} to ${selectedUserEmail}`);
    setShowRoleModal(false);
    setSelectedUserEmail('');
    setTimeout(() => setAssignmentSuccess(null), 5000);
  };

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.presidentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'var(--font-family-body)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── 1. Page Header ────────────────────────────────────────── */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
              }}
            >
              System Administrator Console
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Campus-Wide Multi-Organization Platform
            </span>
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              margin: '0 0 6px 0',
              color: 'var(--foreground, #1e293b)',
              letterSpacing: '-0.3px',
            }}
            className="text-slate-900 dark:text-slate-100"
          >
            Super Admin Platform Management
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }} className="text-slate-500 dark:text-slate-400">
            Create and deactivate organizations, assign club leadership permissions, audit system security, and configure platform settings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowRoleModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--foreground, #334155)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            <UserCheck style={{ width: '16px', height: '16px' }} />
            <span>Assign Club Leadership</span>
          </button>

          <button
            onClick={() => setShowOrgModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Create Organization</span>
          </button>
        </div>
      </div>

      {assignmentSuccess && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{assignmentSuccess}</span>
        </div>
      )}

      {/* ── 2. Stat Cards (4-column) ──────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '22px', height: '22px', color: stat.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--foreground, #1e293b)',
                    marginBottom: '2px',
                    letterSpacing: '-0.5px',
                  }}
                  className="text-slate-900 dark:text-slate-100"
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{stat.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Main 2:1 Content Grid ──────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)] gap-6"
      >
        {/* LEFT COLUMN: Organizations Directory & Management (2/3) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            {/* Table Header & Search */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
              className="border-slate-100 dark:border-slate-800"
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                  <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                    Campus Organizations Management
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Create, configure, and deactivate institutional club charters and active leadership roles.
                </p>
              </div>

              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '14px',
                    height: '14px',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search organization or president..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Organizations Table */}
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '660px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--muted, #f8fafc)',
                      borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      color: '#64748b',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                    className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                  >
                    <th style={{ padding: '14px 20px', fontWeight: 600, whiteSpace: 'nowrap' }}>Organization Charter</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Leadership</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Enrolled Members</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>Charter Status</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>Admin Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrgs.map((org) => {
                    const isActive = org.status === 'ACTIVE';

                    return (
                      <tr
                        key={org.id}
                        style={{
                          borderBottom: '1px solid var(--border-color, #f1f5f9)',
                          transition: 'background-color 0.15s ease',
                        }}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                      >
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
                            {org.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            tenant slug: <code style={{ fontFamily: 'monospace', color: '#1e3a8a' }}>/{org.slug}</code>
                          </div>
                        </td>

                        <td style={{ padding: '16px 16px' }}>
                          <div style={{ fontSize: '13px', color: '#334155' }} className="dark:text-slate-300">
                            <strong>Pres:</strong> {org.presidentName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <strong>Treas:</strong> {org.treasurerName}
                          </div>
                        </td>

                        <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: '#1e293b' }} className="dark:text-slate-100">
                            {org.memberCount} Students
                          </span>
                        </td>

                        <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isActive ? '#dcfce7' : '#fef2f2',
                              color: isActive ? '#15803d' : '#dc2626',
                              border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
                            }}
                          >
                            {isActive ? 'ACTIVE CHARTER' : 'DEACTIVATED'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => handleToggleOrgStatus(org.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: '1px solid var(--border-color, #cbd5e1)',
                                background: 'transparent',
                                color: isActive ? '#dc2626' : '#15803d',
                                cursor: 'pointer',
                              }}
                            >
                              {isActive ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: System Audit History & Platform Settings (1/3) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* System Audit Log Stream */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                  Platform Audit History
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 700 }}>LIVE LOG</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {audits.map((aud) => (
                <div
                  key={aud.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'var(--muted, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    fontSize: '12px',
                  }}
                  className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }} className="dark:text-slate-100">
                      {aud.action}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '11px' }}>{aud.timestamp}</span>
                  </div>
                  <div style={{ color: '#64748b' }}>{aud.target}</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                    by {aud.performedBy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Settings & Access Recovery Card */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Settings style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                Platform Security Controls
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Multi-Tenant Tenant Isolation</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>Enforced (JWT)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Google SSO OAuth2</span>
                <span style={{ fontWeight: 600, color: '#15803d' }}>Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#64748b' }}>Emergency Access Recovery</span>
                <span style={{ fontWeight: 600, color: '#1e3a8a' }}>Super-Admin Pin Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal: Create Organization ───────────────────────────── */}
      {showOrgModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                Register New Campus Organization
              </h3>
              <button
                onClick={() => setShowOrgModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Student Association"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Subdomain / Tenant Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. skyline-sa"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    President
                  </label>
                  <input
                    type="text"
                    placeholder="Elena Rostova"
                    value={newOrgPresident}
                    onChange={(e) => setNewOrgPresident(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--foreground, #1e293b)',
                      outline: 'none',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Treasurer
                  </label>
                  <input
                    type="text"
                    placeholder="Deepak A"
                    value={newOrgTreasurer}
                    onChange={(e) => setNewOrgTreasurer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--foreground, #1e293b)',
                      outline: 'none',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Create Charter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Assign Leadership & Roles ─────────────────────── */}
      {showRoleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                Assign Club Leadership & Roles
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignRole} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Target User Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. deepak@skyline.edu"
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Club Organization *
                </label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Role Permission *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="PRESIDENT">Club President / Organization Admin</option>
                  <option value="TREASURER">Treasurer (Books & Reimbursements)</option>
                  <option value="EVENT_ORGANIZER">Event Organizer (Setup & Scanner)</option>
                  <option value="VOLUNTEER">Volunteer (Tasks & Reimbursements)</option>
                  <option value="MEMBER">Official Member</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Authorize Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
