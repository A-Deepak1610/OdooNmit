import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Megaphone,
  Send,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Calendar,
  MapPin,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CampusEventItem, eventService } from '../../services/event.service';

export const BroadcastAnnouncementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');

  const [events, setEvents] = useState<CampusEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingAttendees, setRefreshingAttendees] = useState(false);

  // Form states
  const [filter, setFilter] = useState<'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN'>('ALL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT' | 'UPDATE'>('NORMAL');
  const [isSending, setIsSending] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success result summary
  const [resultData, setResultData] = useState<{
    sentCount: number;
    failedCount: number;
    totalRecipients: number;
    recipients: { name: string; email: string; isCheckedIn: boolean; status: 'SENT' | 'FAILED' }[];
    message: string;
  } | null>(null);

  // 1. Initial load of events
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsList = await eventService.getEvents();
        if (!isMounted) return;
        setEvents(eventsList);

        if (eventsList.length > 0) {
          const matched = eventIdParam
            ? eventsList.find((e) => e.id === eventIdParam)
            : null;
          const targetEvent = matched || eventsList[0];
          setSelectedEventId(targetEvent.id);
          setSubject(`[Important Update] ${targetEvent.title}`);
        }
      } catch (err: any) {
        console.error('Failed to load events:', err);
        setErrorMsg('Failed to load events. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvents();
    return () => {
      isMounted = false;
    };
  }, [eventIdParam]);

  // 2. Fetch attendees whenever selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;
    let isMounted = true;

    const fetchAttendees = async () => {
      setRefreshingAttendees(true);
      setErrorMsg(null);
      try {
        const res = await eventService.getEventAttendees(selectedEventId);
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res.attendees || [];
        setAttendees(list);

        const currentEvent = events.find((e) => e.id === selectedEventId);
        if (currentEvent) {
          setSubject(`[Important Update] ${currentEvent.title}`);
        }
      } catch (err) {
        console.error('Failed to fetch attendees:', err);
      } finally {
        if (isMounted) setRefreshingAttendees(false);
      }
    };

    fetchAttendees();
    return () => {
      isMounted = false;
    };
  }, [selectedEventId, events]);

  const selectedEvent = useMemo(
    () => events.find((e) => e.id === selectedEventId) || null,
    [events, selectedEventId]
  );

  // Compute recipient list and stats based on attendance filter
  const filteredAttendees = useMemo(() => {
    if (!attendees || attendees.length === 0) return [];
    return attendees.filter((b) => {
      const isCheckedIn = b.checkedInAt !== null;
      if (filter === 'CHECKED_IN') return isCheckedIn;
      if (filter === 'NOT_CHECKED_IN') return !isCheckedIn;
      return true;
    });
  }, [attendees, filter]);

  const checkedInCount = useMemo(
    () => attendees.filter((b) => b.checkedInAt !== null).length,
    [attendees]
  );
  const notCheckedInCount = attendees.length - checkedInCount;

  // Preset quick templates
  const handleApplyTemplate = (type: 'REMINDER' | 'WELCOME' | 'UPDATE') => {
    if (!selectedEvent) return;
    if (type === 'REMINDER') {
      setFilter('NOT_CHECKED_IN');
      setSubject(`⏳ Gate & Entrance Reminder: ${selectedEvent.title}`);
      setPriority('URGENT');
      setMessage(
        `Dear Attendee,\n\nThis is a quick reminder that "${selectedEvent.title}" is starting shortly at ${selectedEvent.venue || 'the venue'}!\n\n` +
        `Entrance checkpoints are currently open. Please have your QR ticket pass or booking number ready on your device for immediate scanning at the check-in desk.\n\n` +
        `If you need directions or campus assistance, please head directly to the registration foyer.\n\n` +
        `See you inside!\nEvent Organizing Committee`
      );
    } else if (type === 'WELCOME') {
      setFilter('CHECKED_IN');
      setSubject(`🎉 Welcome to ${selectedEvent.title} - Session Materials & Schedule`);
      setPriority('NORMAL');
      setMessage(
        `Hello,\n\nWelcome to ${selectedEvent.title}! Your check-in has been successfully verified at the entrance.\n\n` +
        `We are thrilled to have you with us today. Event materials, presentation decks, and WiFi credentials can be accessed via the club portal.\n\n` +
        `Remember to tag our club in your photos and connect with our volunteer mentors throughout the day.\n\n` +
        `Enjoy the session!\nEvent Organizing Team`
      );
    } else {
      setFilter('ALL');
      setSubject(`📢 Announcement: Important Update for ${selectedEvent.title}`);
      setPriority('UPDATE');
      setMessage(
        `Dear Registered Attendees,\n\nPlease note an important announcement regarding "${selectedEvent.title}":\n\n` +
        `[Paste your announcement, venue room details, or timing adjustment here...]\n\n` +
        `Feel free to reach out to the organizing team through the CampusMitra help desk if you have any questions.\n\n` +
        `Best regards,\nEvent Organizing Committee`
      );
    }
  };

  // Form submission: sends Nodemailer email
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) {
      setErrorMsg('Please select an event first.');
      return;
    }
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
      const res = await eventService.sendEventAnnouncementEmail(selectedEvent.id, {
        subject: subject.trim(),
        message: message.trim(),
        filter,
        priority,
      });

      setResultData(res);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || 'Failed to dispatch announcement emails.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedEventId) return;
    setRefreshingAttendees(true);
    try {
      const res = await eventService.getEventAttendees(selectedEventId);
      const list = Array.isArray(res) ? res : res.attendees || [];
      setAttendees(list);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingAttendees(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <Loader2 style={{ width: '36px', height: '36px', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto', color: '#4f46e5' }} />
        <p style={{ fontSize: '15px', fontWeight: 600 }}>Loading events & attendee records...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '16px', padding: '40px' }}>
          <Megaphone style={{ width: '48px', height: '48px', color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>No Events Available</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px' }}>
            There are no events registered under your organizer profile. Once events are created and attendees register, you can broadcast announcements here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Megaphone style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Broadcast Email Announcement
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Dispatch targeted email notifications to attendees via Nodemailer SMTP with live check-in filters
              </p>
            </div>
          </div>
        </div>

        {/* Event Selector & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
              Selected Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setSearchParams({ eventId: e.target.value });
                setResultData(null);
              }}
              style={{
                padding: '9px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                background: 'white',
                color: '#1e293b',
                outline: 'none',
                minWidth: '260px',
                cursor: 'pointer',
              }}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} {ev.venue ? `(${ev.venue})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh attendees list"
            disabled={refreshingAttendees}
            style={{
              padding: '9px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginTop: '16px',
            }}
          >
            <RefreshCw
              style={{
                width: '16px',
                height: '16px',
                animation: refreshingAttendees ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* ── EVENT STATS STRIP ─────────────────────────────────────── */}
      {selectedEvent && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase' }}>
              Target Event
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
              {selectedEvent.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#e0e7ff' }}>
              {selectedEvent.venue && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin style={{ width: '13px', height: '13px' }} />
                  {selectedEvent.venue}
                </span>
              )}
              {selectedEvent.startAt && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar style={{ width: '13px', height: '13px' }} />
                  {new Date(selectedEvent.startAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Registered
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', marginTop: '2px' }}>
              {attendees.length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              All ticket holders for this event
            </div>
          </div>

          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '16px 20px',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#065f46', textTransform: 'uppercase' }}>
              Checked In
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#047857', marginTop: '2px' }}>
              {checkedInCount}
            </div>
            <div style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>
              Verified through scanner stations
            </div>
          </div>

          <div
            style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              padding: '16px 20px',
              borderRadius: '14px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
              Awaiting Check-in
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '2px' }}>
              {notCheckedInCount}
            </div>
            <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
              Pending arrival at venue
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT VIEW (AFTER SUCCESSFUL SEND) ───────────────────── */}
      {resultData ? (
        <div
          style={{
            background: 'white',
            border: '1px solid #bbf7d0',
            borderRadius: '16px',
            padding: '28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
          }}
        >
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
              margin: '0 auto 16px auto',
            }}
          >
            <CheckCircle2 style={{ width: '36px', height: '36px' }} />
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#14532d', margin: '0 0 6px 0' }}>
            Announcement Broadcast Dispatched Successfully!
          </h2>
          <p style={{ fontSize: '14px', color: '#166534', margin: '0 0 24px 0' }}>
            {resultData.message}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '600px',
              margin: '0 auto 24px auto',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>TOTAL AUDIENCE</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b' }}>
                {resultData.totalRecipients}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d' }}>SENT VIA NODEMAILER</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#15803d' }}>
                {resultData.sentCount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c' }}>FAILED / SKIPPED</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#b91c1c' }}>
                {resultData.failedCount}
              </div>
            </div>
          </div>

          {resultData.recipients && resultData.recipients.length > 0 && (
            <div style={{ maxWidth: '640px', margin: '0 auto 24px auto', textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                Detailed Recipient Delivery Log ({resultData.recipients.length})
              </div>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  background: 'white',
                }}
              >
                {resultData.recipients.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #f1f5f9',
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
            onClick={() => {
              setResultData(null);
              setMessage('');
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Send Another Announcement
          </button>
        </div>
      ) : (
        /* ── COMPOSER FORM ───────────────────────────────────────── */
        <form
          onSubmit={handleSend}
          style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Error Banner */}
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
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Recipient Filter Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '10px' }}>
              1. CHOOSE TARGET AUDIENCE (FILTER BY ATTENDANCE)
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Option: All Registered */}
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: filter === 'ALL' ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                  background: filter === 'ALL' ? '#eef2ff' : '#f8fafc',
                  color: filter === 'ALL' ? '#3730a3' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users style={{ width: '15px', height: '15px', color: '#4f46e5' }} />
                    All Registered
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: filter === 'ALL' ? '#4f46e5' : '#cbd5e1',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {attendees.length}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Every attendee registered for event</span>
              </button>

              {/* Option: Checked-In */}
              <button
                type="button"
                onClick={() => setFilter('CHECKED_IN')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: filter === 'CHECKED_IN' ? '2px solid #059669' : '1px solid #cbd5e1',
                  background: filter === 'CHECKED_IN' ? '#ecfdf5' : '#f8fafc',
                  color: filter === 'CHECKED_IN' ? '#065f46' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
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
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {checkedInCount}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Attendees verified at entrance</span>
              </button>

              {/* Option: Not Checked-In */}
              <button
                type="button"
                onClick={() => setFilter('NOT_CHECKED_IN')}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: filter === 'NOT_CHECKED_IN' ? '2px solid #d97706' : '1px solid #cbd5e1',
                  background: filter === 'NOT_CHECKED_IN' ? '#fffbeb' : '#f8fafc',
                  color: filter === 'NOT_CHECKED_IN' ? '#92400e' : '#475569',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
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
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    {notCheckedInCount}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Attendees yet to arrive or scan</span>
              </button>
            </div>

            {/* Audience summary & Preview Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: '10px',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#475569' }}>
                Audience Size:{' '}
                <strong style={{ color: '#0f172a' }}>{filteredAttendees.length} recipient(s)</strong> selected
              </span>
              {filteredAttendees.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecipientList(!showRecipientList)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                  }}
                >
                  {showRecipientList ? 'Hide List' : 'Preview Recipients'}
                  {showRecipientList ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                </button>
              )}
            </div>

            {showRecipientList && filteredAttendees.length > 0 && (
              <div
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  marginTop: '8px',
                  background: 'white',
                  fontSize: '12px',
                  padding: '6px',
                }}
              >
                {filteredAttendees.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      padding: '6px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f8fafc',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {att.user?.fullName || 'Student'} ({att.user?.email})
                    </span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>
                      {att.checkedInAt ? '✅ Checked In' : '⏳ Pending Door Scan'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Quick Templates */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#6366f1' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Quick Announcement Presets
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleApplyTemplate('REMINDER')}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
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
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  cursor: 'pointer',
                }}
              >
                🎉 Welcome & Session Materials (For Checked-In)
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('UPDATE')}
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#eef2ff',
                  border: '1px solid #c7d2fe',
                  color: '#3730a3',
                  cursor: 'pointer',
                }}
              >
                📢 General Update / Room Change (For All)
              </button>
            </div>
          </div>

          {/* 3. Subject */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
              2. EMAIL SUBJECT LINE
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. [Important Notice] Event Starts in 15 Minutes at Main Auditorium"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                fontWeight: 600,
                outline: 'none',
                background: 'white',
              }}
            />
          </div>

          {/* 4. Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                3. ANNOUNCEMENT MESSAGE CONTENT (PASTED BODY)
              </label>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Multiline text & formatting preserved
              </span>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste or type your announcement here...&#10;&#10;e.g. Attention Attendees! The session will kick off promptly at 10:00 AM. Please proceed to Hall B. Bring your college ID and QR ticket pass."
              style={{
                width: '100%',
                padding: '14px',
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

          {/* 5. Priority & Submit Button */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>Urgency:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'white',
                }}
              >
                <option value="NORMAL">Standard Notice</option>
                <option value="URGENT">Urgent / Time-Sensitive</option>
                <option value="UPDATE">Schedule / Room Update</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSending || filteredAttendees.length === 0}
              style={{
                padding: '12px 28px',
                borderRadius: '10px',
                background:
                  isSending || filteredAttendees.length === 0
                    ? '#cbd5e1'
                    : 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: 'white',
                border: 'none',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isSending || filteredAttendees.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow:
                  isSending || filteredAttendees.length === 0
                    ? 'none'
                    : '0 4px 14px rgba(79, 70, 229, 0.4)',
                transition: 'all 0.15s',
              }}
            >
              {isSending ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                  <span>Dispatching Nodemailer Broadcast...</span>
                </>
              ) : (
                <>
                  <Send style={{ width: '16px', height: '16px' }} />
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
  );
};
