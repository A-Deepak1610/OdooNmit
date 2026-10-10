import React, { useState } from "react";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Download,
  Landmark,
  Wallet,
  TrendingUp,
  CreditCard,
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#1e3a8a",
                background: "#eff6ff",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Dev 4 Workstream
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Problem Scene: "The treasurer closing the books at semester end"
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Treasury Books & Volunteer Reimbursement Ledger
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Real-time audited accounting replacing chaotic paper notebooks: dues, gala tickets, merch sales, and volunteer receipts.
          </p>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            background: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <Download size={16} />
          Export Semester Audit PDF
        </button>
      </div>

      {actionNotice && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "#15803d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} color="#15803d" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            style={{
              background: "none",
              border: "none",
              color: "#15803d",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. 4 FINANCIAL STAT CARDS (Rule 4: Mandatory 4-col row) ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Wallet size={22} color="#1e3a8a" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>
              Opening Balance
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b", marginBottom: "2px" }}>
              ₹{ledger.openingBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>Rolled from Fall 2025</div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <TrendingUp size={22} color="#15803d" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>
              Total Inflow (Income)
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#15803d", marginBottom: "2px" }}>
              ₹{ledger.income.totalIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#15803d", fontWeight: 600 }}>+ Dues, Gala & Merch</div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CreditCard size={22} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>
              Total Outflow (Expenses)
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#dc2626", marginBottom: "2px" }}>
              ₹{ledger.expenses.totalExpenses.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#dc2626" }}>Venue, catering & claims</div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "20px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Landmark size={22} color="#1e3a8a" />
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>
              Net Closing Balance
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e3a8a", marginBottom: "2px" }}>
              ₹{ledger.netClosingBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>Audited & Balanced ✓</div>
          </div>
        </div>
      </div>

      {/* ── 3. SIDE-BY-SIDE BREAKDOWN: INFLOWS VS OUTFLOWS ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Inflows Card */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowUpRight size={18} color="#15803d" />
              Semester Inflows (Money In)
            </h3>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#15803d" }}>
              ₹{ledger.income.totalIncome.toLocaleString()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Annual Membership Dues</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>194 verified dues collected at ₹250/yr</div>
              </div>
              <span style={{ fontWeight: 700, color: "#15803d", fontSize: "13px" }}>
                ₹{ledger.income.membershipDues.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Spring Gala Ticket Sales</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>420 tickets sold across tiers</div>
              </div>
              <span style={{ fontWeight: 700, color: "#15803d", fontSize: "13px" }}>
                ₹{ledger.income.galaTickets.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Club Merch & Apparel Orders</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Online store hoodie & t-shirt sales</div>
              </div>
              <span style={{ fontWeight: 700, color: "#15803d", fontSize: "13px" }}>
                ₹{ledger.income.merchandise.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Bake Sale Fundraiser</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Campus plaza quad baked goods coupons</div>
              </div>
              <span style={{ fontWeight: 700, color: "#15803d", fontSize: "13px" }}>
                ₹{ledger.income.bakeSale.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Outflows Card */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowDownRight size={18} color="#dc2626" />
              Semester Outflows (Money Out)
            </h3>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#dc2626" }}>
              ₹{ledger.expenses.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Grand Auditorium Rental</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Official campus invoice #AUD-883</div>
              </div>
              <span style={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                ₹{ledger.expenses.venueBooking.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Gala Catering & Refreshments</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>450 plated dinners + refreshments</div>
              </div>
              <span style={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                ₹{ledger.expenses.galaCatering.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Volunteer Expense Claims</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Verified supplies & ingredient receipts</div>
              </div>
              <span style={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                ₹{ledger.expenses.volunteerReimbursements.toLocaleString()}
              </span>
            </div>

            <div style={ledgerRowStyle}>
              <div>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>Merchandise Bulk Printing</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Embroidered batch apparel production</div>
              </div>
              <span style={{ fontWeight: 700, color: "#dc2626", fontSize: "13px" }}>
                ₹{ledger.expenses.merchandisePrinting.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. VOLUNTEER EXPENSE CLAIMS TABLE ──────────────── */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 2px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Receipt size={18} color="#1e3a8a" />
              Volunteer Expense Claims (Digital Receipt Audit)
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
              Volunteers submit receipts online so treasurers never chase faded paper slips.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>CLAIM ID</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>DESCRIPTION</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>VOLUNTEER</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>RECEIPT NOTE</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>AMOUNT</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>STATUS</th>
                <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", textAlign: "right" }}>TREASURER ACTION</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>
                    {exp.id}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 600, color: "#1e293b" }}>
                    {exp.title}
                  </td>
                  <td style={{ padding: "12px", color: "#475569" }}>
                    {exp.submittedBy}
                  </td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "11px", color: "#64748b" }}>
                    {exp.receiptNote}
                  </td>
                  <td style={{ padding: "12px", fontWeight: 700, color: "#1e293b" }}>
                    ₹{exp.amount}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {exp.status === "REIMBURSED" ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "11px",
                        }}
                      >
                        Reimbursed
                      </span>
                    ) : exp.status === "APPROVED" ? (
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1e3a8a",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "11px",
                        }}
                      >
                        Approved (Pending Payout)
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#fef3c7",
                          color: "#b45309",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          fontSize: "11px",
                        }}
                      >
                        Pending Receipt Review
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {exp.status === "PENDING" ? (
                      <button
                        onClick={() => handleApproveExpense(exp.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#1e3a8a",
                          color: "white",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Approve Claim
                      </button>
                    ) : exp.status === "APPROVED" ? (
                      <button
                        onClick={() => handleApproveExpense(exp.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#15803d",
                          color: "white",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Disburse Funds
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>Settled</span>
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

const ledgerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "8px",
  background: "#f8fafc",
  border: "1px solid #f1f5f9",
};

