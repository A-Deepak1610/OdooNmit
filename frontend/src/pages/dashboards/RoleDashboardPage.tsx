import React, { useState } from 'react';
import { UserRole } from '../../config/roles';
import {
  Calendar,
  Users,
  Trophy,
  Ticket,
  Plus,
  ShoppingBag,
  Landmark,
  CheckSquare,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { TeamWorkstreamBanner, WorkstreamId } from '../../components/modules/TeamWorkstreamBanner';
import { EventsTicketingModule } from '../../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../../components/modules/merchandise/MerchandiseTaskModule';
import { FinanceLedgerModule } from '../../components/modules/finance/FinanceLedgerModule';
import { AnnouncementBoardModule } from '../../components/modules/announcements/AnnouncementBoardModule';

interface RoleDashboardProps {
  role: UserRole;
}

interface StatConfig {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}

interface ActionConfig {
  label: string;
  description: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  targetStream?: WorkstreamId;
}

const ROLE_CONFIGS: Record<
  string,
  {
    title: string;
    subtitle: string;
    actionLabel: string;
    stats: StatConfig[];
    actions: ActionConfig[];
  }
> = {
  STUDENT: {
    title: 'Student Dashboard',
    subtitle: 'Browse upcoming campus club events, member discount passes, and table enrollments.',
    actionLabel: 'Join Skyline Club',
    stats: [
      { label: 'Spring Gala Pass', value: '₹100 (Member)', subtitle: '₹250 Non-Member rate', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket },
      { label: 'Club Membership', value: 'Enrolled', subtitle: 'SSA-2026-0042 Active', color: '#15803d', bg: '#dcfce7', icon: Users },
      { label: 'Official Merch', value: '4 Sizes', subtitle: 'Embroidered hoodies in stock', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag },
      { label: 'Active Notices', value: '3 Published', subtitle: 'Latest meeting updates', color: '#7c3aed', bg: '#f3e8ff', icon: Sparkles },
    ],
    actions: [
      { label: 'Spring Gala Tickets', description: 'Differential member tiers & instant door QR pass', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket, targetStream: 'events' },
      { label: 'Join Skyline Club', description: 'Table registration & digital membership ID card', color: '#15803d', bg: '#dcfce7', icon: Users, targetStream: 'memberships' },
      { label: 'Official Hoodies', description: 'Order 24/7 with real-time size stock tracking', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag, targetStream: 'merch_tasks' },
    ],
  },
  MEMBER: {
    title: 'Club Member Dashboard',
    subtitle: 'Access digital membership card, member-only ticket presales, and verified club perks.',
    actionLabel: 'My Member ID',
    stats: [
      { label: 'Membership Status', value: 'Active', subtitle: 'Dues paid (Expires May 2026)', color: '#15803d', bg: '#dcfce7', icon: Users },
      { label: 'Gala Discount', value: '60% Off', subtitle: '₹100 member pass claimed', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket },
      { label: 'Hoodie Discount', value: '20% Off', subtitle: '₹700 member rate active', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag },
      { label: 'Annual Dues', value: 'Valid', subtitle: '₹250 annual dues recorded', color: '#7c3aed', bg: '#f3e8ff', icon: Trophy },
    ],
    actions: [
      { label: 'Digital Member ID', description: 'View verified QR pass & dues validity', color: '#15803d', bg: '#dcfce7', icon: Users, targetStream: 'memberships' },
      { label: 'Spring Gala Passes', description: 'Book VIP seats at exclusive member rate', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket, targetStream: 'events' },
      { label: 'Club Merchandise', description: 'Reserve apparel size before inventory lapses', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag, targetStream: 'merch_tasks' },
    ],
  },
  VOLUNTEER: {
    title: 'Volunteer Operations Desk',
    subtitle: 'Manage bake sale fundraiser tasks, submit expense receipts, and coordinate door shifts.',
    actionLabel: 'Assign Task',
    stats: [
      { label: 'Assigned Duties', value: '5 Tasks', subtitle: 'Baking & quad table shifts', color: '#1e3a8a', bg: '#eff6ff', icon: CheckSquare },
      { label: 'Upcoming Shift', value: 'May 2', subtitle: '10 AM - 12 PM Quad Table', color: '#15803d', bg: '#dcfce7', icon: Calendar },
      { label: 'Expense Claims', value: '₹1,450', subtitle: 'Ingredient receipt submitted', color: '#b45309', bg: '#fef3c7', icon: Receipt },
      { label: 'Hours Contributed', value: '18 Hours', subtitle: 'Verified by Skyline officers', color: '#7c3aed', bg: '#f3e8ff', icon: Trophy },
    ],
    actions: [
      { label: 'Bake Sale Task Board', description: 'Track who is baking, buying & staffing tables', color: '#1e3a8a', bg: '#eff6ff', icon: CheckSquare, targetStream: 'merch_tasks' },
      { label: 'Submit Expense Claim', description: 'Upload ingredient receipts for reimbursement', color: '#15803d', bg: '#dcfce7', icon: Receipt, targetStream: 'finance_announcements' },
      { label: 'Door Check-in Desk', description: 'Scan QR tickets at gala entrance without paper', color: '#b45309', bg: '#fef3c7', icon: Ticket, targetStream: 'events' },
    ],
  },
  EVENT_ORGANIZER: {
    title: 'Event Organizer Console',
    subtitle: 'Monitor live Spring Gala seat quotas, differential ticket revenue, and entrance turnout.',
    actionLabel: 'Create Event',
    stats: [
      { label: 'Gala Capacity', value: '420 / 500', subtitle: '84% seats claimed online', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket },
      { label: 'Ticket Revenue', value: '₹58,500', subtitle: 'Direct collections into club ledger', color: '#15803d', bg: '#dcfce7', icon: Landmark },
      { label: 'Turnout Rate', value: '91.6%', subtitle: '385 guests scanned at entrance', color: '#b45309', bg: '#fef3c7', icon: Users },
      { label: 'Logistics Tasks', value: '5 Active', subtitle: 'Fundraiser & gala logistics', color: '#7c3aed', bg: '#f3e8ff', icon: CheckSquare },
    ],
    actions: [
      { label: 'Door Check-in Scanner', description: 'Admit guests in seconds without paper sheets', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket, targetStream: 'events' },
      { label: 'Ticket Tier Quotas', description: 'Adjust member pricing & seat availability', color: '#15803d', bg: '#dcfce7', icon: Calendar, targetStream: 'events' },
      { label: 'Volunteer Logistics', description: 'Coordinate staffing & bake sale task boards', color: '#b45309', bg: '#fef3c7', icon: CheckSquare, targetStream: 'merch_tasks' },
    ],
  },
  TREASURER: {
    title: 'Treasurer Ledger & Books',
    subtitle: 'Close the semester books: track dues, ticket sales, merch income, and volunteer reimbursements.',
    actionLabel: 'New Transaction',
    stats: [
      { label: 'Net Closing Balance', value: '₹101,300', subtitle: 'Audited semester books', color: '#15803d', bg: '#dcfce7', icon: Landmark },
      { label: 'Total Inflows', value: '₹155,300', subtitle: 'Dues + Gala tickets + Merch', color: '#1e3a8a', bg: '#eff6ff', icon: Landmark },
      { label: 'Total Outflows', value: '₹99,000', subtitle: 'Venue, catering & reimbursements', color: '#dc2626', bg: '#fef2f2', icon: Receipt },
      { label: 'Pending Claims', value: '1 Claim', subtitle: '₹850 awaiting receipt review', color: '#b45309', bg: '#fef3c7', icon: Receipt },
    ],
    actions: [
      { label: 'Closing The Books', description: 'Full audited semester income & expense balance', color: '#15803d', bg: '#dcfce7', icon: Landmark, targetStream: 'finance_announcements' },
      { label: 'Reimbursement Audit', description: 'Verify digital receipts & disburse funds', color: '#1e3a8a', bg: '#eff6ff', icon: Receipt, targetStream: 'finance_announcements' },
      { label: 'Dues Verification', description: 'Audit 194 paid student membership dues', color: '#b45309', bg: '#fef3c7', icon: Users, targetStream: 'memberships' },
    ],
  },
  PRESIDENT: {
    title: 'President Executive Suite',
    subtitle: 'Unified governance view across club membership, gala ticket targets, and treasury surplus.',
    actionLabel: 'Broadcast Notice',
    stats: [
      { label: 'Total Members', value: '248 Members', subtitle: 'Skyline Student Association', color: '#1e3a8a', bg: '#eff6ff', icon: Users },
      { label: 'Spring Gala Target', value: '84% Booked', subtitle: '₹58,500 ticket revenue', color: '#15803d', bg: '#dcfce7', icon: Ticket },
      { label: 'Treasury Surplus', value: '₹101,300', subtitle: 'Healthy semester closing', color: '#7c3aed', bg: '#f3e8ff', icon: Landmark },
      { label: 'Fundraiser Ops', value: 'On Track', subtitle: 'Charity bake sale May 2', color: '#b45309', bg: '#fef3c7', icon: Trophy },
    ],
    actions: [
      { label: 'Broadcast Notice', description: 'Post once to reach all members replacing WhatsApp', color: '#1e3a8a', bg: '#eff6ff', icon: Sparkles, targetStream: 'finance_announcements' },
      { label: 'Membership Oversight', description: 'Review dues compliance & new campus enrollments', color: '#15803d', bg: '#dcfce7', icon: Users, targetStream: 'memberships' },
      { label: 'Semester Financials', description: 'Inspect closing ledger & approved expenses', color: '#15803d', bg: '#dcfce7', icon: Landmark, targetStream: 'finance_announcements' },
    ],
  },
};

export const RoleDashboardPage: React.FC<RoleDashboardProps> = ({ role }) => {
  const [activeStream, setActiveStream] = useState<WorkstreamId>('all');
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  return (
    <div style={{ fontFamily: 'var(--font-family-body)' }}>
      {/* 4-Developer Workstream Selector Banner */}
      <TeamWorkstreamBanner
        activeStream={activeStream}
        onSelectStream={(s) => setActiveStream(s)}
      />

      {/* Render dedicated Dev Workstream or Full Standard Dashboard */}
      {activeStream === 'events' ? (
        <EventsTicketingModule role={role} />
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
        /* STANDARD MASTER PAGE ANATOMY */
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
                {config.title}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                {config.subtitle}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => {
                  if (role === 'EVENT_ORGANIZER') setActiveStream('events');
                  else if (role === 'TREASURER') setActiveStream('finance_announcements');
                  else if (role === 'VOLUNTEER') setActiveStream('merch_tasks');
                  else setActiveStream('memberships');
                }}
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
                <span>{config.actionLabel}</span>
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
            {config.stats.map((stat, i) => {
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
                  {/* 44×44px container (Part 17 Rule 19) */}
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
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: 500,
                        marginBottom: '4px',
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#1e293b',
                        marginBottom: '2px',
                        letterSpacing: '-0.5px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 3. QUICK ACTIONS (3-col, Part 13 & Part 17 Rule 13) ──── */}
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                margin: '0 0 16px 0',
              }}
            >
              Quick Actions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px',
              }}
            >
              {config.actions.map((action, i) => {
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
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1e293b',
                          marginBottom: '2px',
                        }}
                      >
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
            {/* Left column (2fr) — Primary content cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Featured Card */}
              <div
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                }}
              >
                {/* Card Header Pattern (Part 17 Rule 18) */}
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
                    <Calendar style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                    Flagship Semester Event: Spring Gala 2026
                  </h3>
                  <button
                    onClick={() => setActiveStream('events')}
                    style={{
                      fontSize: '12px',
                      color: '#1e3a8a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Manage Gala →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    The Skyline Student Association's flagship year-end gala. Online member tickets claimed at <strong>₹100</strong> (versus ₹250 general rate).
                  </p>

                  {/* Progress Bar (Part 5.7 Spec) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#64748b' }}>Seat Capacity Allocation</span>
                      <span style={{ color: '#1e3a8a', fontWeight: 600 }}>420 / 500 Seats (84%)</span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'var(--secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: '84%',
                          background: 'var(--primary)',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick Action Buttons inside Card */}
                  <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                    <button
                      onClick={() => setActiveStream('events')}
                      style={{
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Ticket style={{ width: '14px', height: '14px' }} />
                      Book Member Pass
                    </button>
                    <button
                      onClick={() => setActiveStream('events')}
                      style={{
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: 'var(--muted-foreground)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Door QR Check-in Desk
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Content Section: Membership Lifecycle */}
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
                    <Users style={{ width: '16px', height: '16px', color: '#15803d' }} />
                    Active Memberships & Dues Verification
                  </h3>
                  <button
                    onClick={() => setActiveStream('memberships')}
                    style={{
                      fontSize: '12px',
                      color: '#1e3a8a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Member Directory →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Person Row Template (Part 8 Spec) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src="https://api.dicebear.com/9.x/thumbs/svg?seed=Deepak&backgroundColor=b6e3f4"
                      alt="Deepak"
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                        Deepak Kumar
                      </div>
                      <div style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        SSA-2026-0042 • Valid till May 31, 2026
                      </div>
                    </div>
                    <span
                      style={{
                        color: '#15803d',
                        background: '#dcfce7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      Dues Paid (₹250)
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src="https://api.dicebear.com/9.x/thumbs/svg?seed=Ananya&backgroundColor=ffd5dc"
                      alt="Ananya"
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                        Ananya Deshmukh
                      </div>
                      <div style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        SSA-2026-0043 • Expiring soon (April 30)
                      </div>
                    </div>
                    <span
                      style={{
                        color: '#b45309',
                        background: '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      Renewal Warning
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0',
                    }}
                  >
                    <img
                      src="https://api.dicebear.com/9.x/thumbs/svg?seed=Karthik&backgroundColor=c0aede"
                      alt="Karthik"
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#1e293b' }}>
                        Karthik Raja
                      </div>
                      <div style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        SSA-2026-0089 • Overdue dues payment
                      </div>
                    </div>
                    <span
                      style={{
                        color: '#dc2626',
                        background: '#fef2f2',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      Overdue (₹250)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column (1fr) — Secondary content: Fundraiser Tasks & Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Bake Sale Fundraiser Task Box */}
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
                    <CheckSquare style={{ width: '16px', height: '16px', color: '#b45309' }} />
                    Bake Sale Fundraiser
                  </h3>
                  <button
                    onClick={() => setActiveStream('merch_tasks')}
                    style={{
                      fontSize: '12px',
                      color: '#1e3a8a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    All Tasks →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: '#b45309' }}>Baking Duty</span>
                      <span style={{ color: '#64748b' }}>May 1, 6:00 PM</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      Bake 60 chocolate chip cookies
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Assigned: Priya S. (In Progress)
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      background: 'var(--muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: 600, color: '#15803d' }}>Table Shift</span>
                      <span style={{ color: '#64748b' }}>May 2, 10:00 AM</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      Staff Table Shift: 10 AM - 12 PM
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Assigned: Deepak Kumar (Scheduled)
                    </div>
                  </div>
                </div>
              </div>

              {/* Treasury Snapshot Box */}
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
                    <Landmark style={{ width: '16px', height: '16px', color: '#15803d' }} />
                    Closing the Books Ledger
                  </h3>
                  <button
                    onClick={() => setActiveStream('finance_announcements')}
                    style={{
                      fontSize: '12px',
                      color: '#1e3a8a',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Audit PDF →
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Total Inflow (Income)</span>
                    <span style={{ fontWeight: 600, color: '#15803d' }}>₹155,300</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Total Outflow (Expenses)</span>
                    <span style={{ fontWeight: 600, color: '#dc2626' }}>₹99,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, color: '#1e293b' }}>
                    <span>Net Closing Balance</span>
                    <span style={{ color: '#15803d', fontSize: '15px' }}>₹101,300</span>
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
