import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Plus,
  Loader2,
  X,
  Edit3,
  Trash2,
  Pin,
  Lock,
  Globe,
  Instagram,
  Linkedin,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  AlertTriangle,
  Send,
} from 'lucide-react';
import {
  presidentService,
  PresidentClubProfile,
  PresidentAnnouncement,
  PresidentMember,
  PresidentApplication,
  ClubDuesOverview,
} from '../../services/president.service';

export const PresidentModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view directly from URL route (synced with sidebar)
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/president/profile')) return 'profile';
    if (path.includes('/president/announcements')) return 'announcements';
    if (path.includes('/president/membership') || path.includes('/president/members')) return 'membership';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data State
  const [profile, setProfile] = useState<PresidentClubProfile | null>(null);
  const [announcements, setAnnouncements] = useState<PresidentAnnouncement[]>([]);
  const [members, setMembers] = useState<PresidentMember[]>([]);
  const [applications, setApplications] = useState<PresidentApplication[]>([]);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    category: '',
    description: '',
    websiteUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    logoUrl: '',
    coverUrl: '',
  });

  // Membership Fee State
  const [feeInput, setFeeInput] = useState<string>('500');

  // Announcement Filters & Modal State
  const [announcementFilter, setAnnouncementFilter] = useState<'ALL' | 'PINNED' | 'MEMBERS' | 'PUBLIC'>('ALL');
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<PresidentAnnouncement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    category: 'GENERAL',
    content: '',
    isPinned: false,
    isMemberOnly: false,
  });

  // Membership Applications Filter
  const [appFilter, setAppFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [duesFilter, setDuesFilter] = useState<'ALL' | 'EXPIRING_SOON' | 'OVERDUE' | 'ACTIVE'>('ALL');
  const [duesOverview, setDuesOverview] = useState<ClubDuesOverview | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);

  // Application Detail Modal
  const [selectedApp, setSelectedApp] = useState<PresidentApplication | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [overviewRes, announcementsRes, membersRes, appsRes, duesRes] = await Promise.all([
        presidentService.getOverview(),
        presidentService.getAnnouncements(),
        presidentService.getMembers(),
        presidentService.getApplications(),
        presidentService.getDuesOverview(),
      ]);

      setProfile(overviewRes.club);
      setAnnouncements(announcementsRes);
      setMembers(membersRes);
      setApplications(appsRes);
      setDuesOverview(duesRes);

      setFeeInput(overviewRes.club.membershipFeeINR || '500');
      setProfileForm({
        name: overviewRes.club.name || '',
        category: overviewRes.club.category || '',
        description: overviewRes.club.description || '',
        websiteUrl: overviewRes.club.websiteUrl || '',
        instagramUrl: overviewRes.club.instagramUrl || '',
        linkedinUrl: overviewRes.club.linkedinUrl || '',
        logoUrl: overviewRes.club.logoUrl || '',
        coverUrl: overviewRes.club.coverUrl || '',
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to load club executive data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminders = async () => {
    try {
      setSendingReminders(true);
      const res = await presidentService.sendDuesReminders();
      showToast(res.message);
      // Reload dues overview
      const updated = await presidentService.getDuesOverview();
      setDuesOverview(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch reminders', 'error');
    } finally {
      setSendingReminders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers: Club Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const updated = await presidentService.updateProfile(profileForm);
      setProfile(updated);
      showToast('Club profile and public branding saved successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update club profile', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Membership Fee
  const handleUpdateFee = async () => {
    const feeNum = Number(feeInput);
    if (isNaN(feeNum) || feeNum < 0) {
      showToast('Please enter a valid membership fee in INR', 'error');
      return;
    }
    try {
      setActionLoading(true);
      await presidentService.updateMembershipFee(feeNum);
      if (profile) {
        setProfile({ ...profile, membershipFeeINR: String(feeNum), membershipFee: feeNum * 100 });
      }
      showToast(`Membership dues fixed to ₹${feeNum}. All members notified!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update membership dues', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Announcements
  const handleOpenCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      category: 'GENERAL',
      content: '',
      isPinned: false,
      isMemberOnly: false,
    });
    setAnnouncementModalOpen(true);
  };

  const handleOpenEditAnnouncement = (item: PresidentAnnouncement) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      category: item.category,
      content: item.content,
      isPinned: item.isPinned,
      isMemberOnly: item.isMemberOnly,
    });
    setAnnouncementModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    try {
      setActionLoading(true);
      if (editingAnnouncement) {
        const updated = await presidentService.updateAnnouncement(editingAnnouncement.id, announcementForm);
        setAnnouncements((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        showToast('Announcement updated successfully!');
      } else {
        const created = await presidentService.createAnnouncement(announcementForm);
        setAnnouncements((prev) => [created, ...prev]);
        showToast('Announcement published and broadcasted!');
      }
      setAnnouncementModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to publish announcement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this announcement?')) return;
    try {
      setActionLoading(true);
      await presidentService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showToast('Announcement removed.');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete announcement', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Membership Applications Review
  const handleReviewApp = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(true);
      const updated = await presidentService.reviewApplication(id, status);
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a)));
      if (selectedApp?.id === id) {
        setSelectedApp({ ...selectedApp, status: updated.status });
      }

      if (status === 'APPROVED') {
        const refreshedMembers = await presidentService.getMembers();
        setMembers(refreshedMembers);
      }

      showToast(`Membership application ${status.toLowerCase()}! Student notified.`);
    } catch (err: any) {
      showToast(err.message || `Failed to ${status.toLowerCase()} application`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Assign Member Role
  const handleAssignRole = async (memberUserId: string, newRole: string) => {
    try {
      setActionLoading(true);
      await presidentService.assignMemberRole(memberUserId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.userId === memberUserId ? { ...m, role: newRole as any } : m))
      );
      showToast(`Member assigned role ${newRole}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers: Remove Member
  const handleRemoveMember = async (memberUserId: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke membership for ${name}?`)) return;
    try {
      setActionLoading(true);
      await presidentService.removeMember(memberUserId);
      setMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
      showToast(`${name} removed from club roster.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to remove member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered lists
  const filteredAnnouncements = announcements.filter((a) => {
    if (announcementFilter === 'PINNED') return a.isPinned;
    if (announcementFilter === 'MEMBERS') return a.isMemberOnly;
    if (announcementFilter === 'PUBLIC') return !a.isMemberOnly;
    return true;
  });

  const filteredApplications = applications.filter((app) => {
    if (appFilter === 'PENDING') return app.status === 'PENDING';
    if (appFilter === 'APPROVED') return app.status === 'APPROVED';
    if (appFilter === 'REJECTED') return app.status === 'REJECTED';
    return true;
  });

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.user.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.user.email.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.user.username.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesDues =
      duesFilter === 'ALL' ||
      (duesFilter === 'EXPIRING_SOON' && m.duesStatus === 'EXPIRING_SOON') ||
      (duesFilter === 'OVERDUE' && m.duesStatus === 'OVERDUE') ||
      (duesFilter === 'ACTIVE' && (m.duesStatus === 'ACTIVE' || m.duesStatus === 'UPCOMING'));
    return matchesSearch && matchesRole && matchesDues;
  });

  const pendingAppsCount = applications.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="text-slate-800 pb-12">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 ${
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

      {/* Header Bar matching standard CampusMitra pages */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Executive Hub'}
              {activeTab === 'profile' && 'Club Profile'}
              {activeTab === 'announcements' && 'Announcements'}
              {activeTab === 'membership' && 'Membership & Fees'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              CLUB PRESIDENT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'overview' &&
              `Executive command center for ${profile?.name || 'Tech & AI Innovators Club'} • Elena Rostova`}
            {activeTab === 'profile' &&
              'Manage club description, branding logo, cover banner, and public website metadata'}
            {activeTab === 'announcements' &&
              'Publish, pin, and broadcast announcements to campus students and club members'}
            {activeTab === 'membership' &&
              'Fix annual membership fees, review applicant credentials, and assign member roles'}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {isLoading && !profile ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading club workspace from database...</p>
        </div>
      ) : null}

      {/* ── 1. EXECUTIVE HUB (OVERVIEW DASHBOARD) ────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Hero Welcome Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Charter
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Academic Year 2026-2027</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  Welcome, Elena Rostova
                </h2>
                <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                  President of <span className="font-semibold text-slate-900">{profile?.name}</span>.
                  Manage your club profile, publish updates, review pending applications, and fix annual dues.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate('/president/announcements')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Announcement</span>
                </button>
                <button
                  onClick={() => navigate('/president/membership')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Review Applicants ({pendingAppsCount})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dues & Renewal Urgent Alert Banner for Club Admin */}
          {duesOverview?.hasAlert && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Membership Dues Alert
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      {duesOverview.expiringSoonCount + duesOverview.overdueCount} Members Require Action
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    {duesOverview.alert?.title || 'Annual Membership Dues Expiring Soon'}
                  </h4>
                  <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                    {duesOverview.alert?.message || `${duesOverview.expiringSoonCount} member(s) have annual dues expiring within 15 days, and ${duesOverview.overdueCount} are overdue. Total uncollected dues: ₹${duesOverview.pendingAmountINR.toLocaleString('en-IN')}.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSendReminders}
                  disabled={sendingReminders}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {sendingReminders ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{sendingReminders ? 'Dispatching...' : 'Dispatch Renewal Reminders'}</span>
                </button>
                <button
                  onClick={() => {
                    navigate('/president/membership');
                    setDuesFilter('EXPIRING_SOON');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <span>Filter Roster</span>
                </button>
              </div>
            </div>
          )}

          {/* 4 Focused Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Members */}
            <div
              onClick={() => navigate('/president/membership')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Club Members</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">
                  {members.length}
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {members.length}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>{members.length} Active Members</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Voting rights</span>
              </div>
            </div>

            {/* 2. Pending Applications */}
            <div
              onClick={() => navigate('/president/membership')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Pending Applications
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">
                  {pendingAppsCount} New
                </span>
              </div>
              <div className="text-3xl font-black text-amber-600 group-hover:text-amber-700 transition-colors">
                {pendingAppsCount}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{pendingAppsCount} Awaiting Review</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">SoP submitted</span>
              </div>
            </div>

            {/* 3. Announcements */}
            <div
              onClick={() => navigate('/president/announcements')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Announcements</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800">
                  {announcements.length} Active
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {announcements.length}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-indigo-600">
                <Pin className="w-3.5 h-3.5" />
                <span>{announcements.filter((a) => a.isPinned).length} Pinned</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Member & Public feeds</span>
              </div>
            </div>

            {/* 4. Membership Fee */}
            <div
              onClick={() => navigate('/president/membership')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Membership Dues</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  Fixed
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-600 group-hover:text-emerald-700 transition-colors">
                ₹{profile?.membershipFeeINR || '500'}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Annual Fee</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Click to update</span>
              </div>
            </div>
          </div>

          {/* Two Columns: Recent Applications & Announcements Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Pending Membership Review */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Pending Membership Applications</h3>
                </div>
                <button
                  onClick={() => navigate('/president/membership')}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  View All ({applications.length}) →
                </button>
              </div>

              {applications.filter((a) => a.status === 'PENDING').length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No pending applications. All candidate requests processed!
                </div>
              ) : (
                <div className="space-y-3">
                  {applications
                    .filter((a) => a.status === 'PENDING')
                    .slice(0, 3)
                    .map((app) => (
                      <div
                        key={app.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {app.user.fullName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">{app.user.fullName}</h4>
                              <p className="text-xs text-slate-500">
                                {app.department || 'Computer Science'} • {app.semester || 'Semester 4'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING
                          </span>
                        </div>

                        <div className="bg-white rounded-lg p-2.5 text-xs text-slate-700 border border-slate-200/80 line-clamp-2">
                          <span className="font-semibold text-slate-900">SoP: </span>
                          {app.statementOfPurpose || 'Eager to participate in club activities and hackathons.'}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Read Full Details
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleReviewApp(app.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleReviewApp(app.id, 'APPROVED')}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
                            >
                              Approve Member
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Right Column: Announcements Feed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Club Announcements Feed</h3>
                </div>
                <button
                  onClick={() => navigate('/president/announcements')}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  Manage All →
                </button>
              </div>

              <div className="space-y-3">
                {announcements.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {item.isPinned && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.category === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.category === 'EVENT'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : item.category === 'MEETING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {item.category}
                        </span>
                        {item.isMemberOnly && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                            <Lock className="w-2.5 h-2.5" /> Members Only
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MANAGE CLUB PROFILE & PUBLIC WEBSITE ──────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">Club Profile & Public Website</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your club's public branding, description, banner, and social media handles.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Cover Banner Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Cover Banner & Logo Preview
              </label>
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                {profileForm.coverUrl ? (
                  <img
                    src={profileForm.coverUrl}
                    alt="Cover Banner"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Cover Banner specified
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <img
                    src={
                      profileForm.logoUrl ||
                      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=200&fit=crop'
                    }
                    alt="Logo"
                    className="w-14 h-14 rounded-xl border-2 border-white bg-white object-cover shadow-md"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-white drop-shadow-sm">
                      {profileForm.name || 'Club Display Name'}
                    </h3>
                    <span className="text-xs font-semibold text-indigo-200 drop-shadow-sm">
                      {profileForm.category || 'Technology & AI'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Club Display Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  placeholder="e.g. Tech & AI Innovators Club"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={profileForm.category}
                  onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  placeholder="e.g. Technology & Artificial Intelligence"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Club Mission & Description
              </label>
              <textarea
                rows={4}
                required
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                placeholder="Describe your organization's mission, workshops, and weekly activities..."
              />
            </div>

            {/* Media Image URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                <input
                  type="url"
                  value={profileForm.logoUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cover Banner URL
                </label>
                <input
                  type="url"
                  value={profileForm.coverUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, coverUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Public Socials */}
            <div className="border-t border-slate-100 pt-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Public Website & Social Media</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" /> Website URL
                  </label>
                  <input
                    type="url"
                    value={profileForm.websiteUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    placeholder="https://techinnovators.nmit.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={profileForm.instagramUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, instagramUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    placeholder="https://instagram.com/tech_nmit"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                    <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Organization Page
                  </label>
                  <input
                    type="text"
                    value={profileForm.linkedinUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedinUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                    placeholder="https://linkedin.com/company/tech-innovators"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="submit"
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 3. PUBLISH & MANAGE ANNOUNCEMENTS ────────────────────────────── */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              {(['ALL', 'PINNED', 'MEMBERS', 'PUBLIC'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setAnnouncementFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    announcementFilter === filterKey
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? `All (${announcements.length})`
                    : filterKey === 'PINNED'
                    ? `Pinned (${announcements.filter((a) => a.isPinned).length})`
                    : filterKey === 'MEMBERS'
                    ? `Members Only (${announcements.filter((a) => a.isMemberOnly).length})`
                    : `Public (${announcements.filter((a) => !a.isMemberOnly).length})`}
                </button>
              ))}
            </div>

            <button
              onClick={handleOpenCreateAnnouncement}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Announcement</span>
            </button>
          </div>

          {/* Announcements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.isPinned && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Pin className="w-3 h-3 rotate-45" /> Pinned
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.category === 'URGENT'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.category === 'EVENT'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : item.category === 'MEETING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.category}
                      </span>
                      {item.isMemberOnly ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                          <Lock className="w-3 h-3 text-amber-600" /> Members Only
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        item.author?.avatarUrl ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
                      }
                      alt={item.author?.fullName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs text-slate-500 font-medium">
                      {item.author?.fullName || 'Elena Rostova'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditAnnouncement(item)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(item.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. MEMBERSHIP & FEES MANAGEMENT ─────────────────────────────── */}
      {activeTab === 'membership' && (
        <div className="space-y-6">
          {/* Dues & Renewal Status Engine Overview Banner */}
          {duesOverview && (
            <div
              className={`rounded-2xl border p-5 shadow-xs transition-all ${
                duesOverview.hasAlert
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-amber-300'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 text-white shadow-xs ${
                      duesOverview.hasAlert ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                  >
                    {duesOverview.hasAlert ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${
                          duesOverview.hasAlert
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {duesOverview.hasAlert
                          ? 'Action Required: Dues Expiring'
                          : 'All Members In Good Standing'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {duesOverview.totalMembers} Registered Club Members
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {duesOverview.alert?.title || 'Membership Dues & Renewal Engine'}
                    </h3>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      {duesOverview.expiringSoonCount} member(s) expiring within 15 days • {duesOverview.overdueCount} overdue • {duesOverview.activeCount} active & paid. Pending dues collection: <span className="font-bold text-slate-900">₹{duesOverview.pendingAmountINR.toLocaleString('en-IN')}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSendReminders}
                    disabled={sendingReminders}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {sendingReminders ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{sendingReminders ? 'Sending...' : 'Dispatch Renewal Reminders'}</span>
                  </button>
                  <button
                    onClick={() => setDuesFilter(duesOverview.hasAlert ? 'EXPIRING_SOON' : 'ALL')}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <span>View Flagged ({duesOverview.expiringSoonCount + duesOverview.overdueCount})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fix Membership Fee Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Fix & Manage Annual Membership Fee
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-xl">
                  Set the official annual membership fee in Indian Rupees (₹). Student applications and receipts
                  will reflect this value automatically.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={feeInput}
                    onChange={(e) => setFeeInput(e.target.value)}
                    className="w-32 pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-base focus:outline-none focus:border-indigo-500 shadow-xs"
                  />
                </div>
                <button
                  onClick={handleUpdateFee}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0"
                >
                  {actionLoading ? 'Saving...' : 'Fix Membership Fee'}
                </button>
              </div>
            </div>
          </div>

          {/* Pending Applications Review Queue */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  Membership Applications Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Review applicant credentials and statement of purpose before approving membership.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setAppFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      appFilter === filterKey
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {filterKey} (
                    {filterKey === 'ALL'
                      ? applications.length
                      : applications.filter((a) => a.status === filterKey).length}
                    )
                  </button>
                ))}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 py-10 text-center text-slate-400 text-xs">
                No applications matching selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                            {app.user.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{app.user.fullName}</h4>
                            <p className="text-xs text-slate-400">{app.user.email}</p>
                            <p className="text-xs text-indigo-600 font-medium">
                              {app.department || 'Computer Science'} • {app.semester || 'Semester 4'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {/* Statement of Purpose */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Statement of Purpose:
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {app.statementOfPurpose || 'No statement provided.'}
                        </p>
                      </div>

                      {/* Experience */}
                      {app.experience && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-xs">
                          <div className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600" />
                            Experience & Credentials:
                          </div>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {app.experience}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>

                      {app.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleReviewApp(app.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleReviewApp(app.id, 'APPROVED')}
                            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
                          >
                            Approve Member
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Processed {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Members Roster */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Club Active Members Roster ({members.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Assign club leadership responsibilities (Organizer, Volunteer, Treasurer) and manage roster.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search member..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 w-44"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="PRESIDENT">President</option>
                  <option value="TREASURER">Treasurer</option>
                  <option value="EVENT_ORGANIZER">Event Organizer</option>
                  <option value="VOLUNTEER">Volunteer</option>
                  <option value="MEMBER">Member</option>
                </select>

                <select
                  value={duesFilter}
                  onChange={(e) => setDuesFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="ALL">All Dues ({members.length})</option>
                  <option value="EXPIRING_SOON">Expiring Soon ({duesOverview?.expiringSoonCount ?? 0})</option>
                  <option value="OVERDUE">Overdue ({duesOverview?.overdueCount ?? 0})</option>
                  <option value="ACTIVE">Paid / Good Standing ({duesOverview?.activeCount ?? 0})</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Current Role</th>
                    <th className="py-2.5 px-3">Dues & Renewal Status</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => (
                    <tr key={m.roleId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              m.user.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'
                            }
                            alt={m.user.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{m.user.fullName}</div>
                            <div className="text-[11px] text-slate-400">@{m.user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">{m.user.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            m.role === 'PRESIDENT'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : m.role === 'TREASURER'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : m.role === 'EVENT_ORGANIZER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : m.role === 'VOLUNTEER'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {m.duesStatus === 'OVERDUE' ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue ({Math.abs(m.daysRemaining ?? 0)}d)
                            </span>
                            <span className="text-[10px] text-rose-500 font-medium mt-0.5">
                              Expired {m.validUntil ? new Date(m.validUntil).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        ) : m.duesStatus === 'EXPIRING_SOON' ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                              <Clock className="w-3 h-3 text-amber-600" /> Due in {m.daysRemaining}d
                            </span>
                            <span className="text-[10px] text-amber-600 font-medium mt-0.5">
                              Expires {m.validUntil ? new Date(m.validUntil).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid • Active
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Valid thru {m.validUntil ? new Date(m.validUntil).toLocaleDateString() : 'Active'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-400">
                        {new Date(m.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {m.role === 'PRESIDENT' ? (
                          <span className="text-xs text-slate-400 italic">Club President</span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={m.role}
                              onChange={(e) => handleAssignRole(m.userId, e.target.value)}
                              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="MEMBER">Member</option>
                              <option value="VOLUNTEER">Volunteer</option>
                              <option value="EVENT_ORGANIZER">Event Organizer</option>
                              <option value="TREASURER">Treasurer</option>
                            </select>

                            <button
                              onClick={() => handleRemoveMember(m.userId, m.user.fullName)}
                              className="p-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-all cursor-pointer"
                              title="Revoke Membership"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT ANNOUNCEMENT ────────────────────────────── */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                {editingAnnouncement ? 'Edit Announcement' : 'Publish Announcement'}
              </h3>
              <button
                onClick={() => setAnnouncementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. Hackathon Launch This Friday"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={announcementForm.category}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                >
                  <option value="GENERAL">General Notice</option>
                  <option value="EVENT">Event / Workshop</option>
                  <option value="MEETING">General Body Meeting (GBM)</option>
                  <option value="URGENT">Urgent Action Item</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={4}
                  required
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="Detailed announcement content..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementForm.isPinned}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-0"
                  />
                  <span>Pin Announcement to Top</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementForm.isMemberOnly}
                    onChange={(e) =>
                      setAnnouncementForm({ ...announcementForm, isMemberOnly: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-0"
                  />
                  <span>Members Only Visibility</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
                  <span>{editingAnnouncement ? 'Save Changes' : 'Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: VIEW FULL MEMBERSHIP APPLICATION ─────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                Membership Application
              </h3>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center">
                  {selectedApp.user.fullName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedApp.user.fullName}</h4>
                  <p className="text-xs text-slate-500">{selectedApp.user.email}</p>
                  <p className="text-xs text-indigo-600 font-semibold">
                    {selectedApp.department} • {selectedApp.semester}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1 text-xs">
                <div className="font-bold text-slate-700">Statement of Purpose:</div>
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.statementOfPurpose || 'No statement provided.'}
                </p>
              </div>

              {selectedApp.experience && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-1 text-xs">
                  <div className="font-bold text-slate-700">Experience & Credentials:</div>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.experience}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Close
              </button>

              {selectedApp.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReviewApp(selectedApp.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleReviewApp(selectedApp.id, 'APPROVED')}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Member
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresidentModulePage;
