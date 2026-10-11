import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  Send,
  X,
  MessageSquare,
  ShieldCheck,
  User,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Bug,
  CreditCard,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import {
  supportService,
  SupportTicketItem,
  SupportMessageItem,
  CreateTicketPayload,
} from '../../../services/support.service';
import { studentService, StudentClubItem } from '../../../services/student.service';
import { ROLES } from '../../../config/roles';

export const formatCategory = (category: string) => {
  switch (category) {
    case 'CLUB_QUERY':
      return 'Club Query';
    case 'WEBSITE_BUG':
      return 'Platform Bug';
    case 'PAYMENT_ISSUE':
      return 'Payment & Dues';
    case 'EVENT_INQUIRY':
      return 'Event Inquiry';
    case 'ACCESS_RECOVERY':
      return 'Account Access';
    case 'GENERAL':
    default:
      return 'General Support';
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'CLUB_QUERY':
      return Building2;
    case 'WEBSITE_BUG':
      return Bug;
    case 'PAYMENT_ISSUE':
      return CreditCard;
    case 'EVENT_INQUIRY':
      return Calendar;
    case 'ACCESS_RECOVERY':
      return Lock;
    default:
      return HelpCircle;
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return {
        bg: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        label: 'Urgent',
      };
    case 'HIGH':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'High',
      };
    case 'MEDIUM':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: 'Medium',
      };
    case 'LOW':
    default:
      return {
        bg: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Low',
      };
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'OPEN':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Open',
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: 'In Progress',
      };
    case 'RESOLVED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Resolved',
      };
    case 'CLOSED':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-500',
        label: 'Closed',
      };
  }
};

export const SupportHelpDeskModule: React.FC = () => {
  const { user, role } = useAuthStore();
  const isAdmin = role === ROLES.ADMIN;
  const isPresident = role === ROLES.PRESIDENT;

  // State
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [clubs, setClubs] = useState<StudentClubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MY_QUERIES' | 'CLUB_QUERIES'>(
    isPresident ? 'CLUB_QUERIES' : 'MY_QUERIES'
  );

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [activeMessages, setActiveMessages] = useState<SupportMessageItem[]>([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New ticket form
  const [form, setForm] = useState<CreateTicketPayload>({
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    organizationId: null,
  });

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ticketsData, clubsData] = await Promise.all([
        supportService.getTickets(),
        studentService.getClubs().catch(() => []),
      ]);
      setTickets(ticketsData);
      setClubs(clubsData);
    } catch (err: any) {
      showToast(err.message || 'Failed to sync support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openTicketThread = async (ticket: SupportTicketItem) => {
    try {
      const fullTicket = await supportService.getTicketDetails(ticket.id);
      setSelectedTicket(fullTicket);
      setActiveMessages(fullTicket.messages || []);
      setReplyText('');
    } catch (err: any) {
      showToast(err.message || 'Failed to open ticket thread');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      showToast('Please provide both subject and description.');
      return;
    }

    setSubmitting(true);
    try {
      const newTicket = await supportService.createTicket({
        ...form,
        organizationId: form.organizationId ? form.organizationId : null,
      });
      setTickets((prev) => [newTicket, ...prev]);
      setCreateModalOpen(false);
      setForm({
        subject: '',
        description: '',
        category: 'GENERAL',
        priority: 'MEDIUM',
        organizationId: null,
      });
      showToast(
        `Ticket #${newTicket.ticketNumber} submitted! Dispatched to Super Admin ${
          newTicket.organizationId ? 'and Club Leadership' : ''
        }.`
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (markResolved = false) => {
    if (!selectedTicket || !replyText.trim()) return;

    setReplyLoading(true);
    try {
      const newMsg = await supportService.replyToTicket(
        selectedTicket.id,
        replyText.trim(),
        markResolved ? 'RESOLVED' : undefined
      );

      setActiveMessages((prev) => [...prev, newMsg]);
      setReplyText('');

      // Refresh ticket list in background
      const refreshedTickets = await supportService.getTickets();
      setTickets(refreshedTickets);

      if (markResolved) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: 'RESOLVED' } : null));
        showToast('Reply dispatched and ticket marked Resolved.');
      } else {
        if (selectedTicket.status === 'OPEN' && (isAdmin || isPresident)) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: 'IN_PROGRESS' } : null));
        }
        showToast('Reply sent successfully.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    try {
      await supportService.updateTicketStatus(selectedTicket.id, newStatus);
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus as any } : t))
      );
      showToast(`Status updated to ${newStatus}.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
    }
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Role tab filtering for president
      if (isPresident) {
        if (activeTab === 'CLUB_QUERIES') {
          // Tickets that belong to a club (routed to president)
          if (!t.organizationId) return false;
        } else {
          // My own queries
          if (t.createdById !== user?.id) return false;
        }
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.organization?.name && t.organization.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Status match
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      // Category match
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;

      return true;
    });
  }, [tickets, isPresident, activeTab, user?.id, search, statusFilter, categoryFilter]);

  // Metrics
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'OPEN').length,
      inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    };
  }, [tickets]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Sparkles style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER SECTION ──────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Campus Helpdesk & Unified Query Desk
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                Reflected to Super Admin & Club Leaders
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Support, Bug Reports & Inquiries
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
              Post platform-related questions, bugs, payment inquiries, or club-specific requests. Queries tied to a
              club are immediately visible to both Super Admin and the Club President.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={loadData}
              title="Refresh tickets"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '10px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              <span>Sync</span>
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              <span>Submit New Query</span>
            </button>
          </div>
        </div>

        {/* ── METRICS PILLS ──────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Queries
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc' }}>{stats.total}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>
              Awaiting Action (Open)
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>{stats.open}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#818cf8', textTransform: 'uppercase', fontWeight: 600 }}>
              In Progress
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#818cf8' }}>{stats.inProgress}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>
              Resolved Queries
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#34d399' }}>{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* ── 2. ROLE TABS (FOR CLUB PRESIDENT) ─────────────────────────────────── */}
      {isPresident && (
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('CLUB_QUERIES')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'CLUB_QUERIES' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'CLUB_QUERIES' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            Club Member Inquiries & Queries
          </button>
          <button
            onClick={() => setActiveTab('MY_QUERIES')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'MY_QUERIES' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'MY_QUERIES' ? '#ffffff' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            My Submitted Platform Queries
          </button>
        </div>
      )}

      {/* ── 3. CONTROLS: SEARCH & FILTERS ──────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            flex: 1,
            minWidth: '240px',
          }}
        >
          <Search style={{ width: '16px', height: '16px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by ticket #, subject, club name, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: '#1e293b',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="CLUB_QUERY">Club Query</option>
            <option value="WEBSITE_BUG">Platform Bug</option>
            <option value="PAYMENT_ISSUE">Payment & Dues</option>
            <option value="EVENT_INQUIRY">Event Inquiry</option>
            <option value="ACCESS_RECOVERY">Account Access</option>
            <option value="GENERAL">General Support</option>
          </select>
        </div>
      </div>

      {/* ── 4. TICKETS LIST / FEED ─────────────────────────────────────────── */}
      {isLoading ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
            color: '#64748b',
          }}
        >
          <RefreshCw style={{ width: '28px', height: '28px', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Syncing campus support inquiries...</div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '50px 20px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#2563eb',
            }}
          >
            <HelpCircle style={{ width: '28px', height: '28px' }} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            No Support Queries Found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px' }}>
            {search || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'No tickets match the selected filters. Try clearing filters or search terms.'
              : 'You have not submitted any queries yet. If you have questions about clubs, events, dues, or platform issues, submit a query!'}
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Submit First Query
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {filteredTickets.map((ticket) => {
            const priorityBadge = getPriorityBadge(ticket.priority);
            const statusBadge = getStatusBadge(ticket.status);
            const CategoryIcon = getCategoryIcon(ticket.category);

            return (
              <div
                key={ticket.id}
                onClick={() => openTicketThread(ticket)}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '18px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#93c5fd';
                  e.currentTarget.style.boxShadow = '0 6px 20px -6px rgba(37, 99, 235, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: '280px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#475569',
                    }}
                  >
                    <CategoryIcon style={{ width: '20px', height: '20px' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2563eb',
                          background: '#eff6ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        #{ticket.ticketNumber}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569',
                        }}
                      >
                        {formatCategory(ticket.category)}
                      </span>
                      {ticket.organization && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#15803d',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Building2 style={{ width: '11px', height: '11px' }} />
                          {ticket.organization.name}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                      {ticket.subject}
                    </h4>

                    <p
                      style={{
                        fontSize: '13px',
                        color: '#64748b',
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {ticket.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User style={{ width: '12px', height: '12px' }} />
                        {ticket.createdBy?.fullName || 'User'}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontWeight: 600 }}>
                        <MessageSquare style={{ width: '12px', height: '12px' }} />
                        {ticket._count?.messages || 1} messages
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Priority Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityBadge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                    {priorityBadge.label}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                    {statusBadge.label}
                  </span>

                  <ChevronRight style={{ width: '18px', height: '18px', color: '#94a3b8' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. MODAL: SUBMIT NEW QUERY ───────────────────────────────────────── */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#eff6ff',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Create Support Ticket
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  Submit Query or Bug Report
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Query Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  <option value="GENERAL">General Platform Question / Help</option>
                  <option value="CLUB_QUERY">Club Inquiry (Direct to Club President & Admin)</option>
                  <option value="WEBSITE_BUG">Platform Bug / Glitch / Technical Issue</option>
                  <option value="PAYMENT_ISSUE">Membership Dues / Ticket Payment</option>
                  <option value="EVENT_INQUIRY">Event Logistics & QR Check-in</option>
                  <option value="ACCESS_RECOVERY">Account Role / Access Permission</option>
                </select>
              </div>

              {/* Club Selector (Important for routing!) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Related Club / Organization {form.category === 'CLUB_QUERY' ? '*' : '(Optional)'}
                </label>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 6px 0' }}>
                  If selected, this query will be immediately reflected to that club's President and Super Admin.
                </p>
                <select
                  value={form.organizationId || ''}
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value || null })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                >
                  <option value="">General Platform (No specific club)</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.category ? `(${c.category})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Priority Level *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => {
                    const isSel = form.priority === p;
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setForm({ ...form, priority: p })}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isSel ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSel ? '#eff6ff' : '#f8fafc',
                          color: isSel ? '#1d4ed8' : '#64748b',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Subject / Short Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Membership dues paid via UPI but badge not unlocked"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Query Description & Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Please describe what happened, steps to reproduce, transaction references, or specific assistance needed..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: '#1e3a8a',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#ffffff',
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. MODAL: TICKET DETAIL & THREAD ─────────────────────────────────── */}
      {selectedTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#2563eb',
                      background: '#eff6ff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    #{selectedTicket.ticketNumber}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedTicket.status).bg}`}
                  >
                    {getStatusBadge(selectedTicket.status).label}
                  </span>
                  {selectedTicket.organization && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#15803d',
                        background: '#f0fdf4',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {selectedTicket.organization.name}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                  {selectedTicket.subject}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Submitted by <strong>{selectedTicket.createdBy?.fullName}</strong> on{' '}
                  {new Date(selectedTicket.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Modal Body / Conversation Feed */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: '#fafafa',
              }}
            >
              {/* Original ticket description */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedTicket.createdBy?.fullName} (Initial Inquiry)
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {new Date(selectedTicket.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#334155', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {selectedTicket.description}
                </p>
              </div>

              {/* Thread messages */}
              {activeMessages
                .filter((m) => m.message !== selectedTicket.description) // avoid duplicate if first message was description
                .map((msg) => {
                  const isLeaderOrAdmin = msg.isAdminReply;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        background: isLeaderOrAdmin ? '#eff6ff' : '#ffffff',
                        border: isLeaderOrAdmin ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        marginLeft: isLeaderOrAdmin ? '24px' : '0',
                        marginRight: isLeaderOrAdmin ? '0' : '24px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: isLeaderOrAdmin ? '#1e40af' : '#0f172a' }}>
                            {msg.sender?.fullName || 'User'}
                          </span>
                          {isLeaderOrAdmin && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                background: '#1d4ed8',
                                color: '#fff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <ShieldCheck style={{ width: '10px', height: '10px' }} />
                              Leadership / Admin
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#334155', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer: Reply Bar & Actions */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED' ? (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                    This query has been marked {selectedTicket.status}.
                  </span>
                  <button
                    onClick={() => handleUpdateStatus('OPEN')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reopen Query
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                      rows={2}
                      placeholder="Type your response or follow-up note..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        resize: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleSendReply(false)}
                      disabled={replyLoading || !replyText.trim()}
                      style={{
                        background: '#1e3a8a',
                        color: '#fff',
                        border: 'none',
                        padding: '0 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: replyLoading || !replyText.trim() ? 0.6 : 1,
                      }}
                    >
                      <Send style={{ width: '14px', height: '14px' }} />
                      <span>{replyLoading ? 'Sending...' : 'Reply'}</span>
                    </button>
                  </div>

                  {/* Leadership Quick Resolve Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {(isAdmin || isPresident) && (
                      <button
                        onClick={() => handleSendReply(true)}
                        disabled={replyLoading || !replyText.trim()}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Reply & Mark Resolved
                      </button>
                    )}

                    <button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      style={{
                        marginLeft: 'auto',
                        background: 'transparent',
                        border: 'none',
                        color: '#15803d',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                      <span>Mark Resolved Directly</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
