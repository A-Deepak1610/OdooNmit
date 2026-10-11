import React, { useState, useMemo } from 'react';
import {
  X,
  Mail,
  Send,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { eventService } from '../../services/event.service';

export interface EventAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    venue?: string;
    startAt?: string | Date;
  } | null;
  attendees?: any[];
  onSuccess?: (message: string) => void;
}

export const EventAnnouncementModal: React.FC<EventAnnouncementModalProps> = ({
  isOpen,
  onClose,
  event,
  attendees = [],
  onSuccess,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN'>('ALL');
  const [subject, setSubject] = useState(
    event ? `[Important Update] ${event.title}` : '[Event Announcement]'
  );
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'UPDATE'>('NORMAL');
  const [isSending, setIsSending] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [resultData, setResultData] = useState<{
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    recipients: { name: string; email: string; isCheckedIn: boolean; status: 'SENT' | 'FAILED' }[];
    message: string;
  } | null>(null);

  // Local attendees list; fallback to fetch if not supplied via props
  const [attendeesList, setAttendeesList] = useState<any[]>(attendees);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync subject when event changes
  React.useEffect(() => {
    if (event) {
      setSubject(`[Important Update] ${event.title}`);
    }
  }, [event?.id, event?.title]);

  // Load attendees if not provided
  React.useEffect(() => {
    if (event && attendeesList.length === 0) {
      (async () => {
        try {
          const data = await eventService.getEventAttendees(event.id);
          // data.attendees expected from service response
          setAttendeesList(data.attendees || []);
        } catch (e) {
          console.error('Failed to load attendees', e);
        }
      })();
    }
  }, [event, attendeesList.length]);

  // Compute recipient list and counts dynamically using attendeesList
  const filteredAttendees = useMemo(() => {
    if (!attendeesList || attendeesList.length === 0) return [];
    return attendeesList.filter((b) => {
      const isCheckedIn = b.checkedInAt !== null;
      if (filter === 'CHECKED_IN') return isCheckedIn;
      if (filter === 'NOT_CHECKED_IN') return !isCheckedIn;
      return true;
    });
  }, [attendeesList, filter]);

  const checkedInCount = useMemo(
    () => attendeesList.filter((b) => b.checkedInAt !== null).length,
    [attendeesList]
  );
  const notCheckedInCount = attendeesList.length - checkedInCount;

  // Preset quick templates
  const handleApplyTemplate = (type: 'REMINDER' | 'WELCOME' | 'UPDATE') => {
    if (!event) return;
    if (type === 'REMINDER') {
      setFilter('NOT_CHECKED_IN');
      setSubject(`⏳ Gate & Entrance Reminder: ${event.title}`);
      setPriority('URGENT');
      setMessage(
        `Dear Attendee,\n\nThis is a quick reminder that "${event.title}" is starting shortly at ${event.venue || 'the venue'}!\n\n` +
        `Entrance checkpoints are currently open. Please have your QR ticket pass or booking number ready on your device for immediate scanning at the check-in desk.\n\n` +
        `If you need directions or campus assistance, please head directly to the registration foyer.\n\n` +
        `See you inside!\nEvent Organizing Committee`
      );
    } else if (type === 'WELCOME') {
      setFilter('CHECKED_IN');
      setSubject(`🎉 Welcome to ${event.title} - Session Materials & Schedule`);
      setPriority('NORMAL');
      setMessage(
        `Hello,\n\nWelcome to ${event.title}! Your check-in has been successfully verified at the entrance.\n\n` +
        `We are thrilled to have you with us today. Event materials, presentation decks, and WiFi credentials can be accessed via the club portal.\n\n` +
        `Remember to tag our club in your photos and connect with our volunteer mentors throughout the day.\n\n` +
        `Enjoy the session!\nEvent Organizing Team`
      );
    } else {
      setFilter('ALL');
      setSubject(`📢 Announcement: Important Update for ${event.title}`);
      setPriority('UPDATE');
      setMessage(
        `Dear Registered Attendees,\n\nPlease note an important announcement regarding "${event.title}":\n\n` +
        `[Paste your announcement, venue room details, or timing adjustment here...]\n\n` +
        `Feel free to reach out to the organizing team through the CampusMitra help desk if you have any questions.\n\n` +
        `Best regards,\nEvent Organizing Committee`
      );
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!subject.trim()) {
      setErrorMsg('Please enter an announcement subject.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Please paste or type your announcement content.');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);
    setResultData(null);

    try {
      const res = await eventService.sendEventAnnouncementEmail(event.id, {
        subject: subject.trim(),
        message: message.trim(),
        filter,
        priority,
      });

      setResultData(res);
      if (onSuccess) {
        onSuccess(`Announcement sent to ${res.sentCount} recipient(s) via Nodemailer!`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to dispatch announcement emails.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            padding: '24px 28px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Mail style={{ width: '12px', height: '12px' }} />
                Nodemailer Email Broadcast
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: '#86efac',
                  background: 'rgba(34, 197, 94, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  fontWeight: 700,
                }}
              >
                SMTP Active
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0' }}>
              Send Announcement to Registered Attendees
            </h2>
            <p style={{ fontSize: '13px', color: '#c7d2fe', margin: 0 }}>
              Event: <strong style={{ color: 'white' }}>{event.title}</strong>
              {event.venue ? ` • ${event.venue}` : ''}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* If Result view is active */}
          {resultData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}
              >
                <CheckCircle2 style={{ width: '36px', height: '36px' }} />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0' }}>
                  Announcement Dispatched Successfully!
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '480px', marginInline: 'auto' }}>
                  {resultData.message}
                </p>
              </div>

              {/* Delivery Stats Bar */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  background: '#f8fafc',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Filtered
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e293b', marginTop: '2px' }}>
                    {resultData.totalRecipients}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                    Sent via SMTP
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#15803d', marginTop: '2px' }}>
                    {resultData.sentCount}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
                    Failed / Skipped
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#b91c1c', marginTop: '2px' }}>
                    {resultData.failedCount}
                  </div>
                </div>
              </div>

              {/* Recipient breakdown list */}
              {resultData.recipients && resultData.recipients.length > 0 && (
                <div style={{ textAlign: 'left', marginTop: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                    Recipient Delivery Log ({resultData.recipients.length})
                  </div>
                  <div
                    style={{
                      maxHeight: '160px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white',
                    }}
                  >
                    {resultData.recipients.map((r, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          borderBottom: idx === resultData.recipients.length - 1 ? 'none' : '1px solid #f1f5f9',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <strong style={{ color: '#1e293b' }}>{r.name}</strong>
                          <span style={{ color: '#64748b', marginLeft: '6px' }}>({r.email})</span>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: r.status === 'SENT' ? '#dcfce7' : '#fee2e2',
                            color: r.status === 'SENT' ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: '#4338ca',
                  color: 'white',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  margin: '8px auto 0 auto',
                  minWidth: '140px',
                }}
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Error feedback */}
              {errorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle style={{ width: '16px', height: '16px' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ── 1. AUDIENCE RECIPIENT FILTER ────────────────── */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  1. SELECT RECIPIENT ATTENDANCE FILTER
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                  }}
                >
                  {/* Option: All Registered */}
                  <button
                    type="button"
                    onClick={() => setFilter('ALL')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: filter === 'ALL' ? '2px solid #4338ca' : '1px solid #cbd5e1',
                      background: filter === 'ALL' ? '#eef2ff' : '#f8fafc',
                      color: filter === 'ALL' ? '#3730a3' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users style={{ width: '15px', height: '15px', color: '#4338ca' }} />
                        All Registered
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: filter === 'ALL' ? '#4338ca' : '#cbd5e1',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {attendees.length}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Every ticket holder</span>
                  </button>

                  {/* Option: Only Checked-In */}
                  <button
                    type="button"
                    onClick={() => setFilter('CHECKED_IN')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: filter === 'CHECKED_IN' ? '2px solid #059669' : '1px solid #cbd5e1',
                      background: filter === 'CHECKED_IN' ? '#ecfdf5' : '#f8fafc',
                      color: filter === 'CHECKED_IN' ? '#065f46' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <UserCheck style={{ width: '15px', height: '15px', color: '#059669' }} />
                        Only Checked-In
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: filter === 'CHECKED_IN' ? '#059669' : '#cbd5e1',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {checkedInCount}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Currently inside hall</span>
                  </button>

                  {/* Option: Not Checked-In */}
                  <button
                    type="button"
                    onClick={() => setFilter('NOT_CHECKED_IN')}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: filter === 'NOT_CHECKED_IN' ? '2px solid #d97706' : '1px solid #cbd5e1',
                      background: filter === 'NOT_CHECKED_IN' ? '#fffbeb' : '#f8fafc',
                      color: filter === 'NOT_CHECKED_IN' ? '#92400e' : '#475569',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock style={{ width: '15px', height: '15px', color: '#d97706' }} />
                        Not Checked-In
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: filter === 'NOT_CHECKED_IN' ? '#d97706' : '#cbd5e1',
                          color: 'white',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {notCheckedInCount}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Awaiting door check-in</span>
                  </button>
                </div>

                {/* Recipient Count & Expandable List */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ color: '#475569' }}>
                    Target Audience:{' '}
                    <strong style={{ color: '#0f172a' }}>
                      {filteredAttendees.length} recipient(s)
                    </strong>{' '}
                    selected based on {filter === 'ALL' ? 'all bookings' : filter === 'CHECKED_IN' ? 'check-in verified' : 'entrance pending'}
                  </span>
                  {filteredAttendees.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowRecipientList(!showRecipientList)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4338ca',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      {showRecipientList ? 'Hide List' : 'Preview Recipients'}
                      {showRecipientList ? <ChevronUp style={{ width: '12px', height: '12px' }} /> : <ChevronDown style={{ width: '12px', height: '12px' }} />}
                    </button>
                  )}
                </div>

                {showRecipientList && filteredAttendees.length > 0 && (
                  <div
                    style={{
                      maxHeight: '120px',
                      overflowY: 'auto',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginTop: '6px',
                      background: 'white',
                      fontSize: '11px',
                      padding: '4px',
                    }}
                  >
                    {filteredAttendees.map((att) => (
                      <div
                        key={att.id}
                        style={{
                          padding: '4px 8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #f8fafc',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {att.user?.fullName || 'Student'} ({att.user?.email})
                        </span>
                        <span style={{ color: '#64748b' }}>
                          {att.checkedInAt ? '✅ Checked In' : '⏳ Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── 2. QUICK TEMPLATES ──────────────────────────── */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles style={{ width: '13px', height: '13px', color: '#6366f1' }} />
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Quick Content Presets (Autofill Template)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('REMINDER')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      color: '#b45309',
                      cursor: 'pointer',
                    }}
                  >
                    ⏰ Entrance Gate Reminder (For Not Checked-In)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('WELCOME')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      cursor: 'pointer',
                    }}
                  >
                    🎉 Welcome & Materials (For Checked-In)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate('UPDATE')}
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: '#eef2ff',
                      border: '1px solid #c7d2fe',
                      color: '#3730a3',
                      cursor: 'pointer',
                    }}
                  >
                    📢 General Schedule / Room Change (For All)
                  </button>
                </div>
              </div>

              {/* ── 3. EMAIL SUBJECT ────────────────────────────── */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  2. EMAIL SUBJECT LINE
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. [Important Notice] Event Starts in 15 Minutes at Main Auditorium"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    background: 'white',
                  }}
                />
              </div>

              {/* ── 4. ANNOUNCEMENT CONTENT (PASTED CONTENT) ────── */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155' }}>
                    3. ANNOUNCEMENT CONTENT / MESSAGE BODY
                  </label>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Supports multiline text & line breaks
                  </span>
                </div>
                <textarea
                  rows={7}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Paste or type your announcement here...&#10;&#10;e.g. Attention Attendees! The coding session will kick off promptly at 10:00 AM. Please proceed to Lab 3 on the 2nd Floor. Bring your college ID and booking pass QR."
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    background: 'white',
                  }}
                />
              </div>

              {/* ── 5. SUBMIT ACTION BUTTON ──────────────────────── */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSending || filteredAttendees.length === 0}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '10px',
                    background:
                      isSending || filteredAttendees.length === 0
                        ? '#cbd5e1'
                        : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: isSending || filteredAttendees.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow:
                      isSending || filteredAttendees.length === 0
                        ? 'none'
                        : '0 4px 12px rgba(79, 70, 229, 0.35)',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSending ? (
                    <>
                      <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                      <span>Sending Emails via Nodemailer...</span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: '15px', height: '15px' }} />
                      <span>
                        Send to {filteredAttendees.length} Attendee{filteredAttendees.length === 1 ? '' : 's'} via Nodemailer
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
