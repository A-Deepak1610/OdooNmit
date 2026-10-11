import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  History,
  CreditCard,
} from 'lucide-react';
import {
  PaymentTransactionRecord,
  FinancialAuditLogItem,
} from '../../../data/mockTreasurerData';

interface TreasurerAuditTabProps {
  paymentRecords: PaymentTransactionRecord[];
  auditLogs: FinancialAuditLogItem[];
}

export const TreasurerAuditTab: React.FC<TreasurerAuditTabProps> = ({
  paymentRecords,
  auditLogs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'PAYMENTS' | 'AUDIT_TRAIL'>('PAYMENTS');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return paymentRecords.filter((rec) => {
      if (paymentTypeFilter !== 'ALL' && rec.type !== paymentTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = rec.id.toLowerCase().includes(q);
        const matchesParty = rec.partyName.toLowerCase().includes(q);
        const matchesCategory = rec.sourceCategory.toLowerCase().includes(q);
        const matchesRef = rec.referenceId.toLowerCase().includes(q);
        const matchesHash = rec.verifiedHash.toLowerCase().includes(q);
        if (!matchesId && !matchesParty && !matchesCategory && !matchesRef && !matchesHash) {
          return false;
        }
      }
      return true;
    });
  }, [paymentRecords, paymentTypeFilter, searchQuery]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesActor = log.actor.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesRef = log.referenceId.toLowerCase().includes(q);
        const matchesHash = log.verificationHash.toLowerCase().includes(q);
        if (!matchesAction && !matchesActor && !matchesDetails && !matchesRef && !matchesHash) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, searchQuery]);

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  const handleExportPaymentsCSV = () => {
    const headers = ['Transaction ID', 'Timestamp', 'Type', 'Category', 'Party Name', 'Party Details', 'Amount (INR)', 'Method', 'Reference ID', 'Status', 'Verified Hash'];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.timestamp,
      p.type,
      `"${p.sourceCategory}"`,
      `"${p.partyName}"`,
      `"${p.partyDetails}"`,
      p.amount,
      p.method,
      p.referenceId,
      p.status,
      p.verifiedHash,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Treasury_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAuditLogsJSON = () => {
    const jsonString = JSON.stringify(filteredAuditLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Treasury_Audit_Trail_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Action Toolbar ──────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Cryptographic Ledger & Audit Records
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {activeSubTab === 'PAYMENTS' ? (
            <button
              onClick={handleExportPaymentsCSV}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Payments CSV</span>
            </button>
          ) : (
            <button
              onClick={handleExportAuditLogsJSON}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Toggle Sub-Tab Pills ───────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => {
            setActiveSubTab('PAYMENTS');
            setSearchQuery('');
          }}
          className={`pb-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'PAYMENTS'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment Records ({paymentRecords.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('AUDIT_TRAIL');
            setSearchQuery('');
          }}
          className={`pb-2 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'AUDIT_TRAIL'
              ? 'text-slate-900 border-b-2 border-slate-900'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Financial Audit History ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── 3. Filters & Search Bar ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {activeSubTab === 'PAYMENTS' ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPaymentTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                paymentTypeFilter === 'ALL'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              All Payments
            </button>
            <button
              onClick={() => setPaymentTypeFilter('INFLOW')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                paymentTypeFilter === 'INFLOW'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Inflows (Receipts)</span>
            </button>
            <button
              onClick={() => setPaymentTypeFilter('OUTFLOW')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                paymentTypeFilter === 'OUTFLOW'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Outflows (Disbursements)</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Immutable Cryptographic Event Sequence</span>
          </div>
        )}

        <div className="relative md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'PAYMENTS'
                ? 'Search transactions, party, reference, hash...'
                : 'Search audit action, officer, details, hash...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-700 transition-all"
          />
        </div>
      </div>

      {/* ── 4. Main Table / Feed ─────────────────────────────────── */}
      {activeSubTab === 'PAYMENTS' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Source Category</th>
                  <th className="py-3 px-4">Party / Destination</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Verification Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      No payment records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {p.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        {p.type === 'INFLOW' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ArrowUpRight className="w-3 h-3" /> Inflow
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <ArrowDownRight className="w-3 h-3" /> Outflow
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{p.sourceCategory}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{p.partyName}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                          {p.partyDetails}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-700 font-mono text-[11px]">{p.method}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.referenceId}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            p.type === 'INFLOW' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {p.type === 'INFLOW' ? '+' : '-'}₹{p.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => copyToClipboard(p.verifiedHash)}
                          title="Click to copy cryptographic hash"
                          className="font-mono text-[10px] text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>{p.verifiedHash.slice(0, 18)}...</span>
                          {copiedHash === p.verifiedHash && (
                            <span className="text-emerald-600 font-bold font-sans text-[10px]">Copied!</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Financial Audit Trail View */
        <div className="space-y-3">
          {filteredAuditLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              No audit records matching your search query.
            </div>
          ) : (
            filteredAuditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4.5 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white font-mono">
                        {log.action}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{log.actor}</span>
                      <span className="text-xs text-slate-400 font-mono">• {log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <span>Ref: <strong className="text-slate-600 font-mono">{log.referenceId}</strong></span>
                      {log.amount && (
                        <span>
                          Amount: <strong className="text-slate-900 font-mono">₹{log.amount.toLocaleString()}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <button
                    onClick={() => copyToClipboard(log.verificationHash)}
                    className="font-mono text-[10px] text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Click to copy hash"
                  >
                    <span>{log.verificationHash.slice(0, 20)}...</span>
                    {copiedHash === log.verificationHash && (
                      <span className="text-emerald-600 font-bold font-sans text-[10px]">Copied!</span>
                    )}
                  </button>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1 sm:justify-end">
                    <CheckCircle2 className="w-3 h-3" /> Integrity Verified
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
