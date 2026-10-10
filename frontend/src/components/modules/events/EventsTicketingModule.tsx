import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  QrCode,
  Search,
  Plus,
  ShieldCheck,
  Building2,
  Sparkles,
  X,
  Settings,
  Check,
  ClipboardList,
} from 'lucide-react';
import {
  mockEvents,
  mockMembers,
  MockEvent,
  MockTicketTier,
  MockVolunteerAssignment,
  MockEventAttendee,
} from '../../../data/mockClubData';
import { useAuthStore } from '../../../stores/auth.store';
import { ROLES, UserRole } from '../../../config/roles';

// Preset banner images matching the tech symposium reference screenshot
const BANNER_PRESETS = [
  { label: 'Hackathon / Collab', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80' },
  { label: 'Tech Bootcamp', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80' },
  { label: 'IoT Hardware', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
  { label: 'Robotics Arena', url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80' },
  { label: 'Web3 & Blockchain', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80' },
  { label: 'Design & UI/UX', url: 'https://images.unsplash.com/photo-1581291518655-9523c93269c4?auto=format&fit=crop&w=900&q=80' },
];

interface EventsTicketingModuleProps {
  role?: UserRole;
}

export const EventsTicketingModule: React.FC<EventsTicketingModuleProps> = ({ role }) => {
  const { role: authRole } = useAuthStore();
  const currentRole = role || authRole || ROLES.STUDENT;

  // Events list state
  const [eventsList, setEventsList] = useState<MockEvent[]>(mockEvents);
  const [selectedEventId, setSelectedEventId] = useState<string>(mockEvents[0]?.id || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels
  const [isPresidentCreateOpen, setIsPresidentCreateOpen] = useState(false);
  const [isOrganizerManageOpen, setIsOrganizerManageOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeredTicketPass, setRegisteredTicketPass] = useState<{
    event: MockEvent;
    attendee: MockEventAttendee;
  } | null>(null);

  // Notification Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Active event object
  const activeEvent = useMemo(
    () => eventsList.find((e) => e.id === selectedEventId) || eventsList[0],
    [eventsList, selectedEventId]
  );

  // President New Event Form State
  const [newEvtTitle, setNewEvtTitle] = useState('');
  const [newEvtCategory, setNewEvtCategory] = useState<MockEvent['category']>('Hackathon');
  const [newEvtDate, setNewEvtDate] = useState('MAY 14-16, 2026');
  const [newEvtLocation, setNewEvtLocation] = useState('IIT Madras');
  const [newEvtHall, setNewEvtHall] = useState('Central Lecture Theatre 1');
  const [newEvtCapacity, setNewEvtCapacity] = useState(120);
  const [newEvtOrganizerId, setNewEvtOrganizerId] = useState(mockMembers[0]?.id || 'mem-001');
  const [newEvtNotes, setNewEvtNotes] = useState('Ensure club members receive 50% discount and prepare registration desk with NFC wristbands.');
  const [newEvtBanner, setNewEvtBanner] = useState(BANNER_PRESETS[0].url);
  const [newEvtTags, setNewEvtTags] = useState('Innovation, Cloud, Student Hack');

  // Organizer Workbench state for active event
  const [organizerTab, setOrganizerTab] = useState<'tiers' | 'volunteers' | 'attendees' | 'announcements' | 'verify'>('tiers');

  // Organizer Pricing Tiers state for active event
  const [activeTiers, setActiveTiers] = useState<MockTicketTier[]>(activeEvent?.tiers || []);

  // Organizer Volunteer Assignment Form state
  const [newVolMemberId, setNewVolMemberId] = useState(mockMembers[0]?.id || '');
  const [newVolRole, setNewVolRole] = useState('Registration Desk & Attendee Check-in');
  const [newVolShift, setNewVolShift] = useState('08:30 AM - 01:30 PM');
  const [newVolGuidance, setNewVolGuidance] = useState(
    '1. Scan student QR pass.\n2. Confirm membership status if discounted pass.\n3. Hand over welcome kit and attendee lanyard.\n4. Mark as Checked In.'
  );

  // Organizer Announcement Form state
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');

  // Membership Verification Tool state
  const [verifySearchQuery, setVerifySearchQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    found: boolean;
    member?: (typeof mockMembers)[0];
    searched: boolean;
  }>({ found: false, searched: false });

  // Registration modal state
  const [selectedTierId, setSelectedTierId] = useState<string>(activeEvent?.tiers[0]?.id || '');
  const [regName, setRegName] = useState(
    currentRole === ROLES.MEMBER ? 'Deepak Kumar (Verified Member)' : 'Aarav Patel (Student)'
  );
  const [regEmail, setRegEmail] = useState(
    currentRole === ROLES.MEMBER ? 'deepaka.ad24@bitsathy.ac.in' : 'aarav.patel@campus.edu'
  );

  // Volunteer Door Check-in search query
  const [volunteerSearchQuery, setVolunteerSearchQuery] = useState('');

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return eventsList.filter((evt) => {
      const matchCat = categoryFilter === 'ALL' || evt.category.toUpperCase() === categoryFilter.toUpperCase();
      const matchSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [eventsList, categoryFilter, searchQuery]);

  // Handler: President Creates & Delegates Event
  const handlePresidentCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedMember = mockMembers.find((m) => m.id === newEvtOrganizerId) || mockMembers[0];

    const createdEvent: MockEvent = {
      id: `evt-${Date.now()}`,
      title: newEvtTitle,
      category: newEvtCategory,
      bannerImage: newEvtBanner,
      dateDisplay: newEvtDate.toUpperCase(),
      date: newEvtDate,
      time: '09:00 AM - 05:00 PM',
      location: newEvtLocation,
      venueHall: newEvtHall,
      tags: newEvtTags.split(',').map((t) => t.trim()).filter(Boolean),
      capacity: Number(newEvtCapacity),
      soldCount: 0,
      checkedInCount: 0,
      revenue: 0,
      status: 'ORGANIZER_CONFIGURING',
      presidentNotes: newEvtNotes,
      assignedOrganizer: {
        id: assignedMember.id,
        name: assignedMember.name,
        email: assignedMember.email,
        assignedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      tiers: [
        {
          id: `tier-std-${Date.now()}`,
          name: 'Club Member Privilege Pass',
          memberPrice: 100,
          nonMemberPrice: 250,
          available: Math.floor(Number(newEvtCapacity) / 2),
          total: Math.floor(Number(newEvtCapacity) / 2),
          description: 'Official 60% member concession per club bylaws',
        },
        {
          id: `tier-gen-${Date.now()}`,
          name: 'General Student Pass',
          memberPrice: 150,
          nonMemberPrice: 300,
          available: Math.ceil(Number(newEvtCapacity) / 2),
          total: Math.ceil(Number(newEvtCapacity) / 2),
          description: 'Standard campus entry pass with workshop kit',
        },
      ],
      volunteers: [
        {
          id: `vol-${Date.now()}`,
          memberId: 'mem-001',
          memberName: 'Deepak Kumar',
          memberEmail: 'deepaka.ad24@bitsathy.ac.in',
          role: 'Registration Desk & Attendee Check-in',
          shift: '08:30 AM - 01:30 PM',
          responsibilities: 'Manage entry queue, verify student QR pass and validate member concession badge.',
          guideInstructions: [
            'Scan attendee digital ticket pass QR code.',
            'If ticket tier is "Club Member", verify active standing on club roster.',
            'Issue attendee lanyard badge and meal token.',
            'Direct student to Main Auditorium.',
          ],
          status: 'CONFIRMED',
          contactPhone: '+91 98452 11029',
        },
      ],
      attendees: [],
      announcements: [
        {
          id: `ann-${Date.now()}`,
          title: 'Event Approved by President',
          content: `President initialized this event and delegated management to ${assignedMember.name}.`,
          timestamp: 'Just now',
          author: 'Club President',
          pinned: true,
        },
      ],
    };

    setEventsList([createdEvent, ...eventsList]);
    setSelectedEventId(createdEvent.id);
    setIsPresidentCreateOpen(false);
    setNotification({
      type: 'success',
      message: `Event "${createdEvent.title}" initialized and forwarded to Event Organiser ${assignedMember.name}.`,
    });
  };

  // Handler: Organizer Updates Pricing Tiers
  const handleUpdateTierPrice = (tierId: string, field: 'memberPrice' | 'nonMemberPrice', value: number) => {
    const updated = activeTiers.map((t) => (t.id === tierId ? { ...t, [field]: value } : t));
    setActiveTiers(updated);
    setEventsList((prev) =>
      prev.map((evt) => (evt.id === activeEvent.id ? { ...evt, tiers: updated } : evt))
    );
  };

  // Handler: Organizer Allocates Volunteer with Guide
  const handleAddVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    const volunteerMember = mockMembers.find((m) => m.id === newVolMemberId) || mockMembers[0];
    const instructions = newVolGuidance.split('\n').filter((line) => line.trim().length > 0);

    const newAssignment: MockVolunteerAssignment = {
      id: `vol-${Date.now()}`,
      memberId: volunteerMember.id,
      memberName: volunteerMember.name,
      memberEmail: volunteerMember.email,
      role: newVolRole,
      shift: newVolShift,
      responsibilities: `Responsible for: ${newVolRole} with active check-in guidance.`,
      guideInstructions: instructions.length > 0 ? instructions : ['Scan passes', 'Verify member status', 'Assist attendees'],
      status: 'CONFIRMED',
      contactPhone: '+91 98765 43210',
    };

    const updatedEvent = {
      ...activeEvent,
      volunteers: [...activeEvent.volunteers, newAssignment],
    };

    setEventsList((prev) => prev.map((evt) => (evt.id === activeEvent.id ? updatedEvent : evt)));
    setNotification({
      type: 'success',
      message: `Volunteer ${volunteerMember.name} assigned to "${newVolRole}" with operating guidelines!`,
    });
  };

  // Handler: Organizer Publishes Announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      timestamp: 'Just now',
      author: `${activeEvent.assignedOrganizer?.name || 'Event Organizer'} (Organizer)`,
      pinned: true,
    };

    const updatedEvent = {
      ...activeEvent,
      announcements: [newAnnouncement, ...activeEvent.announcements],
    };

    setEventsList((prev) => prev.map((evt) => (evt.id === activeEvent.id ? updatedEvent : evt)));
    setNewAnnTitle('');
    setNewAnnContent('');
    setNotification({
      type: 'success',
      message: `Official announcement "${newAnnouncement.title}" published to all attendees!`,
    });
  };

  // Handler: Attendee Door Check-in (Used by Organizer & Volunteer)
  const handleCheckInAttendee = (attendeeId: string) => {
    const updatedAttendees = activeEvent.attendees.map((att) =>
      att.id === attendeeId
        ? {
            ...att,
            checkedIn: true,
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : att
    );

    const checkInCount = updatedAttendees.filter((a) => a.checkedIn).length;

    const updatedEvent = {
      ...activeEvent,
      attendees: updatedAttendees,
      checkedInCount: checkInCount,
    };

    setEventsList((prev) => prev.map((evt) => (evt.id === activeEvent.id ? updatedEvent : evt)));
    setNotification({
      type: 'success',
      message: `Attendee checked in successfully! Turnout recorded.`,
    });
  };

  // Handler: Member Verification Lookup
  const handleVerifyMembership = () => {
    if (!verifySearchQuery.trim()) return;
    const query = verifySearchQuery.toLowerCase().trim();
    const found = mockMembers.find(
      (m) =>
        m.membershipId.toLowerCase() === query ||
        m.email.toLowerCase() === query ||
        m.name.toLowerCase().includes(query)
    );

    setVerifyResult({
      searched: true,
      found: !!found,
      member: found,
    });
  };

  // Handler: Student/Member Registers for Event
  const handleRegisterTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const tier = activeEvent.tiers.find((t) => t.id === selectedTierId) || activeEvent.tiers[0];
    const isMember = currentRole === ROLES.MEMBER;
    const finalPrice = isMember ? tier.memberPrice : tier.nonMemberPrice;

    const newAttendee: MockEventAttendee = {
      id: `att-${Date.now()}`,
      ticketId: `TKT-${activeEvent.id.slice(4, 8).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: regName,
      email: regEmail,
      isMember: isMember,
      membershipId: isMember ? 'SSA-2026-0042' : undefined,
      tier: tier.name,
      pricePaid: finalPrice,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      checkedIn: false,
    };

    const updatedEvent = {
      ...activeEvent,
      soldCount: activeEvent.soldCount + 1,
      revenue: activeEvent.revenue + finalPrice,
      attendees: [newAttendee, ...activeEvent.attendees],
    };

    setEventsList((prev) => prev.map((evt) => (evt.id === activeEvent.id ? updatedEvent : evt)));
    setIsRegisterModalOpen(false);
    setRegisteredTicketPass({ event: updatedEvent, attendee: newAttendee });
    setNotification({
      type: 'success',
      message: `Registration confirmed! Digital pass generated for ₹${finalPrice}.`,
    });
  };

  // Volunteer duty finding for the active logged-in volunteer
  const myVolunteerAssignments = useMemo(() => {
    const list: { event: MockEvent; assignment: MockVolunteerAssignment }[] = [];
    eventsList.forEach((evt) => {
      evt.volunteers.forEach((v) => {
        // Match volunteer by name or email or default to first if in volunteer role
        if (
          v.memberEmail.toLowerCase().includes('deepak') ||
          v.memberName.toLowerCase().includes('deepak') ||
          v.role.includes('Registration')
        ) {
          list.push({ event: evt, assignment: v });
        }
      });
    });
    return list.length > 0
      ? list
      : [{ event: eventsList[0], assignment: eventsList[0].volunteers[0] }];
  }, [eventsList]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── CLEAN, SHARP, ROLE-AWARE MODULE HEADER (NO CLUTTER) ────────────────── */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 24px',
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
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {currentRole === ROLES.PRESIDENT && 'President Operations'}
              {currentRole === ROLES.EVENT_ORGANIZER && 'Event Organiser Operations'}
              {currentRole === ROLES.VOLUNTEER && 'Volunteer Duty Console'}
              {currentRole === ROLES.MEMBER && 'Member Portal'}
              {currentRole === ROLES.STUDENT && 'Campus Ticketing'}
              {currentRole === ROLES.TREASURER && 'Treasury Event Income'}
              {currentRole === ROLES.ADMIN && 'Admin Oversight'}
            </span>

            {currentRole === ROLES.MEMBER && (
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '11px',
                }}
              >
                ✓ Active Member (SSA-2026-0042) • 60% Concession
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            {currentRole === ROLES.PRESIDENT && 'Events & Delegation Management'}
            {currentRole === ROLES.EVENT_ORGANIZER && 'Event Organiser Management Console'}
            {currentRole === ROLES.VOLUNTEER && 'Volunteer Duty & Door Check-in Console'}
            {currentRole === ROLES.MEMBER && 'Campus Events & Member Passes'}
            {currentRole === ROLES.STUDENT && 'Campus Events & Passes'}
            {(currentRole === ROLES.TREASURER || currentRole === ROLES.ADMIN) && 'Campus Events & Ticketing Platform'}
          </h2>

          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            {currentRole === ROLES.PRESIDENT &&
              'Create upcoming events, set target scope, and assign club members as Event Organisers.'}
            {currentRole === ROLES.EVENT_ORGANIZER &&
              'Manage your delegated events: ticket tier pricing, volunteer allocation with SOP guides, and attendance.'}
            {currentRole === ROLES.VOLUNTEER &&
              'Review your assigned duties, follow step-by-step guidance instructions, and scan attendee entry passes.'}
            {currentRole === ROLES.MEMBER &&
              'Explore upcoming college events. Member discounted pricing is automatically applied to your bookings.'}
            {currentRole === ROLES.STUDENT &&
              'Explore upcoming college hackathons, bootcamps, and symposiums. Club members receive up to 60% discount.'}
            {(currentRole === ROLES.TREASURER || currentRole === ROLES.ADMIN) &&
              'Monitor ticket tiers, verified membership concessions, seat availability, and gate collections.'}
          </p>
        </div>

        {/* Primary Role Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentRole === ROLES.PRESIDENT && (
            <button
              onClick={() => setIsPresidentCreateOpen(true)}
              style={{
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)',
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Create Event & Assign Organiser
            </button>
          )}

          {currentRole === ROLES.EVENT_ORGANIZER && (
            <button
              onClick={() => setIsOrganizerManageOpen(true)}
              style={{
                background: '#0f172a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Settings style={{ width: '15px', height: '15px' }} />
              Open Organizer Operations Workbench
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification Alert */}
      {notification && (
        <div
          style={{
            background: notification.type === 'success' ? '#ecfdf5' : '#eff6ff',
            border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#bfdbfe'}`,
            color: notification.type === 'success' ? '#065f46' : '#1e3a8a',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: notification.type === 'success' ? '#10b981' : '#3b82f6' }} />
            <span style={{ fontWeight: 600 }}>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      )}

      {/* ── EVENT ORGANIZER ROLE: INCOMING DELEGATION REQUEST BANNER ───────────── */}
      {currentRole === ROLES.EVENT_ORGANIZER && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '18px 22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#1e3a8a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClipboardList style={{ width: '22px', height: '22px' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Delegated Event Request: {activeEvent.title}
                </span>
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  Action Required
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                <strong>President Directive:</strong> {activeEvent.presidentNotes || 'Set member & non-member pricing tiers, enforce club discount rules, and allocate volunteers.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOrganizerManageOpen(true)}
            style={{
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Settings style={{ width: '15px', height: '15px' }} />
            Configure Tiers, Capacity & Volunteers
          </button>
        </div>
      )}

      {/* ── VOLUNTEER ROLE: MY ASSIGNED DUTIES & SOP OPERATING GUIDANCE ────────── */}
      {currentRole === ROLES.VOLUNTEER && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              My Assigned Event Responsibilities & Standard Operating Guidance
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Allocated by Event Organiser
            </span>
          </div>

          {myVolunteerAssignments.map(({ event, assignment }) => (
            <div
              key={assignment.id}
              style={{
                background: 'white',
                border: '1px solid #cbd5e1',
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              {/* Duty Overview Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1e3a8a',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}
                    >
                      {assignment.role}
                    </span>
                    <span
                      style={{
                        background: assignment.status === 'ON_DUTY' ? '#dcfce7' : '#f1f5f9',
                        color: assignment.status === 'ON_DUTY' ? '#15803d' : '#475569',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {assignment.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '6px 0 2px 0' }}>
                    {event.title}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Shift: <strong>{assignment.shift}</strong> • Venue: {event.location} ({event.venueHall})
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Turnout Progress</span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#047857' }}>
                    {event.checkedInCount} / {event.soldCount} Checked In
                  </span>
                </div>
              </div>

              {/* Standard Operating Guidance (SOP) Instructions Box */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#1e3a8a' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                    Duty Guide & Instructions for {assignment.memberName}:
                  </span>
                </div>

                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {assignment.guideInstructions.map((instruction, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Volunteer Live Door Check-in Tool */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    Gate Check-in Scanner Console:
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {event.attendees.filter((a) => !a.checkedIn).length} attendees pending entry
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
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
                      placeholder="Search attendee by name or ticket ID (e.g. Aarav, TKT-AI-001)..."
                      value={volunteerSearchQuery}
                      onChange={(e) => setVolunteerSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                      }}
                    />
                  </div>
                </div>

                {/* Attendee Check-in quick table */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Ticket ID</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Attendee</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Membership Check</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Tier</th>
                        <th style={{ padding: '8px 12px', color: '#475569' }}>Status / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.attendees
                        .filter(
                          (a) =>
                            a.name.toLowerCase().includes(volunteerSearchQuery.toLowerCase()) ||
                            a.ticketId.toLowerCase().includes(volunteerSearchQuery.toLowerCase())
                        )
                        .map((att) => (
                          <tr key={att.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1e3a8a' }}>{att.ticketId}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{att.name}</td>
                            <td style={{ padding: '8px 12px' }}>
                              {att.isMember ? (
                                <span style={{ color: '#15803d', fontWeight: 700, fontSize: '11px' }}>
                                  ✓ Verified Member ({att.membershipId})
                                </span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '11px' }}>General Student</span>
                              )}
                            </td>
                            <td style={{ padding: '8px 12px', color: '#475569' }}>{att.tier}</td>
                            <td style={{ padding: '8px 12px' }}>
                              {att.checkedIn ? (
                                <span style={{ color: '#10b981', fontWeight: 700 }}>
                                  ✓ Admitted ({att.checkInTime || 'Scanned'})
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCheckInAttendee(att.id)}
                                  style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Check In Attendee
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FILTER & SEARCH TOOLBAR ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'Hackathon', 'Bootcamp', 'Technical Symposium', 'Competition', 'Workshop'].map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? '#1e3a8a' : '#e2e8f0',
                  background: isActive ? '#1e3a8a' : 'white',
                  color: isActive ? 'white' : '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat === 'ALL' ? 'All Events' : cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '15px',
              height: '15px',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search events, venue, tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              background: 'white',
            }}
          />
        </div>
      </div>

      {/* ── EVENT CARDS GRID (EXACT LAYOUT FROM REFERENCE IMAGE) ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px',
        }}
      >
        {filteredEvents.map((evt) => {
          const seatsLeft = evt.capacity - evt.soldCount;
          const percentageSold = Math.min(100, Math.round((evt.soldCount / evt.capacity) * 100));
          const isSoldOut = seatsLeft <= 0;

          // Member discount pricing calculation
          const lowestMemberPrice = Math.min(...evt.tiers.map((t) => t.memberPrice));
          const lowestNonMemberPrice = Math.min(...evt.tiers.map((t) => t.nonMemberPrice));
          const discountSavings = lowestNonMemberPrice - lowestMemberPrice;

          // Underline bar color based on seats left
          const barColor = seatsLeft <= 10 ? '#ef4444' : seatsLeft <= 50 ? '#f59e0b' : '#10b981';

          return (
            <div
              key={evt.id}
              onClick={() => setSelectedEventId(evt.id)}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: selectedEventId === evt.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
              }}
            >
              {/* Card Image Banner with Category Floating Badge */}
              <div style={{ position: 'relative', width: '100%', height: '185px', overflow: 'hidden' }}>
                <img
                  src={evt.bannerImage}
                  alt={evt.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = BANNER_PRESETS[0].url;
                  }}
                />

                {/* Floating Category Pill in Top-Right Corner */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(15, 23, 42, 0.82)',
                    backdropFilter: 'blur(6px)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}
                >
                  {evt.category}
                </div>

                {/* Status indicator pill top-left if in organizer draft */}
                {evt.status === 'ORGANIZER_CONFIGURING' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(217, 119, 6, 0.9)',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    ORGANIZER SETTING TIERS
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {/* Uppercase Orange Date */}
                <div
                  style={{
                    color: '#ea580c',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {evt.dateDisplay}
                </div>

                {/* Event Title */}
                <h3
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: 0,
                    lineHeight: 1.35,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {evt.title}
                </h3>

                {/* Venue with Building Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                  <Building2 style={{ width: '15px', height: '15px', flexShrink: 0, color: '#94a3b8' }} />
                  <span style={{ fontWeight: 500 }}>{evt.location}</span>
                </div>

                {/* Tags Pill Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                  {evt.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Member vs Student Pricing Display */}
                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: '10px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  {currentRole === ROLES.MEMBER ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#047857' }}>
                          ₹{lowestMemberPrice}
                        </span>
                        <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                          ₹{lowestNonMemberPrice}
                        </span>
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                        >
                          SAVE ₹{discountSavings}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                        ✓ Member Benefit Applied
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                          ₹{lowestNonMemberPrice}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Standard Price</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600 }}>
                        Club members pay ₹{lowestMemberPrice} (Save ₹{discountSavings})
                      </span>
                    </div>
                  )}

                  {/* Organizer Delegate tag */}
                  {evt.assignedOrganizer && (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Org: <strong style={{ color: '#1e293b' }}>{evt.assignedOrganizer.name.split(' ')[0]}</strong>
                    </span>
                  )}
                </div>

                {/* Card Footer: Seats Left Progress Bar + CTA Button */}
                <div
                  style={{
                    paddingTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  {/* Seats Left with colored progress bar underline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '110px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isSoldOut ? '#ef4444' : '#334155' }}>
                      {isSoldOut ? 'Sold Out' : `${seatsLeft} seats left`}
                    </span>
                    <div
                      style={{
                        width: '90px',
                        height: '4px',
                        background: '#e2e8f0',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percentageSold}%`,
                          height: '100%',
                          background: barColor,
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA Button Based on Role */}
                  {currentRole === ROLES.EVENT_ORGANIZER || currentRole === ROLES.PRESIDENT ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEventId(evt.id);
                        setIsOrganizerManageOpen(true);
                      }}
                      style={{
                        background: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Manage Event
                    </button>
                  ) : (
                    <button
                      disabled={isSoldOut}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEventId(evt.id);
                        setIsRegisterModalOpen(true);
                      }}
                      style={{
                        background: isSoldOut ? '#cbd5e1' : '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: isSoldOut ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isSoldOut ? 'Sold Out' : 'Register Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── PRESIDENT MODAL: CREATE EVENT & DELEGATE ORGANIZER ────────────────── */}
      {isPresidentCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <span
                  style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  President Workflow
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0 0' }}>
                  Initiate New Event & Delegate to Club Member
                </h3>
              </div>
              <button
                onClick={() => setIsPresidentCreateOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePresidentCreateEvent} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline AI Dev Sprint 2026"
                  value={newEvtTitle}
                  onChange={(e) => setNewEvtTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Event Category *
                  </label>
                  <select
                    value={newEvtCategory}
                    onChange={(e) => setNewEvtCategory(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: 'white',
                    }}
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Bootcamp">Bootcamp</option>
                    <option value="Technical Symposium">Technical Symposium</option>
                    <option value="Competition">Competition</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Target Dates Display *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MAY 18-20, 2026"
                    value={newEvtDate}
                    onChange={(e) => setNewEvtDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Campus Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Madras"
                    value={newEvtLocation}
                    onChange={(e) => setNewEvtLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Venue Hall / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Turing Computing Lab 3"
                    value={newEvtHall}
                    onChange={(e) => setNewEvtHall(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    min="20"
                    max="1000"
                    required
                    value={newEvtCapacity}
                    onChange={(e) => setNewEvtCapacity(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', display: 'block', marginBottom: '6px' }}>
                    Assign Club Member as Event Organiser *
                  </label>
                  <select
                    value={newEvtOrganizerId}
                    onChange={(e) => setNewEvtOrganizerId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '2px solid #3b82f6',
                      fontSize: '13px',
                      background: '#eff6ff',
                      fontWeight: 600,
                    }}
                  >
                    {mockMembers.map((mem) => (
                      <option key={mem.id} value={mem.id}>
                        {mem.name} ({mem.membershipId}) — {mem.tier} Member
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    Operational control will be delegated to this organizer upon submission.
                  </span>
                </div>
              </div>

              {/* Banner Preset Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Event Poster Banner Visual
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {BANNER_PRESETS.map((bp, i) => (
                    <div
                      key={i}
                      onClick={() => setNewEvtBanner(bp.url)}
                      style={{
                        position: 'relative',
                        height: '70px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: newEvtBanner === bp.url ? '3px solid #2563eb' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={bp.url} alt={bp.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.65)',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 6px',
                          fontWeight: 600,
                        }}
                      >
                        {bp.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Topic Tags */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Topic & Tech Stack Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Machine Learning, Python, National"
                  value={newEvtTags}
                  onChange={(e) => setNewEvtTags(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* President Handover Directives */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  President Directive / Handover Instructions to Organizer
                </label>
                <textarea
                  rows={2}
                  value={newEvtNotes}
                  onChange={(e) => setNewEvtNotes(e.target.value)}
                  placeholder="Set minimum 50% discount for club members, allocate 2 volunteers for front desk check-in..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsPresidentCreateOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Check style={{ width: '16px', height: '16px' }} />
                  Forward to Organizer & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORGANIZER WORKBENCH MODAL: CAPACITY, TIERS, VOLUNTEERS, ATTENDEES ── */}
      {isOrganizerManageOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Organizer Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      background: '#fce7f3',
                      color: '#be185d',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    Event Organiser Workbench
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Lead: <strong>{activeEvent.assignedOrganizer?.name || 'Assigned Member'}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px 0' }}>
                  {activeEvent.title}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  {activeEvent.location} • {activeEvent.dateDisplay} • {activeEvent.capacity} Total Seats
                </p>
              </div>

              <button
                onClick={() => setIsOrganizerManageOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '22px', height: '22px' }} />
              </button>
            </div>

            {/* Organizer Live Stats Strip */}
            <div
              style={{
                padding: '16px 24px',
                background: '#eff6ff',
                borderBottom: '1px solid #dbeafe',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>TICKETS SOLD</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e3a8a' }}>
                  {activeEvent.soldCount} / {activeEvent.capacity}
                </div>
                <span style={{ fontSize: '11px', color: '#3b82f6' }}>
                  {activeEvent.capacity - activeEvent.soldCount} seats remaining
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>TOTAL REVENUE</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857' }}>
                  ₹{activeEvent.revenue.toLocaleString()}
                </div>
                <span style={{ fontSize: '11px', color: '#059669' }}>Real-time collections</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>DOOR TURNOUT</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {activeEvent.checkedInCount} checked in
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {activeEvent.soldCount > 0 ? Math.round((activeEvent.checkedInCount / activeEvent.soldCount) * 100) : 0}% scanned
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: 600 }}>VOLUNTEER CREW</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {activeEvent.volunteers.length} allocated
                </div>
                <span style={{ fontSize: '11px', color: '#64748b' }}>With duty guidance SOP</span>
              </div>
            </div>

            {/* President Directive Banner if any */}
            {activeEvent.presidentNotes && (
              <div
                style={{
                  margin: '16px 24px 0 24px',
                  background: '#fefce8',
                  border: '1px solid #fef08a',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#854d0e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Sparkles style={{ width: '16px', height: '16px', flexShrink: 0, color: '#ca8a04' }} />
                <span>
                  <strong>President Note:</strong> {activeEvent.presidentNotes}
                </span>
              </div>
            )}

            {/* Organizer Tabs */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '14px 24px 0 24px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {[
                { id: 'tiers', label: '1. Ticket Pricing & Rules' },
                { id: 'volunteers', label: '2. Volunteer Allocation & Guide' },
                { id: 'attendees', label: '3. Member & Attendee Roster' },
                { id: 'verify', label: '4. Member Verification Tool' },
                { id: 'announcements', label: '5. Broadcast Announcements' },
              ].map((tab) => {
                const isActive = organizerTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setOrganizerTab(tab.id as any)}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '3px solid #1e3a8a' : '3px solid transparent',
                      color: isActive ? '#1e3a8a' : '#64748b',
                      fontSize: '13px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Organizer Tab Content */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* TAB 1: TICKET PRICING & CLUB DISCOUNT RULES */}
              {organizerTab === 'tiers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <ShieldCheck style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0 }} />
                    <span>
                      <strong>Club Bylaw Compliance:</strong> All events hosted by Skyline Student Association must grant a member discount of at least 30% to verified dues-paying members.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {activeTiers.map((tier) => {
                      const discountPct = Math.round(
                        ((tier.nonMemberPrice - tier.memberPrice) / tier.nonMemberPrice) * 100
                      );

                      return (
                        <div
                          key={tier.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '18px',
                            background: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                {tier.name}
                              </h4>
                              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                {tier.description}
                              </p>
                            </div>
                            <span
                              style={{
                                background: discountPct >= 30 ? '#dcfce7' : '#fee2e2',
                                color: discountPct >= 30 ? '#15803d' : '#b91c1c',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {discountPct}% Member Discount
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '4px' }}>
                                Member Ticket Price (₹) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={tier.memberPrice}
                                onChange={(e) =>
                                  handleUpdateTierPrice(tier.id, 'memberPrice', Number(e.target.value))
                                }
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #a7f3d0',
                                  background: 'white',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: '#065f46',
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                                Non-Member Student Price (₹) *
                              </label>
                              <input
                                type="number"
                                min="10"
                                value={tier.nonMemberPrice}
                                onChange={(e) =>
                                  handleUpdateTierPrice(tier.id, 'nonMemberPrice', Number(e.target.value))
                                }
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: 'white',
                                  fontSize: '14px',
                                  fontWeight: 700,
                                }}
                              />
                            </div>

                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                Tier Allocation Capacity
                              </label>
                              <div style={{ padding: '8px 12px', background: '#e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                {tier.available} / {tier.total} available
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: VOLUNTEER ALLOCATION & RESPONSIBILITY GUIDELINES */}
              {organizerTab === 'volunteers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Active Volunteer Roster */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                      Currently Assigned Volunteers & Standard Operating Guidance
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeEvent.volunteers.map((vol) => (
                        <div
                          key={vol.id}
                          style={{
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '16px',
                            background: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                  {vol.memberName}
                                </span>
                                <span
                                  style={{
                                    background: '#dbeafe',
                                    color: '#1d4ed8',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {vol.role}
                                </span>
                                <span
                                  style={{
                                    background: vol.status === 'ON_DUTY' ? '#dcfce7' : '#f1f5f9',
                                    color: vol.status === 'ON_DUTY' ? '#15803d' : '#64748b',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {vol.status}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>
                                Shift: {vol.shift} • Contact: {vol.contactPhone}
                              </span>
                            </div>
                          </div>

                          {/* SOP Guide Box */}
                          <div
                            style={{
                              background: 'white',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '12px 14px',
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                              Volunteer Operating Guide (SOP):
                            </span>
                            <ol style={{ margin: '6px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                              {vol.guideInstructions.map((inst, i) => (
                                <li key={i}>{inst}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allocate New Volunteer Form */}
                  <form
                    onSubmit={handleAddVolunteer}
                    style={{
                      border: '1px dashed #94a3b8',
                      borderRadius: '12px',
                      padding: '18px',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                      Allocate New Member Volunteer & Issue Duty Guidance
                    </h5>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Select Club Member *
                        </label>
                        <select
                          value={newVolMemberId}
                          onChange={(e) => setNewVolMemberId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            background: 'white',
                          }}
                        >
                          {mockMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.membershipId})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Role & Station *
                        </label>
                        <select
                          value={newVolRole}
                          onChange={(e) => setNewVolRole(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13px',
                            background: 'white',
                          }}
                        >
                          <option value="Registration Desk & Attendee Check-in">Registration Desk & Attendee Check-in</option>
                          <option value="Hardware & Cloud Lab Desk">Hardware & Cloud Lab Desk</option>
                          <option value="Stage Audio & Tech Desk">Stage Audio & Tech Desk</option>
                          <option value="Pit Arena Marshall & Safety Lead">Pit Arena Marshall & Safety Lead</option>
                          <option value="Welcome Kit & Swag Distribution">Welcome Kit & Swag Distribution</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Volunteer Shift Window *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 08:30 AM - 01:30 PM"
                        value={newVolShift}
                        onChange={(e) => setNewVolShift(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                        Volunteer Responsibility Instructions (1 instruction per line) *
                      </label>
                      <textarea
                        rows={3}
                        value={newVolGuidance}
                        onChange={(e) => setNewVolGuidance(e.target.value)}
                        placeholder="1. Verify attendee digital QR pass..."
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#1e3a8a',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Allocate Volunteer
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: MEMBER & ATTENDEE ROSTER & CHECK-IN */}
              {organizerTab === 'attendees' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Registered Attendees & Membership Validation
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {activeEvent.attendees.length} Total Attendees Registered
                    </span>
                  </div>

                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Ticket ID</th>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Attendee</th>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Membership Status</th>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Tier & Paid</th>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Door Status</th>
                          <th style={{ padding: '10px 14px', color: '#475569', fontWeight: 600 }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeEvent.attendees.map((att) => (
                          <tr key={att.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e3a8a' }}>{att.ticketId}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{att.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{att.email}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {att.isMember ? (
                                <span
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                                  Verified Member
                                </span>
                              ) : (
                                <span
                                  style={{
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                  }}
                                >
                                  General Student
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600 }}>₹{att.pricePaid}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{att.tier}</div>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {att.checkedIn ? (
                                <span
                                  style={{
                                    background: '#eff6ff',
                                    color: '#1d4ed8',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                  }}
                                >
                                  Checked In ({att.checkInTime || 'Scanned'})
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Awaiting Entry</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {!att.checkedIn ? (
                                <button
                                  onClick={() => handleCheckInAttendee(att.id)}
                                  style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 10px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Scan In
                                </button>
                              ) : (
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '12px' }}>✓ Verified</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: MEMBERSHIP VERIFICATION LOOKUP TOOL */}
              {organizerTab === 'verify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Door & Box Office Membership Verification
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      Verify whether an attendee is an active, dues-paying member before granting member concession rates.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Enter Membership ID (e.g. SSA-2026-0042) or email..."
                      value={verifySearchQuery}
                      onChange={(e) => setVerifySearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      onClick={handleVerifyMembership}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#1e3a8a',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Verify Membership
                    </button>
                  </div>

                  {verifyResult.searched && (
                    <div>
                      {verifyResult.found && verifyResult.member ? (
                        <div
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            borderRadius: '10px',
                            padding: '18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShieldCheck style={{ width: '20px', height: '20px', color: '#10b981' }} />
                              <span style={{ fontSize: '15px', fontWeight: 800, color: '#065f46' }}>
                                Active Club Member Verified!
                              </span>
                            </div>
                            <div style={{ marginTop: '6px', fontSize: '13px', color: '#047857' }}>
                              <strong>{verifyResult.member.name}</strong> • ID: {verifyResult.member.membershipId} • {verifyResult.member.email}
                            </div>
                            <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
                              Status: {verifyResult.member.duesPaid ? 'Dues Paid (Active Member)' : 'Dues Pending'} • Valid until {verifyResult.member.duesExpiresAt}
                            </div>
                          </div>

                          <div
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '12px',
                            }}
                          >
                            ✓ ELIGIBLE FOR MEMBER CONCESSION
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            padding: '18px',
                            color: '#991b1b',
                            fontSize: '13px',
                          }}
                        >
                          <strong>No Active Membership Found:</strong> The student is not in the active Skyline club roster. Standard non-member pricing applies.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BROADCAST ANNOUNCEMENTS */}
              {organizerTab === 'announcements' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <form
                    onSubmit={handlePublishAnnouncement}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Dispatch Official Event Broadcast Notice
                    </h5>

                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Announcement Headline (e.g. Venue Hall Shifted to Auditorium B)"
                        value={newAnnTitle}
                        onChange={(e) => setNewAnnTitle(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div>
                      <textarea
                        rows={3}
                        required
                        placeholder="Full update details to send to all registered attendees..."
                        value={newAnnContent}
                        onChange={(e) => setNewAnnContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 18px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#1e3a8a',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Publish Broadcast Notice
                      </button>
                    </div>
                  </form>

                  {/* Existing announcements */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {activeEvent.announcements.map((ann) => (
                      <div
                        key={ann.id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '14px',
                          background: 'white',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                            {ann.title}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{ann.timestamp}</span>
                        </div>
                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                          {ann.content}
                        </p>
                        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', display: 'block' }}>
                          By: {ann.author}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENT & MEMBER REGISTRATION MODAL ───────────────────────────────── */}
      {isRegisterModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                  Official Event Ticketing
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  Register for {activeEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterTicket} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentRole === ROLES.MEMBER ? (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <ShieldCheck style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <strong>Skyline Member Pass Concession Activated!</strong>
                    <div>You are paying member-exclusive rates with instant QR verification.</div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#1e3a8a',
                  }}
                >
                  <strong>Non-Member Student Rate:</strong>
                  <div>
                    Club members receive up to 60% discount on all campus events.
                  </div>
                </div>
              )}

              {/* Ticket Tier Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Select Ticket Tier *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeEvent.tiers.map((t) => {
                    const price = currentRole === ROLES.MEMBER ? t.memberPrice : t.nonMemberPrice;
                    const isSelected = selectedTierId === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTierId(t.id)}
                        style={{
                          border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isSelected ? '#f0f9ff' : 'white',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{t.description}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a8a' }}>₹{price}</div>
                          {currentRole === ROLES.MEMBER && (
                            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                              Reg: ₹{t.nonMemberPrice}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Attendee Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Attendee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Campus Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm & Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REGISTERED DIGITAL TICKET PASS SUCCESS MODAL ───────────────────────── */}
      {registeredTicketPass && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Ticket Header Graphic */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                color: 'white',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setRegisteredTicketPass(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                <Sparkles style={{ width: '12px', height: '12px' }} />
                OFFICIAL ENTRY PASS CONFIRMED
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                {registeredTicketPass.event.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#bfdbfe', margin: 0 }}>
                {registeredTicketPass.event.dateDisplay} • {registeredTicketPass.event.location}
              </p>
            </div>

            {/* Ticket Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px dashed #cbd5e1',
                }}
              >
                {/* QR Code Graphic Box */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    background: 'white',
                    border: '2px solid #0f172a',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <QrCode style={{ width: '80px', height: '80px', color: '#0f172a' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '0.08em' }}>
                  {registeredTicketPass.attendee.ticketId}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Scan at Registration Desk with NFC/QR tool</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>ATTENDEE NAME</span>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {registeredTicketPass.attendee.name}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>TICKET TIER</span>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {registeredTicketPass.attendee.tier}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>PRICE PAID</span>
                  <div style={{ fontWeight: 800, color: '#047857', fontSize: '14px' }}>
                    ₹{registeredTicketPass.attendee.pricePaid}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>STATUS</span>
                  <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '13px' }}>
                    {registeredTicketPass.attendee.isMember ? 'Verified Member' : 'General Student'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setRegisteredTicketPass(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#1e3a8a',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
