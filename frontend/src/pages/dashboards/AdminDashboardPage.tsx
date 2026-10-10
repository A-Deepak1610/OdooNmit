import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Trophy,
  IndianRupee,
  Plus,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { activeClub } from '../../data/mockClubData';
import { TeamWorkstreamBanner, WorkstreamId } from '../../components/modules/TeamWorkstreamBanner';
import { EventsTicketingModule } from '../../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../../components/modules/merchandise/MerchandiseTaskModule';
import { FinanceLedgerModule } from '../../components/modules/finance/FinanceLedgerModule';
import { AnnouncementBoardModule } from '../../components/modules/announcements/AnnouncementBoardModule';

export const AdminDashboardPage: React.FC = () => {
  const [activeStream, setActiveStream] = useState<WorkstreamId>('all');

  const statsCards = [
    { icon: Calendar, label: 'Total Events', value: '10', subtitle: '9 active this term', color: '#1e3a8a', bg: '#eff6ff' },
    { icon: Users, label: 'Club Participants', value: '1,013', subtitle: 'Across 6 active clubs', color: '#15803d', bg: '#dcfce7' },
    { icon: Trophy, label: 'Active Clubs', value: '6 Clubs', subtitle: 'All charters verified', color: '#b45309', bg: '#fef3c7' },
    { icon: IndianRupee, label: 'Total Inflow', value: '₹367,500', subtitle: 'Dues & Gala tickets', color: '#7c3aed', bg: '#f3e8ff' },
  ];

  const quickActions = [
    { label: 'Register Club Tenant', description: 'Onboard new campus chapter with dues settings', color: '#1e3a8a', bg: '#eff6ff', icon: Building2, targetStream: 'all' as WorkstreamId },
    { label: 'Audit Treasury Ledger', description: 'Inspect end-of-semester income & closing balances', color: '#15803d', bg: '#dcfce7', icon: IndianRupee, targetStream: 'finance_announcements' as WorkstreamId },
    { label: 'Manage All Events', description: 'Monitor Spring Gala quotas and door check-in rates', color: '#b45309', bg: '#fef3c7', icon: Calendar, targetStream: 'events' as WorkstreamId },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* 4-Developer Workstream Banner */}
      <TeamWorkstreamBanner
        activeStream={activeStream}
        onSelectStream={(s) => setActiveStream(s)}
      />

      {/* Module Inspector or Master Admin Overview */}
      {activeStream === 'events' ? (
        <EventsTicketingModule />
      ) : activeStream === 'memberships' ? (
        <MembershipModule />
      ) : activeStream === 'merch_tasks' ? (
        <MerchandiseTaskModule />
      ) : activeStream === 'finance_announcements' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FinanceLedgerModule />
          <AnnouncementBoardModule />
        </div>
      ) : (
        <div>
          {/* ── 1. PAGE HEADER (Part 13 Spec) ───────────────────────── */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '28px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                  color: '#1e293b',
                  letterSpacing: '-0.3px',
                }}
              >
                Campus Admin Dashboard
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Institutional oversight of student organizations, event quotas, and multi-tenant club accounts.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
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
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#172554';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e3a8a';
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                <span>Register New Club Tenant</span>
              </button>
            </div>
          </div>

          {/* ── 2. STAT CARDS (4-col, Part 13 & Part 17 Rule 4) ─────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
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
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '2px', letterSpacing: '-0.5px' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 3. QUICK ACTIONS (3-col, Part 13 & Part 17 Rule 13) ──── */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 16px 0' }}>
              Quick Actions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
            >
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <div
                    key={i}
                    onClick={() => action.targetStream && setActiveStream(action.targetStream)}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = action.color;
                      e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: action.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: '22px', height: '22px', color: action.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                        {action.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {action.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 4. MAIN CONTENT (2:1 split, Part 13 & Part 17 Rule 14) ─ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '20px',
            }}
          >
            {/* Left Column (2fr): Multi-Tenant Club Directory Table */}
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1e293b',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                  Multi-Tenant Club Directory
                </h3>
                <span
                  style={{
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  Active Isolation
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Club Tenant</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Slug</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Annual Dues</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Members</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Treasury Balance</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{activeClub.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Skyline Student Chapter</div>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b' }}>
                        {activeClub.slug}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                        ₹{activeClub.duesAmount}/yr
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                          {activeClub.memberCount} Members
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                        ₹{activeClub.activeBudget.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => setActiveStream('finance_announcements')}
                          style={{
                            color: '#1e3a8a',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Audit →
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>Developer Student Club</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>Technical Hackathons</div>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#64748b' }}>
                        dsc-chapter
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                        ₹300/yr
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: '#15803d', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, fontSize: '11px' }}>
                          185 Members
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                        ₹64,200
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          style={{
                            color: '#64748b',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column (1fr): Institutional Status Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                    Campus Event Quota
                  </h3>
                  <span style={{ color: '#1e3a8a', fontSize: '12px', fontWeight: 600 }}>Active</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Approved Auditorium Dates:</span>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>14 Days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Pending Student Petitions:</span>
                    <span style={{ fontWeight: 600, color: '#b45309' }}>2 Under Review</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Institution Grade:</span>
                    <span style={{ fontWeight: 700, color: '#15803d' }}>NAAC A++</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
