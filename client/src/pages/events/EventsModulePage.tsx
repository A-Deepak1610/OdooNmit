import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Users,
  Plus,
  Loader2,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Filter,
  Clock,
  UserCheck,
} from 'lucide-react';
import { CampusEventItem, eventService } from '../../services/event.service';
import { presidentService, PresidentMember } from '../../services/president.service';
import { EventAnalyticsView } from './EventAnalyticsView';

interface EventsModulePageProps {
  roleVariant?: 'PRESIDENT' | 'EVENT_ORGANIZER' | 'STUDENT' | 'MEMBER' | 'VOLUNTEER';
}

export const EventsModulePage: React.FC<EventsModulePageProps> = ({
  roleVariant = 'PRESIDENT',
}) => {
  const [events, setEvents] = useState<CampusEventItem[]>([]);
  const [clubMembers, setClubMembers] = useState<PresidentMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search, Status, and Posted Date Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [postedDateFilter, setPostedDateFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'PAST_MONTH'>('ALL');
  const [sortBy, setSortBy] = useState<'createdAt_desc' | 'createdAt_asc' | 'startAt_asc' | 'startAt_desc'>('createdAt_desc');

  // Active Sub-view (Events Grid vs Live Check-in Desk)
  const [activeSubView, setActiveSubView] = useState<'events' | 'checkin'>('events');

  // Live Check-in Station State (for President & Event Organizer)
  const [selectedCheckinEventId, setSelectedCheckinEventId] = useState<string>('');
  const [attendeeRoster, setAttendeeRoster] = useState<any>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [checkinStatusFilter, setCheckinStatusFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [doorPassCode, setDoorPassCode] = useState('');
  const [verifyingPass, setVerifyingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Selected Event for Full Analytics View (matching Image 2)
  const [selectedEvent, setSelectedEvent] = useState<CampusEventItem | null>(null);

  // Create Event Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    category: 'Hackathon',
    domain: 'AI/ML',
    description: '',
    venue: '',
    mode: 'offline',
    startAt: '2026-03-25T09:00',
    endAt: '2026-03-27T18:00',
    totalSeats: 100,
    memberPriceINR: 100,
    nonMemberPriceINR: 150,
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
    inchargeId: '',
    prizes: '1st Prize: ₹50,000 Cash, 2nd Prize: ₹25,000, 3rd Prize: ₹10,000',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, membersRes] = await Promise.all([
        eventService.getEvents({
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          domain: domainFilter !== 'ALL' ? domainFilter : undefined,
          postedDate: postedDateFilter !== 'ALL' ? postedDateFilter : undefined,
          sortBy,
        }),
        presidentService.getMembers().catch(() => []),
      ]);

      setEvents(eventsRes);
      setClubMembers(membersRes);

      // Auto-select first event for check-in desk if not selected yet
      if (!selectedCheckinEventId && eventsRes.length > 0) {
        setSelectedCheckinEventId(eventsRes[0].id);
        loadAttendeesForEvent(eventsRes[0].id);
      } else if (selectedCheckinEventId) {
        loadAttendeesForEvent(selectedCheckinEventId);
      }

      // If an event was selected, refresh its details
      if (selectedEvent) {
        const refreshed = eventsRes.find((e) => e.id === selectedEvent.id);
        if (refreshed) setSelectedEvent(refreshed);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load events data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendeesForEvent = async (eventId: string) => {
    if (!eventId) return;
    try {
      const roster = await eventService.getEventAttendees(eventId);
      setAttendeeRoster(roster);
    } catch {
      // Ignore or empty roster
      setAttendeeRoster(null);
    }
  };

  const handleSelectEventForCheckin = (eventId: string) => {
    setSelectedCheckinEventId(eventId);
    loadAttendeesForEvent(eventId);
  };

  const handleOpenCheckinDesk = (eventId: string) => {
    setSelectedCheckinEventId(eventId);
    loadAttendeesForEvent(eventId);
    setActiveSubView('checkin');
  };

  const handleToggleCheckin = async (bookingId: string, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      await eventService.toggleAttendeeCheckin(bookingId, !currentStatus);
      showToast(!currentStatus ? 'Attendee checked in successfully' : 'Check-in undone');
      if (selectedCheckinEventId) {
        await loadAttendeesForEvent(selectedCheckinEventId);
      }
      // Refresh events counts
      const updatedEvents = await eventService.getEvents({
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        domain: domainFilter !== 'ALL' ? domainFilter : undefined,
        postedDate: postedDateFilter !== 'ALL' ? postedDateFilter : undefined,
        sortBy,
      });
      setEvents(updatedEvents);
    } catch {
      showToast('Failed to update check-in status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyDoorPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doorPassCode.trim()) return;
    setVerifyingPass(true);
    setPassFeedback(null);
    try {
      const res = await eventService.verifyCheckinTicket(doorPassCode.trim());
      if (res.success) {
        setPassFeedback({ type: 'success', message: res.message });
        setDoorPassCode('');
        showToast('Ticket verified and attendee admitted!');
        if (selectedCheckinEventId) {
          await loadAttendeesForEvent(selectedCheckinEventId);
        }
        // Refresh events list
        const updatedEvents = await eventService.getEvents({
          search: searchQuery.trim() || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          domain: domainFilter !== 'ALL' ? domainFilter : undefined,
          postedDate: postedDateFilter !== 'ALL' ? postedDateFilter : undefined,
          sortBy,
        });
        setEvents(updatedEvents);
      } else {
        setPassFeedback({
          type: 'error',
          message: res.message || 'Verification failed. Code not found.',
        });
      }
    } catch (err: any) {
      setPassFeedback({
        type: 'error',
        message: err.message || 'Error processing door pass verification',
      });
    } finally {
      setVerifyingPass(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postedDateFilter, sortBy, statusFilter]);

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventForm.title.trim() || !newEventForm.venue.trim()) {
      showToast('Title and venue are required.', 'error');
      return;
    }

    try {
      setActionLoading(true);
      const created = await eventService.createEvent(newEventForm);
      showToast(`Event "${created.title}" published successfully!`);
      setCreateModalOpen(false);
      setNewEventForm({
        title: '',
        category: 'Hackathon',
        domain: 'AI/ML',
        description: '',
        venue: '',
        mode: 'offline',
        startAt: '2026-03-25T09:00',
        endAt: '2026-03-27T18:00',
        totalSeats: 100,
        memberPriceINR: 100,
        nonMemberPriceINR: 150,
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop',
        inchargeId: '',
        prizes: '1st Prize: ₹50,000 Cash, 2nd Prize: ₹25,000, 3rd Prize: ₹10,000',
      });
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    // Search query matches title or domain or venue
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.domain.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q);

    // Status filter
    const matchesStatus =
      statusFilter === 'ALL' ||
      e.displayStatus === statusFilter ||
      e.status === statusFilter;

    // Domain filter
    const matchesDomain = domainFilter === 'ALL' || e.domain === domainFilter;

    // Filter by Event Posted Date (createdAt)
    let matchesPosted = true;
    if (postedDateFilter !== 'ALL' && e.createdAt) {
      const createdTime = new Date(e.createdAt).getTime();
      const now = Date.now();
      if (postedDateFilter === 'TODAY') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        matchesPosted = createdTime >= startOfToday.getTime();
      } else if (postedDateFilter === 'THIS_WEEK') {
        matchesPosted = now - createdTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (postedDateFilter === 'THIS_MONTH') {
        matchesPosted = now - createdTime <= 31 * 24 * 60 * 60 * 1000;
      } else if (postedDateFilter === 'PAST_MONTH') {
        matchesPosted = now - createdTime <= 62 * 24 * 60 * 60 * 1000;
      }
    }

    return matchesSearch && matchesStatus && matchesDomain && matchesPosted;
  });

  const canManage = roleVariant === 'PRESIDENT' || roleVariant === 'EVENT_ORGANIZER';
  const selectedCheckinEvent = events.find((e) => e.id === selectedCheckinEventId) || events[0] || null;

  // Format date range (e.g., "15 MAR 2026 – 17 MAR") matching Image 1
  const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const startDay = start.getDate();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${startDay} ${startMonth} ${year} – ${endDay} ${endMonth}`;
    }
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
  };

  // If user clicked on a card, show full analytics view (Image 2)
  if (selectedEvent) {
    return (
      <EventAnalyticsView
        event={selectedEvent}
        clubMembers={clubMembers}
        onBack={() => setSelectedEvent(null)}
        onRefresh={loadData}
        canManage={canManage}
      />
    );
  }

  return (
    <div className="text-slate-800 pb-12 space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Bar matching CampusMitra standard layout */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Events & Competitions Hub
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {roleVariant === 'PRESIDENT'
                ? 'CLUB PRESIDENT'
                : roleVariant === 'EVENT_ORGANIZER'
                ? 'EVENT ORGANIZER'
                : 'CAMPUS MITRA'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {roleVariant === 'PRESIDENT'
              ? 'Organize events, monitor live attendee turnout & check-ins, and inspect demographic analytics'
              : 'Oversee ticketing quotas, live attendee check-in desk, event logistics, and volunteer task coordination'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync Data</span>
          </button>

          {canManage && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Organize Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Role View Toggle: Events Directory vs Live Check-in Desk (for President & Organizers) */}
      {canManage && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveSubView('events')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubView === 'events'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Events Directory ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveSubView('checkin')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubView === 'checkin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Live Check-in Desk & Turnout</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>
        </div>
      )}

      {/* ── SUB-VIEW 1: EVENTS DIRECTORY & ROSTER ───────────────────────────── */}
      {activeSubView === 'events' && (
        <div className="space-y-6">
          {/* ── SEARCH & FILTER CONTROLS ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, track, venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Event Status</option>
                <option value="ONGOING">Ongoing</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Filter by Event Posted Date (createdAt) */}
            <div className="flex items-center gap-1.5">
              <select
                value={postedDateFilter}
                onChange={(e) => setPostedDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">📅 All Posted Dates</option>
                <option value="TODAY">Posted Today</option>
                <option value="THIS_WEEK">Posted This Week</option>
                <option value="THIS_MONTH">Posted This Month</option>
                <option value="PAST_MONTH">Past Month</option>
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="createdAt_desc">⚡ Newest Posted First</option>
                <option value="createdAt_asc">⏳ Oldest Posted First</option>
                <option value="startAt_asc">🗓️ Event Date (Soonest)</option>
                <option value="startAt_desc">🗓️ Event Date (Latest)</option>
              </select>
            </div>
          </div>

          {/* Domain Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Track:
            </span>
            {['ALL', 'AI/ML', 'Web Development', 'IoT', 'CyberSecurity', 'Blockchain', 'Mobile Apps'].map(
              (dom) => (
                <button
                  key={dom}
                  onClick={() => setDomainFilter(dom)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                    domainFilter === dom
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {dom === 'ALL' ? 'All Tracks' : dom}
                </button>
              )
            )}
          </div>

          {isLoading && events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-xs font-semibold">Loading campus events from database...</p>
            </div>
          ) : null}

          {/* ── EVENT CARDS GRID ────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                {/* Top Media Banner */}
                <div>
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={
                        evt.bannerUrl ||
                        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop'
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=450&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/30" />

                    {/* Left Status Pill */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase backdrop-blur-xs tracking-wider ${
                          evt.displayStatus === 'ONGOING'
                            ? 'bg-emerald-500/90 text-white'
                            : evt.displayStatus === 'COMPLETED'
                            ? 'bg-slate-800/90 text-slate-300'
                            : 'bg-blue-600/90 text-white'
                        }`}
                      >
                        {evt.displayStatus}
                      </span>
                    </div>

                    {/* Right Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-0.5 rounded-md text-xs font-bold text-white shadow-xs ${
                          evt.category === 'Hackathon'
                            ? 'bg-indigo-900'
                            : evt.category === 'Workshop'
                            ? 'bg-sky-600'
                            : evt.category === 'Competition'
                            ? 'bg-amber-700'
                            : 'bg-purple-700'
                        }`}
                      >
                        {evt.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  <div className="p-4 space-y-2.5">
                    {/* Orange Dates Range */}
                    <div className="text-[11px] font-extrabold uppercase tracking-wide text-amber-600">
                      {formatDateRange(evt.startAt, evt.endAt)}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {evt.title}
                    </h3>

                    {/* Venue */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{evt.venue}</span>
                    </div>

                    {/* Event Posted Date Badge */}
                    {evt.createdAt && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 pt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Posted: {new Date(evt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    )}

                    {/* Tag Chips Row (Domain, Price, Mode) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {evt.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-700">
                        {evt.memberPrice === 0 ? 'Free' : `₹${evt.memberPriceINR}`}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600">
                        {evt.mode}
                      </span>

                      {/* Live Checked-In Badge */}
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{evt.checkedInCount ?? 0} Checked In</span>
                      </span>
                    </div>

                    {/* Incharge Tag */}
                    {evt.incharge && (
                      <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                        Lead Incharge:{' '}
                        <strong className="text-slate-800 font-bold">{evt.incharge.fullName}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Seats Progress, Live Check-in & Teams */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  {/* Left: Seats left with progress bar */}
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 text-[11px]">
                      {evt.remainingSeats === 0 ? (
                        <span className="text-slate-500">Completed</span>
                      ) : (
                        `${evt.remainingSeats} seats left`
                      )}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          evt.remainingSeats === 0 ? 'bg-slate-400' : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.max(
                            10,
                            (evt.remainingSeats / Math.max(1, evt.totalSeats)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Center / Action: Direct Check-in Station Button */}
                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCheckinDesk(evt.id);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      title="Open Live Check-In Desk for this event"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Check-in Desk</span>
                    </button>
                  )}

                  {/* Right: Teams Count with Arrow Chevron */}
                  <div className="flex items-center gap-1 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    <span className="text-xs font-black">{evt.teamsCount}</span>
                    <span className="text-[11px] text-slate-500">Teams</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && !isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200/80 py-16 text-center text-slate-400 text-sm">
              No events found matching current search or filters.
            </div>
          )}
        </div>
      )}

      {/* ── SUB-VIEW 2: LIVE CHECK-IN DESK & TURNOUT (FOR PRESIDENT & ORGANIZER) ── */}
      {activeSubView === 'checkin' && canManage && (
        <div className="space-y-6 animate-in fade-in">
          {/* Active Event Selector Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Live Event Turnout Desk (Real Database Roster)
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                {selectedCheckinEvent?.title || 'Event Check-in Station'}
              </h2>
              <p className="text-xs text-slate-500">
                {roleVariant === 'PRESIDENT'
                  ? 'Club Captain / President Portal: View live attendee entry, verification timestamps, and admission status.'
                  : 'Event Organizer Console: Verify passes, scan attendees, and manage entrance gates.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Select Event:</label>
              <select
                value={selectedCheckinEventId}
                onChange={(e) => handleSelectEventForCheckin(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.displayStatus})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Turnout Statistics Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Current Checked Users</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-700">
                  {attendeeRoster?.checkedInCount ?? 0}
                </span>
                <span className="text-sm font-bold text-slate-400">
                  / {attendeeRoster?.totalCount ?? 0} Registered
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${attendeeRoster?.checkinPercentage ?? 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold mt-1.5">
                <span>Verified Turnout</span>
                <span className="text-indigo-600 font-bold">{attendeeRoster?.checkinPercentage ?? 0}%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Awaiting Admission</div>
              <div className="text-3xl font-black text-amber-600">
                {Math.max(0, (attendeeRoster?.totalCount ?? 0) - (attendeeRoster?.checkedInCount ?? 0))}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Attendees with confirmed passes yet to enter</span>
              </div>
              <div className="mt-2.5">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Entrance Gate Active
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Venue & Timings</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{selectedCheckinEvent?.venue || 'Campus Venue'}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {selectedCheckinEvent?.startAt
                    ? new Date(selectedCheckinEvent.startAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Scheduled Date'}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Door Pass & OTP Verification Station */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Live Door Pass & OTP Verification Desk
                </h3>
                <p className="text-xs text-slate-300">
                  Scan attendee QR pass string, booking pass #, or enter 6-digit door OTP to admit attendees in real time.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 self-start sm:self-auto">
                Real-Time Scanner
              </span>
            </div>

            <form onSubmit={handleVerifyDoorPass} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter ticket booking pass # (e.g. CM-...), QR code string, or 6-digit OTP..."
                  value={doorPassCode}
                  onChange={(e) => setDoorPassCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs font-mono border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <button
                type="submit"
                disabled={verifyingPass || !doorPassCode.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {verifyingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Verify & Admit</span>
              </button>
            </form>

            {passFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passFeedback.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {passFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{passFeedback.message}</span>
              </div>
            )}
          </div>

          {/* Attendee Roster Table with Live Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ticket #"
                  value={attendeeSearch}
                  onChange={(e) => setAttendeeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCheckinStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    checkinStatusFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({attendeeRoster?.attendees?.length || 0})
                </button>
                <button
                  onClick={() => setCheckinStatusFilter('CHECKED_IN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    checkinStatusFilter === 'CHECKED_IN'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Checked In ({attendeeRoster?.checkedInCount || 0})
                </button>
                <button
                  onClick={() => setCheckinStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    checkinStatusFilter === 'PENDING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Awaiting Entry (
                  {Math.max(
                    0,
                    (attendeeRoster?.totalCount || 0) - (attendeeRoster?.checkedInCount || 0)
                  )}
                  )
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ticket Pass #</th>
                    <th className="py-3 px-4">Attendee Name</th>
                    <th className="py-3 px-4">Quantity & Fee</th>
                    <th className="py-3 px-4">Booking Status</th>
                    <th className="py-3 px-4">Live Check-in Status</th>
                    <th className="py-3 px-4 text-right">Entrance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!attendeeRoster?.attendees || attendeeRoster.attendees.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No attendees registered for this event yet.
                      </td>
                    </tr>
                  ) : (
                    attendeeRoster.attendees
                      .filter((att: any) => {
                        if (checkinStatusFilter === 'CHECKED_IN') return att.checkedInAt !== null;
                        if (checkinStatusFilter === 'PENDING') return att.checkedInAt === null;
                        return true;
                      })
                      .filter((att: any) => {
                        if (!attendeeSearch.trim()) return true;
                        const q = attendeeSearch.toLowerCase();
                        return (
                          att.bookingNumber?.toLowerCase().includes(q) ||
                          att.user?.fullName?.toLowerCase().includes(q) ||
                          att.user?.email?.toLowerCase().includes(q)
                        );
                      })
                      .map((att: any) => {
                        const isChecked = att.checkedInAt !== null;
                        return (
                          <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                              {att.bookingNumber}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">
                                {att.user?.fullName || att.user?.username || 'Attendee'}
                              </div>
                              <div className="text-[10px] text-slate-400">{att.user?.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-800">
                                ₹{(att.totalAmount / 100).toFixed(0)}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({att.quantity} seat{att.quantity > 1 ? 's' : ''})
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {att.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {isChecked ? (
                                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Checked In</span>
                                  <span className="text-[10px] font-normal text-slate-500">
                                    ({new Date(att.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                                  <Clock className="w-4 h-4 text-amber-500" />
                                  <span>Awaiting Entrance</span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleCheckin(att.id, isChecked)}
                                disabled={actionLoading}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                }`}
                              >
                                {isChecked ? 'Undo Check-in' : 'Mark Checked In'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ORGANIZE EVENT (FOR PRESIDENT / ORGANIZER) ──────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Organize New Event & Assign Incharge
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newEventForm.title}
                    onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                    placeholder="e.g. National Level Ideathon 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Competition">Competition</option>
                    <option value="Conference">Conference</option>
                    <option value="Tech Talk">Tech Talk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Track</label>
                  <select
                    value={newEventForm.domain}
                    onChange={(e) => setNewEventForm({ ...newEventForm, domain: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="AI/ML">AI/ML</option>
                    <option value="Web Development">Web Development</option>
                    <option value="IoT">IoT</option>
                    <option value="CyberSecurity">CyberSecurity</option>
                    <option value="Blockchain">Blockchain</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Venue Location</label>
                  <input
                    type="text"
                    required
                    value={newEventForm.venue}
                    onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                    placeholder="e.g. Main Auditorium"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Mode</label>
                  <select
                    value={newEventForm.mode}
                    onChange={(e) => setNewEventForm({ ...newEventForm, mode: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="offline">Offline</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="online">Online</option>
                  </select>
                </div>
              </div>

              {/* Assign Event Incharge based on members in this club */}
              <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-1.5">
                <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Assign Event Incharge (from Club Members)
                </label>
                <p className="text-[11px] text-indigo-800/80">
                  The designated member becomes the lead organizer, oversees fee collection & quotas, and coordinates volunteer duties.
                </p>
                <select
                  value={newEventForm.inchargeId}
                  onChange={(e) => setNewEventForm({ ...newEventForm, inchargeId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs mt-1"
                >
                  <option value="">Select Incharge Member...</option>
                  {clubMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.fullName} ({m.role}) — {m.user.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Seats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date/Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventForm.startAt}
                    onChange={(e) => setNewEventForm({ ...newEventForm, startAt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date/Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEventForm.endAt}
                    onChange={(e) => setNewEventForm({ ...newEventForm, endAt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Seats Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newEventForm.totalSeats}
                    onChange={(e) =>
                      setNewEventForm({ ...newEventForm, totalSeats: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              {/* Pricing in INR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Member Price (₹ INR - 0 for Free)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEventForm.memberPriceINR}
                    onChange={(e) =>
                      setNewEventForm({ ...newEventForm, memberPriceINR: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Public / Non-Member Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newEventForm.nonMemberPriceINR}
                    onChange={(e) =>
                      setNewEventForm({ ...newEventForm, nonMemberPriceINR: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  placeholder="Comprehensive event details, syllabus, problem tracks..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={newEventForm.bannerUrl}
                    onChange={(e) => setNewEventForm({ ...newEventForm, bannerUrl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prizes & Incentives</label>
                  <input
                    type="text"
                    value={newEventForm.prizes}
                    onChange={(e) => setNewEventForm({ ...newEventForm, prizes: e.target.value })}
                    placeholder="1st Prize: ₹50,000 Cash + Certificates"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Publish Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsModulePage;
