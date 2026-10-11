import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  CreditCard,
  Plus,
  Search,
  Award,
  UserCheck,
  DollarSign,
  BarChart3,
  Tag,
  ShieldCheck,
  Sparkles,
  Printer,
  Ticket,
  Loader2,
} from 'lucide-react';
import { useClubStore } from '../../stores/club.store';
import { MockEvent } from '../../data/mockClubData';
import { useAuthStore } from '../../stores/auth.store';
import { RealQrCode } from '../../components/shared/RealQrCode';
import { RazorpayPaymentModal } from '../../components/shared/RazorpayPaymentModal';
import { useDebounce } from '../../hooks/useDebounce';

export interface PresidentEventsFundraisersPageProps {
  roleVariant?: 'PRESIDENT' | 'EVENT_ORGANIZER';
  defaultTab?: 'analytics' | 'ticketing' | 'organizer' | 'attendees';
}

export const PresidentEventsFundraisersPage: React.FC<PresidentEventsFundraisersPageProps> = ({
  roleVariant = 'PRESIDENT',
  defaultTab = 'analytics',
}) => {
  const { user } = useAuthStore();
  const {
    events,
    doorTickets,
    postNewEvent,
    assignEventOrganizer,
    bookEventTicket,
    checkInDoorTicket,
    searchEventsFromServer,
    updateEventTierQuota,
  } = useClubStore();

  // Debounced Server-Backed Event Search
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const debouncedEventSearch = useDebounce(eventSearchQuery, 300);
  const [serverEvents, setServerEvents] = useState<MockEvent[]>(events);
  const [isSearchingEvents, setIsSearchingEvents] = useState(false);

  // Active view states
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || 'evt-gala-2026');
  const [activeTab, setActiveTab] = useState<'analytics' | 'ticketing' | 'organizer' | 'attendees'>(defaultTab);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [checkInFilter, setCheckInFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [quotaAdjustNotice, setQuotaAdjustNotice] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Debounced search effect querying server JSON
  useEffect(() => {
    let isCancelled = false;
    const fetchFiltered = async () => {
      setIsSearchingEvents(true);
      try {
        const results = await searchEventsFromServer(debouncedEventSearch);
        if (!isCancelled) {
          setServerEvents(results);
          if (results.length > 0 && !results.some((e) => e.id === selectedEventId)) {
            setSelectedEventId(results[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to search events:', err);
      } finally {
        if (!isCancelled) {
          setIsSearchingEvents(false);
        }
      }
    };
    fetchFiltered();
    return () => {
      isCancelled = true;
    };
  }, [debouncedEventSearch, searchEventsFromServer]);

  // Modals
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState<any | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<{ message: string; isError?: boolean } | null>(null);

  // Razorpay Checkout State for Ticket Booking
  const [checkoutTier, setCheckoutTier] = useState<{
    eventId: string;
    tierName: string;
    price: number;
    isMember: boolean;
  } | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [attendeeType, setAttendeeType] = useState<'MEMBER' | 'STUDENT'>('MEMBER');

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'FLAGSHIP_EVENT' | 'FUNDRAISER' | 'WORKSHOP' | 'SOCIAL'>('FLAGSHIP_EVENT');
  const [newEventDate, setNewEventDate] = useState('2026-05-20');
  const [newEventTime, setNewEventTime] = useState('6:00 PM - 10:00 PM');
  const [newEventVenue, setNewEventVenue] = useState('Grand Auditorium');
  const [newEventCapacity, setNewEventCapacity] = useState(400);
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newFundraiserGoal, setNewFundraiserGoal] = useState(50000);
  const [newOrganizerName, setNewOrganizerName] = useState('Aarav Patel');
  const [newMemberPrice, setNewMemberPrice] = useState(120);
  const [newStudentPrice, setNewStudentPrice] = useState(250);

  // Active Selected Event
  const currentEvent: MockEvent =
    serverEvents.find((e) => e.id === selectedEventId) || serverEvents[0] || events[0];

  // Organizer pool for assignment
  const organizerCandidates = [
    { name: 'Aarav Patel', role: 'Chief Event Organizer', email: 'aarav.patel@skyline.edu', avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=AaravPatel&backgroundColor=ffdfbf' },
    { name: 'Sneha Sundaram', role: 'Cultural & Logistics Lead', email: 'sneha.s@skyline.edu', avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=SnehaSundaram&backgroundColor=b6e3f4' },
    { name: 'Deepak Kumar', role: 'Tech & Stage Director', email: 'deepak.k@skyline.edu', avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=DeepakKumar&backgroundColor=b6e3f4' },
    { name: 'Priya Sharma', role: 'Treasury & Ticket Coordinator', email: 'priya.s@skyline.edu', avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=PriyaSharma&backgroundColor=c0aede' },
    { name: 'Marcus Lee', role: 'Venue Operations Assistant', email: 'marcus.l@skyline.edu', avatar: 'https://api.dicebear.com/9.x/thumbs/svg?seed=MarcusLee&backgroundColor=d1d4f9' },
  ];

  // Calculated Analytics for currentEvent
  const capacityPercent = Math.round((currentEvent.soldCount / currentEvent.capacity) * 100);
  const attendanceRate = currentEvent.soldCount > 0 ? Math.round((currentEvent.checkedInCount / currentEvent.soldCount) * 100) : 0;
  const remainingExpected = Math.max(0, currentEvent.soldCount - currentEvent.checkedInCount);
  const fundraiserGoal = currentEvent.fundraiserTargetGoal || 60000;
  const fundraiserProgress = Math.min(100, Math.round((currentEvent.revenue / fundraiserGoal) * 100));

  // Default demographics if not explicitly provided
  const departmentStats = currentEvent.departmentStats || [
    { department: 'Computer Science & Engineering', count: 176, percentage: 42 },
    { department: 'Electronics & Communication', count: 109, percentage: 26 },
    { department: 'Mechanical Engineering', count: 59, percentage: 14 },
    { department: 'Information Science', count: 50, percentage: 12 },
    { department: 'Design, Media & Others', count: 26, percentage: 6 },
  ];

  const attendanceHourly = currentEvent.attendanceHourly || [
    { hour: '5:30 PM - 6:00 PM', count: 45 },
    { hour: '6:00 PM - 6:30 PM', count: 110 },
    { hour: '6:30 PM - 7:00 PM', count: 160 },
    { hour: '7:00 PM - 7:30 PM', count: 70 },
  ];

  const yearStats = currentEvent.yearStats || [
    { year: '1st Year Freshmen', count: 68, percentage: 16 },
    { year: '2nd Year Sophomores', count: 118, percentage: 28 },
    { year: '3rd Year Juniors', count: 164, percentage: 39 },
    { year: '4th Year Seniors', count: 70, percentage: 17 },
  ];

  const memberVsStudent = currentEvent.memberVsStudentStats || {
    members: Math.round(currentEvent.soldCount * 0.68),
    students: Math.round(currentEvent.soldCount * 0.32),
  };

  // Filtered attendees
  const filteredTickets = doorTickets.filter((t) => {
    const matchesSearch =
      t.attendee.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      t.id.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      (t.department && t.department.toLowerCase().includes(attendeeSearch.toLowerCase()));
    const matchesStatus =
      checkInFilter === 'ALL' ||
      (checkInFilter === 'CHECKED_IN' && t.checkedIn) ||
      (checkInFilter === 'PENDING' && !t.checkedIn);
    return matchesSearch && matchesStatus;
  });

  // Handle Event Creation
  const handlePostEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const organizerObj = organizerCandidates.find((o) => o.name === newOrganizerName) || organizerCandidates[0];

    const newId = postNewEvent({
      title: newEventTitle.trim(),
      type: newEventType,
      date: newEventDate,
      time: newEventTime,
      location: newEventVenue,
      capacity: newEventCapacity,
      description: newEventDescription || 'Official campus event organized by Skyline Student Association.',
      category: newEventType === 'FUNDRAISER' ? 'Fundraiser & Charity' : 'Campus Event',
      fundraiserTargetGoal: newFundraiserGoal,
      assignedOrganizer: {
        ...organizerObj,
        assignedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'ACTIVE',
      },
      departmentStats: [
        { department: 'Computer Science & Engineering', count: 0, percentage: 40 },
        { department: 'Electronics & Communication', count: 0, percentage: 30 },
        { department: 'Information Science', count: 0, percentage: 20 },
        { department: 'Mechanical & Other', count: 0, percentage: 10 },
      ],
      attendanceHourly: [
        { hour: 'Door Opening', count: 0 },
        { hour: 'Mid Session', count: 0 },
      ],
      tiers: [
        {
          name: 'Club Member Pass',
          memberPrice: newMemberPrice,
          nonMemberPrice: newStudentPrice,
          available: Math.round(newEventCapacity * 0.6),
          total: Math.round(newEventCapacity * 0.6),
          perks: `Special Member Prize (${Math.round(((newStudentPrice - newMemberPrice) / newStudentPrice) * 100)}% Discount), Priority Entry & Digital QR Pass`,
        },
        {
          name: 'General Student Pass',
          memberPrice: newStudentPrice,
          nonMemberPrice: newStudentPrice + 50,
          available: Math.round(newEventCapacity * 0.4),
          total: Math.round(newEventCapacity * 0.4),
          perks: 'Standard Student Admission & Door Check-In',
        },
      ],
    });

    setSelectedEventId(newId);
    setShowPostModal(false);
    setNewEventTitle('');
    setNewEventDescription('');
  };

  // Handle Reassign Organizer
  const handleReassignOrganizer = (organizer: typeof organizerCandidates[0]) => {
    assignEventOrganizer(currentEvent.id, {
      ...organizer,
      assignedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'ACTIVE',
    });
    setShowReassignModal(false);
  };

  // Handle Scanner Simulation
  const handleRunScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const res = checkInDoorTicket(scanInput.trim());
    setScanResult({ message: res.message, isError: !res.success });
    if (res.success) {
      setScanInput('');
    }
  };

  const isOrganizer = roleVariant === 'EVENT_ORGANIZER';
  const roleTitleBadge = isOrganizer ? 'Event Organizer Operations Suite' : 'Club President Executive Suite';
  const roleSuiteTitle = isOrganizer ? 'Events, Ticket Quotas & Attendee Analytics' : 'Events & Fundraisers Command Suite';
  const roleSubtitle = isOrganizer
    ? 'Manage live ticket quotas & differential tier pricing, inspect real-time attendee demographics (departments, study years, member ratio), operate door QR scanner, and publish campus events.'
    : 'Publish flagship campus events and charity fundraisers, appoint designated Event Organizers, inspect real-time attendee demographics & attendance check-ins, and issue authentic scannable QR passes.';
  const themeColor = isOrganizer ? '#2563eb' : '#7c3aed';
  const themeLightBg = isOrganizer ? '#eff6ff' : '#f3e8ff';
  const themeBorder = isOrganizer ? '#bfdbfe' : '#ddd6fe';

  return (
    <div style={{ fontFamily: 'var(--font-family-body)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. ROLE EXECUTIVE HEADER ─────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: themeColor,
                background: themeLightBg,
                padding: '3px 9px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                border: `1px solid ${themeBorder}`,
                letterSpacing: '0.4px',
              }}
              className="dark:bg-slate-800 dark:text-blue-300 dark:border-slate-700"
            >
              {roleTitleBadge}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Skyline Student Association (2026-2027)
            </span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--foreground, #0f172a)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
            className="text-slate-900 dark:text-slate-100"
          >
            <Calendar style={{ width: '28px', height: '28px', color: themeColor }} />
            <span>{roleSuiteTitle}</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '800px' }} className="text-slate-500 dark:text-slate-400">
            {roleSubtitle}
          </p>
        </div>

        {/* Top Executive Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowScannerModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: '#f8fafc',
              color: '#1e3a8a',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-750"
          >
            <ShieldCheck style={{ width: '15px', height: '15px', color: '#2563eb' }} />
            <span>Door Scanner Simulator</span>
          </button>

          <button
            onClick={() => setShowPostModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              background: themeColor,
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 2px 4px ${isOrganizer ? 'rgba(37,99,235,0.25)' : 'rgba(124,58,237,0.25)'}`,
            }}
            className="hover:opacity-95 transition-opacity"
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>+ Post Event / Fundraiser</span>
          </button>
        </div>
      </div>

      {quotaAdjustNotice && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e3a8a',
            borderRadius: '10px',
            padding: '14px 18px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(37,99,235,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles style={{ width: '20px', height: '20px', color: '#2563eb', flexShrink: 0 }} />
            <span>{quotaAdjustNotice}</span>
          </div>
          <button
            onClick={() => setQuotaAdjustNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e3a8a', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {bookingNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            padding: '14px 18px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(16,185,129,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#059669', flexShrink: 0 }} />
            <span>{bookingNotice}</span>
          </div>
          <button
            onClick={() => setBookingNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. ACTIVE EVENT SELECTOR & QUICK HIGHLIGHT BAR ───────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
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
              placeholder="Search server events (debounced 300ms)..."
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 28px 8px 30px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            {eventSearchQuery && (
              <button
                onClick={() => setEventSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            )}
          </div>

          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Active Event:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              fontSize: '13px',
              fontWeight: 700,
              background: 'var(--input-bg, #ffffff)',
              color: 'var(--foreground, #0f172a)',
              outline: 'none',
              minWidth: '280px',
              flex: '1 1 280px',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            {serverEvents.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.type === 'FUNDRAISER' ? 'Fundraiser' : 'Event'}) — {evt.date}
              </option>
            ))}
          </select>

          {isSearchingEvents && (
            <span style={{ fontSize: '11px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
              Querying server...
            </span>
          )}
        </div>

        {/* Assigned Event Organizer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <img
              src={currentEvent.assignedOrganizer?.avatar || 'https://api.dicebear.com/9.x/thumbs/svg?seed=Organizer&backgroundColor=ffdfbf'}
              alt={currentEvent.assignedOrganizer?.name || 'Organizer'}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ASSIGNED ORGANIZER</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }} className="dark:text-slate-100">
                {currentEvent.assignedOrganizer?.name || 'Unassigned'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowReassignModal(true)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#7c3aed',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-purple-400"
          >
            <UserCheck style={{ width: '14px', height: '14px' }} />
            <span>Reassign Organizer</span>
          </button>
        </div>
      </div>

      {/* ── 3. FOUR EXECUTIVE KPI METRIC CARDS ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Registrations & Capacity */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-blue-950 dark:text-blue-300"
          >
            <Ticket style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Registrations Sold
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground, #0f172a)' }}>
              {currentEvent.soldCount} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>/ {currentEvent.capacity}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              {capacityPercent}% Quota Claimed ({currentEvent.capacity - currentEvent.soldCount} left)
            </div>
          </div>
        </div>

        {/* Card 2: Currently Attending / Live Check-In */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-emerald-950 dark:text-emerald-300"
          >
            <Users style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Currently Attending (Live)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669' }}>
              {currentEvent.checkedInCount} Checked-In
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {attendanceRate}% Attendance Rate • {remainingExpected} expected
            </div>
          </div>
        </div>

        {/* Card 3: Fundraiser & Ticket Revenue */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-amber-950 dark:text-amber-300"
          >
            <DollarSign style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Funds / Revenue
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--foreground, #0f172a)' }}>
              ₹{(currentEvent.revenue || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
              {fundraiserProgress}% of ₹{(fundraiserGoal || 0).toLocaleString()} Budget Goal
            </div>
          </div>
        </div>

        {/* Card 4: Member Electorate Ratio */}
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: '#f3e8ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-purple-950 dark:text-purple-300"
          >
            <Award style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Attendee Demographics
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed' }}>
              {memberVsStudent.members} Members
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              vs {memberVsStudent.students} General Students (68% Member share)
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. TABS NAVIGATION ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '2px',
        }}
        className="border-slate-200 dark:border-slate-800"
      >
        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'analytics' ? '#7c3aed' : 'transparent',
            color: activeTab === 'analytics' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'analytics' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <BarChart3 style={{ width: '16px', height: '16px' }} />
          <span>Event & Demographics Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('ticketing')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'ticketing' ? '#7c3aed' : 'transparent',
            color: activeTab === 'ticketing' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'ticketing' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Tag style={{ width: '16px', height: '16px' }} />
          <span>Student & Member Ticket Booking (Special Prize)</span>
        </button>

        <button
          onClick={() => setActiveTab('attendees')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'attendees' ? '#7c3aed' : 'transparent',
            color: activeTab === 'attendees' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'attendees' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Users style={{ width: '16px', height: '16px' }} />
          <span>Attendee Directory & Authentic QR Passes ({doorTickets.length})</span>
        </button>
      </div>

      {/* ── TAB 1: FULL VISUAL ANALYTICS (GRAPHS & CHARTS) ────────── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main 2-Column Graphs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            
            {/* GRAPH 1: "From Where People Registered" (Department Source Distribution) */}
            <div
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--foreground, #0f172a)' }}>
                    Attendee Demographics: Where People Registered From
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Distribution of {currentEvent.soldCount} registered students across university departments.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  DEPT BREAKDOWN
                </span>
              </div>

              {/* Progress Bar Distribution List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {departmentStats.map((dept: { department: string; count: number; percentage: number }, i: number) => {
                  const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626'];
                  const color = colors[i % colors.length];

                  return (
                    <div key={dept.department} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
                        <span style={{ color: 'var(--foreground, #1e293b)' }}>{dept.department}</span>
                        <span style={{ color: '#64748b' }}>
                          {dept.count} students ({dept.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }} className="dark:bg-slate-800">
                        <div
                          style={{
                            height: '100%',
                            width: `${dept.percentage}%`,
                            background: color,
                            borderRadius: '4px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }} className="border-slate-100 dark:border-slate-800">
                <span>Top Source: <strong>Computer Science (42%)</strong></span>
                <span>Inter-departmental representation: 5 Schools</span>
              </div>
            </div>

            {/* GRAPH 2: "How Many Currently Attending" (Live Check-In Velocity & Attendance) */}
            <div
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--foreground, #0f172a)' }}>
                    Live Door Attendance: Who is Currently Attending
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Real-time check-in scan cadence at entrance gates vs total tickets issued.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#ecfdf5',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  LIVE DOOR SCANNER
                </span>
              </div>

              {/* Big Attendance Meter */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>ATTENDANCE RATE</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#059669' }}>
                    {attendanceRate}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    <strong>{currentEvent.checkedInCount}</strong> verified attendees in venue
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>REMAINING TO ARRIVE</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#1e3a8a' }}>
                    {remainingExpected}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    Passes pending door scan
                  </div>
                </div>
              </div>

              {/* Hourly Arrival Chart (Bar Columns) */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                  CHECK-IN VELOCITY BY TIME WINDOW
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${attendanceHourly.length}, 1fr)`, gap: '8px' }}>
                  {attendanceHourly.map((slot: { hour: string; count: number }) => {
                    const maxCount = Math.max(...attendanceHourly.map((s: { count: number }) => s.count), 1);
                    const barHeight = Math.round((slot.count / maxCount) * 80) + 20;

                    return (
                      <div key={slot.hour} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#059669' }}>
                          {slot.count}
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '100px',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            padding: '4px',
                          }}
                          className="dark:bg-slate-800"
                        >
                          <div
                            style={{
                              width: '100%',
                              height: `${barHeight}%`,
                              background: '#10b981',
                              borderRadius: '4px',
                              transition: 'height 0.4s ease',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
                          {slot.hour}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Row: Year Cohorts & Fundraiser Target */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
            
            {/* GRAPH 3: Year Cohort Distribution */}
            <div
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                Academic Year / Cohort Breakdown
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {yearStats.map((yr: { year: string; count: number; percentage?: number }) => (
                  <div
                    key={yr.year}
                    style={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid #e2e8f0',
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  >
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#7c3aed' }}>
                      {yr.count}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                      {yr.year}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {yr.percentage}% of attendees
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GRAPH 4: Fundraiser Budget Target & Financial Aggregation */}
            <div
              style={{
                background: 'var(--card-bg, #ffffff)',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Fundraiser Target & Revenue Achievement
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>
                  {fundraiserProgress}% Achieved
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                  <span>Collected: ₹{(currentEvent.revenue || 0).toLocaleString()}</span>
                  <span>Goal: ₹{(fundraiserGoal || 0).toLocaleString()}</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }} className="dark:bg-slate-800">
                  <div
                    style={{
                      height: '100%',
                      width: `${fundraiserProgress}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      borderRadius: '5px',
                    }}
                  />
                </div>
              </div>

              <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                • Automated ledger deposit verified through Razorpay payment gateway.<br />
                • Proceeds earmarked for campus gala sound equipment and charity welfare relief.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: TICKET BOOKING WITH SPECIAL MEMBER PRICE ───────── */}
      {activeTab === 'ticketing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '20px' }}>
          
          {/* Left Column: Tiers with Special Member Price */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#15803d',
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  ELIGIBILITY ENFORCED
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Booking open only to University Students & Verified SSA Members
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                {currentEvent.title} — Tiered Passes
              </h3>
            </div>

            {/* Attendee Type Switcher (Simulates Student vs Official Member) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }} className="dark:text-slate-100">
                  Select Booking Persona / Electorate:
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Club members automatically unlock exclusive discounted member pricing.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setAttendeeType('MEMBER')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: attendeeType === 'MEMBER' ? '#15803d' : '#e2e8f0',
                    color: attendeeType === 'MEMBER' ? 'white' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Award style={{ width: '13px', height: '13px' }} />
                  <span>SSA Club Member (Special Prize)</span>
                </button>
                <button
                  onClick={() => setAttendeeType('STUDENT')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: attendeeType === 'STUDENT' ? '#1e3a8a' : '#e2e8f0',
                    color: attendeeType === 'STUDENT' ? 'white' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>Regular Campus Student</span>
                </button>
              </div>
            </div>

            {/* Tiers List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {currentEvent.tiers.map((tier: MockEvent['tiers'][number]) => {
                const isSoldOut = tier.available === 0;
                const activePrice = attendeeType === 'MEMBER' ? tier.memberPrice : tier.nonMemberPrice;
                const savingsAmount = tier.nonMemberPrice - tier.memberPrice;
                const savingsPercent = Math.round((savingsAmount / tier.nonMemberPrice) * 100);

                return (
                  <div
                    key={tier.name}
                    style={{
                      border: attendeeType === 'MEMBER' ? '2px solid #bbf7d0' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      background: attendeeType === 'MEMBER' ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                    className="dark:bg-slate-800/80 dark:border-slate-700"
                  >
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }} className="dark:text-slate-100">
                          {tier.name}
                        </span>
                        {attendeeType === 'MEMBER' && (
                          <span
                            style={{
                              background: '#15803d',
                              color: 'white',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <Sparkles style={{ width: '10px', height: '10px' }} />
                            SPECIAL MEMBER PRIZE ({savingsPercent}% OFF)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {tier.perks || 'Full event admission and banquet access.'}
                      </div>
                      <div style={{ fontSize: '11px', color: isSoldOut ? '#dc2626' : '#15803d', fontWeight: 700, marginTop: '4px' }}>
                        {isSoldOut ? 'Sold Out' : `${tier.available} passes remaining of ${tier.total}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 900, color: attendeeType === 'MEMBER' ? '#15803d' : '#1e3a8a' }}>
                          ₹{activePrice}
                        </div>
                        {attendeeType === 'MEMBER' && (
                          <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            Standard Student: ₹{tier.nonMemberPrice}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCheckoutTier({
                            eventId: currentEvent.id,
                            tierName: tier.name,
                            price: activePrice,
                            isMember: attendeeType === 'MEMBER',
                          })
                        }
                        disabled={isSoldOut}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isSoldOut ? '#cbd5e1' : attendeeType === 'MEMBER' ? '#15803d' : '#1e3a8a',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: isSoldOut ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSoldOut ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <CreditCard style={{ width: '14px', height: '14px' }} />
                        <span>Pay & Book Pass</span>
                      </button>
                    </div>

                    {/* Quota Management Controls for Organizers / Leadership */}
                    <div
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px dashed #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                      className="border-slate-200 dark:border-slate-700"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                        <Tag style={{ width: '12px', height: '12px', color: themeColor }} />
                        <span style={{ fontWeight: 600 }}>Live Quota Allocation:</span>
                        <span style={{ fontWeight: 800, color: '#0f172a' }} className="dark:text-slate-100">
                          {tier.available} passes remaining of {tier.total}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', marginRight: '4px' }}>Adjust Quota:</span>
                        <button
                          onClick={() => {
                            updateEventTierQuota(currentEvent.id, tier.name, 25);
                            setQuotaAdjustNotice(`Added +25 quota passes to "${tier.name}". Live capacity updated!`);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          className="hover:bg-green-50 transition-colors"
                          title="Increase quota by 25 seats"
                        >
                          +25 Seats
                        </button>

                        <button
                          onClick={() => {
                            updateEventTierQuota(currentEvent.id, tier.name, 50);
                            setQuotaAdjustNotice(`Added +50 quota passes to "${tier.name}". Live capacity updated!`);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#15803d',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          className="hover:bg-green-50 transition-colors"
                          title="Increase quota by 50 seats"
                        >
                          +50 Seats
                        </button>

                        <button
                          onClick={() => {
                            if (tier.available <= 0) return;
                            const delta = Math.min(10, tier.available);
                            updateEventTierQuota(currentEvent.id, tier.name, -delta);
                            setQuotaAdjustNotice(`Reserved/Reduced ${delta} passes from "${tier.name}".`);
                          }}
                          disabled={tier.available <= 0}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            color: tier.available <= 0 ? '#94a3b8' : '#dc2626',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: tier.available <= 0 ? 'not-allowed' : 'pointer',
                          }}
                          className="hover:bg-red-50 transition-colors"
                          title="Reduce available quota by 10 seats"
                        >
                          -10 Seats
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Authentic Digital Pass with REAL QR CODE */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                AUTHENTIC DIGITAL PASS DEMO
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0 0 0', color: '#0f172a' }} className="dark:text-slate-100">
                Camera-Scannable QR Ticket
              </h3>
            </div>

            {/* Genuine Scannable QR Code */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <RealQrCode
                value={`SSA-VERIFIED-TKT-GALA-2026-PRESIDENT-PASS-${user?.email || 'deepak@nmit.edu'}`}
                size={170}
                label="SSA-GALA-2026-PRES-001"
                subLabel="Point your phone camera to scan this authentic code"
              />
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#475569',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
              className="bg-slate-50 dark:bg-slate-800"
            >
              <div>• <strong>Attendee:</strong> {user?.name || 'Deepak Kumar'}</div>
              <div>• <strong>Electorate Status:</strong> Official Club Member (Special Prize Applied)</div>
              <div>• <strong>Event:</strong> {currentEvent.title}</div>
              <div>• <strong>Venue:</strong> {currentEvent.location}</div>
            </div>

            <button
              onClick={() => setShowScannerModal(true)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e3a8a',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-300"
            >
              <ShieldCheck style={{ width: '15px', height: '15px' }} />
              <span>Test Scan This Ticket in Door Simulator</span>
            </button>
          </div>

        </div>
      )}

      {/* ── TAB 3: ATTENDEE DIRECTORY & AUTHENTIC QR PASSES ───────── */}
      {activeTab === 'attendees' && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {/* Table Header Filter */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
            className="border-slate-100 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '15px',
                    height: '15px',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search attendee, ticket ID, dept..."
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #0f172a)',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={checkInFilter}
                onChange={(e) => setCheckInFilter(e.target.value as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '12px',
                  fontWeight: 600,
                  outline: 'none',
                }}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                <option value="ALL">All Attendees</option>
                <option value="CHECKED_IN">Currently Attending (Checked In)</option>
                <option value="PENDING">Pending Arrival</option>
              </select>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Showing {filteredTickets.length} of {doorTickets.length} Registered Passes
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }} className="dark:bg-slate-800 dark:border-slate-700">
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>TICKET ID</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ATTENDEE & DEPT</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>TIER & ELECTORATE</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>SEAT & TIME</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>CHECK-IN STATUS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>AUTHENTIC QR CODE</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {t.id}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--foreground, #0f172a)' }}>{t.attendee}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {t.department || 'Computer Science'} • {t.year || '3rd Year'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600 }}>{t.tier}</div>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: t.isMember ? '#dcfce7' : '#f1f5f9',
                          color: t.isMember ? '#15803d' : '#64748b',
                        }}
                      >
                        {t.isMember ? 'Club Member (Special Rate)' : 'Student Guest'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                      <div>{t.seatNumber || 'General'}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.time}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <button
                        onClick={() => checkInDoorTicket(t.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: t.checkedIn ? '#dcfce7' : '#fef3c7',
                          color: t.checkedIn ? '#15803d' : '#b45309',
                        }}
                      >
                        {t.checkedIn ? '✓ Attending' : 'Mark In'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setShowQrModal(t)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#1e3a8a',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-blue-400"
                      >
                        View Real QR Pass
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: POST NEW EVENT / FUNDRAISER ────────────────────── */}
      {showPostModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Post New Event or Fundraiser
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Define event parameters, assign an Event Organizer, and configure Special Member Pricing.
                </p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostEventSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Event / Fundraiser Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Annual Spring Gala 2026, Charity Bake Sale"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Event Type *
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    <option value="FLAGSHIP_EVENT">Flagship Event / Gala</option>
                    <option value="FUNDRAISER">Charity Fundraiser</option>
                    <option value="WORKSHOP">Technical Workshop / Hackathon</option>
                    <option value="SOCIAL">Social Mixer & Cultural</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Assign Event Organizer *
                  </label>
                  <select
                    value={newOrganizerName}
                    onChange={(e) => setNewOrganizerName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  >
                    {organizerCandidates.map((o) => (
                      <option key={o.name} value={o.name}>
                        {o.name} ({o.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newEventType === 'FUNDRAISER' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#059669' }}>
                    Fundraiser Target Goal (₹) *
                  </label>
                  <input
                    type="number"
                    value={newFundraiserGoal}
                    onChange={(e) => setNewFundraiserGoal(Number(e.target.value))}
                    placeholder="e.g. 50000"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #86efac', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="e.g. 6:30 PM - 10:30 PM"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    value={newEventVenue}
                    onChange={(e) => setNewEventVenue(e.target.value)}
                    placeholder="e.g. Main Auditorium"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Maximum Capacity
                  </label>
                  <input
                    type="number"
                    value={newEventCapacity}
                    onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Special Member Pricing Box */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
                className="dark:bg-emerald-950/40 dark:border-emerald-800"
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }} className="dark:text-emerald-300">
                  Ticket Tier Pricing & Member Discount Privilege
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '4px' }} className="dark:text-emerald-300">
                      Special Member Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={newMemberPrice}
                      onChange={(e) => setNewMemberPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#166534', marginBottom: '4px' }} className="dark:text-emerald-300">
                      Standard Student Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={newStudentPrice}
                      onChange={(e) => setNewStudentPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer' }}
                >
                  Publish Event & Authorize Organizer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REASSIGN EVENT ORGANIZER MODAL ─────────────────── */}
      {showReassignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Assign Event Organizer
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Assign an official organizer responsible for door scanner verification & setup.
                </p>
              </div>
              <button
                onClick={() => setShowReassignModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {organizerCandidates.map((org) => {
                const isSelected = currentEvent.assignedOrganizer?.name === org.name;

                return (
                  <div
                    key={org.name}
                    onClick={() => handleReassignOrganizer(org)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={org.avatar}
                        alt={org.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }} className="dark:text-slate-100">
                          {org.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>
                          {org.role}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {org.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isSelected ? '#7c3aed' : '#f1f5f9',
                        color: isSelected ? 'white' : '#475569',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {isSelected ? 'Assigned' : 'Appoint Lead'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: VIEW AUTHENTIC QR PASS MODAL ───────────────────── */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '2px solid #1e3a8a',
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowQrModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              OFFICIAL VERIFIED ENTRY PASS
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', margin: '4px 0 12px 0' }}>
              {showQrModal.attendee}
            </h3>

            {/* Authentic Camera Scannable QR */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }}>
              <RealQrCode
                value={showQrModal.qrToken || `SSA-GALA-${showQrModal.id}-${showQrModal.attendee.replace(/\s+/g, '')}`}
                size={180}
                label={showQrModal.id}
                subLabel="Point smartphone camera to scan & verify"
              />
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                color: '#475569',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div>• <strong>Tier:</strong> {showQrModal.tier}</div>
              <div>• <strong>Department:</strong> {showQrModal.department || 'Computer Science & Engineering'}</div>
              <div>• <strong>Seating:</strong> {showQrModal.seatNumber || 'Table B, Seat 04'}</div>
              <div>• <strong>Status:</strong> {showQrModal.checkedIn ? '✓ Already Checked-In' : 'Pending Door Arrival'}</div>
            </div>

            <button
              onClick={() => window.print()}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#1e3a8a',
                color: 'white',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              <span>Print Official Pass</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DOOR SCANNER SIMULATOR MODAL ───────────────────── */}
      {showScannerModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck style={{ width: '22px', height: '22px', color: '#10b981' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Door Scanner Verification Tool
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowScannerModal(false);
                  setScanResult(null);
                }}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0' }}>
              Simulate scanning a digital QR pass by typing or selecting a ticket ID (e.g. <code>TKT-GALA-001</code>, <code>TKT-GALA-003</code>).
            </p>

            <form onSubmit={handleRunScan} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                placeholder="Paste Ticket ID or Token..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#15803d',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Scan Pass
              </button>
            </form>

            {/* Quick click suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {doorTickets.slice(0, 4).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setScanInput(t.id)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  {t.id} ({t.attendee.split(' ')[0]})
                </button>
              ))}
            </div>

            {scanResult && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: scanResult.isError ? '#fef2f2' : '#ecfdf5',
                  color: scanResult.isError ? '#dc2626' : '#065f46',
                  border: scanResult.isError ? '1px solid #fecaca' : '1px solid #a7f3d0',
                }}
              >
                {scanResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RAZORPAY MODAL INTEGRATION ──────────────────────────────── */}
      {checkoutTier && (
        <RazorpayPaymentModal
          isOpen={Boolean(checkoutTier)}
          onClose={() => setCheckoutTier(null)}
          title={`Book Pass: ${checkoutTier.tierName}`}
          purpose={`${currentEvent.title} — ${checkoutTier.tierName} (${checkoutTier.isMember ? 'Special Member Rate' : 'Student Pass'})`}
          amount={checkoutTier.price}
          payerName={user?.name || 'Deepak Kumar'}
          payerEmail={user?.email || 'deepaka.ad24@bitsathy.ac.in'}
          onSuccess={(receipt) => {
            const res = bookEventTicket(
              checkoutTier.eventId,
              checkoutTier.tierName,
              user?.name || 'Deepak Kumar',
              checkoutTier.isMember,
              receipt
            );
            setBookingNotice(
              `Pass confirmed! Ticket #${res.ticketId} issued with authentic QR Pass.`
            );
            setCheckoutTier(null);
          }}
        />
      )}
    </div>
  );
};
