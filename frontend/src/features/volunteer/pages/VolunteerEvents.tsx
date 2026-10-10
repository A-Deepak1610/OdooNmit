import React from 'react';
import { useVolunteerEvents } from '../hooks/useVolunteerEvents';
import { EventCard } from '../components/EventCard';
import {
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react';

export const VolunteerEvents: React.FC = () => {
  const { events, loading, error, refreshEvents } = useVolunteerEvents();

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
              <Calendar style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
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
              Event Duty & Shift Assignments
            </h1>
          </div>
          <p
            style={{ fontSize: '14px', color: '#64748b', margin: 0 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Confirmed volunteering shifts, venue locations, check-in logistics, and day-of briefing protocols.
          </p>
        </div>

        <button
          onClick={refreshEvents}
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
            transition: 'all 0.15s ease',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw style={{ width: '15px', height: '15px' }} />
          <span>Refresh Shifts</span>
        </button>
      </div>

      {/* ── 2. Stat Cards Row (3-col) ────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-blue-950"
          >
            <Calendar style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Scheduled Shift
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
              {events.length} Confirmed
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Skyline Annual Spring Gala 2026
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
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-emerald-950"
          >
            <Clock style={{ width: '22px', height: '22px', color: '#15803d' }} className="dark:text-emerald-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Shift Duration
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
              5.0 Hours
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              05:30 PM - 10:30 PM Window
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
            <MapPin style={{ width: '22px', height: '22px', color: '#b45309' }} className="dark:text-amber-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Duty Station
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-900 dark:text-slate-100">
              East Gate Desk
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Main Auditorium Entrance
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Role Boundary & Privacy Notice ────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          fontSize: '13px',
          color: '#475569',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
      >
        <ShieldCheck style={{ width: '20px', height: '20px', color: '#15803d', flexShrink: 0 }} />
        <span>
          <strong>Volunteer Role Boundary:</strong> Displays your allocated shift responsibilities and venue instructions. Guest registries, VIP seating lists, and financial payment journals are protected under Event Organizer and Treasurer authorization.
        </span>
      </div>

      {/* ── 4. Error State ──────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle style={{ width: '18px', height: '18px' }} />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshEvents}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 5. Loading State ────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <Loader2 style={{ width: '28px', height: '28px', color: '#1e3a8a' }} className="animate-spin" />
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Loading allocated event shifts...
          </p>
        </div>
      )}

      {/* ── 6. Empty State ──────────────────────────────────────────────── */}
      {!loading && events.length === 0 && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #e2e8f0)',
            padding: '48px 24px',
            textAlign: 'center',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <Calendar style={{ width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: 'var(--foreground, #1e293b)' }}>
            No Active Event Shifts
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            You do not have any upcoming event shifts assigned yet.
          </p>
        </div>
      )}

      {/* ── 7. Events Grid ──────────────────────────────────────────────── */}
      {!loading && events.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '24px',
          }}
        >
          {events.map((assignment) => (
            <EventCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};
