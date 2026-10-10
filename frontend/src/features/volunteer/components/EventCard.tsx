import React from 'react';
import { VolunteerEventAssignment } from '../types/volunteer.types';
import { Calendar, Clock, MapPin, CheckCircle, Info, Shield, QrCode } from 'lucide-react';

interface EventCardProps {
  assignment: VolunteerEventAssignment;
}

export const EventCard: React.FC<EventCardProps> = ({ assignment }) => {
  return (
    <div
      style={{
        background: 'var(--card-bg, #ffffff)',
        borderRadius: '14px',
        border: '1px solid var(--border-color, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        transition: 'all 0.2s ease',
      }}
      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md"
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              <CheckCircle style={{ width: '13px', height: '13px' }} />
              {assignment.assignmentStatus}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #dbeafe',
              }}
              className="dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
            >
              Official Duty
            </span>
          </div>

          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            Shift ID: #{assignment.id.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--foreground, #1e293b)',
            margin: '0 0 16px 0',
            letterSpacing: '-0.3px',
          }}
          className="text-slate-900 dark:text-slate-100"
        >
          {assignment.eventTitle}
        </h3>

        {/* Logistics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '18px',
            padding: '14px 16px',
            background: 'var(--muted, #f8fafc)',
            borderRadius: '10px',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
          className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              className="dark:bg-blue-950"
            >
              <Calendar style={{ width: '16px', height: '16px', color: '#1e3a8a' }} className="dark:text-blue-400" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Date</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-800 dark:text-slate-200">
                {assignment.date}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              className="dark:bg-amber-950"
            >
              <Clock style={{ width: '16px', height: '16px', color: '#b45309' }} className="dark:text-amber-400" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Shift Window</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-800 dark:text-slate-200">
                {assignment.time}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              className="dark:bg-rose-950"
            >
              <MapPin style={{ width: '16px', height: '16px', color: '#dc2626' }} className="dark:text-rose-400" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Station Location</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground, #1e293b)' }} className="text-slate-800 dark:text-slate-200">
                {assignment.location}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Duty Highlight */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            marginBottom: '18px',
          }}
          className="dark:bg-blue-950/30 dark:border-blue-900"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Shield style={{ width: '15px', height: '15px', color: '#1e3a8a' }} className="dark:text-blue-400" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', letterSpacing: '0.2px' }} className="dark:text-blue-300">
              YOUR VOLUNTEER RESPONSIBILITY:
            </span>
          </div>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1e293b',
              margin: 0,
              lineHeight: 1.5,
            }}
            className="dark:text-slate-100"
          >
            {assignment.responsibility}
          </p>
        </div>

        {/* Shift Day Briefing Checklist */}
        {assignment.briefingInstructions.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Info style={{ width: '15px', height: '15px', color: '#b45309' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground, #1e293b)' }} className="text-slate-800 dark:text-slate-200">
                Shift Day Briefing & Protocols:
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {assignment.briefingInstructions.map((instruction, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: 1.5,
                  }}
                  className="text-slate-600 dark:text-slate-400"
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#3b82f6',
                      marginTop: '7px',
                      flexShrink: 0,
                    }}
                  />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Strip */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
        className="border-slate-100 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
          <QrCode style={{ width: '15px', height: '15px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          <span>Badge Pass Required • Skyline Student Association</span>
        </div>
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#15803d',
            background: '#dcfce7',
            padding: '4px 10px',
            borderRadius: '6px',
          }}
          className="dark:bg-emerald-950/40 dark:text-emerald-400"
        >
          Check-in Desk Ready
        </span>
      </div>
    </div>
  );
};
