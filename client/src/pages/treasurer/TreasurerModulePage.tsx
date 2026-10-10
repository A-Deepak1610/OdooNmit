import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  X,
  Plus,
  FileText,
} from 'lucide-react';
import {
  INITIAL_INCOME_ITEMS,
  INITIAL_EXPENSES,
  INITIAL_REIMBURSEMENTS,
  INITIAL_PAYMENT_RECORDS,
  INITIAL_AUDIT_LOGS,
  IncomeItem,
  ExpenseRecord,
  ReimbursementClaim,
  PaymentTransactionRecord,
  FinancialAuditLogItem,
} from '../../data/mockTreasurerData';
import { treasurerService } from '../../services/treasurer.service';
import { TreasurerOverviewTab } from './components/TreasurerOverviewTab';
import { TreasurerIncomeTab } from './components/TreasurerIncomeTab';
import { TreasurerExpensesTab } from './components/TreasurerExpensesTab';
import { TreasurerReimbursementsTab } from './components/TreasurerReimbursementsTab';
import { TreasurerReportsTab } from './components/TreasurerReportsTab';
import { TreasurerAuditTab } from './components/TreasurerAuditTab';
import { TreasurerDuesTab } from './components/TreasurerDuesTab';
import { TreasurerMerchandiseTab } from './components/TreasurerMerchandiseTab';
import { useClubStore } from '../../stores/club.store';

export const TreasurerModulePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ledger } = useClubStore();

  // Determine active view directly from URL route (synced with sidebar)
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/treasurer/dues')) return 'dues';
    if (path.includes('/treasurer/merchandise')) return 'merchandise';
    if (path.includes('/treasurer/income')) return 'income';
    if (path.includes('/treasurer/expenses') || path.includes('/treasurer/transactions')) return 'expenses';
    if (path.includes('/treasurer/reimbursements')) return 'reimbursements';
    if (path.includes('/treasurer/reports')) return 'reports';
    if (path.includes('/treasurer/audit')) return 'audit';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  // Global Ledger State
  const [openingBalance, setOpeningBalance] = useState<number>(ledger.openingBalance || 45000);
  const [totalIncome, setTotalIncome] = useState<number>(ledger.income.totalIncome || 155300);
  const [totalExpenses, setTotalExpenses] = useState<number>(ledger.expenses.totalExpenses || 99000);
  const [netBalance, setNetBalance] = useState<number>(
    ledger.netClosingBalance || (ledger.openingBalance || 45000) + 155300 - 99000
  );

  // Entities State
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>(INITIAL_INCOME_ITEMS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [claims, setClaims] = useState<ReimbursementClaim[]>(INITIAL_REIMBURSEMENTS);
  const [paymentRecords, setPaymentRecords] = useState<PaymentTransactionRecord[]>(INITIAL_PAYMENT_RECORDS);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLogItem[]>(INITIAL_AUDIT_LOGS);

  // Fetch live server data from TiDB database
  useEffect(() => {
    let isMounted = true;
    const fetchTreasurerData = async () => {
      try {
        const [overviewRes, incomesRes, expensesRes, claimsRes, auditRes] = await Promise.all([
          treasurerService.getOverview().catch(() => null),
          treasurerService.getIncomes().catch(() => null),
          treasurerService.getExpenses().catch(() => null),
          treasurerService.getClaims().catch(() => null),
          treasurerService.getAuditTrail().catch(() => null),
        ]);

        if (!isMounted) return;

        if (overviewRes?.ledger) {
          setOpeningBalance(overviewRes.ledger.openingBalance);
          setTotalIncome(overviewRes.ledger.totalIncome);
          setTotalExpenses(overviewRes.ledger.totalExpenses);
          setNetBalance(overviewRes.ledger.netBalance);
        }
        if (incomesRes && Array.isArray(incomesRes) && incomesRes.length > 0) {
          setIncomeItems(incomesRes);
        }
        if (expensesRes && Array.isArray(expensesRes) && expensesRes.length > 0) {
          setExpenses(expensesRes);
        }
        if (claimsRes && Array.isArray(claimsRes) && claimsRes.length > 0) {
          setClaims(claimsRes);
        }
        if (auditRes?.payments && Array.isArray(auditRes.payments) && auditRes.payments.length > 0) {
          setPaymentRecords(auditRes.payments);
        }
        if (auditRes?.auditLogs && Array.isArray(auditRes.auditLogs) && auditRes.auditLogs.length > 0) {
          setAuditLogs(auditRes.auditLogs);
        }
      } catch (err) {
        console.error('Error fetching live treasurer data:', err);
      }
    };

    fetchTreasurerData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Quick action states
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [inspectClaim, setInspectClaim] = useState<ReimbursementClaim | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Switch tab with URL update
  const handleTabChange = (tabId: string) => {
    switch (tabId) {
      case 'dues':
        navigate('/treasurer/dues');
        break;
      case 'merchandise':
        navigate('/treasurer/merchandise');
        break;
      case 'income':
        navigate('/treasurer/income');
        break;
      case 'expenses':
        navigate('/treasurer/expenses');
        break;
      case 'reimbursements':
        navigate('/treasurer/reimbursements');
        break;
      case 'reports':
        navigate('/treasurer/reports');
        break;
      case 'audit':
        navigate('/treasurer/audit');
        break;
      case 'overview':
      default:
        navigate('/treasurer/dashboard');
        break;
    }
  };

  // 1. Add Income Handler
  const handleAddIncome = async (newItem: Omit<IncomeItem, 'id' | 'status'>) => {
    try {
      const created = await treasurerService.createIncome(newItem);
      setIncomeItems((prev) => [created, ...prev]);
      setTotalIncome((prev) => prev + created.amount);
      setNetBalance((prev) => prev + created.amount);

      // Refresh payment and audit logs from server
      const auditRes = await treasurerService.getAuditTrail().catch(() => null);
      if (auditRes) {
        setPaymentRecords(auditRes.payments);
        setAuditLogs(auditRes.auditLogs);
      }

      showToast(`Income entry "${newItem.title}" (+₹${newItem.amount.toLocaleString()}) saved to database!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to save income entry', 'error');
    }
  };

  // 2. Record Expense Handler
  const handleRecordExpense = async (newExpense: Omit<ExpenseRecord, 'id'>) => {
    try {
      const created = await treasurerService.createExpense(newExpense);
      setExpenses((prev) => [created, ...prev]);
      setTotalExpenses((prev) => prev + created.amount);
      setNetBalance((prev) => prev - created.amount);

      // Refresh audit trail
      const auditRes = await treasurerService.getAuditTrail().catch(() => null);
      if (auditRes) {
        setPaymentRecords(auditRes.payments);
        setAuditLogs(auditRes.auditLogs);
      }

      showToast(`Expense "${newExpense.title}" (₹${newExpense.amount.toLocaleString()}) recorded successfully!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to save expense', 'error');
    }
  };

  // 3. Approve Claim Handler
  const handleApproveClaim = async (claimId: string, reviewerNotes?: string) => {
    try {
      const updated = await treasurerService.reviewClaim(claimId, {
        status: 'APPROVED',
        reviewerNotes,
      });
      setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));

      const auditRes = await treasurerService.getAuditTrail().catch(() => null);
      if (auditRes) {
        setAuditLogs(auditRes.auditLogs);
      }

      showToast(`Claim #${claimId} approved! Ready for payout disbursement.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to approve claim', 'error');
    }
  };

  // 4. Reject Claim Handler
  const handleRejectClaim = async (claimId: string, reason: string) => {
    try {
      const updated = await treasurerService.reviewClaim(claimId, {
        status: 'REJECTED',
        rejectionReason: reason,
      });
      setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));

      const auditRes = await treasurerService.getAuditTrail().catch(() => null);
      if (auditRes) {
        setAuditLogs(auditRes.auditLogs);
      }

      showToast(`Claim #${claimId} has been rejected with audit notice.`, 'error');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject claim', 'error');
    }
  };

  // 5. Record Payout Handler
  const handleRecordPayout = async (
    claimId: string,
    payoutDetails: {
      payoutMethod: 'IMPS' | 'UPI' | 'NEFT' | 'CASH';
      transactionRef: string;
      payoutDate: string;
      accountReference: string;
    }
  ) => {
    try {
      const updated = await treasurerService.disbursePayout(claimId, payoutDetails);
      setClaims((prev) => prev.map((c) => (c.id === claimId ? updated : c)));

      // Refresh overview, expenses and audit trail
      const [overviewRes, expensesRes, auditRes] = await Promise.all([
        treasurerService.getOverview().catch(() => null),
        treasurerService.getExpenses().catch(() => null),
        treasurerService.getAuditTrail().catch(() => null),
      ]);

      if (overviewRes?.ledger) {
        setTotalExpenses(overviewRes.ledger.totalExpenses);
        setNetBalance(overviewRes.ledger.netBalance);
      }
      if (expensesRes) setExpenses(expensesRes);
      if (auditRes) {
        setPaymentRecords(auditRes.payments);
        setAuditLogs(auditRes.auditLogs);
      }

      showToast(`Bank payout recorded and marked as disbursed!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to record payout', 'error');
    }
  };

  return (
    <div className="text-slate-800 pb-12">
      {/* ── 1. Toast Notification ──────────────────────────────────── */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-70 transition-opacity ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. Standard CampusMitra Header Bar (consistent with President & Student) ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Treasury Overview'}
              {activeTab === 'dues' && 'Dues Management'}
              {activeTab === 'merchandise' && 'Merchandise Management'}
              {activeTab === 'income' && 'Income Tracker'}
              {activeTab === 'expenses' && 'Expense Journal'}
              {activeTab === 'reimbursements' && 'Reimbursements & Receipts'}
              {activeTab === 'reports' && 'Semester Reports'}
              {activeTab === 'audit' && 'Audit & Payment History'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              CLUB TREASURER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'overview' && 'Financial command center for club finances, active reserves, voucher audits, and ledger balance'}
            {activeTab === 'dues' && 'Manage annual student club membership fees, payment statuses, collections, and outstanding balances'}
            {activeTab === 'merchandise' && 'Manage official club products, inventory variant stock, student orders, and fulfillment handovers'}
            {activeTab === 'income' && 'Monitor verified inflows from membership dues, gala ticket sales, merchandise, and fundraisers'}
            {activeTab === 'expenses' && 'Log and categorize outflows across venue bookings, catering, audio equipment, and supplies'}
            {activeTab === 'reimbursements' && 'Audit volunteer expense claims, inspect itemized tax receipts, approve and execute ledger payouts'}
            {activeTab === 'reports' && 'Generate and export official audited statements of receipts, disbursements, and closing balance'}
            {activeTab === 'audit' && 'Inspect digital transaction hashes, bank payouts, and immutable cryptographic audit logs'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {activeTab === 'overview' && (
            <>
              <button
                onClick={() => {
                  setOpenExpenseModal(true);
                  handleTabChange('expenses');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Expense</span>
              </button>
              <button
                onClick={() => handleTabChange('reports')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Semester Audit</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── 3. Active Tab Content Rendering ───────────────────────── */}
      {activeTab === 'overview' && (
        <TreasurerOverviewTab
          netBalance={netBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          openingBalance={openingBalance}
          incomeItems={incomeItems}
          expenses={expenses}
          claims={claims}
          paymentRecords={paymentRecords}
          onNavigateTab={handleTabChange}
          onOpenRecordExpense={() => {
            setOpenExpenseModal(true);
            handleTabChange('expenses');
          }}
          onOpenReviewClaim={(claim) => {
            setInspectClaim(claim);
            handleTabChange('reimbursements');
          }}
        />
      )}

      {activeTab === 'dues' && (
        <TreasurerDuesTab
          onRecordIncomeEntry={(entry) =>
            handleAddIncome({
              title: entry.title,
              categoryTag: 'Membership Dues',
              source: 'MEMBERSHIP_DUES',
              amount: entry.amount,
              date: entry.date,
              payerName: entry.payerName,
              paymentMethod: entry.paymentMethod,
              paymentId: entry.reference,
              reference: entry.payerRoll || entry.payerEmail || entry.reference,
            })
          }
        />
      )}

      {activeTab === 'merchandise' && (
        <TreasurerMerchandiseTab
          onRecordIncomeEntry={(entry) =>
            handleAddIncome({
              title: entry.title,
              categoryTag: 'Merchandise Sales',
              source: 'MERCHANDISE',
              amount: entry.amount,
              date: entry.date,
              payerName: entry.payerName,
              paymentMethod: entry.paymentMethod,
              paymentId: entry.reference,
              reference: entry.payerRoll || entry.payerEmail || entry.reference,
            })
          }
        />
      )}

      {activeTab === 'income' && (
        <TreasurerIncomeTab incomeItems={incomeItems} onAddIncome={handleAddIncome} />
      )}

      {activeTab === 'expenses' && (
        <TreasurerExpensesTab
          expenses={expenses}
          onRecordExpense={handleRecordExpense}
          openRecordModalByDefault={openExpenseModal}
          onCloseDefaultModal={() => setOpenExpenseModal(false)}
        />
      )}

      {activeTab === 'reimbursements' && (
        <TreasurerReimbursementsTab
          claims={claims}
          onApproveClaim={handleApproveClaim}
          onRejectClaim={handleRejectClaim}
          onRecordPayout={handleRecordPayout}
          activeInspectClaim={inspectClaim}
          onClearInspectClaim={() => setInspectClaim(null)}
        />
      )}

      {activeTab === 'reports' && (
        <TreasurerReportsTab
          currentLiveBalance={netBalance}
          currentLiveIncome={totalIncome}
          currentLiveExpenses={totalExpenses}
        />
      )}

      {activeTab === 'audit' && (
        <TreasurerAuditTab paymentRecords={paymentRecords} auditLogs={auditLogs} />
      )}
    </div>
  );
};

export default TreasurerModulePage;
