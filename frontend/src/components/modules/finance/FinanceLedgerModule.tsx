import React, { useState } from "react";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Download,
  Landmark,
} from "lucide-react";
import {
  mockTreasurerLedger,
  mockExpenses,
  MockExpense,
} from "../../../data/mockClubData";

export const FinanceLedgerModule: React.FC = () => {
  const [expenses, setExpenses] = useState<MockExpense[]>(mockExpenses);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const ledger = mockTreasurerLedger;

  const handleApproveExpense = (id: string) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "PENDING" ? "APPROVED" : "REIMBURSED" }
          : e,
      ),
    );
    setActionNotice(`Expense claim #${id} status updated successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Dev 4 Workstream
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Problem Statement Scene:
            </span>
            <span className="text-xs font-semibold text-slate-700">
              "The treasurer closing the books at semester end"
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Treasury Books & Volunteer Reimbursement Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audited accounting replacing chaotic paper notebooks:
            track dues, ticket sales, merch income, and volunteer receipts.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-center">
          <Download className="h-4 w-4" />
          <span>Export Semester Audit PDF</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="font-bold underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Financial Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">
            Opening Balance
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ₹{ledger.openingBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rolled over from Fall 2025
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Inflow (Income)
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" /> Inflow
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{ledger.income.totalIncome.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dues, Gala Tickets & Fundraiser
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Outflow (Expenses)
            </span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowDownRight className="h-3 w-3" /> Outflow
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            ₹{ledger.expenses.totalExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Venue, catering & reimbursements
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-200">
              Net Closing Balance
            </span>
            <Landmark className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-1">
            ₹{ledger.netClosingBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-indigo-200 mt-0.5">
            Books balanced & verified
          </p>
        </div>
      </div>

      {/* Side-by-Side Breakdown: Income Inflows vs Outflows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Sources */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              Semester Inflows (Money In)
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              ₹{ledger.income.totalIncome.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Annual Membership Dues
                </p>
                <p className="text-[11px] text-slate-400">
                  194 student dues collected at ₹250/yr
                </p>
              </div>
              <span className="font-bold text-emerald-700">
                ₹{ledger.income.membershipDues.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Spring Gala Ticket Sales
                </p>
                <p className="text-[11px] text-slate-400">
                  420 tickets sold across member/VIP tiers
                </p>
              </div>
              <span className="font-bold text-emerald-700">
                ₹{ledger.income.galaTickets.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Club Hoodie & T-shirt Sales
                </p>
                <p className="text-[11px] text-slate-400">
                  Online store apparel orders
                </p>
              </div>
              <span className="font-bold text-emerald-700">
                ₹{ledger.income.merchandise.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">Bake Sale Fundraiser</p>
                <p className="text-[11px] text-slate-400">
                  Campus plaza quad baked goods vouchers
                </p>
              </div>
              <span className="font-bold text-emerald-700">
                ₹{ledger.income.bakeSale.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Outflows */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
              Semester Outflows (Money Out)
            </h3>
            <span className="text-xs font-bold text-rose-600">
              ₹{ledger.expenses.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Campus Grand Auditorium Rental
                </p>
                <p className="text-[11px] text-slate-400">
                  Official invoice #AUD-883
                </p>
              </div>
              <span className="font-bold text-rose-600">
                ₹{ledger.expenses.venueBooking.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Gala Catering & Refreshments
                </p>
                <p className="text-[11px] text-slate-400">
                  450 plated dinners + mocktails
                </p>
              </div>
              <span className="font-bold text-rose-600">
                ₹{ledger.expenses.galaCatering.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Volunteer Expense Reimbursements
                </p>
                <p className="text-[11px] text-slate-400">
                  Verified ingredient & equipment receipts
                </p>
              </div>
              <span className="font-bold text-rose-600">
                ₹{ledger.expenses.volunteerReimbursements.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Merchandise Bulk Production
                </p>
                <p className="text-[11px] text-slate-400">
                  Embroidered hoodie batch manufacture
                </p>
              </div>
              <span className="font-bold text-rose-600">
                ₹{ledger.expenses.merchandisePrinting.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Expense Reimbursement Review Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600" />
              Volunteer Expense Claims (Digital Receipt Audit)
            </h3>
            <p className="text-xs text-slate-500">
              Volunteers submit receipts online so treasurers never chase faded
              paper slips.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Claim ID</th>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Volunteer</th>
                <th className="py-3 px-4">Receipt Note</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Treasurer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {exp.id}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {exp.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {exp.submittedBy}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {exp.receiptNote}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{exp.amount}
                  </td>
                  <td className="py-3.5 px-4">
                    {exp.status === "REIMBURSED" ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Reimbursed
                      </span>
                    ) : exp.status === "APPROVED" ? (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Approved (Pending Payout)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending Receipt Review
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {exp.status === "PENDING" ? (
                      <button
                        onClick={() => handleApproveExpense(exp.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Approve Claim
                      </button>
                    ) : exp.status === "APPROVED" ? (
                      <button
                        onClick={() => handleApproveExpense(exp.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Disburse Funds
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Closed
                      </span>
                    )}
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
