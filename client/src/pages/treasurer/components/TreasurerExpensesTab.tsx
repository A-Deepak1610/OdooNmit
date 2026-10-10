import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Receipt,
  Building,
  Utensils,
  Volume2,
  Package,
  Printer,
  Truck,
  X,
  FileText,
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategoryType } from '../../../data/mockTreasurerData';

interface TreasurerExpensesTabProps {
  expenses: ExpenseRecord[];
  onRecordExpense: (newExpense: Omit<ExpenseRecord, 'id'>) => void;
  openRecordModalByDefault?: boolean;
  onCloseDefaultModal?: () => void;
}

const CATEGORY_CONFIG: Record<
  ExpenseCategoryType,
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  VENUE: {
    label: 'Venue Booking',
    icon: Building,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  CATERING: {
    label: 'Catering & Food',
    icon: Utensils,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  EQUIPMENT: {
    label: 'Equipment & Sound',
    icon: Volume2,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  SUPPLIES: {
    label: 'Supplies & Ingredients',
    icon: Package,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  MERCHANDISE: {
    label: 'Merch Production',
    icon: Printer,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  MARKETING: {
    label: 'Printing & Marketing',
    icon: FileText,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  LOGISTICS: {
    label: 'Logistics & Travel',
    icon: Truck,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  OTHER: {
    label: 'Other Outflows',
    icon: Receipt,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

export const TreasurerExpensesTab: React.FC<TreasurerExpensesTabProps> = ({
  expenses,
  onRecordExpense,
  openRecordModalByDefault = false,
  onCloseDefaultModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(openRecordModalByDefault);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategoryType>('VENUE');
  const [formAmount, setFormAmount] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<'BANK_TRANSFER' | 'UPI' | 'PETTY_CASH' | 'CREDIT_CARD'>('BANK_TRANSFER');
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Close modal helper
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseDefaultModal) onCloseDefaultModal();
  };

  // Sync if prop changes
  React.useEffect(() => {
    if (openRecordModalByDefault) {
      setIsModalOpen(true);
    }
  }, [openRecordModalByDefault]);

  // Totals & category breakdown
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalAll = 0;
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      totalAll += e.amount;
    });
    return { totals, totalAll };
  }, [expenses]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      if (methodFilter !== 'ALL' && e.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesVendor = e.vendor.toLowerCase().includes(q);
        const matchesInv = e.receiptInvoiceNo?.toLowerCase().includes(q);
        const matchesNotes = e.notes?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesVendor && !matchesInv && !matchesNotes) return false;
      }
      return true;
    });
  }, [expenses, selectedCategory, methodFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Category', 'Title', 'Vendor / Payee', 'Amount (INR)', 'Payment Method', 'Invoice No', 'Recorded By', 'Notes'];
    const rows = filteredExpenses.map((e) => [
      e.id,
      e.date,
      e.category,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.vendor.replace(/"/g, '""')}"`,
      e.amount,
      e.paymentMethod,
      e.receiptInvoiceNo || '',
      `"${e.recordedBy.replace(/"/g, '""')}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Treasury_Expense_Journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount);
    if (!formTitle.trim() || !formVendor.trim() || isNaN(amountVal) || amountVal <= 0) {
      alert('Please complete all required fields with a valid expense amount.');
      return;
    }

    onRecordExpense({
      title: formTitle.trim(),
      category: formCategory,
      amount: amountVal,
      date: formDate,
      vendor: formVendor.trim(),
      paymentMethod: formMethod,
      receiptInvoiceNo: formInvoiceNo.trim() || `BILL-${Date.now().toString().slice(-4)}`,
      receiptNote: formInvoiceNo ? `Invoice #${formInvoiceNo.trim()}` : 'Tax Invoice Recorded',
      recordedBy: 'Priya Patel (Treasurer)',
      notes: formNotes.trim(),
    });

    // Reset & close
    setFormTitle('');
    setFormAmount('');
    setFormVendor('');
    setFormInvoiceNo('');
    setFormNotes('');
    handleCloseModal();
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Action Toolbar ────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Categorized & Verified Outflows
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Journal</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record New Expense</span>
          </button>
        </div>
      </div>

      {/* ── 2. Category Summary Cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(CATEGORY_CONFIG) as ExpenseCategoryType[]).map((catKey) => {
          const cfg = CATEGORY_CONFIG[catKey];
          const totalCat = categoryTotals.totals[catKey] || 0;
          const isSelected = selectedCategory === catKey;
          const Icon = cfg.icon;

          return (
            <div
              key={catKey}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelectedCategory(isSelected ? 'ALL' : catKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedCategory(isSelected ? 'ALL' : catKey);
                }
              }}
              className={`rounded-2xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                isSelected
                  ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] p-[13px] shadow-xs'
                  : 'bg-white border border-[#E2E8F0] p-3.5 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-medium text-[#64748B] font-mono">
                  {((totalCat / (categoryTotals.totalAll || 1)) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-base font-bold text-[#0F172A] mt-1 font-mono">₹{totalCat.toLocaleString()}</div>
              <p className="text-[11px] font-medium text-[#64748B] truncate mt-0.5">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── 3. Filters & Search Bar ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {(['VENUE', 'CATERING', 'SUPPLIES', 'MERCHANDISE', 'LOGISTICS'] as ExpenseCategoryType[]).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              {CATEGORY_CONFIG[c].label}
            </button>
          ))}
        </div>

        {/* Search & Method */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses, vendor, bill #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400 transition-all"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-slate-400 cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="PETTY_CASH">Petty Cash</option>
            <option value="CREDIT_CARD">Card</option>
          </select>
        </div>
      </div>

      {/* ── 4. Categorized Expenses Table ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Item & Description</th>
                <th className="py-3 px-4">Vendor / Payee</th>
                <th className="py-3 px-4">Invoice / Receipt</th>
                <th className="py-3 px-4 text-right">Outflow Amount</th>
                <th className="py-3 px-4">Officer Signed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No expense records matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const cfg = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.OTHER;
                  const Icon = cfg.icon;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 max-w-md truncate">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{exp.vendor}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Via {exp.paymentMethod.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-700 font-semibold">
                          {exp.receiptInvoiceNo || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">{exp.receiptNote}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold font-mono text-xs text-slate-900">
                          -₹{exp.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {exp.recordedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredExpenses.length} audited outflows</span>
          <span className="font-semibold text-slate-900 font-mono">
            Total Disbursed: ₹{filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── 5. Record Expense Modal ──────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Record Club Expenditure</h3>
                  <p className="text-xs text-slate-500">Log authorized disbursement into ledger</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Item *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Sound & AV Microphone Cables"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategoryType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400 font-medium cursor-pointer"
                  >
                    <option value="VENUE">Venue Booking (Auditorium, Hall)</option>
                    <option value="CATERING">Catering & Food (Banquet, Buffet)</option>
                    <option value="EQUIPMENT">Equipment & Sound (AV, Cables, Rentals)</option>
                    <option value="SUPPLIES">Supplies & Ingredients (Baking, Decor)</option>
                    <option value="MERCHANDISE">Merchandise Production (Screenprint)</option>
                    <option value="MARKETING">Printing & Marketing (Banners, Badges)</option>
                    <option value="LOGISTICS">Logistics & Travel</option>
                    <option value="OTHER">Other Contingency Outflow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Payee Entity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Royal Gourmet Caterers"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Disbursement Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method *</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400 font-medium cursor-pointer"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer / IMPS / RTGS</option>
                    <option value="UPI">UPI Direct Merchant</option>
                    <option value="PETTY_CASH">Petty Cash Custodian</option>
                    <option value="CREDIT_CARD">Institutional Club Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Receipt Bill No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TAX-INV-99214"
                    value={formInvoiceNo}
                    onChange={(e) => setFormInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Notes / Budget Line Justification</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pre-approved for Annual Spring Gala. Verified against catering agreement."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]"
                >
                  Confirm & Deduct from Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
