import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  SemesterReportData,
  INITIAL_SEMESTER_REPORTS,
} from '../../../data/mockTreasurerData';

interface TreasurerReportsTabProps {
  currentLiveBalance: number;
  currentLiveIncome: number;
  currentLiveExpenses: number;
}

export const TreasurerReportsTab: React.FC<TreasurerReportsTabProps> = ({
  currentLiveBalance,
  currentLiveIncome,
  currentLiveExpenses,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<string>('Spring 2026');

  // Find report or fallback to first
  const report: SemesterReportData = React.useMemo(() => {
    const found = INITIAL_SEMESTER_REPORTS.find((r) => r.semester === selectedSemester);
    if (!found) return INITIAL_SEMESTER_REPORTS[0];

    // For Spring 2026, dynamically reflect live updates from store
    if (found.semester === 'Spring 2026') {
      const netSurplus = currentLiveIncome - currentLiveExpenses;
      return {
        ...found,
        incomeBreakdown: {
          ...found.incomeBreakdown,
          totalIncome: currentLiveIncome,
        },
        expenseBreakdown: {
          ...found.expenseBreakdown,
          totalExpenses: currentLiveExpenses,
        },
        netOperatingSurplus: netSurplus,
        netClosingBalance: currentLiveBalance,
      };
    }

    return found;
  }, [selectedSemester, currentLiveBalance, currentLiveIncome, currentLiveExpenses]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const statement = `
================================================================================
               SKYLINE STUDENT ASSOCIATION — FINANCIAL REPORT
                    Office of the Club Treasurer
================================================================================
Academic Term:    ${report.semester} (${report.academicYear})
Audit Status:     ${report.status.replace('_', ' ')}
Certified Date:   ${report.certifiedDate}
Integrity Hash:   ${report.auditHash}
--------------------------------------------------------------------------------
1. EXECUTIVE RECONCILIATION
   • Opening Cash Reserves:        ₹${report.openingBalance.toLocaleString()}
   • Gross Operating Inflows:     ₹${report.incomeBreakdown.totalIncome.toLocaleString()}
   • Total Operating Outflows:    ₹${report.expenseBreakdown.totalExpenses.toLocaleString()}
   -----------------------------------------------------------------------------
   • NET OPERATING SURPLUS:       ₹${report.netOperatingSurplus.toLocaleString()}
   • NET CLOSING CASH BALANCE:    ₹${report.netClosingBalance.toLocaleString()}

2. ITEMIZED INFLOW STATEMENT (REVENUES)
   • Student Membership Dues:     ₹${report.incomeBreakdown.membershipDues.toLocaleString()}
   • Event Ticket Sales (Gala):   ₹${report.incomeBreakdown.ticketSales.toLocaleString()}
   • Official Merchandise Sales:  ₹${report.incomeBreakdown.merchandise.toLocaleString()}
   • Charity Fundraisers:         ₹${report.incomeBreakdown.fundraisers.toLocaleString()}
   • External Sponsorships:       ₹${report.incomeBreakdown.sponsorships.toLocaleString()}
   -----------------------------------------------------------------------------
   TOTAL REVENUE:                 ₹${report.incomeBreakdown.totalIncome.toLocaleString()}

3. ITEMIZED OUTFLOW STATEMENT (EXPENDITURES)
   • Grand Auditorium Venue Hire: ₹${report.expenseBreakdown.venueBooking.toLocaleString()}
   • Spring Gala Banquet Catering:₹${report.expenseBreakdown.galaCatering.toLocaleString()}
   • Volunteer Reimbursements:    ₹${report.expenseBreakdown.volunteerReimbursements.toLocaleString()}
   • Merch Screenprinting Batch:  ₹${report.expenseBreakdown.merchandisePrinting.toLocaleString()}
   • Equipment & Audio Console:   ₹${report.expenseBreakdown.equipmentAndSound.toLocaleString()}
   • Supplies & Quad Decor:       ₹${report.expenseBreakdown.suppliesAndDecor.toLocaleString()}
   -----------------------------------------------------------------------------
   TOTAL EXPENDITURE:             ₹${report.expenseBreakdown.totalExpenses.toLocaleString()}

4. CERTIFICATION & AUDIT SIGN-OFF
   Audited & Certified by:
   ${report.auditedBy}

   Attested & Approved by:
   ${report.facultyAdvisor}
================================================================================
`;
    const blob = new Blob([statement], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skyline_SA_Audit_${report.semester.replace(' ', '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csvLines = [
      'Category,Line Item,Amount (INR)',
      `Opening Balance,Cash Float & Reserves,${report.openingBalance}`,
      `Inflows,Membership Dues,${report.incomeBreakdown.membershipDues}`,
      `Inflows,Event Ticket Sales,${report.incomeBreakdown.ticketSales}`,
      `Inflows,Merchandise Orders,${report.incomeBreakdown.merchandise}`,
      `Inflows,Charity Fundraisers,${report.incomeBreakdown.fundraisers}`,
      `Inflows,External Sponsorships,${report.incomeBreakdown.sponsorships}`,
      `Total Inflow,Gross Revenue,${report.incomeBreakdown.totalIncome}`,
      `Outflows,Grand Auditorium Venue Hire,${report.expenseBreakdown.venueBooking}`,
      `Outflows,Gala Banquet Catering,${report.expenseBreakdown.galaCatering}`,
      `Outflows,Volunteer Reimbursements,${report.expenseBreakdown.volunteerReimbursements}`,
      `Outflows,Merchandise Printing,${report.expenseBreakdown.merchandisePrinting}`,
      `Outflows,Equipment Rentals,${report.expenseBreakdown.equipmentAndSound}`,
      `Outflows,Supplies & Decor,${report.expenseBreakdown.suppliesAndDecor}`,
      `Total Outflow,Total Operating Expenses,${report.expenseBreakdown.totalExpenses}`,
      `Net Surplus,Operating Margin,${report.netOperatingSurplus}`,
      `Closing Balance,Net Treasury Reserve,${report.netClosingBalance}`,
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial_Report_${report.semester.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Action Toolbar ────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Certified Ledger Closing Statements
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV Ledger</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#3730A3] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Audited Statement</span>
          </button>
        </div>
      </div>

      {/* ── 2. Term Selector Pills ────────────────────────────────── */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E2E8F0] p-2 shadow-xs">
        {INITIAL_SEMESTER_REPORTS.map((r) => (
          <button
            key={r.semester}
            onClick={() => setSelectedSemester(r.semester)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              selectedSemester === r.semester
                ? 'bg-[#4F46E5] text-white shadow-xs'
                : 'bg-transparent text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{r.semester}</span>
            {r.semester === 'Spring 2026' && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ── 3. High-Fidelity Audited Statement Sheet ──────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Formal Letterhead Header */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-gradient-to-b from-slate-50/80 to-white relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                  Official Statement
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Doc Ref #{report.auditHash.slice(0, 16)}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
                Skyline Student Association
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Office of the Club Treasurer • Financial Audit & Closing Balance Sheet
              </p>
              <p className="text-xs text-slate-400 font-mono pt-1">
                Term: {report.semester} • Academic Year {report.academicYear}
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  report.status === 'ACTIVE_INTERIM'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{report.status.replace('_', ' ')}</span>
              </span>
              <span className="text-[11px] text-slate-400">Certified on {report.certifiedDate}</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Metric Cards */}
        <div className="p-6 sm:p-8 border-b border-slate-200 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Opening Balance */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Opening Cash Reserves
              </span>
              <div className="text-xl font-black text-slate-800 mt-1">
                ₹{report.openingBalance.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Carried from previous term</span>
            </div>

            {/* Total Inflows */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Operating Inflows
              </span>
              <div className="text-xl font-black text-indigo-700 mt-1">
                +₹{report.incomeBreakdown.totalIncome.toLocaleString()}
              </div>
              <span className="text-[10px] text-indigo-500 font-semibold mt-0.5 block">
                Revenues across 4 streams
              </span>
            </div>

            {/* Total Outflows */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Operating Outflows
              </span>
              <div className="text-xl font-black text-rose-700 mt-1">
                -₹{report.expenseBreakdown.totalExpenses.toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">
                Authorized expenditures
              </span>
            </div>

            {/* Net Closing Balance */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Net Ending Balance
              </span>
              <div className="text-2xl font-black text-emerald-900 mt-1">
                ₹{report.netClosingBalance.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                Surplus: +₹{report.netOperatingSurplus.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Financial Tables Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Inflows Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>1. Operating Inflow Statement (Revenues)</span>
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-700">
                Total: ₹{report.incomeBreakdown.totalIncome.toLocaleString()}
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-1">
                  <th className="py-2 font-semibold">Revenue Stream</th>
                  <th className="py-2 font-semibold">Description</th>
                  <th className="py-2 text-right font-semibold">Amount (INR)</th>
                  <th className="py-2 text-right font-semibold">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Student Membership Dues</td>
                  <td className="py-2.5 text-slate-500">194 paid registered student members (₹250/member)</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.incomeBreakdown.membershipDues.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.incomeBreakdown.membershipDues /
                        (report.incomeBreakdown.totalIncome || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Spring Gala Ticket Sales</td>
                  <td className="py-2.5 text-slate-500">385 digital QR admission passes & VIP tables</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.incomeBreakdown.ticketSales.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.incomeBreakdown.ticketSales /
                        (report.incomeBreakdown.totalIncome || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Official Club Merchandise</td>
                  <td className="py-2.5 text-slate-500">Embroidered hoodies, polo shirts, mugs & accessories</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.incomeBreakdown.merchandise.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.incomeBreakdown.merchandise /
                        (report.incomeBreakdown.totalIncome || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Charity Bake Sale Fundraiser</td>
                  <td className="py-2.5 text-slate-500">Quad Plaza Booth collections & verified UPI QR scans</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.incomeBreakdown.fundraisers.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.incomeBreakdown.fundraisers /
                        (report.incomeBreakdown.totalIncome || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                {report.incomeBreakdown.sponsorships > 0 && (
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800">External Sponsorship Grants</td>
                    <td className="py-2.5 text-slate-500">Corporate alumni grants & department contributions</td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{report.incomeBreakdown.sponsorships.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-400">
                      {(
                        (report.incomeBreakdown.sponsorships /
                          (report.incomeBreakdown.totalIncome || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Outflows Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <span>2. Operating Outflow Statement (Expenditures)</span>
              </h4>
              <span className="text-xs font-mono font-bold text-rose-700">
                Total: ₹{report.expenseBreakdown.totalExpenses.toLocaleString()}
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-100 pb-1">
                  <th className="py-2 font-semibold">Expense Head</th>
                  <th className="py-2 font-semibold">Disbursement Details</th>
                  <th className="py-2 text-right font-semibold">Amount (INR)</th>
                  <th className="py-2 text-right font-semibold">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Grand Auditorium Venue Hire</td>
                  <td className="py-2.5 text-slate-500">University Estates Directorate booking & sound rigs</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.expenseBreakdown.venueBooking.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.expenseBreakdown.venueBooking /
                        (report.expenseBreakdown.totalExpenses || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Spring Gala Banquet Catering</td>
                  <td className="py-2.5 text-slate-500">Grand Royal Caterers 3-course dinner for 385 guests</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.expenseBreakdown.galaCatering.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.expenseBreakdown.galaCatering /
                        (report.expenseBreakdown.totalExpenses || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Merchandise Production Batch</td>
                  <td className="py-2.5 text-slate-500">Apex Screenprinting apparel batch</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.expenseBreakdown.merchandisePrinting.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.expenseBreakdown.merchandisePrinting /
                        (report.expenseBreakdown.totalExpenses || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Volunteer Reimbursements</td>
                  <td className="py-2.5 text-slate-500">Audited expense claims for ingredients, supplies & cables</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    ₹{report.expenseBreakdown.volunteerReimbursements.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-400">
                    {(
                      (report.expenseBreakdown.volunteerReimbursements /
                        (report.expenseBreakdown.totalExpenses || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Audit Sign-off Box */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 p-6 rounded-2xl">
            {/* Treasurer Attestation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Audited & Certified by Treasurer</span>
              </div>
              <p className="text-xs text-slate-600">
                "I certify that these financial statements correctly reflect the receipts, payments, and ending balances of the Skyline Student Association for the term ended {report.certifiedDate}."
              </p>
              <div className="pt-2">
                <div className="font-serif italic font-bold text-sm text-slate-900">Priya Patel</div>
                <div className="text-[11px] text-slate-500">Office of the Club Treasurer</div>
                <div className="text-[10px] text-slate-400 font-mono">ID: SSA-TREAS-2026-001</div>
              </div>
            </div>

            {/* Faculty Advisor Attestation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Attested by Faculty Advisory Board</span>
              </div>
              <p className="text-xs text-slate-600">
                "Reviewed and ratified in accordance with university student organization governance and financial accountability standards."
              </p>
              <div className="pt-2">
                <div className="font-serif italic font-bold text-sm text-slate-900">
                  {report.facultyAdvisor}
                </div>
                <div className="text-[11px] text-slate-500">Dean of Student Affairs / Directorate</div>
                <div className="text-[10px] text-slate-400 font-mono">Hash: {report.auditHash}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
