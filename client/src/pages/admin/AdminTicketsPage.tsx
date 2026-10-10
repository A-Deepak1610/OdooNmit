import React, { useState, useEffect } from 'react';
import { adminService, SupportTicketItem, SupportMessageItem } from '../../services/admin.service';
import { AdminTicketsView, AdminTicketDetailModal } from './dashboard/AdminTicketsView';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState<(SupportTicketItem & { messages: SupportMessageItem[] }) | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getTickets();
      setTickets(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync tickets from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ticket Support</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              SUPER ADMIN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Receive student & club queries, resolve issues & send messages
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* Realtime Admin Tickets View */}
      <AdminTicketsView
        tickets={tickets}
        isLoading={isLoading}
        onRefresh={fetchTickets}
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

      {/* Ticket Modal */}
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

export default AdminTicketsPage;
