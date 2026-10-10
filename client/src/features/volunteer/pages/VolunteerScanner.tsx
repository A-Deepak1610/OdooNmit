import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../services/volunteerApi';
import { DoorTicket } from '../types/volunteer.types';
import { useClubStore } from '../../../stores/club.store';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Ticket,
  RefreshCw,
  Sparkles,
  Lock,
  ShieldCheck,
  UserCheck,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export const VolunteerScanner: React.FC = () => {
  const { members } = useClubStore();
  const [tickets, setTickets] = useState<DoorTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'PENDING' | 'ADMITTED'>('ALL');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    ticket?: DoorTicket;
  } | null>(null);

  // Requirement: "Verify memberships or check tickets only if explicitly granted event-day permissions"
  const [hasEventDayPermission, setHasEventDayPermission] = useState(true);
  const [activeMode, setActiveMode] = useState<'TICKETS' | 'MEMBERSHIP'>('TICKETS');

  // Membership Verification State
  const [memberLookupQuery, setMemberLookupQuery] = useState('');
  const [verifiedMember, setVerifiedMember] = useState<{
    found: boolean;
    member?: any;
    message: string;
  } | null>(null);

  const loadTickets = async () => {
    try {
      const data = await volunteerApi.getTickets();
      setTickets(data);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const totalSold = 420;
  const admittedCount = tickets.filter((t) => t.admitted).length + 383; // Base demo count
  const pendingCount = Math.max(0, totalSold - admittedCount);
  const turnoutPercent = ((admittedCount / totalSold) * 100).toFixed(1);

  const handleQuickAdmit = async (ticketIdOrCode: string) => {
    setScanResult(null);
    try {
      const res = await volunteerApi.admitTicket(ticketIdOrCode);
      if (res.success) {
        setScanResult({
          type: 'success',
          message: res.message,
          ticket: res.ticket,
        });
      } else {
        setScanResult({
          type: 'warning',
          message: res.message,
          ticket: res.ticket,
        });
      }
      loadTickets();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Invalid ticket or ticket code not found.';
      setScanResult({
        type: 'error',
        message: errMsg,
      });
    }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim() || !hasEventDayPermission) return;
    handleQuickAdmit(scanInput.trim());
    setScanInput('');
  };

  const handleMemberLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberLookupQuery.trim() || !hasEventDayPermission) return;
    const q = memberLookupQuery.trim().toLowerCase();
    const found = members.find(
      (m) =>
        m.membershipId.toLowerCase() === q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.id.toLowerCase() === q
    );

    if (found) {
      setVerifiedMember({
        found: true,
        member: found,
        message:
          found.duesPaid
            ? `Verified Active Member: ${found.name} (${found.membershipId}). Eligible for Member-Discount Pass.`
            : `Membership Arrears: ${found.name} (${found.membershipId}) has pending annual dues. Standard admission applies.`,
      });
    } else {
      setVerifiedMember({
        found: false,
        message: `No registered membership record found for "${memberLookupQuery}". Not an active club member.`,
      });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (tabFilter === 'PENDING' && t.admitted) return false;
    if (tabFilter === 'ADMITTED' && !t.admitted) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.guestName.toLowerCase().includes(q) ||
      t.seatInfo.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-family-body)' }}>
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
              <QrCode style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
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
              Door Check-in & Verification Desk
            </h1>
          </div>
          <p
            style={{ fontSize: '14px', color: '#64748b', margin: 0 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Check event tickets and verify membership status at the door (access requires explicit event-day organizer permissions).
          </p>
        </div>

        <button
          onClick={loadTickets}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--card-bg, #ffffff)',
            color: 'var(--foreground, #334155)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ── 2. Event-Day Permission Status Guard ──────────────────── */}
      <div
        style={{
          background: hasEventDayPermission ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${hasEventDayPermission ? '#a7f3d0' : '#fecaca'}`,
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
        className={hasEventDayPermission ? 'dark:bg-emerald-950/40 dark:border-emerald-800' : 'dark:bg-rose-950/40 dark:border-rose-900'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: hasEventDayPermission ? '#dcfce7' : '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasEventDayPermission ? '#15803d' : '#dc2626',
              flexShrink: 0,
            }}
          >
            {hasEventDayPermission ? (
              <ShieldCheck style={{ width: '22px', height: '22px' }} />
            ) : (
              <Lock style={{ width: '22px', height: '22px' }} />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: hasEventDayPermission ? '#15803d' : '#dc2626',
                }}
              >
                {hasEventDayPermission ? 'Event-Day Permission: GRANTED' : 'Event-Day Permission: LOCKED'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>• Assigned Shift: Spring Gala East Gate</span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '13px', color: hasEventDayPermission ? '#065f46' : '#991b1b', lineHeight: 1.4 }}>
              {hasEventDayPermission
                ? 'The Event Organizer has granted door check-in permissions for your shift. You may check tickets and verify student memberships.'
                : 'Volunteers can only verify memberships or check tickets if explicitly granted event-day permissions by the Event Organizer.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHasEventDayPermission(!hasEventDayPermission)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '1px solid',
            borderColor: hasEventDayPermission ? '#bbf7d0' : '#fca5a5',
            background: '#ffffff',
            color: hasEventDayPermission ? '#15803d' : '#dc2626',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          className="hover:opacity-90 dark:bg-slate-900"
        >
          {hasEventDayPermission ? <ToggleRight style={{ width: '16px', height: '16px' }} /> : <ToggleLeft style={{ width: '16px', height: '16px' }} />}
          <span>{hasEventDayPermission ? 'Simulate Revoked Permission' : 'Grant Event-Day Permission'}</span>
        </button>
      </div>

      {/* ── 3. Operation Mode Selector Tabs ───────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveMode('TICKETS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeMode === 'TICKETS' ? '#1e3a8a' : 'transparent',
            color: activeMode === 'TICKETS' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          className={activeMode !== 'TICKETS' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Ticket style={{ width: '15px', height: '15px' }} />
          <span>Check Tickets & Passes ({tickets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('MEMBERSHIP')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            background: activeMode === 'MEMBERSHIP' ? '#1e3a8a' : 'transparent',
            color: activeMode === 'MEMBERSHIP' ? '#ffffff' : '#64748b',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          className={activeMode !== 'MEMBERSHIP' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <UserCheck style={{ width: '15px', height: '15px' }} />
          <span>Verify Memberships ({members.length})</span>
        </button>
      </div>

      {!hasEventDayPermission ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            border: '1px solid #fecaca',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
          className="bg-white dark:bg-slate-900"
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
            }}
          >
            <Lock style={{ width: '32px', height: '32px' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', margin: '0 0 6px 0' }}>
              Event-Day Door Permissions Required
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
              Under student organization policy, volunteers can only verify memberships or check tickets if explicitly granted event-day permissions by the Event Organizer for their shift.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasEventDayPermission(true)}
            style={{
              padding: '10px 22px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck style={{ width: '16px', height: '16px' }} />
            <span>Simulate Granting Shift Permission</span>
          </button>
        </div>
      ) : activeMode === 'TICKETS' ? (
        <>
      {/* ── 2. Real-Time Turnout Stat Cards ───────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        <div
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
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-emerald-950"
          >
            <CheckCircle2 style={{ width: '22px', height: '22px', color: '#15803d' }} className="dark:text-emerald-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Admitted Turnout
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }} className="dark:text-emerald-400">
              {admittedCount} / {totalSold}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              {turnoutPercent}% verified at East Gate
            </div>
          </div>
        </div>

        <div
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
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-blue-950"
          >
            <Users style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Pending Arrival
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a8a' }} className="dark:text-blue-400">
              {pendingCount} Guests
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Awaiting entrance check-in
            </div>
          </div>
        </div>

        <div
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
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-amber-950"
          >
            <Clock style={{ width: '22px', height: '22px', color: '#b45309' }} className="dark:text-amber-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Station Status
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
              LIVE • Door 1
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Main Auditorium East Gate Desk
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Quick Scanner Bar ──────────────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Sparkles style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
            Rapid Barcode / Pass Code Lookup
          </h2>
        </div>

        <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            >
              <QrCode style={{ width: '18px', height: '18px' }} />
            </span>
            <input
              type="text"
              placeholder="Scan QR or enter Ticket Code (e.g. GALA-TKT-1089, GALA-TKT-1091)..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 42px',
                fontSize: '14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                background: 'var(--input-bg, #ffffff)',
                color: 'var(--foreground, #1e293b)',
                outline: 'none',
              }}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <CheckCircle2 style={{ width: '16px', height: '16px' }} />
            <span>Verify & Admit</span>
          </button>
        </form>

        {/* Feedback Alert */}
        {scanResult && (
          <div
            style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background:
                scanResult.type === 'success'
                  ? '#ecfdf5'
                  : scanResult.type === 'warning'
                  ? '#fef3c7'
                  : '#fef2f2',
              border: `1px solid ${
                scanResult.type === 'success'
                  ? '#a7f3d0'
                  : scanResult.type === 'warning'
                  ? '#fde68a'
                  : '#fecaca'
              }`,
              color:
                scanResult.type === 'success'
                  ? '#065f46'
                  : scanResult.type === 'warning'
                  ? '#92400e'
                  : '#dc2626',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {scanResult.type === 'success' ? (
                <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              ) : (
                <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              )}
              <div>
                <strong>{scanResult.message}</strong>
                {scanResult.ticket && (
                  <span style={{ marginLeft: '8px', opacity: 0.9 }}>
                    [Ticket: {scanResult.ticket.ticketCode} • Seat: {scanResult.ticket.seatInfo}]
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setScanResult(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '12px',
                color: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Guest Roster & Ticket Verification Table ───────────── */}
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
        {/* Toolbar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
          className="border-slate-100 dark:border-slate-800"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setTabFilter('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: tabFilter === 'ALL' ? '#1e3a8a' : 'var(--muted, #f1f5f9)',
                color: tabFilter === 'ALL' ? 'white' : '#64748b',
              }}
            >
              All Passes ({tickets.length})
            </button>
            <button
              onClick={() => setTabFilter('PENDING')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: tabFilter === 'PENDING' ? '#1e3a8a' : 'var(--muted, #f1f5f9)',
                color: tabFilter === 'PENDING' ? 'white' : '#64748b',
              }}
            >
              Pending ({tickets.filter((t) => !t.admitted).length})
            </button>
            <button
              onClick={() => setTabFilter('ADMITTED')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: tabFilter === 'ADMITTED' ? '#1e3a8a' : 'var(--muted, #f1f5f9)',
                color: tabFilter === 'ADMITTED' ? 'white' : '#64748b',
              }}
            >
              Admitted ({tickets.filter((t) => t.admitted).length})
            </button>
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
              placeholder="Search name, ticket code, seat..."
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

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
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
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Ticket Code</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Guest Name</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Ticket Tier</th>
                <th style={{ padding: '14px 16px', fontWeight: 600 }}>Seat / Table Info</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>Entrance Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  style={{
                    borderBottom: '1px solid var(--border-color, #f1f5f9)',
                    transition: 'background-color 0.15s ease',
                  }}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                >
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Ticket style={{ width: '16px', height: '16px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px' }}>
                        {ticket.ticketCode}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
                      {ticket.guestName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{ticket.email}</div>
                  </td>

                  <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background:
                          ticket.tier === 'VIP'
                            ? '#fef3c7'
                            : ticket.tier === 'STUDENT_MEMBER'
                            ? '#eff6ff'
                            : '#f1f5f9',
                        color:
                          ticket.tier === 'VIP'
                            ? '#b45309'
                            : ticket.tier === 'STUDENT_MEMBER'
                            ? '#1e3a8a'
                            : '#475569',
                      }}
                      className={
                        ticket.tier === 'VIP'
                          ? 'dark:bg-amber-950/40 dark:text-amber-400'
                          : ticket.tier === 'STUDENT_MEMBER'
                          ? 'dark:bg-blue-950/40 dark:text-blue-400'
                          : 'dark:bg-slate-800 dark:text-slate-300'
                      }
                    >
                      {ticket.tier === 'VIP'
                        ? 'VIP Pass (₹500)'
                        : ticket.tier === 'STUDENT_MEMBER'
                        ? 'Member Pass (₹150)'
                        : 'General Pass (₹250)'}
                    </span>
                  </td>

                  <td style={{ padding: '16px 16px', color: '#475569', fontSize: '13px' }}>
                    {ticket.seatInfo}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {ticket.admitted ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                        }}
                        className="dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      >
                        <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                        <span>Admitted ({ticket.admittedAt || 'Live'})</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuickAdmit(ticket.ticketCode)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#1e3a8a',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                        <span>Admit Guest</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        /* ── 4. MEMBERSHIP VERIFICATION MODE ────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Membership Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
            }}
          >
            <div
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
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                className="dark:bg-emerald-950"
              >
                <CheckCircle2 style={{ width: '22px', height: '22px', color: '#15803d' }} className="dark:text-emerald-400" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
                  Active Dues-Paid Members
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }} className="dark:text-emerald-400">
                  {members.filter((m) => m.duesPaid).length} / {members.length}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Eligible for gala member discount tickets
                </div>
              </div>
            </div>

            <div
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
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                className="dark:bg-amber-950"
              >
                <Clock style={{ width: '22px', height: '22px', color: '#b45309' }} className="dark:text-amber-400" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
                  Pending Dues / Inactive
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#b45309' }} className="dark:text-amber-400">
                  {members.filter((m) => !m.duesPaid).length} Students
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Must renew dues (₹250) or pay general fare
                </div>
              </div>
            </div>

            <div
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
                  background: '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                className="dark:bg-blue-950"
              >
                <UserCheck style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
                  Door Verification Desk
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
                  Desk #1 Active
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Instant Roll No & ID lookup active
                </div>
              </div>
            </div>
          </div>

          {/* Membership Lookup Box */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid var(--border-color, #e2e8f0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <UserCheck style={{ width: '18px', height: '18px', color: '#1e3a8a' }} className="dark:text-blue-400" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                Verify Student Membership at Entrance Door
              </h2>
            </div>

            <form onSubmit={handleMemberLookup} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    width: '18px',
                    height: '18px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Enter Student Roll No (e.g. 24CS108, 23IT045), Name, or Email..."
                  value={memberLookupQuery}
                  onChange={(e) => setMemberLookupQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 42px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #1e293b)',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <UserCheck style={{ width: '16px', height: '16px' }} />
                <span>Verify Member</span>
              </button>
            </form>

            {/* Verified Member Result Card */}
            {verifiedMember && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: verifiedMember.found && verifiedMember.member?.duesPaid ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${verifiedMember.found && verifiedMember.member?.duesPaid ? '#a7f3d0' : '#fecaca'}`,
                  color: verifiedMember.found && verifiedMember.member?.duesPaid ? '#065f46' : '#991b1b',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {verifiedMember.found && verifiedMember.member?.duesPaid ? (
                      <CheckCircle2 style={{ width: '22px', height: '22px', flexShrink: 0, color: '#15803d' }} />
                    ) : (
                      <AlertCircle style={{ width: '22px', height: '22px', flexShrink: 0, color: '#dc2626' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{verifiedMember.message}</div>
                      {verifiedMember.member && (
                        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                          Club: Skyline Student Association • Tier: {verifiedMember.member.tier} • Valid Expiry: {verifiedMember.member.duesExpiresAt}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerifiedMember(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                      color: 'inherit',
                      textDecoration: 'underline',
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Members Roster Table */}
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
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              className="border-slate-100 dark:border-slate-800"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--foreground, #1e293b)' }}>
                  Club Membership Verification Register
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                  ({members.length} records)
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Door ID & Member Discount Verification
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
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
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Roll Number</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Student Member</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Club</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Member Tier</th>
                    <th style={{ padding: '14px 16px', fontWeight: 600 }}>Expiry Date</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'center' }}>Dues Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #f1f5f9)',
                        transition: 'background-color 0.15s ease',
                      }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                    >
                      <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700 }}>
                        {member.membershipId}
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--foreground, #1e293b)' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{member.email}</div>
                      </td>
                      <td style={{ padding: '16px 16px', color: '#475569' }}>
                        Skyline Student Association
                      </td>
                      <td style={{ padding: '16px 16px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1e3a8a',
                          }}
                        >
                          {member.tier}
                        </span>
                      </td>
                      <td style={{ padding: '16px 16px', color: '#64748b', fontSize: '12px' }}>
                        {member.duesExpiresAt}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {member.duesPaid ? (
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
                            }}
                          >
                            <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                            <span>Active (Eligible)</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              background: '#fef3c7',
                              color: '#b45309',
                            }}
                          >
                            <Clock style={{ width: '13px', height: '13px' }} />
                            <span>Pending Dues</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
