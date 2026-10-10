import React, { useState } from 'react';
import {
  Users,
  Calendar,
  IndianRupee,
  Building2,
  Download,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { exportToCsv } from './utils/exportCsv';

interface MonthlyMetric {
  month: string;
  users: number;
  tickets: number;
  revenue: number;
}

const MONTHLY_DATA: MonthlyMetric[] = [
  { month: 'May', users: 180, tickets: 420, revenue: 45000 },
  { month: 'Jun', users: 310, tickets: 680, revenue: 78000 },
  { month: 'Jul', users: 540, tickets: 1120, revenue: 135000 },
  { month: 'Aug', users: 820, tickets: 1850, revenue: 210000 },
  { month: 'Sep', users: 1150, tickets: 2940, revenue: 320000 },
  { month: 'Oct', users: 1420, tickets: 4010, revenue: 418000 },
];

export const AdminAnalyticsPage: React.FC = () => {
  const [selectedClub, setSelectedClub] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('Fall 2026');

  const kpis = [
    {
      title: 'Active Student Users',
      value: '1,420',
      change: '+24%',
      period: 'vs last month',
      icon: Users,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      title: 'Chartered Clubs',
      value: '12 Active',
      change: '+2 new',
      period: 'this semester',
      icon: Building2,
      color: '#7c3aed',
      bg: '#f3e8ff',
    },
    {
      title: 'Event Tickets Sold',
      value: '4,010',
      change: '+410',
      period: 'past 30 days',
      icon: Calendar,
      color: '#0891b2',
      bg: '#ecfeff',
    },
    {
      title: 'Gross Platform Inflow',
      value: '₹4,18,000',
      change: '+18.5%',
      period: 'vs target',
      icon: IndianRupee,
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  const clubBreakdown = [
    { name: 'Skyline Student Association', category: 'Governance', members: 248, events: 4, revenue: '₹1,18,500' },
    { name: 'Coding & Algorithm Club', category: 'Technical', members: 320, events: 5, revenue: '₹1,40,000' },
    { name: 'Robotics & Automation Society', category: 'Technical', members: 195, events: 3, revenue: '₹63,000' },
    { name: 'Cultural & Performing Arts', category: 'Cultural', members: 280, events: 2, revenue: '₹54,000' },
    { name: 'E-Cell Innovation Forum', category: 'Entrepreneurship', members: 210, events: 2, revenue: '₹42,500' },
  ];

  const handleExport = () => {
    const cols = [
      { header: 'Month', accessor: (r: MonthlyMetric) => r.month },
      { header: 'New Users', accessor: (r: MonthlyMetric) => r.users },
      { header: 'Tickets Sold', accessor: (r: MonthlyMetric) => r.tickets },
      { header: 'Revenue (INR)', accessor: (r: MonthlyMetric) => `₹${r.revenue.toLocaleString('en-IN')}` },
    ];
    exportToCsv('campus_platform_analytics', cols, MONTHLY_DATA);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Page Header ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Institutional Intelligence
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Real-time Campus Metrics
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Platform Analytics & Growth
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Operational growth metrics, ticket throughput, membership velocity, and multi-club financial inflow.
          </p>
        </div>

        {/* Filter Controls & Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={15} color="#64748b" />
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                background: '#f8fafc',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Organizations (12 Clubs)</option>
              <option value="skyline">Skyline Student Association</option>
              <option value="coding">Coding & Algorithm Club</option>
              <option value="robotics">Robotics & Automation</option>
            </select>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="Fall 2026">This Semester (Fall 2026)</option>
            <option value="Academic 2025-26">Academic Year 2025-26</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>

          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px',
              padding: '0 16px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={15} />
            Export Analytics
          </button>
        </div>
      </div>

      {/* ── 2. Spacious KPI Grid (4 Cards, No Overlap) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {kpi.title}
                  </span>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                    {kpi.value}
                  </div>
                </div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: kpi.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={kpi.color} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontWeight: 700,
                    color: '#16a34a',
                    background: '#dcfce7',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  <ArrowUpRight size={13} />
                  {kpi.change}
                </span>
                <span style={{ color: '#94a3b8' }}>{kpi.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Visual Charts Grid (Growth Curve & Revenue Distribution) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Chart 1: User Growth Area Curve */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px 0' }}>
                Student User Growth Trajectory
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Cumulative registered students and active club participants
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              +1,420 Total
            </span>
          </div>

          {/* SVG Area Chart */}
          <div style={{ width: '100%', height: '200px', position: 'relative' }}>
            <svg viewBox="0 0 500 180" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Area */}
              <path
                d="M 30,160 Q 110,140 190,115 T 350,60 T 470,25 L 470,170 L 30,170 Z"
                fill="url(#userGrowthGrad)"
              />

              {/* Line */}
              <path
                d="M 30,160 Q 110,140 190,115 T 350,60 T 470,25"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {[
                { cx: 30, cy: 160, label: 'May' },
                { cx: 120, cy: 145, label: 'Jun' },
                { cx: 210, cy: 110, label: 'Jul' },
                { cx: 300, cy: 80, label: 'Aug' },
                { cx: 390, cy: 50, label: 'Sep' },
                { cx: 470, cy: 25, label: 'Oct' },
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={p.cx} cy={p.cy} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                  <text x={p.cx} y="175" textAnchor="middle" fontSize="11" fill="#94a3b8">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Chart 2: Monthly Ticket Sales Bar Chart */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '22px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px 0' }}>
                Monthly Event Ticket Sales (Turnout)
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Volume of tickets issued per month for all campus activities
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#0891b2',
                background: '#ecfeff',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              4,010 Total
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '24px', padding: '10px 20px 25px' }}>
            {MONTHLY_DATA.map((d, i) => {
              const maxTickets = 4500;
              const heightPct = Math.round((d.tickets / maxTickets) * 100);

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    {d.tickets > 999 ? `${(d.tickets / 1000).toFixed(1)}k` : d.tickets}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPct}%`,
                      background: 'linear-gradient(180deg, #0891b2 0%, #06b6d4 100%)',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                    {d.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Organization Contribution Table ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 2px 0' }}>
              Student Organization Engagement Matrix
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Performance summary across chartered clubs, membership base, and collected revenue
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Showing top active clubs
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px' }}>ORGANIZATION</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px' }}>CATEGORY</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px' }}>MEMBERS</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px' }}>EVENTS HOSTED</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px' }}>COLLECTED INFLOW</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {clubBreakdown.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>
                    {c.name}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>
                    {c.members} Active
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>
                    {c.events} Events
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#16a34a' }}>
                    {c.revenue}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#16a34a',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                      Chartered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
