import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  BarChart3,
  PieChart,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Layers,
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
    target: 'Global Razorpay Sandbox Mode',
    timestamp: '2 days ago',
    type: 'SETTINGS',
  },
];

interface ActivityMonth {
  month: string;
  events: number;
  attendees: number;
  revenue: number;
  isProjection?: boolean;
}

const MONTHLY_STATS: ActivityMonth[] = [
  { month: 'Jun', events: 3, attendees: 420, revenue: 38000 },
  { month: 'Jul', events: 5, attendees: 680, revenue: 64000 },
  { month: 'Aug', events: 8, attendees: 1150, revenue: 112000 },
  { month: 'Sep', events: 12, attendees: 1820, revenue: 185000 },
  { month: 'Oct', events: 15, attendees: 2450, revenue: 265000 },
  { month: 'Nov', events: 18, attendees: 3100, revenue: 340000, isProjection: true },
];

interface DomainStat {
  label: string;
  count: number;
  percentage: number;
  color: string;
  bg: string;
}

const DOMAIN_DISTRIBUTION: DomainStat[] = [
  { label: 'Technical & Coding', count: 5, percentage: 42, color: '#1e3a8a', bg: '#eff6ff' },
  { label: 'Cultural & Performing', count: 3, percentage: 25, color: '#db2777', bg: '#fdf2f8' },
  { label: 'Entrepreneurship & E-Cell', count: 2, percentage: 17, color: '#d97706', bg: '#fffbeb' },
  { label: 'Sports & Social Welfare', count: 2, percentage: 16, color: '#059669', bg: '#ecfdf5' },
];

const TOP_CLUBS_CAPACITY = [
  { name: 'Skyline Student Association', slug: 'skyline-sa', enrolled: 248, capacity: 300, duesRate: '94% Paid', color: '#1e3a8a' },
  { name: 'Campus Robotics & AI Society', slug: 'robotics-ai', enrolled: 184, capacity: 250, duesRate: '88% Paid', color: '#2563eb' },
  { name: 'IEEE Student Chapter', slug: 'ieee-student', enrolled: 310, capacity: 350, duesRate: '98% Paid', color: '#0284c7' },
  { name: 'Literary & Debating Union', slug: 'literary-union', enrolled: 142, capacity: 200, duesRate: '82% Paid', color: '#7c3aed' },
];

export const AdminDashboardPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>(INITIAL_ORGANIZATIONS);
  const [audits] = useState<AuditEntry[]>(INITIAL_AUDITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Chart Interactive States
  const [chartMetric, setChartMetric] = useState<'attendees' | 'events'>('attendees');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

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

      {/* ── 3. Visual Charts & Stats Diagrams (Interactive Bar Chart + Donut & Capacity Diagram) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px',
        }}
      >
        {/* ── CARD 1: Monthly Engagement & Event Turnout Interactive Bar Chart ── */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {/* Card Header & Metric Controls */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--foreground, #1e293b)',
                    }}
                    className="text-slate-900 dark:text-slate-100"
                  >
                    Campus Participation & Activity Volume
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Monthly verified student event check-ins and organization activities
                </p>
              </div>

              {/* Metric Toggle Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f1f5f9',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  gap: '4px',
                }}
                className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => setChartMetric('attendees')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    background: chartMetric === 'attendees' ? '#1e3a8a' : 'transparent',
                    color: chartMetric === 'attendees' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Student Attendees
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric('events')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    background: chartMetric === 'events' ? '#1e3a8a' : 'transparent',
                    color: chartMetric === 'events' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Events Hosted
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
              className="bg-slate-50 dark:bg-slate-800/50"
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Turnout</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }} className="dark:text-blue-400">
                  9,620 Students
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <TrendingUp size={11} />
                  <span>+31.4% vs last term</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Events Coordinated</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }} className="dark:text-slate-100">
                  61 Total
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Activity size={11} color="#1e3a8a" />
                  <span>15 active this month</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Cumulative Gate Inflow</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d', marginTop: '2px' }} className="dark:text-emerald-400">
                  ₹10.04 Lakhs
                </div>
                <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                  100% digital settlement
                </div>
              </div>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <svg
                viewBox="0 0 540 200"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
              >
                <defs>
                  {/* Active Bar Gradient */}
                  <linearGradient id="barActiveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  {/* Projected Bar Gradient */}
                  <linearGradient id="barProjectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>

                {/* Y-Axis dashed guidelines */}
                {[
                  { y: 30, label: chartMetric === 'attendees' ? '3,500' : '20' },
                  { y: 75, label: chartMetric === 'attendees' ? '2,300' : '14' },
                  { y: 120, label: chartMetric === 'attendees' ? '1,100' : '7' },
                  { y: 165, label: '0' },
                ].map((line, idx) => (
                  <g key={idx}>
                    <line
                      x1="45"
                      y1={line.y}
                      x2="525"
                      y2={line.y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      className="stroke-slate-200 dark:stroke-slate-800"
                    />
                    <text
                      x="40"
                      y={line.y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      {line.label}
                    </text>
                  </g>
                ))}

                {/* Render 6 Bars */}
                {MONTHLY_STATS.map((item, idx) => {
                  const maxVal = chartMetric === 'attendees' ? 3500 : 20;
                  const currentVal = chartMetric === 'attendees' ? item.attendees : item.events;
                  const barHeight = Math.max(12, (currentVal / maxVal) * 135);
                  const barY = 165 - barHeight;
                  const slotWidth = (520 - 50) / MONTHLY_STATS.length;
                  const barWidth = 40;
                  const slotX = 50 + idx * slotWidth;
                  const barX = slotX + (slotWidth - barWidth) / 2;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <g
                      key={item.month}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Highlight column on hover */}
                      {isHovered && (
                        <rect
                          x={slotX}
                          y={20}
                          width={slotWidth}
                          height={150}
                          fill="#eff6ff"
                          opacity={0.6}
                          rx={6}
                          className="dark:fill-blue-900/20"
                        />
                      )}

                      {/* Bar Rectangle */}
                      <rect
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        rx={5}
                        fill={item.isProjection ? 'url(#barProjectedGrad)' : 'url(#barActiveGrad)'}
                        opacity={isHovered ? 1 : 0.9}
                        style={{
                          transition: 'all 0.2s ease',
                          transformOrigin: `${barX + barWidth / 2}px 165px`,
                          transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                          filter: isHovered ? 'drop-shadow(0 4px 8px rgba(30, 58, 138, 0.3))' : 'none',
                        }}
                      />

                      {/* Value label above bar */}
                      <text
                        x={barX + barWidth / 2}
                        y={barY - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill={isHovered ? '#1e3a8a' : '#475569'}
                        className="dark:fill-slate-200"
                      >
                        {chartMetric === 'attendees' ? currentVal.toLocaleString() : currentVal}
                      </text>

                      {/* Month label under baseline */}
                      <text
                        x={barX + barWidth / 2}
                        y={183}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={isHovered ? '700' : '500'}
                        fill={isHovered ? '#1e3a8a' : '#64748b'}
                        className="dark:fill-slate-400"
                      >
                        {item.month}
                      </text>

                      {/* Projected indicator pill text */}
                      {item.isProjection && (
                        <text
                          x={barX + barWidth / 2}
                          y={195}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="#059669"
                        >
                          Target
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic Hover Tooltip */}
              {hoveredBarIndex !== null && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '12px',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                    {MONTHLY_STATS[hoveredBarIndex].month} Summary
                  </div>
                  <div>
                    👥 Attendees: <strong>{MONTHLY_STATS[hoveredBarIndex].attendees.toLocaleString()}</strong>
                  </div>
                  <div>
                    📅 Events Hosted: <strong>{MONTHLY_STATS[hoveredBarIndex].events}</strong>
                  </div>
                  <div>
                    💰 Ticket Volume: <strong>₹{MONTHLY_STATS[hoveredBarIndex].revenue.toLocaleString()}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Chart Footer Legend */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '12px',
              marginTop: '12px',
              fontSize: '11px',
              color: '#64748b',
            }}
            className="border-slate-100 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1e3a8a' }} />
                <span>Verified Actuals</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#059669' }} />
                <span>Target Projections</span>
              </div>
            </div>
            <span style={{ fontWeight: 500 }}>Semester Term: Fall 2026</span>
          </div>
        </div>

        {/* ── CARD 2: Stats Diagram (Donut Distribution + Top Clubs Capacity Bars) ── */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChart style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      margin: 0,
                      color: 'var(--foreground, #1e293b)',
                    }}
                    className="text-slate-900 dark:text-slate-100"
                  >
                    Organization Portfolio & Roster Density
                  </h3>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Domain representation and capacity utilization across student bodies
                </p>
              </div>

              <Link
                to="/admin/clubs"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1e3a8a',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                className="hover:underline"
              >
                <span>View Clubs</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {/* TOP HALF: Donut Stats Diagram & Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: '10px',
                marginBottom: '20px',
              }}
              className="bg-slate-50 dark:bg-slate-800/50"
            >
              {/* SVG Donut Circle */}
              <div style={{ width: '130px', height: '130px', flexShrink: 0, position: 'relative' }}>
                <svg viewBox="0 0 160 160" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r="52"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="18"
                    className="stroke-slate-200 dark:stroke-slate-700"
                  />

                  {/* Dynamic Donut Segments */}
                  {(() => {
                    const circumference = 2 * Math.PI * 52;
                    let accumulatedOffset = 0;
                    return DOMAIN_DISTRIBUTION.map((domain) => {
                      const strokeDash = (domain.percentage / 100) * circumference;
                      const strokeGap = circumference - strokeDash;
                      const currentOffset = -accumulatedOffset;
                      accumulatedOffset += strokeDash;
                      const isHovered = hoveredDomain === domain.label;

                      return (
                        <circle
                          key={domain.label}
                          cx="80"
                          cy="80"
                          r="52"
                          fill="none"
                          stroke={domain.color}
                          strokeWidth={isHovered ? 22 : 18}
                          strokeDasharray={`${strokeDash} ${strokeGap}`}
                          strokeDashoffset={currentOffset}
                          style={{
                            transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                            cursor: 'pointer',
                            opacity: hoveredDomain && !isHovered ? 0.4 : 1,
                          }}
                          onMouseEnter={() => setHoveredDomain(domain.label)}
                          onMouseLeave={() => setHoveredDomain(null)}
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Donut Center Display */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }} className="dark:text-slate-100">
                    12
                  </span>
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                    Charters
                  </span>
                </div>
              </div>

              {/* Donut Legend */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DOMAIN_DISTRIBUTION.map((domain) => (
                  <div
                    key={domain.label}
                    onMouseEnter={() => setHoveredDomain(domain.label)}
                    onMouseLeave={() => setHoveredDomain(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      background: hoveredDomain === domain.label ? '#ffffff' : 'transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: domain.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: hoveredDomain === domain.label ? 700 : 500,
                          color: '#334155',
                        }}
                        className="dark:text-slate-300"
                      >
                        {domain.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>{domain.count} clubs</span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: domain.color,
                          background: domain.bg,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}
                      >
                        {domain.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM HALF: Top Clubs Enrollment Capacity Comparison */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748b',
                    letterSpacing: '0.4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Layers size={13} color="#1e3a8a" className="dark:text-blue-400" />
                  <span>Key Student Body Capacity Quotas</span>
                </span>
                <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                  Active Dues Compliance
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {TOP_CLUBS_CAPACITY.map((club) => {
                  const pct = Math.round((club.enrolled / club.capacity) * 100);
                  return (
                    <div key={club.slug}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          marginBottom: '4px',
                        }}
                      >
                        <Link
                          to={`/admin/clubs?club=${club.slug}`}
                          style={{
                            fontWeight: 600,
                            color: '#1e3a8a',
                            textDecoration: 'none',
                          }}
                          className="hover:underline"
                        >
                          {club.name}
                        </Link>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {club.enrolled}/{club.capacity} ({pct}%)
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: '#15803d',
                              background: '#dcfce7',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {club.duesRate}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '7px',
                          background: '#f1f5f9',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                        className="bg-slate-100 dark:bg-slate-800"
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: club.color,
                            borderRadius: '4px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Status Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '12px',
              marginTop: '14px',
              fontSize: '11px',
              color: '#64748b',
            }}
            className="border-slate-100 dark:border-slate-800"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#15803d', fontWeight: 600 }}>
              <CheckCircle2 size={13} />
              <span>All 12 Charters in Good Standing</span>
            </span>
            <Link
              to="/admin/analytics"
              style={{
                color: '#1e3a8a',
                fontWeight: 600,
                textDecoration: 'none',
              }}
              className="hover:underline"
            >
              Comprehensive Analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 4. Main 2:1 Content Grid ──────────────────────────────── */}
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
                          <Link
                            to={`/admin/clubs?club=${org.slug}`}
                            style={{
                              fontWeight: 600,
                              color: '#1e3a8a',
                              textDecoration: 'none',
                              display: 'inline-block',
                            }}
                            className="hover:underline"
                            title="Click to view full club profile, dues and events"
                          >
                            {org.name}
                          </Link>
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
                            <Link
                              to={`/admin/clubs?club=${org.slug}`}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#1e3a8a',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              View Details
                            </Link>
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
