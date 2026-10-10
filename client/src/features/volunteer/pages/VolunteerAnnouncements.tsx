import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../services/volunteerApi';
import { ClubAnnouncement } from '../types/volunteer.types';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Users,
  RefreshCw,
  Search,
  Loader2,
} from 'lucide-react';

export const VolunteerAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<ClubAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'VOLUNTEER_BRIEFING' | 'MEETING' | 'DEADLINE'>('ALL');
  const [search, setSearch] = useState('');

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await volunteerApi.getAnnouncements();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleAcknowledge = async (id: string) => {
    await volunteerApi.acknowledgeAnnouncement(id);
    loadAnnouncements();
  };

  const filtered = announcements.filter((a) => {
    if (filter !== 'ALL' && a.category !== filter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.postedBy.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: 'var(--font-family-body)' }}>
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
              <Bell style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
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
              Club Announcements & Shift Briefings
            </h1>
          </div>
          <p
            style={{ fontSize: '14px', color: '#64748b', margin: 0 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Authoritative club announcements, meeting deadlines, and volunteer directives—replacing cluttered WhatsApp groups with permanent records.
          </p>
        </div>

        <button
          onClick={loadAnnouncements}
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
          <span>Refresh Notices</span>
        </button>
      </div>

      {/* ── 2. Filter Bar & Search ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setFilter('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'ALL' ? '#1e3a8a' : 'var(--card-bg, #ffffff)',
              color: filter === 'ALL' ? 'white' : '#64748b',
              boxShadow: filter === 'ALL' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
            className={filter !== 'ALL' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' : ''}
          >
            All Notices ({announcements.length})
          </button>
          <button
            onClick={() => setFilter('VOLUNTEER_BRIEFING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'VOLUNTEER_BRIEFING' ? '#1e3a8a' : 'var(--card-bg, #ffffff)',
              color: filter === 'VOLUNTEER_BRIEFING' ? 'white' : '#64748b',
            }}
            className={filter !== 'VOLUNTEER_BRIEFING' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' : ''}
          >
            Shift Briefings
          </button>
          <button
            onClick={() => setFilter('MEETING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'MEETING' ? '#1e3a8a' : 'var(--card-bg, #ffffff)',
              color: filter === 'MEETING' ? 'white' : '#64748b',
            }}
            className={filter !== 'MEETING' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' : ''}
          >
            Club Meetings
          </button>
          <button
            onClick={() => setFilter('DEADLINE')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'DEADLINE' ? '#1e3a8a' : 'var(--card-bg, #ffffff)',
              color: filter === 'DEADLINE' ? 'white' : '#64748b',
            }}
            className={filter !== 'DEADLINE' ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' : ''}
          >
            Treasurer Deadlines
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search directives, meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
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

      {/* ── 3. Announcements Stream ───────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
          <Loader2 style={{ width: '28px', height: '28px', color: '#1e3a8a', margin: '0 auto 12px' }} className="animate-spin" />
          <p style={{ fontSize: '14px', margin: 0 }}>Loading club directives and briefings...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((announcement) => {
            const isUrgent = announcement.priority === 'URGENT';
            const isImportant = announcement.priority === 'IMPORTANT';

          return (
            <div
              key={announcement.id}
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: isUrgent ? '#fef2f2' : isImportant ? '#fef3c7' : '#eff6ff',
                      color: isUrgent ? '#dc2626' : isImportant ? '#b45309' : '#1e3a8a',
                      border: `1px solid ${isUrgent ? '#fecaca' : isImportant ? '#fde68a' : '#bfdbfe'}`,
                    }}
                  >
                    {isUrgent ? 'URGENT DIRECTIVE' : isImportant ? 'ACTION REQUIRED' : 'OFFICIAL NOTICE'}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      background: 'var(--muted, #f1f5f9)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Audience: {announcement.targetAudience}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Calendar style={{ width: '14px', height: '14px' }} />
                  <span>{announcement.date}</span>
                </div>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--foreground, #1e293b)',
                  letterSpacing: '-0.3px',
                }}
                className="text-slate-900 dark:text-slate-100"
              >
                {announcement.title}
              </h3>

              {/* Content text */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: 0,
                }}
                className="text-slate-600 dark:text-slate-300"
              >
                {announcement.content}
              </p>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-color, #f1f5f9)',
                  fontSize: '12px',
                }}
                className="border-slate-100 dark:border-slate-800"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                  <Users style={{ width: '14px', height: '14px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                  <span>Posted by: <strong>{announcement.postedBy}</strong></span>
                </div>

                {announcement.acknowledged ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#15803d',
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    <span>Briefing Acknowledged</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(announcement.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: 'var(--card-bg, #ffffff)',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      color: 'var(--foreground, #334155)',
                      cursor: 'pointer',
                    }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Mark as Read & Acknowledged
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};
