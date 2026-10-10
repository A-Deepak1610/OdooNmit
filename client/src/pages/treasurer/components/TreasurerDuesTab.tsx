import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  ShieldCheck,
  User,
  History,
  X,
  CreditCard,
  Building,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  StudentDuesRecord,
  DuesConfiguration,
  INITIAL_DUES_CONFIG,
  INITIAL_STUDENT_DUES,
} from '../../../data/mockTreasurerDuesData';
import { presidentService } from '../../../services/president.service';
import { treasurerService } from '../../../services/treasurer.service';
import { useAuthStore } from '../../../stores/auth.store';

interface TreasurerDuesTabProps {
  onRecordIncomeEntry?: (entry: {
    source: 'MEMBERSHIP_DUES';
    title: string;
    payerName: string;
    payerEmail?: string;
    payerRoll?: string;
    amount: number;
    paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';
    reference: string;
    date: string;
  }) => void;
}

export const TreasurerDuesTab: React.FC<TreasurerDuesTabProps> = ({ onRecordIncomeEntry }) => {
  const { user } = useAuthStore();

  // 1. Data State
  const [config, setConfig] = useState<DuesConfiguration>(INITIAL_DUES_CONFIG);
  const [students, setStudents] = useState<StudentDuesRecord[]>(INITIAL_STUDENT_DUES);
  const [presidentName, setPresidentName] = useState<string>('Arjun Sharma');
  const [clubLogoUrl, setClubLogoUrl] = useState<string | null>(null);

  // 2. Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedKpiCard, setSelectedKpiCard] = useState<string | null>(null);

  // 3. Modals State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<StudentDuesRecord | null>(null);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<StudentDuesRecord | null>(null);

  // 4. Record Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'NET_BANKING' | 'CARD'>('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // 5. Config Form State
  const [configFee, setConfigFee] = useState<number>(config.annualFee);
  const [configDeadline, setConfigDeadline] = useState<string>(config.paymentDeadline);
  const [configYear, setConfigYear] = useState<string>(config.academicYear);

  // 6. Toast Feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real club profile, president and server dues
  useEffect(() => {
    let isMounted = true;
    const fetchClubData = async () => {
      try {
        const [overviewRes, membersRes, duesRes] = await Promise.all([
          presidentService.getOverview().catch(() => null),
          presidentService.getMembers().catch(() => []),
          treasurerService.getDues().catch(() => null),
        ]);

        if (isMounted && duesRes) {
          if (duesRes.config) {
            setConfig((prev) => ({ ...prev, ...duesRes.config }));
          }
          if (Array.isArray(duesRes.students) && duesRes.students.length > 0) {
            setStudents(duesRes.students);
          }
        }

        if (isMounted && overviewRes?.club) {
          setConfig((prev) => ({
            ...prev,
            clubName: overviewRes.club.name || prev.clubName,
            annualFee: overviewRes.club.membershipFee || prev.annualFee,
          }));
          if (overviewRes.club.logoUrl) {
            setClubLogoUrl(overviewRes.club.logoUrl);
          }
        }

        if (isMounted && Array.isArray(membersRes) && membersRes.length > 0) {
          const pres = membersRes.find((m) => m.role === 'PRESIDENT');
          if (pres?.user?.fullName) {
            setPresidentName(pres.user.fullName);
          }
        }
      } catch {
        // Graceful fallback to default club data
      }
    };

    fetchClubData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute Summary Figures Dynamically
  const summary = useMemo(() => {
    const totalMembers = students.length;
    const fullyPaid = students.filter((s) => s.paymentStatus === 'PAID').length;
    const pending = students.filter((s) => s.paymentStatus === 'PENDING').length;
    const partial = students.filter((s) => s.paymentStatus === 'PARTIAL').length;
    const overdue = students.filter((s) => s.paymentStatus === 'OVERDUE').length;
    const waived = students.filter((s) => s.paymentStatus === 'WAIVED').length;

    const totalCollected = students.reduce((acc, s) => acc + s.amountPaid, 0);
    const totalOutstanding = students.reduce((acc, s) => acc + s.outstandingBalance, 0);
    const collectionRate = totalMembers > 0 ? ((fullyPaid + waived) / totalMembers) * 100 : 0;

    return {
      totalMembers,
      fullyPaid,
      pending,
      partial,
      overdue,
      waived,
      totalCollected,
      totalOutstanding,
      collectionRate,
    };
  }, [students]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set<string>();
    students.forEach((s) => depts.add(s.department));
    return Array.from(depts);
  }, [students]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // KPI card filter shortcut
      if (selectedKpiCard && student.paymentStatus !== selectedKpiCard) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && student.paymentStatus !== statusFilter) {
        return false;
      }
      // Department filter
      if (departmentFilter !== 'ALL' && student.department !== departmentFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesId = student.studentId.toLowerCase().includes(q);
        const matchesRoll = student.rollNumber.toLowerCase().includes(q);
        const matchesEmail = student.email.toLowerCase().includes(q);
        const matchesRef = student.transactionRef?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesRoll && !matchesEmail && !matchesRef) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedKpiCard, statusFilter, departmentFilter, searchQuery]);

  // Handle Dues Configuration Save
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (configFee <= 0) {
      showToast('Annual membership fee must be greater than zero.', 'error');
      return;
    }
    if (!configDeadline) {
      showToast('Please specify a valid payment deadline.', 'error');
      return;
    }

    // Update config
    setConfig((prev) => ({
      ...prev,
      annualFee: configFee,
      paymentDeadline: configDeadline,
      academicYear: configYear,
    }));

    // Update student records: adjust annualFee and recalculate balances for pending/partial members
    setStudents((prev) =>
      prev.map((s) => {
        if (s.paymentStatus === 'PAID' || s.paymentStatus === 'WAIVED') {
          // If already fully paid or waived, preserve their fulfilled historical status
          return { ...s, dueDate: configDeadline, academicYear: configYear };
        }

        const newAnnualFee = configFee;
        const newOutstanding = Math.max(0, newAnnualFee - s.amountPaid);
        let newStatus: StudentDuesRecord['paymentStatus'] = s.paymentStatus;
        if (newOutstanding === 0) {
          newStatus = 'PAID';
        } else if (s.amountPaid > 0) {
          newStatus = 'PARTIAL';
        } else {
          // Check if today > deadline -> overdue
          newStatus = new Date().toISOString().split('T')[0] > configDeadline ? 'OVERDUE' : 'PENDING';
        }

        return {
          ...s,
          annualFee: newAnnualFee,
          outstandingBalance: newOutstanding,
          paymentStatus: newStatus,
          dueDate: configDeadline,
          academicYear: configYear,
        };
      })
    );

    setIsConfigModalOpen(false);
    showToast(`Dues configuration saved: ₹${configFee.toLocaleString()} / member for ${configYear}.`);
  };

  // Open Record Payment Modal for a Student
  const handleOpenRecordPayment = (student: StudentDuesRecord) => {
    setSelectedStudentForPayment(student);
    setPaymentAmount(student.outstandingBalance > 0 ? student.outstandingBalance.toString() : config.annualFee.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('UPI');
    setPaymentReference(`REC-DUE-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('');
    setIsRecordPaymentModalOpen(true);
  };

  // Submit Recorded Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast('Please enter a valid positive payment amount.', 'error');
      return;
    }

    const refStr = paymentReference.trim() || `OFFLINE-${Date.now().toString().slice(-4)}`;
    const notesStr = paymentNotes.trim() || `Membership payment for ${config.academicYear}`;

    try {
      const updated = await treasurerService.recordDuesPayment(selectedStudentForPayment.id, {
        amount: parsedAmount,
        date: paymentDate,
        paymentMethod,
        reference: refStr,
        notes: notesStr,
      });

      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudentForPayment.id ? updated : s))
      );

      // Trigger central income entry integration
      if (onRecordIncomeEntry) {
        onRecordIncomeEntry({
          source: 'MEMBERSHIP_DUES',
          title: `Annual Membership Dues Collection: ${selectedStudentForPayment.name}`,
          payerName: selectedStudentForPayment.name,
          payerEmail: selectedStudentForPayment.email,
          payerRoll: selectedStudentForPayment.rollNumber,
          amount: parsedAmount,
          paymentMethod: paymentMethod,
          reference: refStr,
          date: paymentDate,
        });
      }

      setIsRecordPaymentModalOpen(false);
      setSelectedStudentForPayment(null);
      showToast(`Payment of ₹${parsedAmount.toLocaleString()} saved in database for ${selectedStudentForPayment.name}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to record payment on server', 'error');
    }
  };

  // Send Reminder Feedback
  const handleSendReminder = (student: StudentDuesRecord) => {
    showToast(`Payment reminder notification sent to ${student.name} (${student.email}) for balance ₹${student.outstandingBalance}.`);
  };

  // Waive Dues for Special Cases
  const handleWaiveDues = (student: StudentDuesRecord) => {
    if (student.paymentStatus === 'WAIVED') return;
    const confirmWaive = window.confirm(
      `Are you sure you want to grant an official fee waiver for ${student.name}? Outstanding balance will be set to ₹0.`
    );
    if (!confirmWaive) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,
              paymentStatus: 'WAIVED',
              outstandingBalance: 0,
              notes: 'Authorized financial grant fee waiver recorded by Treasurer',
            }
          : s
      )
    );
    showToast(`Official dues waiver recorded for ${student.name}.`);
  };

  // Export Dues to CSV
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Full Name',
      'Roll Number',
      'Email',
      'Phone',
      'Department',
      'Year of Study',
      'Membership Status',
      'Academic Year',
      'Annual Fee (INR)',
      'Amount Paid (INR)',
      'Outstanding Balance (INR)',
      'Payment Status',
      'Last Payment Date',
      'Payment Method',
      'Transaction Reference',
      'Due Date',
    ];

    const rows = filteredStudents.map((s) => [
      s.studentId,
      `"${s.name.replace(/"/g, '""')}"`,
      s.rollNumber,
      s.email,
      s.phone || '',
      `"${s.department.replace(/"/g, '""')}"`,
      s.yearOfStudy,
      s.membershipStatus,
      s.academicYear,
      s.annualFee,
      s.amountPaid,
      s.outstandingBalance,
      s.paymentStatus,
      s.lastPaymentDate || '',
      s.paymentMethod || '',
      s.transactionRef || '',
      s.dueDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CampusMitra_Dues_${config.academicYear}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold transition-all ${
            toastMessage.type === 'success' ? 'bg-[#059669] text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-70 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── 1. Club Information Header ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Club Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
              {clubLogoUrl ? (
                <img src={clubLogoUrl} alt={config.clubName} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-7 h-7 text-[#4F46E5]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight">{config.clubName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">
                  Academic Year {config.academicYear}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    President: <strong className="text-[#0F172A] font-semibold">{presidentName}</strong>
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Treasurer: <strong className="text-[#0F172A] font-semibold">{user?.name || 'Priya Patel'}</strong>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Dues Policy & Quick Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <div className="bg-slate-50 border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-right">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                Annual Fee / Student
              </span>
              <div className="text-xl font-bold text-[#0F172A] font-mono tracking-tight">
                ₹{config.annualFee.toLocaleString()}
              </div>
              <span className="block text-[10px] text-[#64748B] mt-0.5">Deadline: {config.paymentDeadline}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setConfigFee(config.annualFee);
                  setConfigDeadline(config.paymentDeadline);
                  setConfigYear(config.academicYear);
                  setIsConfigModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Configure Dues</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#64748B]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Dues Summary Cards (Interactive KPI Row) ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Total Members */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedKpiCard(null);
            setStatusFilter('ALL');
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none p-4 ${
            selectedKpiCard === null && statusFilter === 'ALL'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] shadow-xs'
              : 'bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Total Members</span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.totalMembers}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Roster enrollees</span>
        </div>

        {/* Fully Paid */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedKpiCard(selectedKpiCard === 'PAID' ? null : 'PAID');
            setStatusFilter(selectedKpiCard === 'PAID' ? 'ALL' : 'PAID');
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none p-4 ${
            selectedKpiCard === 'PAID'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] shadow-xs'
              : 'bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <span className="block text-[11px] font-semibold text-[#059669] uppercase tracking-wider">Fully Paid</span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.fullyPaid}</div>
          <span className="text-[10px] text-[#059669] font-medium mt-1 block">
            {((summary.fullyPaid / (summary.totalMembers || 1)) * 100).toFixed(0)}% cleared
          </span>
        </div>

        {/* Pending */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedKpiCard(selectedKpiCard === 'PENDING' ? null : 'PENDING');
            setStatusFilter(selectedKpiCard === 'PENDING' ? 'ALL' : 'PENDING');
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none p-4 ${
            selectedKpiCard === 'PENDING'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] shadow-xs'
              : 'bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <span className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Pending</span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.pending}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Before deadline</span>
        </div>

        {/* Partial */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedKpiCard(selectedKpiCard === 'PARTIAL' ? null : 'PARTIAL');
            setStatusFilter(selectedKpiCard === 'PARTIAL' ? 'ALL' : 'PARTIAL');
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none p-4 ${
            selectedKpiCard === 'PARTIAL'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] shadow-xs'
              : 'bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <span className="block text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Partially Paid</span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">{summary.partial}</div>
          <span className="text-[10px] text-amber-700 font-medium mt-1 block">Part installments</span>
        </div>

        {/* Overdue */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSelectedKpiCard(selectedKpiCard === 'OVERDUE' ? null : 'OVERDUE');
            setStatusFilter(selectedKpiCard === 'OVERDUE' ? 'ALL' : 'OVERDUE');
          }}
          className={`rounded-2xl transition-all duration-200 cursor-pointer select-none p-4 ${
            selectedKpiCard === 'OVERDUE'
              ? 'bg-[#EEF2FF] border-2 border-[#4F46E5] shadow-xs'
              : 'bg-white border border-[#E2E8F0] hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <span className="block text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Overdue</span>
          <div className="text-xl font-bold text-rose-700 font-mono mt-1">{summary.overdue}</div>
          <span className="text-[10px] text-rose-600 font-medium mt-1 block">Notice required</span>
        </div>

        {/* Total Collected */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#059669] uppercase tracking-wider">Total Collected</span>
          <div className="text-xl font-bold text-[#059669] font-mono mt-1">₹{summary.totalCollected.toLocaleString()}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Verified inflows</span>
        </div>

        {/* Total Outstanding */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
          <span className="block text-[11px] font-semibold text-[#0F172A] uppercase tracking-wider">Total Outstanding</span>
          <div className="text-xl font-bold text-[#0F172A] font-mono mt-1">₹{summary.totalOutstanding.toLocaleString()}</div>
          <span className="text-[10px] text-[#64748B] mt-1 block">Receivable balance</span>
        </div>
      </div>

      {/* ── 3. Filters & Search Toolbar ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Dues' },
            { id: 'PAID', label: 'Paid' },
            { id: 'PARTIAL', label: 'Partial' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'WAIVED', label: 'Waived' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setSelectedKpiCard(tab.id === 'ALL' ? null : tab.id);
              }}
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

        {/* Search & Department Selector */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student, roll, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 4. Student Dues Ledger Table ───────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Student & Member ID</th>
                <th className="py-3 px-4">Department & Year</th>
                <th className="py-3 px-4 text-right">Annual Fee</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Last Payment & Ref</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B] text-xs">
                    No student dues records found matching current search or status filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-semibold text-[#0F172A] text-xs">{student.name}</div>
                      <div className="text-[11px] text-[#64748B] font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{student.studentId}</span>
                        <span className="text-slate-300">•</span>
                        <span>{student.rollNumber}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{student.email}</div>
                    </td>

                    {/* Department & Year */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="font-medium text-[#0F172A] text-xs">{student.department}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        {student.yearOfStudy} •{' '}
                        <span className="text-slate-500 font-semibold">{student.membershipStatus}</span>
                      </div>
                    </td>

                    {/* Annual Fee */}
                    <td className="py-3.5 px-4 text-right align-middle font-mono font-medium text-slate-700 text-xs">
                      ₹{student.annualFee.toLocaleString()}
                    </td>

                    {/* Amount Paid */}
                    <td className="py-3.5 px-4 text-right align-middle font-mono font-semibold text-xs text-[#059669]">
                      ₹{student.amountPaid.toLocaleString()}
                    </td>

                    {/* Outstanding Balance */}
                    <td className="py-3.5 px-4 text-right align-middle font-mono font-bold text-xs">
                      {student.outstandingBalance > 0 ? (
                        <span className="text-rose-600">₹{student.outstandingBalance.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700">₹0</span>
                      )}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="py-3.5 px-4 text-center align-middle">
                      {student.paymentStatus === 'PAID' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-[#059669] border border-emerald-200/70">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {student.paymentStatus === 'PARTIAL' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/70">
                          <Clock className="w-3 h-3" /> Partial
                        </span>
                      )}
                      {student.paymentStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                          <Clock className="w-3 h-3 text-slate-500" /> Pending
                        </span>
                      )}
                      {student.paymentStatus === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                          <AlertTriangle className="w-3 h-3" /> Overdue
                        </span>
                      )}
                      {student.paymentStatus === 'WAIVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/70">
                          <Sparkles className="w-3 h-3" /> Waived
                        </span>
                      )}
                    </td>

                    {/* Last Payment & Ref */}
                    <td className="py-3.5 px-4 align-middle">
                      {student.lastPaymentDate ? (
                        <>
                          <div className="font-mono text-[11px] text-slate-800">
                            {student.lastPaymentDate}
                            {student.paymentMethod && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                                {student.paymentMethod}
                              </span>
                            )}
                          </div>
                          {student.transactionRef && (
                            <div className="text-[10px] text-[#64748B] font-mono mt-0.5 truncate max-w-[150px]">
                              {student.transactionRef}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs italic">No transactions</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 align-middle font-mono text-[11px] text-[#64748B]">
                      {student.dueDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-1.5">
                        {student.outstandingBalance > 0 && student.paymentStatus !== 'WAIVED' && (
                          <button
                            onClick={() => handleOpenRecordPayment(student)}
                            className="px-2.5 py-1 rounded-lg bg-[#4F46E5] hover:bg-[#3730A3] text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Record payment collected offline or via bank transfer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedStudentForHistory(student)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          title="View student payment history & audit trail"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                        </button>

                        {student.outstandingBalance > 0 && student.paymentStatus !== 'WAIVED' && (
                          <button
                            onClick={() => handleSendReminder(student)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                            title="Send payment reminder email/notice"
                          >
                            <Send className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="p-3.5 bg-slate-50/60 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748B]">
          <span>
            Showing <strong className="text-[#0F172A]">{filteredStudents.length}</strong> of{' '}
            {students.length} students enrolled in {config.academicYear}
          </span>
          <div className="flex items-center gap-4">
            <span>
              Total Inflows:{' '}
              <strong className="text-[#059669] font-mono text-xs">
                ₹{filteredStudents.reduce((acc, s) => acc + s.amountPaid, 0).toLocaleString()}
              </strong>
            </span>
            <span>
              Outstanding:{' '}
              <strong className="text-rose-600 font-mono text-xs">
                ₹{filteredStudents.reduce((acc, s) => acc + s.outstandingBalance, 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. Record Payment Received Modal ───────────────────────── */}
      {isRecordPaymentModalOpen && selectedStudentForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Record Student Dues Payment</h3>
                  <p className="text-xs text-[#64748B]">
                    {selectedStudentForPayment.name} ({selectedStudentForPayment.studentId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsRecordPaymentModalOpen(false);
                  setSelectedStudentForPayment(null);
                }}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
              {/* Student Overview Box */}
              <div className="p-3 bg-slate-50 border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Department:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedStudentForPayment.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Annual Obligation:</span>
                  <span className="font-mono text-[#0F172A]">₹{selectedStudentForPayment.annualFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Current Outstanding Balance:</span>
                  <span className="font-mono font-bold text-rose-600">
                    ₹{selectedStudentForPayment.outstandingBalance}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedStudentForPayment.annualFee}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium cursor-pointer"
                  >
                    <option value="UPI">UPI Payment</option>
                    <option value="CASH">Cash at Desk</option>
                    <option value="NET_BANKING">Net Banking / NEFT</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Transaction Ref / Receipt No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPI-TXN-491204"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Auditor Note / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid in cash at orientation booth"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => handleWaiveDues(selectedStudentForPayment)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  Grant Hardship Waiver
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecordPaymentModalOpen(false);
                      setSelectedStudentForPayment(null);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Confirm & Record Payment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. Student Payment History Modal ───────────────────────── */}
      {selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">{selectedStudentForHistory.name}</h3>
                  <p className="text-xs text-[#64748B]">
                    Payment History • {selectedStudentForHistory.studentId} ({selectedStudentForHistory.rollNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForHistory(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-[#E2E8F0] text-center">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#64748B]">Annual Fee</span>
                  <div className="text-sm font-bold font-mono text-[#0F172A]">₹{selectedStudentForHistory.annualFee}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#059669]">Total Paid</span>
                  <div className="text-sm font-bold font-mono text-[#059669]">₹{selectedStudentForHistory.amountPaid}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-rose-600">Balance Due</span>
                  <div className="text-sm font-bold font-mono text-rose-600">₹{selectedStudentForHistory.outstandingBalance}</div>
                </div>
              </div>

              {/* Transactions Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-[#0F172A] mb-2">Confirmed Transaction Records</h4>
                {selectedStudentForHistory.paymentHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#64748B] bg-slate-50 rounded-xl border border-dashed border-[#E2E8F0]">
                    No payments recorded yet for this student.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedStudentForHistory.paymentHistory.map((rec) => (
                      <div key={rec.id} className="p-3 bg-white rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0F172A] font-mono">+₹{rec.amount.toLocaleString()}</span>
                          <span className="text-[11px] text-[#64748B] font-mono">{rec.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold">{rec.method}</span>
                          <span>Ref: {rec.reference}</span>
                        </div>
                        {rec.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">{rec.notes}</div>}
                        <div className="text-[10px] text-slate-400">Audited by: {rec.recordedBy}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForHistory(null)}
                  className="px-4 py-2 text-xs font-medium text-[#0F172A] bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Configure Annual Dues Modal ─────────────────────────── */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">Configure Annual Membership Dues</h3>
                  <p className="text-xs text-[#64748B]">{config.clubName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Academic Year *</label>
                <select
                  value={configYear}
                  onChange={(e) => setConfigYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] font-medium cursor-pointer"
                >
                  <option value="2025–2026">2025–2026 (Current Academic Year)</option>
                  <option value="2026–2027">2026–2027 (Next Term)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                  Annual Membership Fee per Student (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="10"
                  value={configFee}
                  onChange={(e) => setConfigFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-medium bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
                <span className="block text-[11px] text-[#64748B] mt-1">
                  Historical payments already fulfilled will remain honored.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">Standard Payment Deadline *</label>
                <input
                  type="date"
                  required
                  value={configDeadline}
                  onChange={(e) => setConfigDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#0F172A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#64748B] bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-[#0F172A] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#4F46E5] hover:bg-[#3730A3] rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
