import React from 'react';
import {
  TrendingUp,
  Clock,
  ChevronRight,
  Building2,
  DollarSign,
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  IncomeItem,
  ExpenseRecord,
  ReimbursementClaim,
  PaymentTransactionRecord,
} from '../../../data/mockTreasurerData';

interface TreasurerOverviewTabProps {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  openingBalance: number;
  incomeItems: IncomeItem[];
  expenses: ExpenseRecord[];
  claims: ReimbursementClaim[];
  paymentRecords: PaymentTransactionRecord[];
  onNavigateTab: (tabId: string) => void;
  onOpenRecordExpense?: () => void;
  onOpenReviewClaim?: (claim: ReimbursementClaim) => void;
}

export const TreasurerOverviewTab: React.FC<TreasurerOverviewTabProps> = ({
  netBalance,
  totalIncome,
  totalExpenses,
  openingBalance,
  incomeItems,
  expenses,
  claims,
  paymentRecords,
  onNavigateTab,
}) => {
  const pendingClaims = claims.filter((c) => c.status === 'PENDING');
  const pendingAmount = pendingClaims.reduce((sum, c) => sum + c.amount, 0);

  // Stream calculations
  const duesIncome = incomeItems
    .filter((i) => i.source === 'MEMBERSHIP_DUES')
    .reduce((sum, i) => sum + i.amount, 0);
  const ticketsIncome = incomeItems
    .filter((i) => i.source === 'TICKET_SALES')
    .reduce((sum, i) => sum + i.amount, 0);
  const merchIncome = incomeItems
    .filter((i) => i.source === 'MERCHANDISE')
    .reduce((sum, i) => sum + i.amount, 0);
  const fundraiserIncome = incomeItems
    .filter((i) => i.source === 'FUNDRAISER')
    .reduce((sum, i) => sum + i.amount, 0);

  // Expense distribution
  const venueExpenses = expenses
    .filter((e) => e.category === 'VENUE')
    .reduce((sum, e) => sum + e.amount, 0);
  const cateringExpenses = expenses
    .filter((e) => e.category === 'CATERING')
    .reduce((sum, e) => sum + e.amount, 0);
  const merchExpenses = expenses
    .filter((e) => e.category === 'MERCHANDISE')
    .reduce((sum, e) => sum + e.amount, 0);
  const volunteerExpenses = expenses
    .filter((e) => e.category === 'LOGISTICS' || e.category === 'SUPPLIES' || e.category === 'EQUIPMENT')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* ── 1. Unified, Cohesive KPI Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Treasury Balance */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Net Closing Balance</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-mono">
            ₹{netBalance.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-[#64748B]">
            <span className="flex items-center gap-1 text-[#059669] font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Surplus Active
            </span>
            <span className="text-slate-400">Opening: ₹{openingBalance.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Inflows / Income */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Gross Inflows</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-mono">
            ₹{totalIncome.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-[#64748B]">
            <span>4 Revenue Streams</span>
            <button
              onClick={() => onNavigateTab('income')}
              className="text-[#4F46E5] hover:text-[#3730A3] font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Details <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Total Outflows / Expenses */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Disbursed Outflows</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-mono">
            ₹{totalExpenses.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-[#64748B]">
            <span>{((totalExpenses / (totalIncome || 1)) * 100).toFixed(1)}% of Inflows</span>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-[#4F46E5] hover:text-[#3730A3] font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Journal <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Pending Reimbursement Audit */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between pb-2.5">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Reimbursement Queue</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight font-mono flex items-baseline gap-2">
            <span>{pendingClaims.length}</span>
            <span className="text-xs font-medium text-[#64748B]">Claims Pending</span>
          </div>
          <div className="flex items-center justify-between mt-2.5 text-xs text-[#64748B]">
            <span>₹{pendingAmount.toLocaleString()} claim total</span>
            <button
              onClick={() => onNavigateTab('reimbursements')}
              className="text-[#4F46E5] hover:text-[#3730A3] font-medium flex items-center gap-0.5 cursor-pointer"
            >
              Audit Now <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>


      {/* ── 3. Two-Column Analytics: Income vs Expense Breakdown ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card: 4 Income Streams Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-5.5 shadow-xs space-y-4.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Income Stream Breakdown</h3>
                <p className="text-xs text-[#64748B]">Total verified inflows: ₹{totalIncome.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('income')}
              className="text-xs text-[#4F46E5] hover:text-[#3730A3] font-semibold cursor-pointer flex items-center gap-0.5"
            >
              All Streams →
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Membership Dues */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onNavigateTab('dues')}
                  className="text-slate-700 font-medium hover:text-[#4F46E5] text-left cursor-pointer flex items-center gap-1 group"
                >
                  <span>Membership Dues (194 Active Members)</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
                </button>
                <span className="font-semibold text-[#0F172A] font-mono">₹{duesIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4F46E5] rounded-full"
                  style={{ width: `${(duesIncome / (totalIncome || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((duesIncome / (totalIncome || 1)) * 100).toFixed(1)}% of revenues • Annual student dues
              </span>
            </div>

            {/* Ticket Sales */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Ticket Sales (Spring Gala Passes)</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{ticketsIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6366F1] rounded-full"
                  style={{ width: `${(ticketsIncome / (totalIncome || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((ticketsIncome / (totalIncome || 1)) * 100).toFixed(1)}% of revenues • VIP & General
              </span>
            </div>

            {/* Merchandise */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => onNavigateTab('merchandise')}
                  className="text-slate-700 font-medium hover:text-[#4F46E5] text-left cursor-pointer flex items-center gap-1 group"
                >
                  <span>Merchandise Sales (Hoodies, Polos, Mugs)</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-[#4F46E5] transition-colors" />
                </button>
                <span className="font-semibold text-[#0F172A] font-mono">₹{merchIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(merchIncome / (totalIncome || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((merchIncome / (totalIncome || 1)) * 100).toFixed(1)}% of revenues • Store orders
              </span>
            </div>

            {/* Fundraiser */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Fundraiser (Spring Charity Bake Sale)</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{fundraiserIncome.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-300 rounded-full"
                  style={{ width: `${(fundraiserIncome / (totalIncome || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((fundraiserIncome / (totalIncome || 1)) * 100).toFixed(1)}% of revenues • Plaza booth & QR
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Expense Allocations */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-5.5 shadow-xs space-y-4.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#0F172A] flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Expense Allocations</h3>
                <p className="text-xs text-[#64748B]">Total outflows: ₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-[#4F46E5] hover:text-[#3730A3] font-semibold cursor-pointer flex items-center gap-0.5"
            >
              View Journal →
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Catering */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Gala Banquet Catering</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{cateringExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-700 rounded-full"
                  style={{ width: `${(cateringExpenses / (totalExpenses || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((cateringExpenses / (totalExpenses || 1)) * 100).toFixed(1)}% of expenses • 3-course dinner
              </span>
            </div>

            {/* Venue Booking */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Grand Auditorium Venue Hire</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{venueExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${(venueExpenses / (totalExpenses || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((venueExpenses / (totalExpenses || 1)) * 100).toFixed(1)}% of expenses • University estates
              </span>
            </div>

            {/* Merchandise Production */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Apparel Batch Screenprinting</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{merchExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-500 rounded-full"
                  style={{ width: `${(merchExpenses / (totalExpenses || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((merchExpenses / (totalExpenses || 1)) * 100).toFixed(1)}% of expenses • Apex production
              </span>
            </div>

            {/* Volunteer Reimbursements */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Volunteer Expense Claims</span>
                <span className="font-semibold text-[#0F172A] font-mono">₹{volunteerExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${(volunteerExpenses / (totalExpenses || 1)) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-[#64748B]">
                {((volunteerExpenses / (totalExpenses || 1)) * 100).toFixed(1)}% of expenses • Audited claims
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Recent Financial Activity Stream ───────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4F46E5]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Recent Payment Records & Ledger Activity</h3>
          </div>
          <button
            onClick={() => onNavigateTab('audit')}
            className="text-xs text-[#4F46E5] hover:text-[#3730A3] font-semibold cursor-pointer flex items-center gap-1"
          >
            Audit Trail ({paymentRecords.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Party / Payer</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentRecords.slice(0, 5).map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                    {rec.timestamp}
                  </td>
                  <td className="py-3 px-3">
                    {rec.type === 'INFLOW' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                        <ArrowUpRight className="w-3 h-3 text-[#059669]" /> Inflow
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        <ArrowDownRight className="w-3 h-3 text-[#64748B]" /> Outflow
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#0F172A]">{rec.sourceCategory}</td>
                  <td className="py-3 px-3 text-[#64748B] max-w-[200px] truncate">{rec.partyName}</td>
                  <td className="py-3 px-3 font-mono text-[#64748B] text-[11px]">{rec.method}</td>
                  <td className="py-3 px-3 text-right font-semibold font-mono text-xs text-[#0F172A]">
                    {rec.type === 'INFLOW' ? (
                      <span className="text-[#059669]">+₹{rec.amount.toLocaleString()}</span>
                    ) : (
                      <span>-₹{rec.amount.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
