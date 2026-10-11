import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  adminService,
  ClubItem,
  SupportTicketItem,
  SupportMessageItem,
  ElectionItem,
} from '../../../services/admin.service';
import { AdminDbAssistantPage } from '../AdminDbAssistantPage';
import { AdminQuickOverview } from './AdminQuickOverview';
import { AdminClubsView } from './AdminClubsView';
import { AdminTicketsView, AdminTicketDetailModal } from './AdminTicketsView';
import { AdminElectionsView } from './AdminElectionsView';

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

  // Clubs Data
  const [clubs, setClubs] = useState<ClubItem[]>([]);

  // Tickets Data & Drawer
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [activeTicket, setActiveTicket] = useState<(SupportTicketItem & { messages: SupportMessageItem[] }) | null>(null);
  const [replyText, setReplyText] = useState('');

  // Elections Data
  const [elections, setElections] = useState<ElectionItem[]>([]);
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
      {activeTab !== 'assistant' && (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'overview' && 'Quick Overview'}
                {activeTab === 'clubs' && 'Club Management'}
                {activeTab === 'tickets' && 'Ticket Support'}
                {activeTab === 'elections' && 'Annual Elections'}
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
      )}

      {isLoading && !overviewData ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold">Loading data from database...</p>
        </div>
      ) : null}

      {/* ── 1. QUICK OVERVIEW ────────────────────────────────────────── */}
      {activeTab === 'overview' && overviewData && (
        <AdminQuickOverview
          overviewData={overviewData}
          clubs={clubs}
          tickets={tickets}
          elections={elections}
          onOpenTicket={handleOpenTicket}
          onNavigateTab={(path) => navigate(path)}
        />
      )}

      {/* ── 2. CLUB MANAGEMENT ───────────────────────────────────────── */}
      {activeTab === 'clubs' && (
        <AdminClubsView
          clubs={clubs}
          isLoading={isLoading}
          onRefresh={fetchAllData}
          onClubsUpdated={(updated) => setClubs(updated)}
          showToast={showToast}
        />
      )}

      {/* ── 3. TICKET SUPPORT ────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <AdminTicketsView
          tickets={tickets}
          isLoading={isLoading}
          onRefresh={fetchAllData}
          onTicketsUpdated={(updated) => setTickets(updated)}
          showToast={showToast}
          activeTicket={activeTicket}
          setActiveTicket={setActiveTicket}
          onOpenTicket={handleOpenTicket}
          replyText={replyText}
          setReplyText={setReplyText}
          actionLoading={actionLoading}
          handleSendTicketReply={handleSendTicketReply}
          renderModal={false}
        />
      )}

      {/* ── 4. ANNUAL ELECTIONS ──────────────────────────────────────── */}
      {activeTab === 'elections' && (
        <AdminElectionsView
          elections={elections}
          clubs={clubs}
          isLoading={isLoading}
          actionLoading={actionLoading}
          onRefresh={fetchAllData}
          onElectionsUpdated={(updated) => setElections(updated)}
          onClubsUpdated={(updated) => setClubs(updated)}
          showToast={showToast}
        />
      )}

      {/* ── 5. DB QUERY ASSISTANT ────────────────────────────────────── */}
      {activeTab === 'assistant' && <AdminDbAssistantPage />}

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      {/* 1. Ticket Conversation Drawer */}
      {activeTicket && (
        <AdminTicketDetailModal
          activeTicket={activeTicket}
          onClose={() => setActiveTicket(null)}
          replyText={replyText}
          setReplyText={setReplyText}
          actionLoading={actionLoading}
          onSendReply={handleSendTicketReply}
          onDirectStatusChange={async (ticketId, status) => {
            setActionLoading(true);
            try {
              await adminService.updateTicketStatus(ticketId, status);
              showToast(`Ticket status updated to ${status.replace('_', ' ')}.`);
              setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status } : t)));
              setActiveTicket((prev) => (prev && prev.id === ticketId ? { ...prev, status } : prev));
            } catch (err: any) {
              showToast(err.message || 'Failed to update ticket status', 'error');
            } finally {
              setActionLoading(false);
            }
          }}
        />
      )}




    </div>
  );
};

export default AdminDashboardPage;
