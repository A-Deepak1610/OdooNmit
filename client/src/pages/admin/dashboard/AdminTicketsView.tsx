import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  Ticket,
  FilterX,
  Building2,
} from 'lucide-react';
import {
  SupportTicketItem,
  SupportMessageItem,
  adminService,
} from '../../../services/admin.service';

export interface AdminTicketsViewProps {
  tickets: SupportTicketItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onTicketsUpdated?: (updated: SupportTicketItem[]) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
  onOpenTicket?: (ticket: SupportTicketItem) => Promise<void> | void;
  activeTicket?: (SupportTicketItem & { messages: SupportMessageItem[] }) | null;
  setActiveTicket?: (ticket: (SupportTicketItem & { messages: SupportMessageItem[] }) | null) => void;
  replyText?: string;
  setReplyText?: (val: string) => void;
  actionLoading?: boolean;
  handleSendTicketReply?: (markResolved: boolean) => Promise<void>;
  renderModal?: boolean;
}

// Format Category Enums into clean human-readable labels
export const formatTicketCategory = (category: string | null | undefined): string => {
  if (!category) return 'General';
  const categoryMap: Record<string, string> = {
    CLUB_QUERY: 'Club Query',
    WEBSITE_BUG: 'Website Bug',
    ACCESS_RECOVERY: 'Access Recovery',
    EVENT_INQUIRY: 'Event Inquiry',
    PAYMENT_ISSUE: 'Payment Issue',
    GENERAL: 'General',
  };
  return categoryMap[category] || category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Priority badge formatting and styling
export const getPriorityBadgeStyle = (priority: string | null | undefined) => {
  switch (priority?.toUpperCase()) {
    case 'URGENT':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200/80',
        dot: 'bg-red-500',
        label: 'Urgent',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
        label: 'High',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        dot: 'bg-blue-500',
        label: 'Medium',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-slate-50 text-slate-600 border-slate-200/80',
        dot: 'bg-slate-400',
        label: 'Low',
      };
  }
};

// Status badge formatting and styling
export const getStatusBadgeStyle = (status: string | null | undefined) => {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        dot: 'bg-amber-500',
        label: 'Open',
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        dot: 'bg-indigo-500',
        label: 'In Progress',
      };
    case 'RESOLVED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dot: 'bg-emerald-500',
        label: 'Resolved',
      };
    case 'CLOSED':
      return {
        bg: 'bg-slate-100 text-slate-600 border-slate-200/80',
        dot: 'bg-slate-400',
        label: 'Closed',
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-600 border-slate-200/80',
        dot: 'bg-slate-400',
        label: status || 'Unknown',
      };
  }
};

// Sensible creator name fallback
export const getCreatorName = (createdBy?: { fullName?: string; username?: string; email?: string } | null): string => {
  if (!createdBy) return 'Unknown Student';
  return createdBy.fullName?.trim() || createdBy.username || createdBy.email || 'Unknown';
};

const STATUS_FILTERS = [
  { id: 'ALL', label: 'ALL' },
  { id: 'OPEN', label: 'OPEN' },
  { id: 'IN_PROGRESS', label: 'IN PROGRESS' },
  { id: 'RESOLVED', label: 'RESOLVED' },
  { id: 'CLOSED', label: 'CLOSED' },
] as const;

export const AdminTicketsView: React.FC<AdminTicketsViewProps> = ({
  tickets,
  isLoading,
  onRefresh,
  onTicketsUpdated,
  showToast,
  onOpenTicket,
  activeTicket: externalActiveTicket,
  setActiveTicket: externalSetActiveTicket,
  replyText: externalReplyText,
  setReplyText: externalSetReplyText,
  actionLoading: externalActionLoading,
  handleSendTicketReply: externalHandleSendReply,
  renderModal = true,
}) => {
  // Local state for filters and search
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Fallback internal modal state if not passed from parent
  const [internalActiveTicket, setInternalActiveTicket] = useState<(SupportTicketItem & { messages: SupportMessageItem[] }) | null>(null);
  const [internalReplyText, setInternalReplyText] = useState<string>('');
  const [internalActionLoading, setInternalActionLoading] = useState<boolean>(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const activeTicket = externalActiveTicket !== undefined ? externalActiveTicket : internalActiveTicket;
  const setActiveTicket = externalSetActiveTicket || setInternalActiveTicket;
  const replyText = externalReplyText !== undefined ? externalReplyText : internalReplyText;
  const setReplyText = externalSetReplyText || setInternalReplyText;
  const actionLoading = externalActionLoading !== undefined ? externalActionLoading : internalActionLoading;

  // Real counts calculated from backend ticket list
  const filterCounts = useMemo(() => {
    return {
      ALL: tickets.length,
      OPEN: tickets.filter((t) => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter((t) => t.status === 'RESOLVED').length,
      CLOSED: tickets.filter((t) => t.status === 'CLOSED').length,
    };
  }, [tickets]);

  // Filtered tickets based on status and search query
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Status filter
      if (selectedStatus !== 'ALL' && ticket.status !== selectedStatus) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const numberMatch = ticket.ticketNumber?.toLowerCase().includes(query);
        const subjectMatch = ticket.subject?.toLowerCase().includes(query);
        const descMatch = ticket.description?.toLowerCase().includes(query);
        const creatorMatch = getCreatorName(ticket.createdBy).toLowerCase().includes(query);
        const clubMatch = ticket.organization?.name?.toLowerCase().includes(query);
        const categoryMatch = formatTicketCategory(ticket.category).toLowerCase().includes(query);

        return numberMatch || subjectMatch || descMatch || creatorMatch || clubMatch || categoryMatch;
      }

      return true;
    });
  }, [tickets, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // Reset to page 1 on filter or search change
  const handleFilterChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Open ticket conversation drawer / details
  const handleOpenTicketDetails = async (ticket: SupportTicketItem) => {
    if (onOpenTicket) {
      await onOpenTicket(ticket);
    } else {
      setInternalActionLoading(true);
      try {
        const details = await adminService.getTicketDetails(ticket.id);
        setActiveTicket(details);
      } catch (err: any) {
        showToast(err.message || 'Failed to load ticket conversation', 'error');
      } finally {
        setInternalActionLoading(false);
      }
    }
  };

  // Quick inline / modal status change
  const handleDirectStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingStatusId(ticketId);
    try {
      await adminService.updateTicketStatus(ticketId, newStatus);
      showToast(`Ticket status updated to ${newStatus.replace('_', ' ')}.`);

      // Refresh in-memory tickets
      if (onTicketsUpdated) {
        const updated = tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t));
        onTicketsUpdated(updated);
      } else {
        await onRefresh();
      }

      // If active modal is open, refresh it as well
      if (activeTicket && activeTicket.id === ticketId) {
        setActiveTicket({ ...activeTicket, status: newStatus });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Reply handler inside drawer
  const handleSendReply = async (markResolved: boolean) => {
    if (externalHandleSendReply) {
      await externalHandleSendReply(markResolved);
      return;
    }

    if (!activeTicket || !replyText.trim()) return;

    setInternalActionLoading(true);
    try {
      const statusToSet = markResolved ? 'RESOLVED' : 'IN_PROGRESS';
      await adminService.replyTicket(activeTicket.id, replyText, statusToSet);
      showToast(markResolved ? 'Reply sent & ticket marked as RESOLVED!' : 'Reply sent successfully.');
      setReplyText('');

      const refreshed = await adminService.getTicketDetails(activeTicket.id);
      setActiveTicket(refreshed);

      const refreshedTickets = await adminService.getTickets();
      if (onTicketsUpdated) {
        onTicketsUpdated(refreshedTickets);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setInternalActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 1. TICKET STATUS FILTER BAR ───────────────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Status buttons with real backend counts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((filter) => {
            const isSelected = selectedStatus === filter.id;
            const count = filterCounts[filter.id as keyof typeof filterCounts] || 0;

            return (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{filter.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                    isSelected ? 'bg-indigo-700/60 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search bar & Matching count */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search ticket, student, subject..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            {filteredTickets.length} ticket(s) found
          </span>
        </div>
      </div>

      {/* ── 2. PROFESSIONAL TICKET TABLE ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider select-none">
              <tr>
                <th className="py-3.5 px-4 font-bold text-slate-600">Ticket</th>
                <th className="py-3.5 px-4 font-bold text-slate-600">Subject</th>
                <th className="py-3.5 px-4 font-bold text-slate-600">Category</th>
                <th className="py-3.5 px-4 font-bold text-slate-600">Priority</th>
                <th className="py-3.5 px-4 font-bold text-slate-600">Status</th>
                <th className="py-3.5 px-4 font-bold text-slate-600">Creator</th>
                <th className="py-3.5 px-4 text-right font-bold text-slate-600">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {/* Loading Skeleton Rows */}
              {isLoading && tickets.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-48 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-5 w-20 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded-md"></div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-7 w-24 bg-slate-200 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedTickets.length > 0 ? (
                paginatedTickets.map((t) => {
                  const priorityStyle = getPriorityBadgeStyle(t.priority);
                  const statusStyle = getStatusBadgeStyle(t.status);
                  const creatorName = getCreatorName(t.createdBy);
                  const formattedTicketNo = t.ticketNumber?.startsWith('#') ? t.ticketNumber : `#${t.ticketNumber}`;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-default"
                    >
                      {/* 1. TICKET */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs whitespace-nowrap">
                        <span className="bg-indigo-50/60 px-2 py-0.5 rounded-md border border-indigo-100/80">
                          {formattedTicketNo}
                        </span>
                      </td>

                      {/* 2. SUBJECT */}
                      <td className="py-3.5 px-4 max-w-xs md:max-w-sm lg:max-w-md">
                        <div
                          className="font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer transition-colors"
                          title={t.subject}
                          onClick={() => handleOpenTicketDetails(t)}
                        >
                          {t.subject}
                        </div>
                        {t.organization?.name && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 truncate">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{t.organization.name}</span>
                          </div>
                        )}
                      </td>

                      {/* 3. CATEGORY */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                          {formatTicketCategory(t.category)}
                        </span>
                      </td>

                      {/* 4. PRIORITY */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${priorityStyle.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                          <span>{t.priority}</span>
                        </span>
                      </td>

                      {/* 5. STATUS */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${statusStyle.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          <span>{statusStyle.label}</span>
                        </span>
                      </td>

                      {/* 6. CREATOR */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden">
                            {t.createdBy?.avatarUrl ? (
                              <img
                                src={t.createdBy.avatarUrl}
                                alt={creatorName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              creatorName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-slate-700 font-semibold truncate max-w-[140px]" title={creatorName}>
                            {creatorName}
                          </span>
                        </div>
                      </td>

                      {/* 7. ACTION */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenTicketDetails(t)}
                          disabled={actionLoading || updatingStatusId === t.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200/60 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Resolve / Reply</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
        </div>

        {/* ── 3. EMPTY STATES ───────────────────────────────────────── */}
        {!isLoading && filteredTickets.length === 0 && (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center">
            {tickets.length === 0 ? (
              <>
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100 shadow-xs">
                  <Ticket className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">No support tickets found</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  There are currently no tickets logged in the system. Student and organization inquiries will appear here as they arrive.
                </p>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Tickets</span>
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                  <FilterX className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">No matching tickets</h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  No tickets matched status{' '}
                  <span className="font-bold text-slate-700">"{selectedStatus.replace('_', ' ')}"</span>
                  {searchQuery && (
                    <>
                      {' '}
                      or query <span className="font-bold text-slate-700">"{searchQuery}"</span>
                    </>
                  )}
                  .
                </p>
                <button
                  onClick={() => {
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer border border-indigo-200/60"
                >
                  Reset Status & Search
                </button>
              </>
            )}
          </div>
        )}

        {/* ── 4. PAGINATION FOOTER ──────────────────────────────────── */}
        {filteredTickets.length > 0 && (
          <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>
                Showing{' '}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, filteredTickets.length)}
                </span>{' '}
                to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredTickets.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{filteredTickets.length}</span> tickets
              </span>

              {filteredTickets.length > 10 && (
                <div className="ml-3 hidden sm:flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  // Only show current, first, last, and immediate siblings if totalPages is large
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - currentPage) > 1
                  ) {
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return <span key={`ellipsis-${pageNum}`} className="px-1 text-slate-400">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-7 h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 5. TICKET CONVERSATION & RESOLUTION MODAL ──────────────── */}
      {renderModal !== false && activeTicket && (
        <AdminTicketDetailModal
          activeTicket={activeTicket}
          onClose={() => setActiveTicket(null)}
          replyText={replyText}
          setReplyText={setReplyText}
          actionLoading={actionLoading}
          onSendReply={handleSendReply}
          onDirectStatusChange={handleDirectStatusChange}
          updatingStatusId={updatingStatusId}
        />
      )}
    </div>
  );
};

export interface AdminTicketDetailModalProps {
  activeTicket: (SupportTicketItem & { messages: SupportMessageItem[] }) | null;
  onClose: () => void;
  replyText: string;
  setReplyText: (val: string) => void;
  actionLoading: boolean;
  onSendReply: (markResolved: boolean) => Promise<void>;
  onDirectStatusChange?: (ticketId: string, status: string) => Promise<void>;
  updatingStatusId?: string | null;
}

export const AdminTicketDetailModal: React.FC<AdminTicketDetailModalProps> = ({
  activeTicket,
  onClose,
  replyText,
  setReplyText,
  actionLoading,
  onSendReply,
  onDirectStatusChange,
  updatingStatusId,
}) => {
  if (!activeTicket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                {activeTicket.ticketNumber?.startsWith('#') ? activeTicket.ticketNumber : `#${activeTicket.ticketNumber}`}
              </span>
              {/* Status badge */}
              {(() => {
                const st = getStatusBadgeStyle(activeTicket.status);
                return (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${st.bg}`}>
                    {st.label}
                  </span>
                );
              })()}
              {/* Priority badge */}
              {(() => {
                const pr = getPriorityBadgeStyle(activeTicket.priority);
                return (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pr.bg}`}>
                    {activeTicket.priority}
                  </span>
                );
              })()}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                {formatTicketCategory(activeTicket.category)}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 leading-snug">{activeTicket.subject}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Opened by <span className="font-semibold text-slate-700">{getCreatorName(activeTicket.createdBy)}</span>
              {activeTicket.organization?.name && ` • ${activeTicket.organization.name}`}
              {activeTicket.createdAt && ` • ${new Date(activeTicket.createdAt).toLocaleDateString()}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 cursor-pointer transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {/* Original Issue Description */}
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Original Issue Description
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {activeTicket.description || 'No detailed description provided.'}
            </p>
          </div>

          {/* Messages Thread */}
          {activeTicket.messages && activeTicket.messages.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                Conversation Timeline ({activeTicket.messages.length} message{activeTicket.messages.length === 1 ? '' : 's'})
              </div>

              {activeTicket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.isAdminReply
                      ? 'ml-auto bg-indigo-600 text-white shadow-xs'
                      : 'mr-auto bg-white border border-slate-200 text-slate-800 shadow-2xs'
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold mb-1 flex items-center justify-between gap-3 ${
                      msg.isAdminReply ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    <span>
                      {msg.sender.fullName || msg.sender.username}{' '}
                      {msg.isAdminReply && '• System Admin'}
                    </span>
                    {msg.createdAt && (
                      <span className="text-[9px] opacity-80">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 text-xs italic">
              No replies in this thread yet. Send a response below.
            </div>
          )}
        </div>

        {/* Modal Footer / Reply & Quick Actions */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          {/* Quick Status Bar */}
          {onDirectStatusChange && (
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500">Quick Change Status:</span>
              <div className="flex items-center gap-1.5">
                {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={activeTicket.status === st || updatingStatusId === activeTicket.id}
                    onClick={() => onDirectStatusChange(activeTicket.id, st)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      activeTicket.status === st
                        ? 'bg-slate-900 text-white cursor-default'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    } disabled:opacity-60`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type resolution message or response to the student..."
            className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />

          {/* Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSendReply(false)}
              disabled={actionLoading || !replyText.trim()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-slate-500" />
              <span>Send Reply (Keep Open)</span>
            </button>

            <button
              type="button"
              onClick={() => onSendReply(true)}
              disabled={actionLoading || !replyText.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Send & Mark Resolved</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsView;

