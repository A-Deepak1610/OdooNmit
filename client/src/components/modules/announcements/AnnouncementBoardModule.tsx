import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { useAuthStore } from '../../../stores/auth.store';

export const AnnouncementBoardModule: React.FC = () => {
  const { user } = useAuthStore();
  const { announcements, publishAnnouncement } = useClubStore();

  const [showCreate, setShowCreate] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'MEETING' as const,
    author: user?.name ? `${user.name} (Leadership)` : 'Skyline Secretariat',
    priority: 'NORMAL' as const,
    content: '',
  });
  const [postNotice, setPostNotice] = useState<string | null>(null);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    publishAnnouncement({
      title: newNotice.title,
      category: newNotice.category,
      author: newNotice.author,
      priority: newNotice.priority,
      content: newNotice.content,
    });

    setShowCreate(false);
    setPostNotice(
      `Broadcast published! Permanent bulletin created and notification dispatched across all student portals.`
    );
    setTimeout(() => setPostNotice(null), 5000);

    setNewNotice({
      title: '',
      category: 'MEETING',
      author: user?.name ? `${user.name} (Leadership)` : 'Skyline Secretariat',
      priority: 'NORMAL',
      content: '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
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
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              CENTRAL ANNOUNCEMENT BOARD
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Problem Scene: "Announcing the next meeting & notices instead of WhatsApp"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '2px 0 2px 0' }}>
            Permanent Club Bulletins & Meeting Notices
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Post once to reach all club members with verified timestamps, official priority tagging, and historical audit records.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
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
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Megaphone style={{ width: '16px', height: '16px' }} />
          <span>Post Official Bulletin</span>
        </button>
      </div>

      {postNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>{postNotice}</span>
        </div>
      )}

      {/* ── CREATE ANNOUNCEMENT FORM ────────────────────────── */}
      {showCreate && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '2px solid #2563eb',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Broadcast Club Bulletin
            </h3>
            <button
              onClick={() => setShowCreate(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handlePostNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Notice Subject Line *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mandatory General Body Meeting this Friday at 5 PM"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="MEETING">Club Meeting</option>
                  <option value="EVENT">Event Update</option>
                  <option value="DEADLINE">Dues / Deadline</option>
                  <option value="ELECTIONS">Officer Elections</option>
                  <option value="GENERAL">General Notice</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Priority Level
                </label>
                <select
                  value={newNotice.priority}
                  onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Action Required</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Author / Issuing Body
                </label>
                <input
                  type="text"
                  value={newNotice.author}
                  onChange={(e) => setNewNotice({ ...newNotice, author: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Full Announcement Body & Instructions *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Type the complete notice details, agenda items, location, and relevant instructions..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                <span>Publish to All Members</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. ANNOUNCEMENTS LIST ───────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {announcements.map((ann) => (
          <div
            key={ann.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color:
                      ann.category === 'EVENT'
                        ? '#15803d'
                        : ann.category === 'MEETING'
                        ? '#1e3a8a'
                        : ann.category === 'ELECTIONS'
                        ? '#7c3aed'
                        : '#b45309',
                    background:
                      ann.category === 'EVENT'
                        ? '#dcfce7'
                        : ann.category === 'MEETING'
                        ? '#eff6ff'
                        : ann.category === 'ELECTIONS'
                        ? '#f3e8ff'
                        : '#fef3c7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {ann.category}
                </span>

                {ann.priority === 'HIGH' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '4px' }}>
                    High Priority
                  </span>
                )}
                {ann.priority === 'URGENT' && (
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', background: '#dc2626', padding: '2px 6px', borderRadius: '4px' }}>
                    Urgent
                  </span>
                )}

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  {ann.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                <span>{ann.date}</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              {ann.content}
            </p>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
              <span>Issued by: <strong style={{ color: '#475569' }}>{ann.author}</strong></span>
              <span>Delivered via Skyline Central Mailing Feed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
