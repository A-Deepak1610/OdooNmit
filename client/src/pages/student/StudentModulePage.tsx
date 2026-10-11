import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Vote,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Loader2,
  X,
  MailCheck,
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import {
  studentService,
  StudentNotificationItem,
  StudentClubItem,
  StudentElectionItem,
  MembershipDuesStatus,
} from '../../services/student.service';
import { ElectionsVotingModule } from '../../components/modules/elections/ElectionsVotingModule';

export const StudentModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view from URL path
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/student/notifications')) return 'notifications';
    if (path.includes('/student/elections') || path.includes('/student/voting')) return 'elections';
    if (path.includes('/student/clubs') || path.includes('/student/organizations')) return 'clubs';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  // Loading & State
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data
  const [notifications, setNotifications] = useState<StudentNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [clubs, setClubs] = useState<StudentClubItem[]>([]);
  const [elections, setElections] = useState<StudentElectionItem[]>([]);
  const [myDuesStatus, setMyDuesStatus] = useState<MembershipDuesStatus | null>(null);
  const [renewingDues, setRenewingDues] = useState(false);

  // Search & Filters
  const [clubSearch, setClubSearch] = useState('');
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'UNREAD' | 'SYSTEM'>('ALL');

  // Modals
  // 1. Membership Application Modal
  const [membershipModal, setMembershipModal] = useState<{ open: boolean; club: StudentClubItem | null }>({
    open: false,
    club: null,
  });
  const [membershipForm, setMembershipForm] = useState({
    statementOfPurpose: '',
    experience: '',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [notifsData, clubsData, electionsData, duesData] = await Promise.all([
        studentService.getNotifications(),
        studentService.getClubs(),
        studentService.getElections(),
        studentService.getMyMembershipStatus().catch(() => null),
      ]);

      setNotifications(notifsData.notifications);
      setUnreadCount(notifsData.unreadCount);
      setClubs(clubsData);
      setElections(electionsData);
      setMyDuesStatus(duesData);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync student data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenewDues = async () => {
    try {
      setRenewingDues(true);
      const res = await studentService.renewMembership();
      showToast(res.message);
      const updated = await studentService.getMyMembershipStatus();
      setMyDuesStatus(updated);
    } catch (err: any) {
      showToast(err.message || 'Renewal failed', 'error');
    } finally {
      setRenewingDues(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Handlers: Notifications ───────────────────────────────────────────────
  const handleMarkAsRead = async (id: string) => {
    try {
      await studentService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      showToast(err.message || 'Failed to update notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await studentService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read.');
    } catch (err: any) {
      showToast(err.message || 'Failed to update notifications', 'error');
    }
  };

  // ── Handlers: Membership Application ──────────────────────────────────────
  const handleOpenMembershipModal = (club: StudentClubItem) => {
    setMembershipModal({ open: true, club });
    setMembershipForm({
      statementOfPurpose: '',
      experience: '',
      department: 'Computer Science & Engineering',
      semester: '6th Semester',
    });
  };

  const handleSubmitMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membershipModal.club) return;
    if (!membershipForm.statementOfPurpose.trim() || !membershipForm.experience.trim()) {
      showToast('Please provide your statement of purpose and relevant experience.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await studentService.applyMembership(membershipModal.club.id, membershipForm);
      showToast(`Membership application submitted for ${membershipModal.club.name}!`);
      setMembershipModal({ open: false, club: null });
      const updatedClubs = await studentService.getClubs();
      setClubs(updatedClubs);
    } catch (err: any) {
      showToast(err.message || 'Failed to apply for membership', 'error');
    } finally {
      setActionLoading(false);
    }
  };



  // Filtered Notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'UNREAD') return !n.isRead;
    if (notificationFilter === 'SYSTEM') return n.type === 'SYSTEM' || n.type === 'ELECTION_ANNOUNCEMENT';
    return true;
  });

  // Filtered Clubs
  const filteredClubs = clubs.filter((c) => {
    return (
      c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(clubSearch.toLowerCase()))
    );
  });



  return (
    <div className="text-slate-800 pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 ${toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
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

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Student Hub'}
              {activeTab === 'notifications' && 'Campus Notifications'}
              {activeTab === 'elections' && 'Annual Elections & Voting'}
              {activeTab === 'clubs' && 'Campus Clubs & Membership'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              STUDENT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'overview' && 'Review membership status, annual election notices, and recent notifications'}
            {activeTab === 'notifications' && 'Dedicated notification centre for platform broadcasts, election alerts & club updates'}
            {activeTab === 'elections' && 'Vote for elected representatives or apply to run for Club President'}
            {activeTab === 'clubs' && 'Explore active campus organizations and submit membership applications'}
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Clock className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {isLoading && !clubs.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-semibold">Loading student services...</p>
        </div>
      ) : null}

      {/* ── 1. STUDENT OVERVIEW HUB ─────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Urgent Membership Renewal Alert Banner */}
          {myDuesStatus?.hasAlert && myDuesStatus.club && (
            <div
              className={`p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in ${
                myDuesStatus.duesStatus === 'OVERDUE'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl text-white shrink-0 shadow-xs ${
                    myDuesStatus.duesStatus === 'OVERDUE' ? 'bg-rose-600' : 'bg-amber-500'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        myDuesStatus.duesStatus === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {myDuesStatus.duesStatus === 'OVERDUE' ? 'Dues Overdue' : 'Dues Expiring Soon'}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {myDuesStatus.club.name} • {myDuesStatus.role}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {myDuesStatus.alert?.title || 'Annual Membership Renewal Required'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {myDuesStatus.alert?.message ||
                      `Your annual dues are expiring in ${myDuesStatus.daysRemaining} days. Renew now to retain voting eligibility, member discounts, and good standing.`}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span>
                      Valid Until:{' '}
                      <strong className="text-slate-800">
                        {myDuesStatus.validUntil
                          ? new Date(myDuesStatus.validUntil).toLocaleDateString()
                          : 'N/A'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Annual Fee:{' '}
                      <strong className="text-slate-800">
                        ₹{myDuesStatus.duesAmountINR ?? myDuesStatus.club.membershipFeeINR ?? 250}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRenewDues}
                  disabled={renewingDues}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                    myDuesStatus.duesStatus === 'OVERDUE'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {renewingDues
                      ? 'Processing...'
                      : `Renew Membership (₹${myDuesStatus.duesAmountINR ?? myDuesStatus.club.membershipFeeINR ?? 250})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 4 Core Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Notifications Card */}
            <div
              onClick={() => navigate('/student/notifications')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${unreadCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  {unreadCount} Unread
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {notifications.length} Total
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Open dedicated notifications screen →</span>
              </div>
            </div>

            {/* Elections Card */}
            <div
              onClick={() => navigate('/student/elections')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Elections</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800">
                  {elections.filter((e) => e.status === 'VOTING_OPEN').length} Voting Active
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {elections.length} Elections
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                <Vote className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cast 1-time ballot or run for President →</span>
              </div>
            </div>

            {/* Clubs Card */}
            <div
              onClick={() => navigate('/student/clubs')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Clubs</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  {clubs.filter((c) => c.isMember).length} Member of
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {clubs.length} Clubs
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Explore clubs and apply for membership →</span>
              </div>
            </div>

            {/* Merchandise Store Card */}
            <div
              onClick={() => navigate('/student/merchandise')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Campus Merchandise</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">
                  Odoo Swag
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                Store
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500">
                <ShoppingBag   className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shop Odoo goodies & apparel with member discount →</span>
              </div>
            </div>
          </div>

          {/* Quick Active Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Latest Broadcast Notices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Latest Campus Broadcasts</h3>
                </div>
                <button
                  onClick={() => navigate('/student/notifications')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  View All ({notifications.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${!n.isRead ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/70 border-slate-100'
                      }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${!n.isRead ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{n.title}</span>
                        {!n.isRead && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Election Notices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Active Election Notice</h3>
                </div>
                <button
                  onClick={() => navigate('/student/elections')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Ballots & Nominations →
                </button>
              </div>

              <div className="space-y-3">
                {elections.map((elec) => (
                  <div
                    key={elec.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">{elec.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${elec.status === 'VOTING_OPEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : elec.status === 'NOMINATION_OPEN'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                      >
                        {elec.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Club: {elec.organization.name}</span>
                      {elec.hasVoted ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ballot Cast
                        </span>
                      ) : elec.status === 'VOTING_OPEN' ? (
                        <button
                          onClick={() => navigate('/student/elections')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                        >
                          Vote Now
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/student/elections')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 cursor-pointer"
                        >
                          Apply for President
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. SEPARATE SCREEN: NOTIFICATIONS ───────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-5">
          {/* Notification Top Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${notificationFilter === 'ALL'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setNotificationFilter('UNREAD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${notificationFilter === 'UNREAD'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setNotificationFilter('SYSTEM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${notificationFilter === 'SYSTEM'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                Broadcasts
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
              >
                <MailCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>

          {/* Notifications Full List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No notifications found under this filter.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex items-start justify-between gap-4 ${!notif.isRead
                      ? 'border-blue-200/80 bg-gradient-to-r from-blue-50/30 to-white'
                      : 'border-slate-200/80'
                    }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 ${!notif.isRead
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            UNREAD
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">{notif.message}</p>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 cursor-pointer flex-shrink-0"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 3. SEPARATE SCREEN: ELECTIONS & VOTING ───────────────────── */}
      {activeTab === 'elections' && <ElectionsVotingModule />}

      {/* ── 4. SEPARATE SCREEN: CLUBS & MEMBERSHIP ───────────────────── */}
      {activeTab === 'clubs' && (
        <div className="space-y-5">
          {/* Clubs Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Search clubs by name or category..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            <span className="text-xs text-slate-500 font-semibold">{filteredClubs.length} Club(s) found</span>
          </div>

          {/* Clubs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          club.logoUrl ||
                          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop'
                        }
                        alt={club.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{club.name}</h4>
                        <span className="text-[11px] font-semibold text-slate-500">{club.category}</span>
                      </div>
                    </div>

                    {club.isMember ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        MEMBER
                      </span>
                    ) : club.applicationStatus === 'PENDING' ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {club.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">President</span>
                    <span className="font-bold text-slate-800 truncate max-w-[130px] block">
                      {club.president ? club.president.fullName : 'Vacant'}
                    </span>
                  </div>

                  {club.isMember ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  ) : club.applicationStatus === 'PENDING' ? (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Review Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenMembershipModal(club)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all"
                    >
                      Apply for Membership
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {/* 1. Membership Application Modal */}
      {membershipModal.open && membershipModal.club && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply for Club Membership</h3>
                <p className="text-xs text-slate-500">Target: {membershipModal.club.name}</p>
              </div>
              <button
                onClick={() => setMembershipModal({ open: false, club: null })}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMembership} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">
                  Why are you applying? (Statement of Purpose) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why you are excited to join this club and what you hope to contribute..."
                  value={membershipForm.statementOfPurpose}
                  onChange={(e) =>
                    setMembershipForm({ ...membershipForm, statementOfPurpose: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-1">
                  Relevant Experience & Skills <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Prior projects, coding experience, event coordination, design skills..."
                  value={membershipForm.experience}
                  onChange={(e) => setMembershipForm({ ...membershipForm, experience: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Department</label>
                  <input
                    type="text"
                    value={membershipForm.department}
                    onChange={(e) => setMembershipForm({ ...membershipForm, department: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Semester</label>
                  <input
                    type="text"
                    value={membershipForm.semester}
                    onChange={(e) => setMembershipForm({ ...membershipForm, semester: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMembershipModal({ open: false, club: null })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentModulePage;
