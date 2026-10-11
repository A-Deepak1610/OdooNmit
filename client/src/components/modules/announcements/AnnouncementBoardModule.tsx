import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle2,
  Clock,
  Pin,
  Building2,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { studentService, StudentAnnouncementItem, StudentClubItem } from '../../../services/student.service';
import { presidentService } from '../../../services/president.service';
import { adminService } from '../../../services/admin.service';
import { ROLES } from '../../../config/roles';

export const AnnouncementBoardModule: React.FC = () => {
  const { role } = useAuthStore();
  const isAdmin = role === ROLES.ADMIN;
  const isPresident = role === ROLES.PRESIDENT;
  const canPublish = isAdmin || isPresident;

  const [announcements, setAnnouncements] = useState<StudentAnnouncementItem[]>([]);
  const [clubs, setClubs] = useState<StudentClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [postNotice, setPostNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [clubFilter, setClubFilter] = useState('ALL');

  // Form
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'MEETING',
    content: '',
    isPinned: false,
    isMemberOnly: false,
    organizationId: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [annData, clubsData] = await Promise.all([
        studentService.getAnnouncements(),
        studentService.getClubs().catch(() => []),
      ]);
      setAnnouncements(annData);
      setClubs(clubsData);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePostNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    setSubmitting(true);
    try {
      if (isAdmin) {
        await adminService.createAnnouncement({
          title: newNotice.title,
          content: newNotice.content,
          category: newNotice.category,
          isPinned: newNotice.isPinned,
          isMemberOnly: newNotice.isMemberOnly,
          organizationId: newNotice.organizationId || undefined,
        });
      } else if (isPresident) {
        await presidentService.createAnnouncement({
          title: newNotice.title,
          content: newNotice.content,
          category: newNotice.category,
          isPinned: newNotice.isPinned,
          isMemberOnly: newNotice.isMemberOnly,
        });
      }

      setShowCreate(false);
      setPostNotice(
        `Announcement published! Broadcast reflected immediately across all member feeds (no email dispatched).`
      );
      setTimeout(() => setPostNotice(null), 5000);

      setNewNotice({
        title: '',
        category: 'MEETING',
        content: '',
        isPinned: false,
        isMemberOnly: false,
        organizationId: '',
      });

      // Reload fresh data from backend
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          ann.title.toLowerCase().includes(q) ||
          ann.content.toLowerCase().includes(q) ||
          (ann.organization?.name && ann.organization.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (categoryFilter !== 'ALL' && ann.category !== categoryFilter) return false;
      if (clubFilter !== 'ALL' && ann.organizationId !== clubFilter) return false;
      return true;
    });
  }, [announcements, search, categoryFilter, clubFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#60a5fa',
                background: 'rgba(96, 165, 250, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CENTRAL ANNOUNCEMENT BOARD
            </span>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
              Broadcasts from Admin & Club Leaders
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '2px 0 4px 0', letterSpacing: '-0.3px' }}>
            Permanent Club Bulletins & Official Broadcasts
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '680px' }}>
            Real-time verified bulletins delivered instantly across member and student portals with full audit records.
            Email notifications are disabled; all notices are reflected directly in this feed and your notification bell.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadData}
            title="Refresh announcements"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: '15px', height: '15px' }} />
            <span>Sync</span>
          </button>

          {canPublish && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Megaphone style={{ width: '16px', height: '16px' }} />
              <span>{showCreate ? 'Close Form' : 'Publish Announcement'}</span>
            </button>
          )}
        </div>
      </div>

      {postNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '14px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px -2px rgba(16, 185, 129, 0.1)',
          }}
        >
          <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0 }} />
          <span>{postNotice}</span>
        </div>
      )}

      {/* ── CREATE ANNOUNCEMENT FORM (ADMIN & CLUB LEADER) ────── */}
      {showCreate && canPublish && (
        <div
          style={{
            background: 'white',
            borderRadius: '14px',
            border: '2px solid #2563eb',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                {isAdmin ? 'System Administrator Broadcast' : 'Club Leadership Bulletin'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '2px 0 0 0' }}>
                Broadcast Official Announcement to Members
              </h3>
            </div>
            <button
              onClick={() => setShowCreate(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Announcement Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Campus Orientation Scheduled for Friday • Mandatory Club Attendance"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="GENERAL">General Bulletin</option>
                  <option value="MEETING">General Meeting</option>
                  <option value="EVENT">Event Alert</option>
                  <option value="ELECTIONS">Officer Elections</option>
                  <option value="CAMPUS_ALERT">Campus Alert</option>
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Target Club (Optional)
                  </label>
                  <select
                    value={newNotice.organizationId}
                    onChange={(e) => setNewNotice({ ...newNotice, organizationId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="">Default / Platform-wide Charter</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newNotice.isPinned}
                    onChange={(e) => setNewNotice({ ...newNotice, isPinned: e.target.checked })}
                  />
                  <span>Pin to Top</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newNotice.isMemberOnly}
                    onChange={(e) => setNewNotice({ ...newNotice, isMemberOnly: e.target.checked })}
                  />
                  <span>Members Only</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Announcement Body & Details *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide comprehensive details, instructions, links, or schedule notes for members..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{ padding: '9px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '9px 22px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                <span>{submitting ? 'Publishing...' : 'Publish to Feed'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. SEARCH & FILTER CONTROLS ─────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'white',
          padding: '14px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            flex: 1,
            minWidth: '220px',
          }}
        >
          <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search bulletins by title, content, or club..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600 }}
        >
          <option value="ALL">All Categories</option>
          <option value="GENERAL">General</option>
          <option value="MEETING">Meeting</option>
          <option value="EVENT">Event</option>
          <option value="ELECTIONS">Elections</option>
          <option value="CAMPUS_ALERT">Campus Alert</option>
        </select>

        {/* Club filter */}
        <select
          value={clubFilter}
          onChange={(e) => setClubFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 600 }}
        >
          <option value="ALL">All Organizations</option>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── 3. ANNOUNCEMENTS LIST ───────────────────────────── */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
          <RefreshCw style={{ width: '24px', height: '24px', margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} />
          <div>Syncing announcements...</div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '50px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <Megaphone style={{ width: '36px', height: '36px', color: '#94a3b8', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
            No Announcements Found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {search || categoryFilter !== 'ALL' || clubFilter !== 'ALL'
              ? 'No announcements match the selected filter criteria.'
              : 'There are no announcements currently published. Check back soon!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              style={{
                background: 'white',
                borderRadius: '14px',
                border: ann.isPinned ? '2px solid #93c5fd' : '1px solid #e2e8f0',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: ann.isPinned ? '0 4px 16px -2px rgba(59, 130, 246, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {ann.isPinned && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#1d4ed8',
                        background: '#dbeafe',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Pin style={{ width: '11px', height: '11px' }} />
                      Pinned Notice
                    </span>
                  )}

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0369a1',
                      background: '#e0f2fe',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {ann.category}
                  </span>

                  {ann.isMemberOnly && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#7c3aed',
                        background: '#f3e8ff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      Members Only
                    </span>
                  )}

                  {ann.organization && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#15803d',
                        background: '#f0fdf4',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Building2 style={{ width: '12px', height: '12px' }} />
                      {ann.organization.name}
                    </span>
                  )}

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 0 4px' }}>
                    {ann.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                  <Clock style={{ width: '13px', height: '13px' }} />
                  <span>{new Date(ann.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                {ann.content}
              </p>

              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
              >
                <span>
                  Issued by: <strong style={{ color: '#475569' }}>{ann.author?.fullName || 'Campus Administration'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: 600 }}>
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  Live Campus Bulletin (No Email Dispatched)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
