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

  // Search & Filter States matching Image 1
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [domainFilter, setDomainFilter] = useState('ALL');

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
        eventService.getEvents(),
        presidentService.getMembers().catch(() => []),
      ]);

      setEvents(eventsRes);
      setClubMembers(membersRes);

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

  useEffect(() => {
    loadData();
  }, []);

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

    return matchesSearch && matchesStatus && matchesDomain;
  });

  const canManage = roleVariant === 'PRESIDENT' || roleVariant === 'EVENT_ORGANIZER';

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
              ? 'Organize events, assign designated event incharges, and click any card for full demographic analytics'
              : 'Oversee ticketing quotas, fee collections, event logistics, and volunteer task coordination'}
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

      {/* ── SEARCH & FILTER CONTROLS (EXACTLY MATCHING IMAGE 1) ─────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ONGOING">Ongoing</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
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
          <p className="text-xs font-semibold">Loading campus events...</p>
        </div>
      ) : null}

      {/* ── EVENT CARDS GRID (EXACTLY REPLICATING IMAGE 1) ─────────────────── */}
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

                {/* Left Status Pill (matching Image 1) */}
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

                {/* Right Category Badge (matching Image 1) */}
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

                {/* Tag Chips Row (Domain, Price, Mode) matching Image 1 */}
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

            {/* Card Footer: Seats Progress & Teams Count (matching Image 1) */}
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              {/* Left: Seats left with progress bar */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700">
                  {evt.remainingSeats === 0 ? (
                    <span className="text-slate-500">Completed</span>
                  ) : (
                    `${evt.remainingSeats} seats left`
                  )}
                </span>
                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      evt.remainingSeats === 0
                        ? 'bg-slate-400'
                        : 'bg-amber-500'
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

              {/* Right: Teams Count with Arrow Chevron */}
              <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                <span className="text-sm font-black">{evt.teamsCount}</span>
                <span className="text-xs text-slate-500">Teams</span>
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
