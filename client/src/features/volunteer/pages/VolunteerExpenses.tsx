import React, { useState } from 'react';
import { useVolunteerExpenses } from '../hooks/useVolunteerExpenses';
import { ExpenseClaimForm } from '../components/ExpenseClaimForm';
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  Wallet,
} from 'lucide-react';
import { ExpenseStatus } from '../types/volunteer.types';

export const VolunteerExpenses: React.FC = () => {
  const {
    expenses,
    loading,
    submitting,
    error,
    successMessage,
    setSuccessMessage,
    submitExpense,
    refreshExpenses,
    stats,
  } = useVolunteerExpenses();

  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED'>('ALL');

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'REIMBURSED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#dcfce7',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
            className="dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
          >
            <CheckCircle2 style={{ width: '13px', height: '13px' }} />
            <span>Paid</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
            }}
            className="dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
          >
            <CheckCircle2 style={{ width: '13px', height: '13px' }} />
            <span>Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
            }}
            className="dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
          >
            <XCircle style={{ width: '13px', height: '13px' }} />
            <span>Rejected</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fde68a',
            }}
            className="dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
          >
            <Clock style={{ width: '13px', height: '13px' }} />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── 1. Master Page Header ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              className="dark:bg-blue-950"
            >
              <Receipt style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                margin: 0,
                color: 'var(--foreground, #1e293b)',
                letterSpacing: '-0.3px',
              }}
              className="text-slate-900 dark:text-slate-100"
            >
              Volunteer Expense Claims & Reimbursements
            </h1>
          </div>
          <p
            style={{ fontSize: '14px', color: '#64748b', margin: 0 }}
            className="text-slate-500 dark:text-slate-400"
          >
            Submit out-of-pocket costs incurred during bake sales and events, track treasurer audit approvals, and monitor disbursements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={refreshExpenses}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--foreground, #334155)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <RefreshCw style={{ width: '15px', height: '15px' }} />
            <span>Refresh Ledger</span>
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>{showForm ? 'Hide Form' : 'New Expense Claim'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Stat Cards Row (3-col) ────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-amber-950"
          >
            <Clock style={{ width: '22px', height: '22px', color: '#b45309' }} className="dark:text-amber-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Pending Review
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#b45309' }} className="dark:text-amber-400">
              ₹{stats.pendingTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Awaiting treasurer receipt verification
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-blue-950"
          >
            <CheckCircle2 style={{ width: '22px', height: '22px', color: '#1e3a8a' }} className="dark:text-blue-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Approved for Payout
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e3a8a' }} className="dark:text-blue-400">
              ₹{stats.approvedTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Verified, queued for disbursement
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            className="dark:bg-emerald-950"
          >
            <Wallet style={{ width: '22px', height: '22px', color: '#15803d' }} className="dark:text-emerald-400" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
              Total Reimbursed
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }} className="dark:text-emerald-400">
              ₹{stats.reimbursedTotal.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Successfully credited to student bank
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Alerts ────────────────────────────────────────────────────── */}
      {successMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#065f46',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '12px',
            }}
            className="dark:text-emerald-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          className="dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400"
        >
          <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* ── 4. Form Drawer ──────────────────────────────────────────────── */}
      {showForm && (
        <ExpenseClaimForm
          submitting={submitting}
          onSubmit={async (data) => {
            await submitExpense(data);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── 5. Master Claim History Table ────────────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e2e8f0)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color, #f1f5f9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
          className="border-slate-100 dark:border-slate-800"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--foreground, #1e293b)',
                margin: 0,
              }}
              className="text-slate-900 dark:text-slate-100"
            >
              Reimbursement Requests
            </h2>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                background: 'var(--muted, #f1f5f9)',
                padding: '2px 8px',
                borderRadius: '12px',
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-500"
            >
              {expenses.length} total
            </span>
          </div>

          {/* Status Filter Tabs (Track: pending, approved, rejected, or paid) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL' as const, label: 'All', count: expenses.length },
              { id: 'PENDING' as const, label: 'Pending', count: expenses.filter((e) => e.status === 'PENDING').length },
              { id: 'APPROVED' as const, label: 'Approved', count: expenses.filter((e) => e.status === 'APPROVED').length },
              { id: 'REJECTED' as const, label: 'Rejected', count: expenses.filter((e) => e.status === 'REJECTED').length },
              { id: 'REIMBURSED' as const, label: 'Paid', count: expenses.filter((e) => e.status === 'REIMBURSED').length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === tab.id ? '#1e3a8a' : 'var(--muted, #f1f5f9)',
                  color: statusFilter === tab.id ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
                className={statusFilter !== tab.id ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Loader2 style={{ width: '28px', height: '28px', color: '#1e3a8a', margin: '0 auto 12px' }} className="animate-spin" />
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Loading reimbursement ledger...
            </p>
          </div>
        ) : expenses.filter((c) => statusFilter === 'ALL' || c.status === statusFilter).length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <Receipt style={{ width: '44px', height: '44px', color: '#cbd5e1', margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground, #1e293b)', margin: '0 0 6px' }}>
              No {statusFilter === 'ALL' ? 'Claims' : statusFilter} Records Found
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {statusFilter === 'ALL'
                ? 'Purchased bake sale supplies or event materials out-of-pocket? Click "New Expense Claim" above.'
                : `There are currently no reimbursement claims with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr
                  style={{
                    background: 'var(--muted, #f8fafc)',
                    borderBottom: '1px solid var(--border-color, #e2e8f0)',
                    color: '#64748b',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  className="bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800"
                >
                  <th style={{ padding: '14px 24px', fontWeight: 600 }}>Description & Project</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Receipt Reference</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '14px 24px', fontWeight: 600, textAlign: 'center' }}>Review Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses
                  .filter((c) => statusFilter === 'ALL' || c.status === statusFilter)
                  .map((claim) => (
                  <tr
                    key={claim.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, #f1f5f9)',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800"
                  >
                    <td style={{ padding: '18px 24px', maxWidth: '340px' }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--foreground, #1e293b)',
                          marginBottom: '4px',
                        }}
                        className="text-slate-900 dark:text-slate-100"
                      >
                        {claim.title}
                      </div>
                      {claim.projectName && (
                        <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 500 }} className="dark:text-blue-400">
                          📁 {claim.projectName}
                        </div>
                      )}
                      {claim.reviewerNotes && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#64748b',
                            fontStyle: 'italic',
                            marginTop: '6px',
                            background: '#f8fafc',
                            padding: '6px 10px',
                            borderRadius: '6px',
                          }}
                          className="bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300"
                        >
                          Treasurer Note: {claim.reviewerNotes}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '18px 16px', whiteSpace: 'nowrap', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar style={{ width: '14px', height: '14px', color: '#94a3b8' }} />
                        <span>{claim.date}</span>
                      </div>
                    </td>

                    <td style={{ padding: '18px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'var(--muted, #f1f5f9)',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {claim.category}
                      </span>
                    </td>

                    <td style={{ padding: '18px 16px', color: '#475569', maxWidth: '240px' }}>
                      <span style={{ fontSize: '13px' }}>{claim.receiptNote}</span>
                    </td>

                    <td
                      style={{
                        padding: '18px 16px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'var(--foreground, #1e293b)',
                      }}
                      className="text-slate-900 dark:text-slate-100"
                    >
                      ₹{claim.amount.toLocaleString()}
                    </td>

                    <td style={{ padding: '18px 24px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {getStatusBadge(claim.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
