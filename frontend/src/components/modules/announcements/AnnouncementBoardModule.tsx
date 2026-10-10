import React, { useState } from 'react';
import {
  Megaphone,
  Send,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { mockAnnouncements } from '../../../data/mockClubData';

export const AnnouncementBoardModule: React.FC = () => {
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [showCreate, setShowCreate] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    category: 'MEETING' as const,
    author: 'Skyline Secretariat',
    priority: 'NORMAL' as const,
    content: '',
  });
  const [postNotice, setPostNotice] = useState<string | null>(null);

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    const notice = {
      id: `ann-${Date.now()}`,
      title: newNotice.title,
      category: newNotice.category,
      author: newNotice.author,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      priority: newNotice.priority,
      content: newNotice.content,
    };

    setAnnouncements([notice, ...announcements]);
    setShowCreate(false);
    setPostNotice(`Broadcast published! Notification delivered to all student member dashboards.`);
    setNewNotice({
      title: '',
      category: 'MEETING',
      author: 'Skyline Secretariat',
      priority: 'NORMAL',
      content: '',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Dev 4 Workstream
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Problem Scene: "Announcing the next meeting & notices"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Centralized Campus Announcement Board
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Post once to reach all members with timestamped logs, replacing fragmented and lost WhatsApp group messages.
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
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Megaphone size={16} />
          <span>Broadcast Notice</span>
        </button>
      </div>

      {postNotice && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            color: '#15803d',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#15803d" />
            <span>{postNotice}</span>
          </div>
          <button
            onClick={() => setPostNotice(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. BROADCAST COMPOSER FORM ─────────────────────── */}
      {showCreate && (
        <form
          onSubmit={handlePostNotice}
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: '0 0 2px 0' }}>
                Create Official Broadcast
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Notice will be displayed across student dashboards and sent to verified member emails.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label style={noticeLabel}>Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Venue Change for Spring Gala"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                style={noticeInput}
              />
            </div>
            <div>
              <label style={noticeLabel}>Notice Category</label>
              <select
                value={newNotice.category}
                onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                style={noticeSelect}
              >
                <option value="EVENT">Event Update</option>
                <option value="MEETING">General Body Meeting</option>
                <option value="DEADLINE">Dues / Form Deadline</option>
                <option value="GENERAL">General Notice</option>
              </select>
            </div>
            <div>
              <label style={noticeLabel}>Priority Level</label>
              <select
                value={newNotice.priority}
                onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
                style={noticeSelect}
              >
                <option value="NORMAL">Standard Notice</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Red Alert)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={noticeLabel}>Notice Content</label>
            <textarea
              rows={3}
              required
              placeholder="Type your official announcement details here..."
              value={newNotice.content}
              onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '13px',
                color: '#1e293b',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="submit"
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
              }}
            >
              <Send size={14} />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      )}

      {/* ── 3. ANNOUNCEMENTS LIST ──────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {announcements.map((ann) => {
          const isUrgent = ann.priority === 'URGENT';
          const isHigh = ann.priority === 'HIGH';

          const borderCol = isUrgent ? '#fecaca' : isHigh ? '#fed7aa' : '#e2e8f0';
          const bgCol = isUrgent ? '#fff5f5' : isHigh ? '#fffbf5' : 'white';

          return (
            <div
              key={ann.id}
              style={{
                background: bgCol,
                borderRadius: '12px',
                border: `1px solid ${borderCol}`,
                padding: '20px',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: isUrgent ? '#fef2f2' : isHigh ? '#fef3c7' : '#eff6ff',
                      color: isUrgent ? '#dc2626' : isHigh ? '#b45309' : '#1e3a8a',
                      border: isUrgent ? '1px solid #fecaca' : isHigh ? '1px solid #fde68a' : '1px solid #dbeafe',
                    }}
                  >
                    {ann.category}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    Posted by {ann.author}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{ann.date}</span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
                {ann.title}
              </h4>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {ann.content}
              </p>

              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} />
                  <span>Audience: Skyline Association & Campus Students</span>
                </div>
                <span style={{ fontWeight: 600, color: '#1e3a8a', cursor: 'pointer' }}>
                  View Full Thread →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── MODULE-SCOPE STYLES ───────────────────────────────── */
const noticeLabel: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
};

const noticeInput: React.CSSProperties = {
  width: '100%',
  height: '38px',
  padding: '0 12px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '13px',
  color: '#1e293b',
  outline: 'none',
};

const noticeSelect: React.CSSProperties = {
  width: '100%',
  height: '38px',
  padding: '0 12px',
  borderRadius: '6px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  fontSize: '13px',
  color: '#1e293b',
  outline: 'none',
  cursor: 'pointer',
};

