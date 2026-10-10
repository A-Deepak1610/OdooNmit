import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';

export const FinanceLedgerModule: React.FC = () => {
  const {
    ledger,
    expenses,
    paymentReceipts,
    approveExpenseClaim,
    recordExpensePayout,
  } = useClubStore();

  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ledger' | 'reimbursements' | 'audit_log'>('ledger');

  const handleApprove = (id: string) => {
    approveExpenseClaim(id);
    setActionNotice(`Expense claim #${id} approved for disbursement.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handlePayout = (id: string, amount: number) => {
    recordExpensePayout(id);
    setActionNotice(`Payout of ₹${amount} recorded! Expense logged in ledger and balance deducted.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExportPDF = () => {
    const reportText = `
SKYLINE STUDENT ASSOCIATION — SEMESTER FINANCIAL AUDIT
Term: ${ledger.semester}
------------------------------------------------------
TOTAL INFLOWS (INCOME):
  • Membership Dues: ₹${ledger.income.membershipDues}
  • Spring Gala Tickets: ₹${ledger.income.galaTickets}
  • Bake Sale Fundraiser: ₹${ledger.income.bakeSale}
  • Merchandise Goodies: ₹${ledger.income.merchandise}
  ---------------------------------
  GROSS INCOME: ₹${ledger.income.totalIncome}

TOTAL OUTFLOWS (EXPENSES):
  • Venue Booking: ₹${ledger.expenses.venueBooking}
  • Gala Catering: ₹${ledger.expenses.galaCatering}
  • Volunteer Reimbursements: ₹${ledger.expenses.volunteerReimbursements}
  • Merchandise Production: ₹${ledger.expenses.merchandisePrinting}
  ---------------------------------
  TOTAL EXPENSES: ₹${ledger.expenses.totalExpenses}

NET CLOSING BALANCE: ₹${ledger.netClosingBalance}
Audited by: Office of the Club Treasurer
Certified on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skyline_SA_Audit_${ledger.semester.replace(' ', '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setActionNotice('Semester Financial Audit statement exported successfully.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              TREASURY BOOKS & AUDITED LEDGER
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Problem Scene: "The treasurer closing the books at the end of the semester"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '2px 0 2px 0' }}>
            Semester Closing Books, Inflows, Expenses & Payouts
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Unified real-time financial transparency replacing paper notebooks and lost receipts: dues, tickets, merchandise, and volunteer expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'var(--muted)', padding: '4px', borderRadius: '8px' }}>
            {(['ledger', 'reimbursements', 'audit_log'] as const).map((tab) => {
              const isActive = activeTab === tab;
              const labels = {
                ledger: 'Semester Books',
                reimbursements: `Reimbursements (${expenses.length})`,
                audit_log: `Payment Audit (${paymentReceipts.length})`,
              };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--muted-foreground)',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            <span>Export Audit Statement</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ── 2. TREASURY SNAPSHOT CARDS ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Gross Inflow (Income)</span>
            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
              +Dues +Tickets +Merch
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803d', marginTop: '6px' }}>
            ₹{ledger.income.totalIncome.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Includes ₹{ledger.income.membershipDues} in member dues
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Outflow (Expenses)</span>
            <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
              Operations & Claims
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>
            ₹{ledger.expenses.totalExpenses.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            Includes ₹{ledger.expenses.volunteerReimbursements} paid to volunteers
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Net Closing Balance</span>
            <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
              Term Reserve
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e3a8a', marginTop: '6px' }}>
            ₹{ledger.netClosingBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
            ✓ In good standing for next academic semester
          </div>
        </div>
      </div>

      {/* ── TAB 1: SEMESTER BOOKS BREAKDOWN ─────────────────── */}
      {activeTab === 'ledger' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Inflow Card */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#15803d', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpRight style={{ width: '18px', height: '18px' }} />
              Categorized Income Streams
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Membership Dues (Annual Registrations)</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{ledger.income.membershipDues.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Spring Gala Ticket Sales</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{ledger.income.galaTickets.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Club Hoodies & T-shirt Sales</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{ledger.income.merchandise.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Charity Bake Sale Fundraiser</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{ledger.income.bakeSale.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 800, fontSize: '15px' }}>
                <span>Total Income</span>
                <span style={{ color: '#15803d' }}>₹{ledger.income.totalIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Outflow Card */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowDownRight style={{ width: '18px', height: '18px' }} />
              Categorized Expense Outflows
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Grand Auditorium Venue Deposit</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{ledger.expenses.venueBooking.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Spring Gala Catering & Dinner</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{ledger.expenses.galaCatering.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Volunteer Expense Reimbursements</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{ledger.expenses.volunteerReimbursements.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#475569' }}>Merchandise Bulk Printing & Embroidery</span>
                <span style={{ fontWeight: 700, color: '#dc2626' }}>₹{ledger.expenses.merchandisePrinting.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontWeight: 800, fontSize: '15px' }}>
                <span>Total Expenses</span>
                <span style={{ color: '#dc2626' }}>₹{ledger.expenses.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: VOLUNTEER REIMBURSEMENT QUEUE ─────────────── */}
      {activeTab === 'reimbursements' && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Volunteer Out-of-Pocket Expense Claims & Receipts
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Review attached receipts before approving payouts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Claim ID</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Description</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Volunteer</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Receipt Reference</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Amount</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Treasurer Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {exp.id}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {exp.title}
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      {exp.submittedBy}
                    </td>
                    <td style={{ padding: '12px', color: '#475569', fontStyle: 'italic' }}>
                      {exp.receiptNote}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#dc2626' }}>
                      ₹{exp.amount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          background:
                            exp.status === 'REIMBURSED'
                              ? '#dcfce7'
                              : exp.status === 'APPROVED'
                              ? '#eff6ff'
                              : '#fef3c7',
                          color:
                            exp.status === 'REIMBURSED'
                              ? '#15803d'
                              : exp.status === 'APPROVED'
                              ? '#1e3a8a'
                              : '#b45309',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {exp.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(exp.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#1e3a8a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Approve Claim
                        </button>
                      )}
                      {exp.status === 'APPROVED' && (
                        <button
                          onClick={() => handlePayout(exp.id, exp.amount)}
                          style={{
                            padding: '6px 12px',
                            background: '#15803d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Record Payout (₹{exp.amount})
                        </button>
                      )}
                      {exp.status === 'REIMBURSED' && (
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                          ✓ Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: PAYMENT AUDIT TRAIL ───────────────────────── */}
      {activeTab === 'audit_log' && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Razorpay Inflow Receipts & Cryptographic Signatures
            </h3>
            <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
              HMAC SHA-256 Verified
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Payment ID</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Purpose</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Payer</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Amount</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Method</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {paymentReceipts.map((rcpt) => (
                  <tr key={rcpt.paymentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {rcpt.paymentId}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {rcpt.purpose}
                    </td>
                    <td style={{ padding: '12px', color: '#64748b' }}>
                      {rcpt.payerName}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#15803d' }}>
                      ₹{rcpt.amount}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                        {rcpt.method}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>
                      {new Date(rcpt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
