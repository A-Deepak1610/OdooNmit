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

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'REIMBURSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Reimbursed</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Approved</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Rejected</span>
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Expense Claims & Reimbursements
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit out-of-pocket expenses incurred for volunteer projects and track reimbursement status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshExpenses}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Hide Form' : 'New Expense Claim'}</span>
          </button>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Pending Review</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            ₹{stats.pendingTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting treasurer verification</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Approved for Payout</span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            ₹{stats.approvedTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified, queued for disbursement</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Reimbursed</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{stats.reimbursedTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully credited to account</p>
        </div>
      </div>

      {/* ── Submission Success Alert ──────────────────────────────── */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Error Alert ───────────────────────────────────────────── */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Submit Form Drawer / Section ──────────────────────────── */}
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

      {/* ── Claims Table ──────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          My Claim History ({expenses.length})
        </h2>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading expense claims...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
            <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              No Claims Submitted
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Have you made out-of-pocket purchases for club events? Click "New Expense Claim" above.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Title & Project</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Receipt / Bill Note</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((claim) => (
                    <tr
                      key={claim.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {claim.title}
                        </div>
                        {claim.projectName && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                            📁 {claim.projectName}
                          </div>
                        )}
                        {claim.reviewerNotes && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded">
                            Reviewer: {claim.reviewerNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {claim.date}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {claim.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                        {claim.receiptNote}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-slate-900 dark:text-slate-100">
                        ₹{claim.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(claim.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
