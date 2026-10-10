import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Users,
  Ticket,
  ShoppingBag,
  Trophy,
  Search,
  Plus,
  CheckCircle2,
  Download,
  X,
} from 'lucide-react';
import { IncomeItem, IncomeStreamType } from '../../../data/mockTreasurerData';

interface TreasurerIncomeTabProps {
  incomeItems: IncomeItem[];
  onAddIncome: (newItem: Omit<IncomeItem, 'id' | 'status'>) => void;
}

export const TreasurerIncomeTab: React.FC<TreasurerIncomeTabProps> = ({
  incomeItems,
  onAddIncome,
}) => {
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Income Form State
  const [formSource, setFormSource] = useState<IncomeStreamType>('FUNDRAISER');
  const [formTitle, setFormTitle] = useState('');
  const [formPayer, setFormPayer] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'CASH'>('UPI');
  const [formReference, setFormReference] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Aggregate stats per stream
  const stats = useMemo(() => {
    const dues = incomeItems
      .filter((i) => i.source === 'MEMBERSHIP_DUES')
      .reduce((s, i) => s + i.amount, 0);
    const tickets = incomeItems
      .filter((i) => i.source === 'TICKET_SALES')
      .reduce((s, i) => s + i.amount, 0);
    const merch = incomeItems
      .filter((i) => i.source === 'MERCHANDISE')
      .reduce((s, i) => s + i.amount, 0);
    const fundraiser = incomeItems
      .filter((i) => i.source === 'FUNDRAISER')
      .reduce((s, i) => s + i.amount, 0);
    const total = dues + tickets + merch + fundraiser;

    return { dues, tickets, merch, fundraiser, total };
  }, [incomeItems]);

  // Filtered income list
  const filteredItems = useMemo(() => {
    return incomeItems.filter((item) => {
      if (selectedStream !== 'ALL' && item.source !== selectedStream) return false;
      if (methodFilter !== 'ALL' && item.paymentMethod !== methodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesPayer = item.payerName.toLowerCase().includes(q);
        const matchesRef = item.reference.toLowerCase().includes(q);
        const matchesPaymentId = item.paymentId.toLowerCase().includes(q);
        const matchesRoll = item.payerRoll?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesPayer && !matchesRef && !matchesPaymentId && !matchesRoll) {
          return false;
        }
      }
      return true;
    });
  }, [incomeItems, selectedStream, methodFilter, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Source', 'Title', 'Payer Name', 'Roll / Email', 'Amount (INR)', 'Method', 'Payment ID', 'Reference'];
    const rows = filteredItems.map((i) => [
      i.id,
      i.date,
      i.source,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.payerName.replace(/"/g, '""')}"`,
      i.payerRoll || i.payerEmail || '',
      i.amount,
      i.paymentMethod,
      i.paymentId,
      i.reference,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Treasury_Income_${selectedStream}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount);
    if (!formTitle.trim() || !formPayer.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please fill out all required fields with a valid positive amount.');
      return;
    }

    onAddIncome({
      source: formSource,
      title: formTitle.trim(),
      payerName: formPayer.trim(),
      amount: parsedAmount,
      date: formDate,
      paymentMethod: formMethod,
      paymentId: `pay_${formMethod}_${Date.now().toString().slice(-6)}`,
      reference: formReference.trim() || `INC-REF-${Date.now().toString().slice(-4)}`,
      categoryTag: 'Manual Treasury Log',
    });

    // Reset & close
    setFormTitle('');
    setFormPayer('');
    setFormAmount('');
    setFormReference('');
    setShowAddModal(false);
  };

  const getSourceBadge = (source: IncomeStreamType) => {
    switch (source) {
      case 'MEMBERSHIP_DUES':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
            <Users className="w-3 h-3 text-[#64748B]" /> Membership Dues
          </span>
        );
      case 'TICKET_SALES':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
            <Ticket className="w-3 h-3 text-[#64748B]" /> Ticket Sales
          </span>
        );
      case 'MERCHANDISE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
            <ShoppingBag className="w-3 h-3 text-[#64748B]" /> Merchandise
          </span>
        );
      case 'FUNDRAISER':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
            <Trophy className="w-3 h-3 text-[#64748B]" /> Fundraiser
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Action Toolbar ─────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B] font-medium">
            4 Authorized Club Revenue Streams
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Inflow Entry</span>
          </button>
        </div>
      </div>

      {/* ── 2. The 4 Revenue Streams Highlight Cards ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stream 1: Membership Dues */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={selectedStream === 'MEMBERSHIP_DUES'}
          onClick={() => setSelectedStream(selectedStream === 'MEMBERSHIP_DUES' ? 'ALL' : 'MEMBERSHIP_DUES')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStream(selectedStream === 'MEMBERSHIP_DUES' ? 'ALL' : 'MEMBERSHIP_DUES');
            }
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
            selectedStream === 'MEMBERSHIP_DUES'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] p-[15px] shadow-xs'
              : 'bg-white border border-[#E2E8F0] p-4 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Membership Dues</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-mono tracking-tight">₹{stats.dues.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[#64748B] flex items-center justify-between">
            <span>194 Paid Members</span>
            <span className="font-medium text-slate-700">₹250/yr</span>
          </div>
        </div>

        {/* Stream 2: Ticket Sales */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={selectedStream === 'TICKET_SALES'}
          onClick={() => setSelectedStream(selectedStream === 'TICKET_SALES' ? 'ALL' : 'TICKET_SALES')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStream(selectedStream === 'TICKET_SALES' ? 'ALL' : 'TICKET_SALES');
            }
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
            selectedStream === 'TICKET_SALES'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] p-[15px] shadow-xs'
              : 'bg-white border border-[#E2E8F0] p-4 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Ticket Sales</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-mono tracking-tight">₹{stats.tickets.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[#64748B] flex items-center justify-between">
            <span>Spring Gala Passes</span>
            <span className="font-medium text-slate-700">385 Sold</span>
          </div>
        </div>

        {/* Stream 3: Merchandise */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={selectedStream === 'MERCHANDISE'}
          onClick={() => setSelectedStream(selectedStream === 'MERCHANDISE' ? 'ALL' : 'MERCHANDISE')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStream(selectedStream === 'MERCHANDISE' ? 'ALL' : 'MERCHANDISE');
            }
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
            selectedStream === 'MERCHANDISE'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] p-[15px] shadow-xs'
              : 'bg-white border border-[#E2E8F0] p-4 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Merchandise</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-mono tracking-tight">₹{stats.merch.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[#64748B] flex items-center justify-between">
            <span>Hoodies, Polos, Mugs</span>
            <span className="font-medium text-slate-700">Store Orders</span>
          </div>
        </div>

        {/* Stream 4: Fundraisers */}
        <div
          role="button"
          tabIndex={0}
          aria-pressed={selectedStream === 'FUNDRAISER'}
          onClick={() => setSelectedStream(selectedStream === 'FUNDRAISER' ? 'ALL' : 'FUNDRAISER')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStream(selectedStream === 'FUNDRAISER' ? 'ALL' : 'FUNDRAISER');
            }
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 ${
            selectedStream === 'FUNDRAISER'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] p-[15px] shadow-xs'
              : 'bg-white border border-[#E2E8F0] p-4 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Fundraisers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-[#4F46E5]" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0F172A] font-mono tracking-tight">₹{stats.fundraiser.toLocaleString()}</div>
          <div className="mt-2 text-xs text-[#64748B] flex items-center justify-between">
            <span>Spring Charity Bake Sale</span>
            <span className="font-medium text-slate-700">Quad Booth</span>
          </div>
        </div>
      </div>

      {/* ── 3. Filters & Search Controls ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Stream Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Streams' },
            { id: 'MEMBERSHIP_DUES', label: 'Membership Dues' },
            { id: 'TICKET_SALES', label: 'Ticket Sales' },
            { id: 'MERCHANDISE', label: 'Merchandise' },
            { id: 'FUNDRAISER', label: 'Fundraisers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStream(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] ${
                selectedStream === tab.id
                  ? 'bg-[#4F46E5] text-white shadow-xs font-semibold'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200/80 hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Method Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, payer, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] cursor-pointer"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CASH">Cash Float</option>
          </select>
        </div>
      </div>

      {/* ── 4. Detailed Income Table ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Source Stream</th>
                <th className="py-3 px-4">Description / Title</th>
                <th className="py-3 px-4">Payer / Customer</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4 text-right">Inflow Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748B] text-xs">
                    No income records matching current stream or search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-[#64748B] font-mono text-[11px] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3.5 px-4">{getSourceBadge(item.source)}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#0F172A] text-xs">{item.title}</div>
                      {item.categoryTag && (
                        <div className="text-[10px] text-[#64748B] mt-0.5">{item.categoryTag}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#0F172A] text-xs">{item.payerName}</div>
                      {(item.payerRoll || item.payerEmail) && (
                        <div className="text-[11px] text-[#64748B] font-mono mt-0.5">
                          {item.payerRoll || item.payerEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#0F172A]">
                        <span className="font-semibold">{item.paymentMethod}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#64748B] truncate max-w-[120px]">{item.paymentId}</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">{item.reference}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-semibold font-mono text-xs text-[#059669]">
                        +₹{item.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                        <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3.5 bg-slate-50/60 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <span>Showing {filteredItems.length} verified income receipts</span>
          <span className="font-semibold text-[#0F172A] font-mono text-xs">
            Total Inflow: ₹{filteredItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── 5. Log Income Entry Modal ─────────────────────────────── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-[#4F46E5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Log Treasury Income Entry</h3>
                  <p className="text-xs text-[#64748B]">Record off-line cash, sponsor grant, or booth collection</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Income Stream Type *</label>
                <select
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value as IncomeStreamType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium text-[#0F172A] cursor-pointer"
                >
                  <option value="FUNDRAISER">Fundraiser (Bake sale, charity booth, pledge drive)</option>
                  <option value="MEMBERSHIP_DUES">Membership Dues (Student enrollment & renewal)</option>
                  <option value="TICKET_SALES">Ticket Sales (Gala passes, workshop tickets)</option>
                  <option value="MERCHANDISE">Merchandise (Apparel, goodies, accessories)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Inflow Title / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quad Plaza Bake Sale - Saturday Afternoon Collections"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Date Collected *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payer / Source Entity *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Student Union Booth #4"
                    value={formPayer}
                    onChange={(e) => setFormPayer(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Method *</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium cursor-pointer"
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="CASH">Cash Float Deposit</option>
                    <option value="NET_BANKING">Net Banking Transfer</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Reference / Voucher Number</label>
                <input
                  type="text"
                  placeholder="e.g. REC-BOOTH-4421"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2"
                >
                  Confirm & Log Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
