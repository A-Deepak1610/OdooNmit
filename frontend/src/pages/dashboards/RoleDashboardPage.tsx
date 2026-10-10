import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowRight,
  QrCode,
  Megaphone,
  DollarSign,
  PieChart,
  FileText,
  Building2,
  CreditCard,
  UserCheck,
} from 'lucide-react';

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
  path: string;
}

interface RoleConfig {
  title: string;
  subtitle: string;
  actionLabel: string;
  actionPath: string;
  stats: StatConfig[];
  actions: ActionConfig[];
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  // =========================================================================
  // 6. MEMBER / STUDENT
  // Uses the club's public and member-facing services:
  // Browse orgs, events, announcements, merch; register & pay dues;
  // view expiry/benefits; renew; buy tickets (QR passes); order status.
  // =========================================================================
  STUDENT: {
    title: 'Student Services Hub',
    subtitle: 'Browse recognized campus organizations, events, member discounts, merchandise, and access verified digital QR passes and receipts.',
    actionLabel: 'Browse Organizations',
    actionPath: '/student/organizations',
    stats: [
      { label: 'Organizations', value: '12 Active Charters', subtitle: 'Cultural, Tech & Academic clubs', color: '#1e3a8a', bg: '#eff6ff', icon: Building2 },
      { label: 'Membership Status', value: 'Active Member', subtitle: 'SSA-2026-0042 • Valid till Dec 2026', color: '#15803d', bg: '#dcfce7', icon: Users },
      { label: 'Confirmed QR Passes', value: '1 Pass Ready', subtitle: 'Spring Gala VIP Table #4', color: '#b45309', bg: '#fef3c7', icon: Ticket },
      { label: 'Member Notices', value: '4 Announcements', subtitle: '20% discounts & perks active', color: '#7c3aed', bg: '#f3e8ff', icon: Megaphone },
    ],
    actions: [
      { label: 'Browse Organizations', description: 'Explore student clubs, meeting venues, advisors, and join charters', color: '#1e3a8a', bg: '#eff6ff', icon: Building2, path: '/student/organizations' },
      { label: 'Browse Events & Buy Tickets', description: 'Book gala passes at member discount rates with instant QR door passes', color: '#15803d', bg: '#dcfce7', icon: Calendar, path: '/student/events' },
      { label: 'Ticket Confirmations & QR Codes', description: 'View confirmed event passes and digital admission barcodes', color: '#b45309', bg: '#fef3c7', icon: Ticket, path: '/student/tickets' },
      { label: 'Member Announcements & Discounts', description: 'View exclusive notices, discount codes, and meeting schedules', color: '#7c3aed', bg: '#f3e8ff', icon: Megaphone, path: '/student/announcements' },
      { label: 'Browse & Buy Merchandise', description: 'Order official club hoodies, stickers, and select apparel sizes', color: '#0d9488', bg: '#ccfbf1', icon: ShoppingBag, path: '/student/merchandise' },
      { label: 'Membership Status, Expiry & Renewal', description: 'Inspect membership card, check expiry date, benefits, and renew annual dues', color: '#1e3a8a', bg: '#eff6ff', icon: UserCheck, path: '/student/membership' },
      { label: 'Register for Organization & Dues', description: 'Enroll in clubs and pay annual membership dues (₹250 via Razorpay)', color: '#15803d', bg: '#dcfce7', icon: CreditCard, path: '/student/apply-membership' },
      { label: 'Order & Payment Status', description: 'Review order fulfillment status, Razorpay receipts, and HMAC hashes', color: '#475569', bg: '#f1f5f9', icon: Receipt, path: '/student/orders' },
    ],
  },

  MEMBER: {
    title: 'Club Member Portal',
    subtitle: 'Access digital membership pass, discounted event tickets with QR codes, merchandise orders, and member notices.',
    actionLabel: 'View Member Pass',
    actionPath: '/member/membership',
    stats: [
      { label: 'Membership Tier', value: 'Active Member', subtitle: 'Annual dues paid • No arrears', color: '#15803d', bg: '#dcfce7', icon: Users },
      { label: 'Gala Discount', value: '60% Claimed', subtitle: 'VIP Table Seat #4 Confirmed', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket },
      { label: 'Apparel Orders', value: '1 Active Order', subtitle: 'Embroidered hoodie in processing', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag },
      { label: 'Club Notices', value: '4 Announcements', subtitle: 'Latest updates replacing WhatsApp', color: '#7c3aed', bg: '#f3e8ff', icon: Megaphone },
    ],
    actions: [
      { label: 'Digital Member Pass & QR', description: 'Show verified digital ID badge at event doors and booths', color: '#15803d', bg: '#dcfce7', icon: Users, path: '/member/membership' },
      { label: 'My Event Tickets', description: 'Access confirmed ticket QR codes for the Spring Gala', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket, path: '/member/tickets' },
      { label: 'Order Merchandise', description: 'Purchase club hoodies and track delivery status', color: '#b45309', bg: '#fef3c7', icon: ShoppingBag, path: '/member/merchandise' },
      { label: 'Member Announcements', description: 'View meeting schedules, elections notices, and discount codes', color: '#7c3aed', bg: '#f3e8ff', icon: Megaphone, path: '/member/announcements' },
    ],
  },

  // =========================================================================
  // 4. EVENT ORGANIZER
  // Runs events from setup through check-in and reporting:
  // Create events, set member/non-member prices, monitor capacity,
  // scan tickets & prevent duplicates, verify membership, view revenue.
  // =========================================================================
  EVENT_ORGANIZER: {
    title: 'Event Organizer Console',
    subtitle: 'Manage events, configure member/non-member pricing, monitor ticket quotas, scan tickets, and track live turnout revenue.',
    actionLabel: 'Create New Event',
    actionPath: '/organizer/events',
    stats: [
      { label: 'Spring Gala Quota', value: '420 / 500 Seats', subtitle: '84% booked online', color: '#1e3a8a', bg: '#eff6ff', icon: Ticket },
      { label: 'Ticket Revenue', value: '₹58,500', subtitle: 'Direct collections into club books', color: '#15803d', bg: '#dcfce7', icon: Landmark },
      { label: 'Entrance Turnout', value: '385 Scanned', subtitle: '91.6% turnout rate verified at door', color: '#b45309', bg: '#fef3c7', icon: QrCode },
      { label: 'Ticket Pricing', value: '₹150 / ₹250', subtitle: 'Member discount pricing applied', color: '#7c3aed', bg: '#f3e8ff', icon: DollarSign },
    ],
    actions: [
      { label: 'Create & Setup Event', description: 'Set date, venue, capacity, and member/non-member ticket prices', color: '#1e3a8a', bg: '#eff6ff', icon: Calendar, path: '/organizer/events' },
      { label: 'Door Check-in Scanner', description: 'Scan QR tickets in seconds and prevent duplicate admission', color: '#15803d', bg: '#dcfce7', icon: QrCode, path: '/volunteer/scanner' },
      { label: 'Attendance & Revenue Reports', description: 'Track live attendance count and total ticket revenue', color: '#b45309', bg: '#fef3c7', icon: PieChart, path: '/organizer/attendees' },
      { label: 'Publish Event Announcement', description: 'Broadcast event schedule updates directly to registered guests', color: '#7c3aed', bg: '#f3e8ff', icon: Megaphone, path: '/student/announcements' },
    ],
  },

  // =========================================================================
  // 3. TREASURER
  // Responsible for money, records, and reimbursements:
  // Track dues, tickets, merch, fundraisers; categorize expenses;
  // review receipts; approve/reject reimbursements; closing balance reports.
  // =========================================================================
  TREASURER: {
    title: 'Treasurer Financial Books & Ledger',
    subtitle: 'Track dues, ticket sales, merch income, categorize expenses, review volunteer receipts, and close the semester books.',
    actionLabel: 'Record Expense',
    actionPath: '/treasurer/transactions',
    stats: [
      { label: 'Closing Net Balance', value: '₹101,300', subtitle: 'Audited semester treasury surplus', color: '#15803d', bg: '#dcfce7', icon: Landmark },
      { label: 'Total Inflows', value: '₹155,300', subtitle: 'Dues + Gala tickets + Merch + Bake Sale', color: '#1e3a8a', bg: '#eff6ff', icon: DollarSign },
      { label: 'Total Outflows', value: '₹99,000', subtitle: 'Venue, catering, and reimbursements', color: '#dc2626', bg: '#fef2f2', icon: Receipt },
      { label: 'Reimbursement Audit', value: '1 Pending', subtitle: '₹450 awaiting receipt review', color: '#b45309', bg: '#fef3c7', icon: CheckSquare },
    ],
    actions: [
      { label: 'Reimbursement Audit Queue', description: 'Inspect volunteer receipts, approve/reject, and record bank payouts', color: '#15803d', bg: '#dcfce7', icon: Receipt, path: '/treasurer/reimbursements' },
      { label: 'Record & Categorize Expense', description: 'Log outflows across venue, baking supplies, and equipment', color: '#1e3a8a', bg: '#eff6ff', icon: DollarSign, path: '/treasurer/transactions' },
      { label: 'Membership Dues Verification', description: 'Audit 194 paid student membership dues records', color: '#b45309', bg: '#fef3c7', icon: Users, path: '/president/members' },
      { label: 'Generate Semester Report', description: 'Export complete closing income, expense, and balance statement', color: '#7c3aed', bg: '#f3e8ff', icon: FileText, path: '/treasurer/reports' },
    ],
  },

  // =========================================================================
  // 2. CLUB PRESIDENT / ORGANIZATION ADMIN
  // Oversees the club's activities and leadership:
  // Manage profile/website; publish announcements; oversee events, merch,
  // fundraisers; view reports; assign duties; review financial summaries.
  // =========================================================================
  PRESIDENT: {
    title: 'Club President Executive Suite',
    subtitle: 'Oversees Skyline Student Association activities, announcements, events, merchandise, fundraisers, and semester reports.',
    actionLabel: 'Broadcast Announcement',
    actionPath: '/president/announcements',
    stats: [
      { label: 'Total Membership', value: '248 Members', subtitle: '194 dues paid • 54 renewals pending', color: '#1e3a8a', bg: '#eff6ff', icon: Users },
      { label: 'Spring Gala Target', value: '84% Booked', subtitle: '₹58,500 ticket sales • 385 turnout', color: '#15803d', bg: '#dcfce7', icon: Ticket },
      { label: 'Treasury Surplus', value: '₹101,300', subtitle: 'Audited semester financial surplus', color: '#15803d', bg: '#dcfce7', icon: Landmark },
      { label: 'Bake Sale Fundraiser', value: '₹28,500 Raised', subtitle: '81.4% toward ₹35,000 charity goal', color: '#b45309', bg: '#fef3c7', icon: Trophy },
    ],
    actions: [
      { label: 'Broadcast Official Announcement', description: 'Post once to reach all members, replacing chaotic WhatsApp groups', color: '#1e3a8a', bg: '#eff6ff', icon: Megaphone, path: '/president/announcements' },
      { label: 'Assign Responsibilities & Squads', description: 'Allocate tasks to event organizers and volunteer bake sale squads', color: '#15803d', bg: '#dcfce7', icon: CheckSquare, path: '/volunteer/tasks' },
      { label: 'Review Financial Summaries', description: 'Inspect closing balances, approved expenses, and audit books', color: '#b45309', bg: '#fef3c7', icon: Landmark, path: '/president/finance' },
      { label: 'Manage Club Profile & Website', description: 'Update public club description, banner, and membership dues terms', color: '#7c3aed', bg: '#f3e8ff', icon: Sparkles, path: '/president/members' },
    ],
  },

  // =========================================================================
  // 5. VOLUNTEER (Fallback view)
  // =========================================================================
  VOLUNTEER: {
    title: 'Volunteer Operations Desk',
    subtitle: 'Complete assigned fundraiser tasks, check shift duties, and submit out-of-pocket supply reimbursements.',
    actionLabel: 'Open Volunteer Portal',
    actionPath: '/volunteer/dashboard',
    stats: [
      { label: 'Assigned Duties', value: '3 Active Tasks', subtitle: 'Baking & quad table shifts', color: '#1e3a8a', bg: '#eff6ff', icon: CheckSquare },
      { label: 'Next Event Shift', value: 'May 2 (Quad)', subtitle: 'Plaza Booth Table Duty', color: '#15803d', bg: '#dcfce7', icon: Calendar },
      { label: 'Expense Claims', value: '1 Pending', subtitle: '₹450 receipt under review', color: '#b45309', bg: '#fef3c7', icon: Receipt },
      { label: 'Volunteer Service', value: '14.5 Hours', subtitle: 'Logged for current semester', color: '#7c3aed', bg: '#f3e8ff', icon: Trophy },
    ],
    actions: [
      { label: 'Bake Sale Task Board', description: 'Update progress: To do, In progress, or Done', color: '#1e3a8a', bg: '#eff6ff', icon: CheckSquare, path: '/volunteer/tasks' },
      { label: 'Door Ticket Scanner', description: 'Admit guests at venue entrance with event permissions', color: '#15803d', bg: '#dcfce7', icon: QrCode, path: '/volunteer/scanner' },
      { label: 'Submit Reimbursement Claim', description: 'Upload receipts for baking ingredients & supplies', color: '#b45309', bg: '#fef3c7', icon: Receipt, path: '/volunteer/expenses' },
      { label: 'Shift Roster & Briefing', description: 'View station location, timing, and duty instructions', color: '#7c3aed', bg: '#f3e8ff', icon: Calendar, path: '/volunteer/events' },
    ],
  },
};

export const RoleDashboardPage: React.FC<RoleDashboardProps> = ({ role }) => {
  const navigate = useNavigate();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

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
              Skyline Student Association
            </span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {role.replace('_', ' ')} Role Workspace
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
            {config.title}
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }} className="text-slate-500 dark:text-slate-400">
            {config.subtitle}
          </p>
        </div>

        <button
          onClick={() => navigate(config.actionPath)}
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
          <span>{config.actionLabel}</span>
        </button>
      </div>

      {/* ── 2. Stat Cards (4-column) ──────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {config.stats.map((stat, i) => {
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

      {/* ── 3. Quick Action Cards (4-column) ──────────────────────── */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--foreground, #1e293b)' }}>
          Assigned Role Workspaces & Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {config.actions.map((act, i) => {
            const Icon = act.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(act.path)}
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = act.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)';
                }}
              >
                <div>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: act.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <Icon style={{ width: '20px', height: '20px', color: act.color }} />
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: 'var(--foreground, #1e293b)',
                      marginBottom: '6px',
                    }}
                    className="text-slate-900 dark:text-slate-100"
                  >
                    {act.label}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                    {act.description}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: act.color,
                  }}
                >
                  <span>Open Workspace</span>
                  <ArrowRight style={{ width: '13px', height: '13px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Main Role Content Modules ──────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column (2fr): Primary Role Ledger / Action Center */}
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
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
              {role === 'TREASURER'
                ? 'Semester Income & Expense Breakdown'
                : role === 'PRESIDENT'
                ? 'Club Leadership & Program Health'
                : role === 'EVENT_ORGANIZER'
                ? 'Live Event Capacity & Ticket Sales'
                : 'My Club Status & Pass Privileges'}
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#15803d',
                background: '#dcfce7',
                padding: '3px 8px',
                borderRadius: '4px',
              }}
            >
              VERIFIED ACTIVE
            </span>
          </div>

          {role === 'TREASURER' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Student Membership Dues (194 Paid)</span>
                <strong style={{ color: '#15803d' }}>+ ₹48,500</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Spring Gala Ticket Collections (420 Sold)</span>
                <strong style={{ color: '#15803d' }}>+ ₹58,500</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Charity Bake Sale Inflow</span>
                <strong style={{ color: '#15803d' }}>+ ₹28,500</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Official Hoodies Merchandise Income</span>
                <strong style={{ color: '#15803d' }}>+ ₹19,800</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Venue & Stage Booking Outflows</span>
                <strong style={{ color: '#dc2626' }}>- ₹65,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Approved Volunteer Reimbursements (Disbursed)</span>
                <strong style={{ color: '#dc2626' }}>- ₹12,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontWeight: 700, fontSize: '15px' }}>
                <span>Audited Closing Semester Balance</span>
                <span style={{ color: '#15803d' }}>₹101,300</span>
              </div>
            </div>
          ) : role === 'EVENT_ORGANIZER' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--muted, #f8fafc)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong>Skyline Annual Spring Gala 2026</strong>
                  <span style={{ color: '#1e3a8a', fontWeight: 600 }}>420 / 500 Seats (84%)</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '84%', background: '#3b82f6' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  <span>Member Tier: ₹150 • General: ₹250</span>
                  <span>Turnout: 385 Scanned (91.6%)</span>
                </div>
              </div>

              <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--muted, #f8fafc)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong>Inter-College Hackathon 2026</strong>
                  <span style={{ color: '#15803d', fontWeight: 600 }}>160 / 160 Seats (100% Sold Out)</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '100%', background: '#10b981' }} />
                </div>
              </div>
            </div>
          ) : role === 'PRESIDENT' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '13px' }}>
                <strong style={{ color: '#1e3a8a' }}>Official Announcement Pipeline:</strong> Replaces uncoordinated WhatsApp messages with authoritative broadcasts. All 248 members receive notifications instantly.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Total Paid Dues Compliance</span>
                <strong style={{ color: '#15803d' }}>78.2% (194/248)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Active Volunteer Squad Tasks</span>
                <strong style={{ color: '#1e3a8a' }}>8 Tasks in Progress</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#64748b' }}>Treasury Solvency Status</span>
                <strong style={{ color: '#15803d' }}>Audited Surplus (+₹101,300)</strong>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                <div style={{ fontWeight: 700, color: '#065f46', marginBottom: '2px' }}>
                  Verified Skyline Club Membership
                </div>
                <div style={{ fontSize: '12px', color: '#047857' }}>
                  Cardholder: {role} User • Pass ID: SSA-2026-0042 • Dues Current
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Spring Gala VIP Table Pass</span>
                <strong style={{ color: '#1e3a8a' }}>QR Pass Ready</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span style={{ color: '#64748b' }}>Merchandise Order: Navy Hoodie</span>
                <strong style={{ color: '#15803d' }}>Reserved (Size L)</strong>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1fr): Operational Actions & Quick Links */}
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
            gap: '16px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--foreground, #1e293b)' }}>
              {role === 'TREASURER'
                ? 'Pending Reimbursements Queue'
                : role === 'EVENT_ORGANIZER'
                ? 'Door Check-in Desk'
                : role === 'PRESIDENT'
                ? 'Appointed Officers'
                : 'Member Discounts & Benefits'}
            </h3>

            {role === 'TREASURER' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: '#fef3c7', border: '1px solid #fde68a' }}>
                  <div style={{ fontWeight: 700, color: '#92400e' }}>Bake Sale Heavy-duty Trays</div>
                  <div style={{ color: '#78350f', fontSize: '12px', marginTop: '2px' }}>
                    Claimant: RITHISH S • Amount: ₹450 • Receipt attached
                  </div>
                  <button
                    onClick={() => navigate('/treasurer/reimbursements')}
                    style={{
                      marginTop: '8px',
                      padding: '4px 10px',
                      background: '#b45309',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Audit Receipt & Approve
                  </button>
                </div>
              </div>
            ) : role === 'EVENT_ORGANIZER' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Door marshals are stationed at Main Auditorium East Gate. Scan QR tickets in real time to prevent duplicate entrance.
                </p>
                <button
                  onClick={() => navigate('/volunteer/scanner')}
                  style={{
                    padding: '10px',
                    background: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <QrCode style={{ width: '16px', height: '16px' }} />
                  <span>Launch Door Ticket Scanner</span>
                </button>
              </div>
            ) : role === 'PRESIDENT' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Treasurer</span>
                  <strong>Deepak A</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Event Organizer</span>
                  <strong>Priya Sharma</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>Volunteer Squad Lead</span>
                  <strong>Rithish S</strong>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ padding: '10px', borderRadius: '6px', background: '#eff6ff', color: '#1e3a8a' }}>
                  ✓ 60% discount on all Spring Gala tickets
                </div>
                <div style={{ padding: '10px', borderRadius: '6px', background: '#eff6ff', color: '#1e3a8a' }}>
                  ✓ 20% discount on official hoodies & merch
                </div>
                <div style={{ padding: '10px', borderRadius: '6px', background: '#eff6ff', color: '#1e3a8a' }}>
                  ✓ Voting eligibility in annual officer elections
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', fontSize: '12px', color: '#94a3b8' }}>
            CampusMitra Student Organization System • Role-Based Access Control
          </div>
        </div>
      </div>
    </div>
  );
};
