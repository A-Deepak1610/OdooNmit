import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Ticket,
  Vote,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Trophy,
  Loader2,
  X,
  ChevronRight,
  Users,
  Code2,
} from 'lucide-react';
import {
  adminService,
  ClubItem,
  SupportTicketItem,
  SupportMessageItem,
  ElectionItem,
  DbAssistantResult,
} from '../../../services/admin.service';

export const AdminDashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view directly from URL route (synced with sidebar)
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/admin/clubs')) return 'clubs';
    if (path.includes('/admin/tickets')) return 'tickets';
    if (path.includes('/admin/elections')) return 'elections';
    if (path.includes('/admin/assistant')) return 'assistant';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  // Loading & Feedback
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Overview Data
  const [overviewData, setOverviewData] = useState<any>(null);

  // Clubs Data & Modals
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [clubSearch, setClubSearch] = useState('');
  const [clubFilter, setClubFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [newClubForm, setNewClubForm] = useState({ name: '', category: 'Technology', description: '', logoUrl: '' });
  const [assignPresidentModal, setAssignPresidentModal] = useState<{ open: boolean; club: ClubItem | null; userId: string }>({
    open: false,
    club: null,
    userId: '',
  });

  // Tickets Data & Drawer
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [activeTicket, setActiveTicket] = useState<(SupportTicketItem & { messages: SupportMessageItem[] }) | null>(null);
  const [replyText, setReplyText] = useState('');

  // Elections Data & Modals
  const [elections, setElections] = useState<ElectionItem[]>([]);
  const [showCreateElectionModal, setShowCreateElectionModal] = useState(false);
  const [newElectionForm, setNewElectionForm] = useState({
    title: '',
    organizationId: '',
    academicYear: '2026-2027',
    description: '',
    nominationDeadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    votingStartDate: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
    votingEndDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
  });

  // DB Assistant State
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResult, setAssistantResult] = useState<DbAssistantResult | null>(null);
  const [isAssistantSearching, setIsAssistantSearching] = useState(false);

  // Show auto-dismissing toast
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial Load
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [overview, clubsData, ticketsData, electionsData] = await Promise.all([
        adminService.getOverview(),
        adminService.getClubs(),
        adminService.getTickets(),
        adminService.getElections(),
      ]);

      setOverviewData(overview);
      setClubs(clubsData);
      setTickets(ticketsData);
      setElections(electionsData);

      const defaultAi = await adminService.queryDbAssistant('Show campus organizations overview and tickets');
      setAssistantResult(defaultAi);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync with backend', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ── Club Management Handlers ──────────────────────────────────────────────
  const handleToggleClubStatus = async (club: ClubItem) => {
    setActionLoading(true);
    try {
      await adminService.updateClubStatus(club.id, !club.isActive);
      showToast(`Club "${club.name}" status updated to ${!club.isActive ? 'Active' : 'Inactive'}.`);
      const updated = await adminService.getClubs();
      setClubs(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update club status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubForm.name.trim()) return;

    setActionLoading(true);
    try {
      await adminService.createClub(newClubForm);
      showToast(`Club "${newClubForm.name}" created successfully!`);
      setShowCreateClubModal(false);
      setNewClubForm({ name: '', category: 'Technology', description: '', logoUrl: '' });
      const updated = await adminService.getClubs();
      setClubs(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to create club', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignPresident = async () => {
    if (!assignPresidentModal.club || !assignPresidentModal.userId.trim()) return;

    setActionLoading(true);
    try {
      await adminService.assignPresident(assignPresidentModal.club.id, assignPresidentModal.userId);
      showToast(`Appointed President for ${assignPresidentModal.club.name}!`);
      setAssignPresidentModal({ open: false, club: null, userId: '' });
      const updated = await adminService.getClubs();
      setClubs(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign leadership', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Support Tickets Handlers ──────────────────────────────────────────────
  const handleOpenTicket = async (ticket: SupportTicketItem) => {
    try {
      const details = await adminService.getTicketDetails(ticket.id);
      setActiveTicket(details);
    } catch (err: any) {
      showToast(err.message || 'Failed to load ticket conversation', 'error');
    }
  };

  const handleSendTicketReply = async (markResolved = false) => {
    if (!activeTicket || !replyText.trim()) return;

    setActionLoading(true);
    try {
      const statusToSet = markResolved ? 'RESOLVED' : 'IN_PROGRESS';
      await adminService.replyTicket(activeTicket.id, replyText, statusToSet);
      showToast(markResolved ? 'Reply sent & ticket marked as RESOLVED!' : 'Reply sent successfully.');
      setReplyText('');

      const refreshed = await adminService.getTicketDetails(activeTicket.id);
      setActiveTicket(refreshed);

      const refreshedTickets = await adminService.getTickets();
      setTickets(refreshedTickets);
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Election Handlers ─────────────────────────────────────────────────────
  const handleCreateElectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElectionForm.title.trim() || !newElectionForm.organizationId) {
      showToast('Please provide an election title and select a club.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.createElection(newElectionForm);
      showToast('Election announced and campus notification sent!');
      setShowCreateElectionModal(false);
      const updated = await adminService.getElections();
      setElections(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to announce election', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNomineeStatusChange = async (candidateId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      await adminService.updateCandidateStatus(candidateId, status);
      showToast(`Candidate nomination ${status.toLowerCase()} successfully.`);
      const updated = await adminService.getElections();
      setElections(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update candidate', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCastVote = async (electionId: string, candidateId: string) => {
    setActionLoading(true);
    try {
      await adminService.castVote(electionId, candidateId);
      showToast('Ballot registered! Atomic 1-time vote verified.');
      const updated = await adminService.getElections();
      setElections(updated);
    } catch (err: any) {
      showToast(err.message || 'Vote rejected', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeElection = async (electionId: string) => {
    if (!window.confirm('Finalize this election? The top candidate will be automatically promoted to President.')) return;

    setActionLoading(true);
    try {
      const res = await adminService.finalizeElection(electionId);
      showToast(`Election finalized! ${res.winner.fullName} is now President of ${res.organization}!`);
      const updated = await adminService.getElections();
      setElections(updated);
      const updatedClubs = await adminService.getClubs();
      setClubs(updatedClubs);
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize election', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── DB Assistant Query Handler ────────────────────────────────────────────
  const handleRunAssistantQuery = async (queryToRun: string) => {
    if (!queryToRun.trim()) return;
    setIsAssistantSearching(true);
    try {
      const res = await adminService.queryDbAssistant(queryToRun);
      setAssistantResult(res);
      setAssistantQuery(queryToRun);
    } catch (err: any) {
      showToast(err.message || 'Assistant query failed', 'error');
    } finally {
      setIsAssistantSearching(false);
    }
  };

  // Filtered lists
  const filteredClubs = clubs.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(clubSearch.toLowerCase()) || c.category.toLowerCase().includes(clubSearch.toLowerCase());
    const matchesStatus = clubFilter === 'all' || (clubFilter === 'active' && c.isActive) || (clubFilter === 'inactive' && !c.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredTickets = tickets.filter((t) => {
    return ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
  });

  return (
    <div className="text-slate-800 pb-12">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Quick Overview'}
              {activeTab === 'clubs' && 'Club Management'}
              {activeTab === 'tickets' && 'Ticket Support'}
              {activeTab === 'elections' && 'Annual Elections'}
              {activeTab === 'assistant' && 'DB Query Assistant'}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'overview' && 'Platform summary, active club statuses, tickets & elections'}
            {activeTab === 'clubs' && 'Manage clubs, review status, assign leadership & charter new organizations'}
            {activeTab === 'tickets' && 'Receive student & club queries, resolve issues & send messages'}
            {activeTab === 'elections' && 'Yearly election governance, nominee applications & atomic voting'}
            {activeTab === 'assistant' && 'Natural language query database assistant with formatted results'}
          </p>
        </div>

        <button
          onClick={fetchAllData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {isLoading && !overviewData ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading data from database...</p>
        </div>
      ) : null}

      {/* ── 1. QUICK OVERVIEW ────────────────────────────────────────── */}
      {activeTab === 'overview' && overviewData && (
        <div className="space-y-6">
          {/* 4 Focused Metric Cards Matching Sidebar Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Clubs KPI */}
            <div
              onClick={() => navigate('/admin/clubs')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Club Management</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">12</span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {overviewData.kpis.totalClubs}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>{overviewData.kpis.activeClubs} Active</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{overviewData.kpis.inactiveClubs} Inactive</span>
              </div>
            </div>

            {/* 2. Tickets KPI */}
            <div
              onClick={() => navigate('/admin/tickets')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket Support</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800">4 Open</span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {overviewData.kpis.totalTickets}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-amber-600">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span>{overviewData.kpis.openTickets} Open Queries</span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-600">{overviewData.kpis.inProgressTickets} In Progress</span>
              </div>
            </div>

            {/* 3. Elections KPI */}
            <div
              onClick={() => navigate('/admin/elections')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Annual Elections</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">3</span>
              </div>
              <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {overviewData.kpis.totalElections}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                <span>{overviewData.kpis.activeElections} Active Elections</span>
              </div>
            </div>

            {/* 4. DB Query Assistant KPI */}
            <div
              onClick={() => navigate('/admin/assistant')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">DB Assistant</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-100 text-purple-800">NLP</span>
              </div>
              <div className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                Natural Query
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-purple-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask DB in plain English</span>
              </div>
            </div>
          </div>

          {/* Two Column: Recent Tickets & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Queries */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Support Queries</h3>
                </div>
                <button onClick={() => navigate('/admin/tickets')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">
                  View All →
                </button>
              </div>

              <div className="space-y-2.5">
                {overviewData.recentTickets.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      navigate('/admin/tickets');
                      handleOpenTicket(t);
                    }}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">{t.ticketNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            t.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 truncate">{t.subject}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">By {t.createdBy?.fullName || 'User'}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast Feed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Platform Activity Broadcasts</h3>
              </div>

              <div className="space-y-2.5">
                {overviewData.recentNotifications.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900">{n.title}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CLUB MANAGEMENT ───────────────────────────────────────── */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Search clubs by title or category..."
                value={clubSearch}
                onChange={(e) => setClubSearch(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {(['all', 'active', 'inactive'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setClubFilter(filter)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      clubFilter === filter ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCreateClubModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Club</span>
              </button>
            </div>
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
                        src={club.logoUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=100&fit=crop'}
                        alt={club.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{club.name}</h4>
                        <span className="text-[11px] font-semibold text-slate-500">{club.category}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleClubStatus(club)}
                      disabled={actionLoading}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        club.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                      title="Click to toggle status"
                    >
                      {club.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">{club.description || 'No description provided.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">President</span>
                    <span className="font-bold text-slate-800 truncate max-w-[140px] block">
                      {club.president ? club.president.fullName : 'Vacant Position'}
                    </span>
                  </div>

                  <button
                    onClick={() => setAssignPresidentModal({ open: true, club, userId: club.president?.id || '' })}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-indigo-600 cursor-pointer"
                  >
                    Assign President
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. TICKET SUPPORT ────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setTicketStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ticketStatusFilter === st ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-semibold">{filteredTickets.length} ticket(s) found</span>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Creator</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{t.ticketNumber}</td>
                    <td className="py-3 px-4 max-w-xs truncate font-bold text-slate-900">{t.subject}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">{t.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.priority === 'URGENT'
                            ? 'bg-red-100 text-red-800'
                            : t.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          t.status === 'OPEN'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.createdBy?.fullName || t.createdBy?.username}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenTicket(t)}
                        className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer"
                      >
                        Resolve / Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── 4. ANNUAL ELECTIONS ──────────────────────────────────────── */}
      {activeTab === 'elections' && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Yearly Club Elections & Leadership Ratification</h3>
              <p className="text-xs text-slate-500">
                Announce yearly elections, review candidate nominations, enforce atomic 1-time voting, and promote elected winners to President.
              </p>
            </div>
            <button
              onClick={() => setShowCreateElectionModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Announce Election</span>
            </button>
          </div>

          {/* Elections List */}
          <div className="space-y-6">
            {elections.map((elec) => (
              <div key={elec.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-indigo-600">{elec.organization?.name}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-500">Term {elec.academicYear}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          elec.status === 'VOTING_OPEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : elec.status === 'NOMINATION_OPEN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {elec.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{elec.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{elec.description}</p>
                  </div>

                  {elec.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleFinalizeElection(elec.id)}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Finalize & Promote President</span>
                    </button>
                  )}
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Nomination Closes: {new Date(elec.nominationDeadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-emerald-500" />
                    <span>Voting: {new Date(elec.votingStartDate).toLocaleDateString()} - {new Date(elec.votingEndDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Ballots Cast: {elec._count?.votes || 0} Total</span>
                  </div>
                </div>

                {/* Nominees */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Nominees ({elec.candidates.length})
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {elec.candidates.map((cand) => (
                      <div key={cand.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={cand.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={cand.user.fullName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900">{cand.user.fullName}</div>
                                <div className="text-[10px] text-slate-500">@{cand.user.username}</div>
                              </div>
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                cand.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : cand.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {cand.status}
                            </span>
                          </div>

                          {cand.statementOfPurpose && (
                            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 mb-2">
                              <span className="font-bold text-slate-500 uppercase text-[9px] block">Why Applying:</span>
                              {cand.statementOfPurpose}
                            </div>
                          )}
                          {cand.experience && (
                            <div className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/60 mb-2">
                              <span className="font-bold text-slate-500 uppercase text-[9px] block">Leadership Experience:</span>
                              {cand.experience}
                            </div>
                          )}
                          <div className="text-xs text-slate-600 line-clamp-3 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed mb-3">
                            <span className="font-bold text-slate-500 uppercase text-[9px] block">Manifesto:</span>
                            "{cand.manifesto}"
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-xs font-bold text-indigo-700">{cand.voteCount} Ballots</span>

                          <div className="flex items-center gap-2">
                            {cand.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleNomineeStatusChange(cand.id, 'APPROVED')}
                                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleNomineeStatusChange(cand.id, 'REJECTED')}
                                  className="px-2 py-1 rounded-md bg-red-100 text-red-700 hover:bg-red-200 text-[10px] font-bold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : cand.status === 'APPROVED' && elec.status === 'VOTING_OPEN' ? (
                              <button
                                onClick={() => handleCastVote(elec.id, cand.id)}
                                disabled={actionLoading}
                                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer shadow-xs disabled:opacity-50"
                              >
                                Cast 1-Time Ballot
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. DB QUERY ASSISTANT ────────────────────────────────────── */}
      {activeTab === 'assistant' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Natural Query Processor</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunAssistantQuery(assistantQuery)}
                  placeholder="Ask a natural language query, e.g. 'Show all active clubs and tickets'..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={() => handleRunAssistantQuery(assistantQuery)}
                disabled={isAssistantSearching}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAssistantSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Run Query</span>
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Quick Prompts:</span>
              {[
                'Show all active clubs and membership',
                'List unresolved tickets with high priority',
                'Elections status and vote tallies',
                'General system-wide audit summary',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => handleRunAssistantQuery(sample)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 font-medium transition-all cursor-pointer"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* Formatted Results */}
          {assistantResult && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Interpreted Intent</span>
                  <div className="text-xs font-bold text-slate-900">{assistantResult.interpretedIntent}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-indigo-400 font-bold block mb-1">Generated SQL</span>
                    <code>{assistantResult.sqlQuery}</code>
                  </div>
                  <Code2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {assistantResult.summaryMetrics.map((m, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">{m.label}</span>
                    <span className="text-sm font-extrabold text-indigo-950 mt-0.5 block">{m.value}</span>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <tr>
                      {assistantResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {assistantResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {/* 1. Ticket Conversation Drawer */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-indigo-600">{activeTicket.ticketNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">{activeTicket.status}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">{activeTicket.priority}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{activeTicket.subject}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Opened by {activeTicket.createdBy.fullName} • {activeTicket.organization?.name || 'General Inquiry'}
                </p>
              </div>
              <button onClick={() => setActiveTicket(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/40">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Original Issue Description</div>
                <p className="text-xs text-slate-700 leading-relaxed">{activeTicket.description}</p>
              </div>

              {activeTicket.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                    msg.isAdminReply
                      ? 'ml-auto bg-indigo-600 text-white shadow-xs'
                      : 'mr-auto bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-bold mb-1 ${msg.isAdminReply ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {msg.sender.fullName || msg.sender.username} {msg.isAdminReply && '• System Admin'}
                  </div>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-white space-y-3">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type resolution message or response to the student..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleSendTicketReply(false)}
                  disabled={actionLoading || !replyText.trim()}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Send Reply (Keep Open)
                </button>

                <button
                  type="button"
                  onClick={() => handleSendTicketReply(true)}
                  disabled={actionLoading || !replyText.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Send & Mark Resolved</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Create Club Modal */}
      {showCreateClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Charter New Club</h3>
              <button onClick={() => setShowCreateClubModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClubSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Club Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence Research Society"
                  value={newClubForm.name}
                  onChange={(e) => setNewClubForm({ ...newClubForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1">Category</label>
                <select
                  value={newClubForm.category}
                  onChange={(e) => setNewClubForm({ ...newClubForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Technology">Technology & AI</option>
                  <option value="Arts & Media">Arts & Media</option>
                  <option value="Engineering">Engineering & Hardware</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Finance & Business">Finance & Business</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="Culture">Culture & Music</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of club objectives..."
                  value={newClubForm.description}
                  onChange={(e) => setNewClubForm({ ...newClubForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClubModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Charter Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign President Modal */}
      {assignPresidentModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assign President</h3>
              <button
                onClick={() => setAssignPresidentModal({ open: false, club: null, userId: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Appoint a student leader as President of <span className="font-bold">{assignPresidentModal.club?.name}</span>.
            </p>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Student User ID</label>
                <input
                  type="text"
                  placeholder="Paste student UUID"
                  value={assignPresidentModal.userId}
                  onChange={(e) => setAssignPresidentModal({ ...assignPresidentModal, userId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignPresidentModal({ open: false, club: null, userId: '' })}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAssignPresident}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Confirm Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Announce Election Modal */}
      {showCreateElectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Announce Annual Election</h3>
              <button onClick={() => setShowCreateElectionModal(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateElectionSubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Election Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027 Executive Officer Election"
                  value={newElectionForm.title}
                  onChange={(e) => setNewElectionForm({ ...newElectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Target Club</label>
                  <select
                    value={newElectionForm.organizationId}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, organizationId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a Club</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={newElectionForm.academicYear}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1">Nomination Closes</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.nominationDeadline}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, nominationDeadline: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Voting Starts</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.votingStartDate}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, votingStartDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1">Voting Ends</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.votingEndDate}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, votingEndDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Description & Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Voting eligibility and atomic 1-time ballot policy..."
                  value={newElectionForm.description}
                  onChange={(e) => setNewElectionForm({ ...newElectionForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateElectionModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Broadcast Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
