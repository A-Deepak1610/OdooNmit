import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Ticket,
  PieChart,
  DollarSign,
  Users,
  UserCheck,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  Calendar,
  MapPin,
  RefreshCw,
  X,
  CreditCard,
} from 'lucide-react';
import { CampusEventItem, eventService } from '../../services/event.service';
import { EventAnalyticsView } from '../events/EventAnalyticsView';
import { EventsModulePage } from '../events/EventsModulePage';

interface OrganizerSuitePageProps {
  initialTab?: 'events' | 'analytics' | 'revenue' | 'volunteers' | 'checkin';
}

export const OrganizerSuitePage: React.FC<OrganizerSuitePageProps> = ({
  initialTab = 'events',
}) => {
  const [searchParams] = useSearchParams();
  const tabFromQuery = searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'events' | 'analytics' | 'revenue' | 'volunteers' | 'checkin'>(
    tabFromQuery || initialTab
  );

  const [events, setEvents] = useState<CampusEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [volunteerData, setVolunteerData] = useState<any>(null);
  const [attendeeRoster, setAttendeeRoster] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search & Filters for Attendees
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');

  // Direct Door Pass / OTP Verification State
  const [doorPassCode, setDoorPassCode] = useState('');
  const [verifyingPass, setVerifyingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active selected event
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0] || null;

  // Task Modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    eventId: '',
    title: '',
    description: '',
    assignedToId: '',
    priority: 'MEDIUM',
    deadline: '',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsList, ov, rev, vol] = await Promise.all([
        eventService.getEvents(),
        eventService.getOrganizerOverview().catch(() => null),
        eventService.getRevenueDetails().catch(() => null),
        eventService.getVolunteerManagement().catch(() => null),
      ]);

      setEvents(eventsList);
      setOverview(ov);
      setRevenueData(rev);
      setVolunteerData(vol);

      const firstId = eventsList[0]?.id || '';
      setSelectedEventId(firstId);

      if (firstId) {
        const att = await eventService.getEventAttendees(firstId).catch(() => null);
        setAttendeeRoster(att);
      }
    } catch (err: any) {
      showToast('Error loading organizer data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectEventForCheckin = async (id: string) => {
    setSelectedEventId(id);
    try {
      const att = await eventService.getEventAttendees(id);
      setAttendeeRoster(att);
    } catch {
      showToast('Error fetching event attendees', 'error');
    }
  };

  const handleToggleCheckin = async (bookingId: string, currentStatus: boolean) => {
    setActionLoading(true);
    try {
      await eventService.toggleAttendeeCheckin(bookingId, !currentStatus);
      showToast(!currentStatus ? 'Attendee checked in successfully' : 'Check-in undone');
      if (selectedEventId) {
        const att = await eventService.getEventAttendees(selectedEventId);
        setAttendeeRoster(att);
      }
      // Refresh overview
      const ov = await eventService.getOrganizerOverview();
      setOverview(ov);
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
        // Refresh attendee roster & overview
        if (selectedEventId) {
          const att = await eventService.getEventAttendees(selectedEventId);
          setAttendeeRoster(att);
        }
        const ov = await eventService.getOrganizerOverview();
        setOverview(ov);
        showToast('Ticket verified and attendee admitted!');
      } else {
        setPassFeedback({
          type: 'error',
          message: res.message || 'Verification failed. Code not found.',
        });
      }
    } catch (err: any) {
      setPassFeedback({
        type: 'error',
        message: err.message || 'Error processing ticket pass verification',
      });
    } finally {
      setVerifyingPass(false);
    }
  };

  // Compute live real hourly check-in distribution from actual checkedInAt timestamps
  const hourlyVelocity = React.useMemo(() => {
    const buckets: { [label: string]: number } = {};
    const checkedAttendees = (attendeeRoster?.attendees || []).filter(
      (a: any) => a.checkedInAt !== null
    );

    if (checkedAttendees.length === 0) return [];

    checkedAttendees.forEach((att: any) => {
      const d = new Date(att.checkedInAt);
      const hour = d.getHours();
      const label = `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`;
      buckets[label] = (buckets[label] || 0) + 1;
    });

    return Object.entries(buckets).map(([hour, count]) => ({ hour, count }));
  }, [attendeeRoster]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.eventId) {
      showToast('Please provide a title and select an event.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await eventService.assignTask(taskForm.eventId, {
        title: taskForm.title,
        description: taskForm.description,
        assignedToId: taskForm.assignedToId || undefined,
        priority: taskForm.priority,
        deadline: taskForm.deadline || undefined,
      });
      showToast('Task delegated to volunteer successfully!');
      setTaskModalOpen(false);
      setTaskForm({
        eventId: '',
        title: '',
        description: '',
        assignedToId: '',
        priority: 'MEDIUM',
        deadline: '',
      });
      const vol = await eventService.getVolunteerManagement();
      setVolunteerData(vol);
    } catch {
      showToast('Failed to assign task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await eventService.updateTaskStatus(taskId, newStatus);
      showToast('Task status updated');
      const vol = await eventService.getVolunteerManagement();
      setVolunteerData(vol);
    } catch {
      showToast('Failed to update task status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          {toastMessage.text}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wide">
              Event Management Desk
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">Organizer Operations Suite</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Event Organizer Operations
          </h1>
          <p className="text-sm text-slate-500">
            Manage ticket quotas, revenue collection, volunteer delegations, and live event-day check-ins.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 shadow-xs transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Top 5 Quick KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500">Events Managed</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overview?.totalEvents ?? events.length}</div>
          <div className="text-[11px] text-slate-400">Total in calendar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500">Tickets Booked</span>
            <Ticket className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overview?.totalTicketsSold ?? 0}</div>
          <div className="text-[11px] text-slate-400">{overview?.totalRemainingSeats ?? 0} seats remaining</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500">Fee Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{(overview?.totalRevenueINR ?? 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400">Settled to club books</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500">Live Checked-in</span>
            <UserCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{overview?.totalCheckedIn ?? 0}</div>
          <div className="text-[11px] text-slate-400">{overview?.turnoutRate ?? 0}% verified turnout</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500">Volunteer Tasks</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overview?.tasksSummary?.total ?? 0}</div>
          <div className="text-[11px] text-slate-400">{overview?.tasksSummary?.completed ?? 0} completed</div>
        </div>
      </div>

      {/* Navigation Tab Bar matching Image Theme */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-4 h-4" />
          Events & Ticket Details
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Demographic & Mapbox Analytics
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Fee Collection & Revenue
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'volunteers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Volunteer Squad Delegation
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'checkin'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Event Day Live Check-in
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
            Live
          </span>
        </button>
      </div>

      {/* ── TAB 1: EVENTS & TICKETS DETAILS ── */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <EventsModulePage roleVariant="EVENT_ORGANIZER" />
        </div>
      )}

      {/* ── TAB 2: DEMOGRAPHIC & MAPBOX ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Event Picker Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <PieChart className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Demographic Analytics Dashboard</h3>
                <p className="text-xs text-slate-500">
                  Select an event to inspect its live Mapbox satellite geographic distribution and demographics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Event:</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
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

          {selectedEvent ? (
            <EventAnalyticsView
              event={selectedEvent}
              clubMembers={[]}
              onBack={() => setActiveTab('events')}
              onRefresh={loadData}
              canManage={true}
            />
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              No event selected for analytics.
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: REVENUE & FEE COLLECTION ── */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Total Fees Collected</div>
              <div className="text-3xl font-black text-emerald-700">
                ₹{(revenueData?.summary?.totalCollectedINR ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">100% Verified in database</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Member Discounts Granted</div>
              <div className="text-3xl font-black text-indigo-700">
                ₹{(revenueData?.summary?.memberSavingsINR ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-indigo-600 font-semibold mt-1">Direct club member savings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Pending Inflows</div>
              <div className="text-3xl font-black text-amber-700">
                ₹{(revenueData?.summary?.totalPendingINR ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-amber-600 font-semibold mt-1">Awaiting checkout capture</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Transactions Logged</div>
              <div className="text-3xl font-black text-slate-900">
                {revenueData?.summary?.totalTransactions || 24}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">Razorpay orders captured</div>
            </div>
          </div>

          {/* Per-Event Fee Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Per-Event Fee Collections Breakdown
              </h3>
              <span className="text-xs text-slate-400 font-medium">10 Active Campus Events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Event Name</th>
                    <th className="py-3 px-4">Domain</th>
                    <th className="py-3 px-4">Member / Regular Price</th>
                    <th className="py-3 px-4">Tickets Booked</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Quota Capacity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenueData?.eventBreakdowns?.map((ev: any) => (
                    <tr key={ev.eventId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">
                        {ev.eventTitle}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                          {ev.domain}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        ₹{ev.memberPriceINR} / ₹{ev.regularPriceINR}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">{ev.ticketsSold}</span>
                        <span className="text-[11px] text-slate-400 ml-1">
                          ({ev.memberTicketsSold} Member, {ev.regularTicketsSold} Reg)
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700">
                        ₹{ev.totalRevenueINR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((ev.ticketsSold / Math.max(1, ev.totalSeats)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 inline-block">
                          {ev.remainingSeats} seats left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Transactions Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Live Payment Transactions Log
              </h3>
              <span className="text-xs text-slate-400">Audited payment hashes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Payment ID / Order ID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Captured At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {revenueData?.recentPayments?.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.user?.fullName || p.user?.username || 'Student User'}
                        <div className="text-[10px] text-slate-400 font-normal">{p.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                        {p.booking?.event?.title || 'Campus Event'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {p.razorpayPaymentId || p.razorpayOrderId || p.id.substring(0, 16)}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700">
                        ₹{(p.amount / 100).toFixed(0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(p.capturedAt || p.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VOLUNTEER SQUAD DELEGATION ── */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6">
          {/* Volunteer Header Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Volunteer Operations & Squad Delegations
              </h3>
              <p className="text-xs text-slate-500">
                Assign tasks with priority and deadlines to active club volunteers for event execution.
              </p>
            </div>

            <button
              onClick={() => {
                setTaskForm({
                  eventId: events[0]?.id || '',
                  title: '',
                  description: '',
                  assignedToId: volunteerData?.volunteers[0]?.id || '',
                  priority: 'MEDIUM',
                  deadline: '',
                });
                setTaskModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              Delegate Volunteer Task
            </button>
          </div>

          {/* Active Volunteers Squad Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {volunteerData?.volunteers?.map((vol: any) => {
              const assignedTasksCount =
                volunteerData?.tasks?.filter((t: any) => t.assignedTo?.id === vol.id).length || 0;
              return (
                <div
                  key={vol.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 hover:border-slate-300 transition-all"
                >
                  <img
                    src={vol.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                    alt={vol.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{vol.fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{vol.email}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Volunteer Squad
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {assignedTasksCount} tasks assigned
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assigned Logistics Tasks ({volunteerData?.tasks?.length || 0})
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Task Details</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Assigned Volunteer</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteerData?.tasks?.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs">
                        {t.title}
                        {t.description && (
                          <div className="text-[11px] text-slate-500 font-normal line-clamp-1">
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {t.event?.title}
                      </td>
                      <td className="py-3 px-4">
                        {t.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={t.assignedTo.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop'}
                              alt={t.assignedTo.fullName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="font-semibold text-slate-800">{t.assignedTo.fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            t.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: EVENT DAY LIVE CHECK-IN ANALYSIS ── */}
      {activeTab === 'checkin' && (
        <div className="space-y-6">
          {/* Event Day Control Banner */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  Live Event Check-in Station
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900">
                Event-Day Turnout & Entry Verification
              </h2>
              <p className="text-xs text-slate-500">
                Verify attendee QR codes and track live checked-in participant velocity directly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">Active Event:</label>
              <select
                value={selectedEventId}
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
                <span>Turnout Progress</span>
                <span className="text-indigo-600 font-bold">{attendeeRoster?.checkinPercentage ?? 0}%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Venue & Timing</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{selectedEvent?.venue || 'Main Campus Venue'}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  {selectedEvent?.startAt
                    ? new Date(selectedEvent.startAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Scheduled Event'}
                </span>
              </div>
              <div className="mt-3">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Admission Desk Active
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="text-xs font-bold text-slate-500 mb-1">Hourly Check-in Velocity</div>
              {hourlyVelocity.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-slate-400 text-center">
                  <Clock className="w-5 h-5 text-slate-300 mb-1" />
                  <span className="text-xs font-bold text-slate-600">Awaiting Admissions</span>
                  <span className="text-[10px] text-slate-400">0 check-ins recorded yet</span>
                </div>
              ) : (
                <div className="flex items-end gap-2 h-20 pt-2">
                  {hourlyVelocity.map((h) => {
                    const maxH = Math.max(1, ...hourlyVelocity.map((x) => x.count));
                    const heightPercent = Math.max(25, Math.round((h.count / maxH) * 100));
                    return (
                      <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] font-black text-indigo-600">{h.count}</span>
                        <div
                          className="w-full bg-indigo-600 rounded-t transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[9px] text-slate-500 font-bold">{h.hour}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Door Scanner & OTP Ticket Pass Input */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-5 rounded-2xl text-white shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Door Pass & OTP Entrance Verification
                </h3>
                <p className="text-xs text-slate-300">
                  Scan attendee QR code string, booking pass #, or enter 6-digit door OTP to admit attendees instantly.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 self-start sm:self-auto">
                Door Desk Active
              </span>
            </div>

            <form onSubmit={handleVerifyDoorPass} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Enter ticket booking # (e.g., CM-...), QR code, or 6-digit OTP..."
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
                <span>Verify & Check In</span>
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

          {/* Attendee Roster & Manual Instant Check-in Toggle */}
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
                  onClick={() => setCheckinFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    checkinFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({attendeeRoster?.attendees?.length || 0})
                </button>
                <button
                  onClick={() => setCheckinFilter('CHECKED_IN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    checkinFilter === 'CHECKED_IN'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Checked In ({attendeeRoster?.checkedInCount || 0})
                </button>
                <button
                  onClick={() => setCheckinFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    checkinFilter === 'PENDING'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Not Checked In (
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
                    <th className="py-3 px-4">Type & Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Check-in Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendeeRoster?.attendees
                    ?.filter((att: any) => {
                      if (checkinFilter === 'CHECKED_IN') return att.checkedInAt !== null;
                      if (checkinFilter === 'PENDING') return att.checkedInAt === null;
                      return true;
                    })
                    ?.filter((att: any) => {
                      if (!attendeeSearch.trim()) return true;
                      const q = attendeeSearch.toLowerCase();
                      return (
                        att.bookingNumber?.toLowerCase().includes(q) ||
                        att.user?.fullName?.toLowerCase().includes(q) ||
                        att.user?.email?.toLowerCase().includes(q)
                      );
                    })
                    ?.map((att: any) => {
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
                              ({att.quantity} pass)
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
                                <span className="text-[10px] font-normal text-slate-400">
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Task Delegation Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Delegate Task to Volunteer
              </h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Event *</label>
                <select
                  value={taskForm.eventId}
                  onChange={(e) => setTaskForm({ ...taskForm, eventId: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Event --</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Door Scanner Check-in Desk Setup"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign To Volunteer Squad Member
                </label>
                <select
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned (Squad Pool) --</option>
                  {volunteerData?.volunteers?.map((vol: any) => (
                    <option key={vol.id} value={vol.id}>
                      {vol.fullName} ({vol.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full text-xs font-medium px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Duty Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Detail exact instructions for the volunteer..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Confirm & Delegate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerSuitePage;
