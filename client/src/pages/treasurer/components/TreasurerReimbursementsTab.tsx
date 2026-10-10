import React, { useState, useMemo } from 'react';
import {
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  ShieldCheck,
  X,
  CreditCard,
} from 'lucide-react';
import { ReimbursementClaim, ReimbursementStatus } from '../../../data/mockTreasurerData';
import { ReceiptModal } from './ReceiptModal';

interface TreasurerReimbursementsTabProps {
  claims: ReimbursementClaim[];
  onApproveClaim: (claimId: string, reviewerNotes?: string) => void;
  onRejectClaim: (claimId: string, reason: string) => void;
  onRecordPayout: (
    claimId: string,
    payoutDetails: {
      payoutMethod: 'IMPS' | 'UPI' | 'NEFT' | 'CASH';
      transactionRef: string;
      payoutDate: string;
      accountReference: string;
    }
  ) => void;
  activeInspectClaim?: ReimbursementClaim | null;
  onClearInspectClaim?: () => void;
}

export const TreasurerReimbursementsTab: React.FC<TreasurerReimbursementsTabProps> = ({
  claims,
  onApproveClaim,
  onRejectClaim,
  onRecordPayout,
  activeInspectClaim,
  onClearInspectClaim,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected claim for receipt viewer modal
  const [viewingReceiptClaim, setViewingReceiptClaim] = useState<ReimbursementClaim | null>(
    activeInspectClaim || null
  );

  // Sync if parent passes inspection claim
  React.useEffect(() => {
    if (activeInspectClaim) {
      setViewingReceiptClaim(activeInspectClaim);
    }
  }, [activeInspectClaim]);

  // Reject Claim Modal state
  const [rejectingClaim, setRejectingClaim] = useState<ReimbursementClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Record Payout Modal state
  const [payingClaim, setPayingClaim] = useState<ReimbursementClaim | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'IMPS' | 'UPI' | 'NEFT' | 'CASH'>('IMPS');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutDate, setPayoutDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick Approve Claim Modal state
  const [approvingClaim, setApprovingClaim] = useState<ReimbursementClaim | null>(null);
  const [approvalNote, setApprovalNote] = useState('');

  // Aggregate stats
  const stats = useMemo(() => {
    const pending = claims.filter((c) => c.status === 'PENDING');
    const approved = claims.filter((c) => c.status === 'APPROVED');
    const reimbursed = claims.filter((c) => c.status === 'REIMBURSED');
    const rejected = claims.filter((c) => c.status === 'REJECTED');

    const pendingTotal = pending.reduce((s, c) => s + c.amount, 0);
    const approvedTotal = approved.reduce((s, c) => s + c.amount, 0);
    const reimbursedTotal = reimbursed.reduce((s, c) => s + c.amount, 0);

    return {
      pendingCount: pending.length,
      pendingTotal,
      approvedCount: approved.length,
      approvedTotal,
      reimbursedCount: reimbursed.length,
      reimbursedTotal,
      rejectedCount: rejected.length,
    };
  }, [claims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesName = c.volunteerName.toLowerCase().includes(q);
        const matchesProject = c.projectName.toLowerCase().includes(q);
        const matchesRoll = c.volunteerRoll.toLowerCase().includes(q);
        const matchesMerchant = c.receipt.merchantName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesName && !matchesProject && !matchesRoll && !matchesMerchant) {
          return false;
        }
      }
      return true;
    });
  }, [claims, statusFilter, searchQuery]);

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingClaim) return;
    onApproveClaim(
      approvingClaim.id,
      approvalNote.trim() || 'Verified against event requisition by Treasurer Office.'
    );
    setApprovingClaim(null);
    setApprovalNote('');
  };

  const handleConfirmRejection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingClaim) return;
    if (!rejectionReason.trim()) {
      alert('Please specify an audit reason for rejecting this reimbursement claim.');
      return;
    }
    onRejectClaim(rejectingClaim.id, rejectionReason.trim());
    setRejectingClaim(null);
    setRejectionReason('');
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingClaim) return;
    const generatedRef = payoutRef.trim() || `${payoutMethod}-${Math.floor(100000 + Math.random() * 900000)}`;

    onRecordPayout(payingClaim.id, {
      payoutMethod,
      transactionRef: generatedRef,
      payoutDate,
      accountReference: payoutAccount.trim() || 'Beneficiary Primary Verified VPA/Account',
    });

    setPayingClaim(null);
    setPayoutRef('');
    setPayoutAccount('');
  };

  const getStatusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case 'REIMBURSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3 h-3 text-slate-500" /> Settled / Reimbursed
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3 h-3 text-slate-500" /> Approved (Payout Ready)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" /> Claim Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" /> Pending Audit
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Metric Highlight Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Review */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'PENDING'
              ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Audit</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats.pendingCount} <span className="text-xs font-normal text-slate-500">Claims</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">₹{stats.pendingTotal.toLocaleString()} pending decision</p>
        </div>

        {/* Approved / Payout Ready */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'APPROVED'
              ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ready for Payout</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats.approvedCount} <span className="text-xs font-normal text-slate-500">Approved</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">₹{stats.approvedTotal.toLocaleString()} ready for bank payout</p>
        </div>

        {/* Reimbursed / Paid */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'REIMBURSED' ? 'ALL' : 'REIMBURSED')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'REIMBURSED'
              ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled Payouts</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {stats.reimbursedCount} <span className="text-xs font-normal text-slate-500">Settled</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">₹{stats.reimbursedTotal.toLocaleString()} disbursed via IMPS</p>
        </div>
      </div>

      {/* ── 3. Filter Tabs & Search Bar ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: `All Claims (${claims.length})` },
            { id: 'PENDING', label: `Pending (${stats.pendingCount})` },
            { id: 'APPROVED', label: `Approved (${stats.approvedCount})` },
            { id: 'REIMBURSED', label: `Paid (${stats.reimbursedCount})` },
            { id: 'REJECTED', label: `Rejected (${stats.rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by volunteer, claim, merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400 transition-all"
          />
        </div>
      </div>

      {/* ── 4. Claims List / Review Desk Cards ────────────────────── */}
      <div className="space-y-3.5">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
            No reimbursement claims match the selected criteria.
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top row: Claim Header, Volunteer, Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 font-bold text-sm">
                    {claim.volunteerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{claim.title}</h3>
                      <span className="text-xs text-slate-400 font-mono">#{claim.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-semibold text-slate-700">{claim.volunteerName}</span>
                      <span>•</span>
                      <span>{claim.volunteerDepartment} ({claim.volunteerRoll})</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-medium">{claim.projectName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-xl font-black font-mono text-slate-900">
                    ₹{claim.amount.toLocaleString()}
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </div>

              {/* Middle row: Receipt Summary Pill & Reviewer Notes */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{claim.receipt.merchantName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Inv #{claim.receipt.invoiceNumber} • {claim.receipt.invoiceDate}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {claim.receipt.items.length} item(s): {claim.receipt.items.map((i) => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setViewingReceiptClaim(claim)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors flex items-center gap-1.5 shrink-0 self-start md:self-auto cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect Receipt</span>
                </button>
              </div>

              {/* Notes Banner if reviewed/paid/rejected */}
              {claim.reviewerNotes && (
                <div className="text-xs text-slate-600 bg-blue-50/50 border border-blue-100 rounded-lg p-2.5">
                  <span className="font-bold text-blue-900">Auditor Note: </span>
                  {claim.reviewerNotes}
                  {claim.reviewedBy && (
                    <span className="text-slate-400 ml-1">({claim.reviewedBy})</span>
                  )}
                </div>
              )}

              {claim.rejectionReason && (
                <div className="text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                  <span className="font-bold text-rose-900">Rejection Audit Reason: </span>
                  {claim.rejectionReason}
                </div>
              )}

              {claim.payoutDetails && (
                <div className="text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-bold">Disbursement Record: </span>
                    <span>
                      Paid via {claim.payoutDetails.payoutMethod} Ref #{claim.payoutDetails.transactionRef} on{' '}
                      {claim.payoutDetails.payoutDate}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 font-semibold">
                    {claim.payoutDetails.accountReference}
                  </span>
                </div>
              )}

              {/* Bottom row: Action Buttons based on status */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
                <div className="text-[11px] text-slate-400">
                  Submitted on {claim.dateSubmitted} • Budget: {claim.category}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {claim.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          setRejectingClaim(claim);
                          setRejectionReason('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => {
                          setApprovingClaim(claim);
                          setApprovalNote('');
                        }}
                        className="px-4 py-1.5 rounded-xl text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Approve Claim</span>
                      </button>
                    </>
                  )}

                  {claim.status === 'APPROVED' && (
                    <button
                      onClick={() => {
                        setPayingClaim(claim);
                        setPayoutRef(`IMPS-${Date.now().toString().slice(-6)}`);
                        setPayoutAccount(`Beneficiary Bank Acc of ${claim.volunteerName}`);
                      }}
                      className="px-4 py-1.5 rounded-xl text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Record Bank Payout (₹{claim.amount.toLocaleString()})</span>
                    </button>
                  )}

                  {claim.status === 'REIMBURSED' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Payout Cleared
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── 5. Receipt Viewer Modal ──────────────────────────────── */}
      <ReceiptModal
        isOpen={Boolean(viewingReceiptClaim)}
        onClose={() => {
          setViewingReceiptClaim(null);
          if (onClearInspectClaim) onClearInspectClaim();
        }}
        receipt={viewingReceiptClaim ? viewingReceiptClaim.receipt : null}
        claimTitle={viewingReceiptClaim ? viewingReceiptClaim.title : undefined}
        volunteerName={viewingReceiptClaim ? viewingReceiptClaim.volunteerName : undefined}
      />

      {/* ── 6. Approve Claim Modal ───────────────────────────────── */}
      {approvingClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Approve Reimbursement</h3>
                  <p className="text-xs text-slate-500">Claim #{approvingClaim.id}</p>
                </div>
              </div>
              <button
                onClick={() => setApprovingClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmApproval} className="p-6 space-y-4">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-blue-900">{approvingClaim.title}</div>
                <div className="text-blue-700">Claimant: {approvingClaim.volunteerName}</div>
                <div className="text-sm font-black text-blue-950 font-mono mt-1">
                  ₹{approvingClaim.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Auditor Verification Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Verified against event requisition and itemized invoice. Authorized for batch bank disbursement."
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovingClaim(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. Reject Claim Modal ────────────────────────────────── */}
      {rejectingClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reject Reimbursement Claim</h3>
                  <p className="text-xs text-slate-500">Claim #{rejectingClaim.id}</p>
                </div>
              </div>
              <button
                onClick={() => setRejectingClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRejection} className="p-6 space-y-4">
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-rose-900">{rejectingClaim.title}</div>
                <div className="text-rose-700">Claimant: {rejectingClaim.volunteerName}</div>
                <div className="text-sm font-black text-rose-950 font-mono mt-1">
                  ₹{rejectingClaim.amount.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Missing valid GST tax invoice, or non-eligible expense under club travel policy."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectingClaim(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. Record Payout Modal ───────────────────────────────── */}
      {payingClaim && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Bank Payout & Disburse</h3>
                  <p className="text-xs text-slate-500">Claim #{payingClaim.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPayingClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-emerald-950">{payingClaim.title}</div>
                <div className="text-emerald-800">Beneficiary: {payingClaim.volunteerName}</div>
                <div className="text-lg font-black text-emerald-900 font-mono mt-1">
                  Disbursing: ₹{payingClaim.amount.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payout Method *</label>
                  <select
                    value={payoutMethod}
                    onChange={(e) => setPayoutMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 font-semibold cursor-pointer"
                  >
                    <option value="IMPS">IMPS Bank Transfer</option>
                    <option value="UPI">UPI Direct VPA</option>
                    <option value="NEFT">NEFT Settlement</option>
                    <option value="CASH">Petty Cash Handover</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disbursement Date *</label>
                  <input
                    type="date"
                    required
                    value={payoutDate}
                    onChange={(e) => setPayoutDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Reference / UTR / Transaction No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IMPS-9382104829"
                  value={payoutRef}
                  onChange={(e) => setPayoutRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Account / UPI VPA Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank ending in **4821"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingClaim(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Payout & Deduct Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
