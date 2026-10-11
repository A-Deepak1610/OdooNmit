import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  X,
  UserCheck,
  Award,
  ListTodo,
  RefreshCw,
  Search,
  KeyRound,
  Clock,
  DollarSign,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import {
  CampusEventItem,
  eventService,
  EventTaskItem,
} from '../../services/event.service';
import { PresidentMember } from '../../services/president.service';
import { merchandiseService, EventFinanceResponse } from '../../services/merchandise.service';

interface EventAnalyticsViewProps {
  event: CampusEventItem;
  clubMembers: PresidentMember[];
  onBack: () => void;
  onRefresh: () => void;
  canManage?: boolean;
}

export const EventAnalyticsView: React.FC<EventAnalyticsViewProps> = ({
  event,
  clubMembers,
  onBack,
  onRefresh,
  canManage = true,
}) => {
  const [currentEvent, setCurrentEvent] = useState<CampusEventItem>(event);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync prop changes
  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  // Fetch fresh real metrics and record view on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshData = async () => {
      try {
        const fresh = await eventService.getEventById(event.id);
        if (isMounted && fresh) {
          setCurrentEvent(fresh);
        }
      } catch {
        // Fallback to initial event prop
      }
    };
    fetchFreshData();
    return () => {
      isMounted = false;
    };
  }, [event.id]);

  // Task assignment modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    priority: 'HIGH',
    deadline: '',
  });

  // Reassign Incharge modal state
  const [inchargeModalOpen, setInchargeModalOpen] = useState(false);
  const [selectedInchargeId, setSelectedInchargeId] = useState(event.inchargeId || '');
  const [inchargeLoading, setInchargeLoading] = useState(false);

  // Live Attendee Roster & Check-in Desk State
  const [attendeeRoster, setAttendeeRoster] = useState<any>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [checkinFilter, setCheckinFilter] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [doorPassCode, setDoorPassCode] = useState('');
  const [verifyingPass, setVerifyingPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Event Finance Records State
  const [eventFinance, setEventFinance] = useState<EventFinanceResponse | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAttendees = async () => {
    try {
      const roster = await eventService.getEventAttendees(currentEvent.id);
      setAttendeeRoster(roster);
    } catch {
      setAttendeeRoster(null);
    }
  };

  const loadFinance = async () => {
    try {
      setFinanceLoading(true);
      const data = await merchandiseService.getEventFinanceRecord(currentEvent.organization?.id);
      setEventFinance(data);
    } catch {
      setEventFinance(null);
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
    loadFinance();
  }, [currentEvent.id]);

  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const [fresh] = await Promise.all([
        eventService.getEventById(currentEvent.id),
        loadAttendees(),
        loadFinance(),
      ]);
      if (fresh) setCurrentEvent(fresh);
      onRefresh();
      showToast('Live metrics, turnout roster & financial ledger refreshed!');
    } catch {
      showToast('Failed to refresh metrics', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleCheckin = async (bookingId: string, currentStatus: boolean) => {
    try {
      await eventService.toggleAttendeeCheckin(bookingId, !currentStatus);
      showToast(!currentStatus ? 'Attendee checked in successfully' : 'Check-in undone');
      await loadAttendees();
      const fresh = await eventService.getEventById(currentEvent.id);
      if (fresh) setCurrentEvent(fresh);
    } catch {
      showToast('Failed to update check-in status', 'error');
    }
  };

  const handleVerifyPass = async (e: React.FormEvent) => {
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
        await loadAttendees();
        const fresh = await eventService.getEventById(currentEvent.id);
        if (fresh) setCurrentEvent(fresh);
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

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    try {
      setTaskLoading(true);
      await eventService.assignTask(currentEvent.id, taskForm);
      showToast('Volunteer task assigned successfully!');
      setTaskModalOpen(false);
      setTaskForm({ title: '', description: '', assignedToId: '', priority: 'HIGH', deadline: '' });
      handleManualRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign task', 'error');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleReassignIncharge = async () => {
    if (!selectedInchargeId) return;
    try {
      setInchargeLoading(true);
      await eventService.updateEvent(currentEvent.id, { inchargeId: selectedInchargeId });
      showToast('Event Incharge updated successfully!');
      setInchargeModalOpen(false);
      handleManualRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update incharge', 'error');
    } finally {
      setInchargeLoading(false);
    }
  };

  const handleTaskStatusToggle = async (task: EventTaskItem) => {
    const nextStatus =
      task.status === 'PENDING'
        ? 'IN_PROGRESS'
        : task.status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'PENDING';
    try {
      await eventService.updateTaskStatus(task.id, nextStatus);
      showToast(`Task marked as ${nextStatus.replace('_', ' ')}.`);
      handleManualRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  // Real Analytics Metrics
  const analytics = currentEvent.analytics;
  const pageViews = analytics?.pageViews ?? 1;
  const uniqueVisitors = analytics?.uniqueVisitors ?? 1;
  const totalBooked = Math.max(0, currentEvent.totalSeats - currentEvent.remainingSeats);

  // Real Registration Trend Points
  const trendPoints: Array<{ date: string; count: number }> =
    analytics?.registrationTrend && analytics.registrationTrend.length > 0
      ? analytics.registrationTrend
      : [
          {
            date: new Date(currentEvent.createdAt || currentEvent.startAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            count: totalBooked,
          },
        ];

  // SVG Chart Geometry calculations
  const maxTrendCount = Math.max(5, ...trendPoints.map((p) => p.count));
  const chartWidth = 700;
  const chartHeight = 180;
  const padX = 50;
  const padY = 30;

  const chartCoords = trendPoints.map((pt, idx) => {
    const x =
      trendPoints.length === 1
        ? chartWidth / 2
        : padX + (idx / (trendPoints.length - 1)) * (chartWidth - padX * 2);
    const y = chartHeight - padY - (pt.count / maxTrendCount) * (chartHeight - padY * 2);
    return { x, y, pt };
  });

  const linePath =
    chartCoords.length === 1
      ? `M ${chartCoords[0].x - 50} ${chartCoords[0].y} L ${chartCoords[0].x + 50} ${chartCoords[0].y}`
      : chartCoords.reduce((acc, c, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`, '');

  const areaPath =
    chartCoords.length === 1
      ? `M ${chartCoords[0].x - 50} ${chartCoords[0].y} L ${chartCoords[0].x + 50} ${chartCoords[0].y} L ${chartCoords[0].x + 50} ${chartHeight - padY} L ${chartCoords[0].x - 50} ${chartHeight - padY} Z`
      : `${linePath} L ${chartCoords[chartCoords.length - 1].x} ${chartHeight - padY} L ${chartCoords[0].x} ${chartHeight - padY} Z`;

  return (
    <div className="space-y-6 animate-in fade-in pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all cursor-pointer"
            title="Back to Events"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {currentEvent.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  currentEvent.displayStatus === 'ONGOING'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentEvent.displayStatus === 'COMPLETED'
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {currentEvent.displayStatus}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentEvent.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {currentEvent.venue}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(currentEvent.startAt).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold capitalize">Mode: {currentEvent.mode}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all cursor-pointer"
            title="Refresh Real Analytics"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {canManage && (
            <>
              <button
                onClick={() => setInchargeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Event Incharge</span>
              </button>
              <button
                onClick={() => setTaskModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Volunteer Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 1. REAL KEY PERFORMANCE METRICS: PAGE VIEWS & UNIQUE VISITORS ──────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Page Views Counter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Page View Count
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {pageViews.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Total times this event page has been viewed in the portal</span>
          </p>
        </div>

        {/* Real Unique Visitors Counter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Unique Visitors
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {uniqueVisitors.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span>Distinct campus attendees & members who viewed this event</span>
          </p>
        </div>
      </div>

      {/* ── 2. REAL REGISTRATION TRAJECTORY TREND ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Registration Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live booking trajectory & confirmed ticket registrations recorded over time
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {totalBooked} passes booked of {currentEvent.totalSeats} seats
            </span>
            <span className="text-xs font-semibold text-slate-400">
              ({currentEvent.remainingSeats} remaining)
            </span>
          </div>
        </div>

        {totalBooked === 0 && (!trendPoints.length || trendPoints.every((p) => p.count === 0)) ? (
          <div className="py-12 px-4 text-center rounded-xl bg-slate-50/70 border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Registrations Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              This event currently has 0 ticket bookings. As soon as students or members reserve passes, their live registration trajectory curve will plot here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="h-48 sm:h-56 relative w-full overflow-hidden">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="realTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line x1={padX} y1={padY} x2={chartWidth - padX} y2={padY} stroke="#f1f5f9" strokeWidth="1" />
                <line
                  x1={padX}
                  y1={chartHeight / 2}
                  x2={chartWidth - padX}
                  y2={chartHeight / 2}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <line
                  x1={padX}
                  y1={chartHeight - padY}
                  x2={chartWidth - padX}
                  y2={chartHeight - padY}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />

                {/* Area fill */}
                <path d={areaPath} fill="url(#realTrendGradient)" />

                {/* Main Curve line */}
                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="3.5" strokeLinecap="round" />

                {/* Point markers & Value Pills */}
                {chartCoords.map((coord, i) => (
                  <g key={`${coord.pt.date}-${i}`}>
                    <circle cx={coord.x} cy={coord.y} r="5" fill="#ffffff" stroke="#6366f1" strokeWidth="3" />
                    {/* Value Badge pill above point */}
                    <rect
                      x={coord.x - 16}
                      y={Math.max(4, coord.y - 24)}
                      width="32"
                      height="16"
                      rx="8"
                      fill="#4f46e5"
                    />
                    <text
                      x={coord.x}
                      y={Math.max(4, coord.y - 24) + 11}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {coord.pt.count}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* X-axis Date Labels */}
            <div className="flex justify-between text-xs text-slate-500 font-bold border-t border-slate-100 pt-2 px-6">
              {trendPoints.map((pt, i) => (
                <span key={`${pt.date}-${i}`}>{pt.date}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. EVENT INCHARGE & FEE STATUS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Incharge & Financial Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              Event Incharge & Fee Status
            </h3>
            {canManage && (
              <button
                onClick={() => setInchargeModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Change Incharge →
              </button>
            )}
          </div>

          {/* Designated Incharge Profile Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={
                currentEvent.incharge?.avatarUrl ||
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop'
              }
              alt="Incharge"
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 truncate">
                {currentEvent.incharge?.fullName || 'Not yet designated'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {currentEvent.incharge?.email || 'Awaiting leadership assignment'}
              </div>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Designated Event Lead
              </span>
            </div>
          </div>

          {/* Pricing & Fee Structure */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-slate-500 font-medium">Member Ticket Fee</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {currentEvent.memberPrice === 0 ? 'Free Entry' : `₹${currentEvent.memberPriceINR}`}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-slate-500 font-medium">Public / Non-Member Fee</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                ₹{currentEvent.nonMemberPriceINR}
              </div>
            </div>
          </div>

          {/* Prize Pool Details */}
          {currentEvent.prizes && (
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 text-xs">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-amber-600" /> Prize Pool:
              </span>
              <p className="text-amber-800 leading-relaxed">{currentEvent.prizes}</p>
            </div>
          )}
        </div>

        {/* Volunteer Duty Coordination List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Assigned Volunteer Duties ({currentEvent.tasks?.length || 0})
              </h3>
            </div>
            {canManage && (
              <button
                onClick={() => setTaskModalOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                + Assign Task
              </button>
            )}
          </div>

          {!currentEvent.tasks || currentEvent.tasks.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No volunteer duties assigned yet. Click "+ Assign Task" to delegate tasks.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {currentEvent.tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'URGENT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <button
                      onClick={() => handleTaskStatusToggle(task)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : task.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                  {task.description && (
                    <p className="text-[11px] text-slate-500 leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>
                      Assignee:{' '}
                      <strong className="text-slate-700">
                        {task.assignedTo?.fullName || 'Assigned Volunteer'}
                      </strong>
                    </span>
                    {task.deadline && (
                      <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 4. LIVE ATTENDEE ADMISSION & CHECK-IN ROSTER (ZERO MOCK DATA) ────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Live Admission Station
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Event Turnout & Live Check-in Roster
            </h3>
            <p className="text-xs text-slate-500">
              Live database attendee records. When attendees check in at the entrance desk, their admission status updates immediately.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {attendeeRoster?.checkedInCount ?? 0} Checked In / {attendeeRoster?.totalCount ?? 0} Registered
            </span>
            <span className="text-xs font-black text-indigo-600">
              ({attendeeRoster?.checkinPercentage ?? 0}% Turnout)
            </span>
          </div>
        </div>

        {/* Turnout Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
            <span>Live Entrance Turnout Progress</span>
            <span className="text-indigo-600 font-bold">{attendeeRoster?.checkinPercentage ?? 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${attendeeRoster?.checkinPercentage ?? 0}%` }}
            />
          </div>
        </div>

        {/* Door Pass & OTP Verification Station */}
        {canManage && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 rounded-xl text-white space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-300">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Direct Door Pass / OTP Verification Counter
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                Admit Attendee
              </span>
            </div>

            <form onSubmit={handleVerifyPass} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Enter booking ticket # (e.g. CM-...), QR string, or 6-digit OTP..."
                value={doorPassCode}
                onChange={(e) => setDoorPassCode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs font-mono border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                disabled={verifyingPass || !doorPassCode.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {verifyingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Admit Attendee</span>
              </button>
            </form>

            {passFeedback && (
              <div
                className={`p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
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
        )}

        {/* Attendee Roster Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search attendees by name, email, ticket #"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCheckinFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  checkinFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({attendeeRoster?.attendees?.length || 0})
              </button>
              <button
                onClick={() => setCheckinFilter('CHECKED_IN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  checkinFilter === 'CHECKED_IN'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Checked In ({attendeeRoster?.checkedInCount || 0})
              </button>
              <button
                onClick={() => setCheckinFilter('PENDING')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  checkinFilter === 'PENDING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Awaiting (
                {Math.max(
                  0,
                  (attendeeRoster?.totalCount || 0) - (attendeeRoster?.checkedInCount || 0)
                )}
                )
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Ticket Pass #</th>
                  <th className="py-2.5 px-3">Attendee Name</th>
                  <th className="py-2.5 px-3">Seats & Fee</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Check-in Status</th>
                  {canManage && <th className="py-2.5 px-3 text-right">Admission</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!attendeeRoster?.attendees || attendeeRoster.attendees.length === 0) ? (
                  <tr>
                    <td colSpan={canManage ? 6 : 5} className="py-8 text-center text-slate-400">
                      No registered attendees for this event yet.
                    </td>
                  </tr>
                ) : (
                  attendeeRoster.attendees
                    .filter((att: any) => {
                      if (checkinFilter === 'CHECKED_IN') return att.checkedInAt !== null;
                      if (checkinFilter === 'PENDING') return att.checkedInAt === null;
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
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                            {att.bookingNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">
                              {att.user?.fullName || att.user?.username || 'Attendee'}
                            </div>
                            <div className="text-[10px] text-slate-400">{att.user?.email}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800">
                              ₹{(att.totalAmount / 100).toFixed(0)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">
                              ({att.quantity} pass)
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {att.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {isChecked ? (
                              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Checked In</span>
                                <span className="text-[10px] font-normal text-slate-500">
                                  ({new Date(att.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                <span>Awaiting Entrance</span>
                              </div>
                            )}
                          </td>
                          {canManage && (
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleToggleCheckin(att.id, isChecked)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  isChecked
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                }`}
                              >
                                {isChecked ? 'Undo Check-in' : 'Mark Checked In'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. EVENT FINANCE RECORDS & TREASURY PROCEEDS LEDGER ────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                Treasury Records
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Verified Financial Ledger</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Event Finance Records & Ticket Proceeds
            </h3>
            <p className="text-xs text-slate-500">
              Live collection records from ticket sales, member discounts, and seat occupancy proceeds.
            </p>
          </div>

          <button
            onClick={loadFinance}
            disabled={financeLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${financeLoading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gross Event Revenue
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{(eventFinance?.overview?.totalEventRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700">
              Verified via Treasury Incomes
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Tickets Sold
              </span>
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              {eventFinance?.overview?.totalTicketsSold || 0}
            </div>
            <div className="text-[11px] font-semibold text-indigo-700">
              Across {eventFinance?.overview?.totalEvents || 1} organized events
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Member Ticket Savings
              </span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">
              ₹{(eventFinance?.overview?.totalMemberTicketSavings || 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-amber-700">
              Saved by registered members
            </div>
          </div>
        </div>

        {/* Event-By-Event Financial Ledger Table */}
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Event Seat Occupancy & Proceeds Ledger
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Event Title & Venue</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Seats & Tickets</th>
                  <th className="py-2.5 px-3">Rates (Mbr / Reg)</th>
                  <th className="py-2.5 px-3">Gross Proceeds</th>
                  <th className="py-2.5 px-3">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!eventFinance?.events || eventFinance.events.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No financial records found for events.
                    </td>
                  </tr>
                ) : (
                  eventFinance.events.map((ev) => (
                    <tr
                      key={ev.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        ev.id === currentEvent.id ? 'bg-indigo-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {ev.title}
                          {ev.id === currentEvent.id && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{ev.venue}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {new Date(ev.startAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900">{ev.ticketsSold}</span> / {ev.totalSeats} seats
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-700 font-bold">₹{ev.memberPriceINR}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-800">₹{ev.nonMemberPriceINR}</span>
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-700">
                        ₹{ev.grossRevenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${Math.min(100, ev.occupancyRate)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{ev.occupancyRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Ticket Bookings Table */}
        <div className="space-y-2.5 pt-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Recent Ticket Bookings & Payment Records
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Booking #</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Attendee</th>
                  <th className="py-2.5 px-3">Passes</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!eventFinance?.recentBookings || eventFinance.recentBookings.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No ticket bookings recorded yet.
                    </td>
                  </tr>
                ) : (
                  eventFinance.recentBookings.slice(0, 15).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                        {b.bookingNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[160px]">
                        {b.eventTitle}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{b.userName}</div>
                        <div className="text-[10px] text-slate-400">{b.userEmail}</div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">
                        {b.quantity} pass(es)
                      </td>
                      <td className="py-2.5 px-3 font-black text-emerald-700">
                        ₹{b.totalAmountINR}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-600" />
                Assign Volunteer Duty
              </h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Door Scanner Desk Check-in"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign To Volunteer / Member
                </label>
                <select
                  value={taskForm.assignedToId}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="">Select Volunteer...</option>
                  {clubMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.fullName} ({m.role}) - {m.user.email}
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Instructions</label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Specific duties, venue locations, and materials to manage..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {taskLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Assign Duty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ASSIGN / REASSIGN EVENT INCHARGE ───────────────────────────── */}
      {inchargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Assign Event Incharge
              </h3>
              <button
                onClick={() => setInchargeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Designate any member from the club to oversee this event. They will be granted Event Organizer
              privileges to manage ticketing quotas and assign volunteer duties.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Club Member
              </label>
              <select
                value={selectedInchargeId}
                onChange={(e) => setSelectedInchargeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
              >
                <option value="">Select Incharge...</option>
                {clubMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.fullName} ({m.role}) — {m.user.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInchargeModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignIncharge}
                disabled={inchargeLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {inchargeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Confirm Incharge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EventAnalyticsView;
