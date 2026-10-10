import React, { useState } from 'react';
import {
  Download,
  Calendar,
  CreditCard,
  Users,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { exportToCsv } from './utils/exportCsv';
import { mockMembers } from '../../data/mockClubData';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Finance' | 'Memberships' | 'Events' | 'Merchandise';
  recordCount: number;
  lastGenerated: string;
  icon: any;
  color: string;
  bg: string;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'REP-001',
    title: 'Financial Ledger & Dues Audit',
    description: 'Itemized revenue from annual ₹250 dues, Gala ticket sales, and club expense reconciliations.',
    category: 'Finance',
    recordCount: 35,
    lastGenerated: 'Today, 2:15 PM',
    icon: CreditCard,
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    id: 'REP-002',
    title: 'Student Membership Rosters',
    description: 'Active digital pass holders, dues payment records, expiration timelines, and discount eligibility.',
    category: 'Memberships',
    recordCount: mockMembers.length,
    lastGenerated: 'Today, 1:40 PM',
    icon: Users,
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    id: 'REP-003',
    title: 'Campus Events & Door Check-ins',
    description: 'Ticket tier quotas, attendee check-in velocity, door scans, and capacity utilization ratios.',
    category: 'Events',
    recordCount: 16,
    lastGenerated: 'Yesterday',
    icon: Calendar,
    color: '#7c3aed',
    bg: '#f3e8ff',
  },
  {
    id: 'REP-004',
    title: 'Merchandise Sales & Inventory',
    description: 'Official club hoodie & t-shirt order log, size variant availability, and revenue shares.',
    category: 'Merchandise',
    recordCount: 42,
    lastGenerated: '3 days ago',
    icon: ShoppingBag,
    color: '#ea580c',
    bg: '#fff7ed',
  },
];

export const AdminReportsPage: React.FC = () => {
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  const handleDownload = (report: ReportTemplate) => {
    if (report.id === 'REP-002') {
      const cols = [
        { header: 'Member ID', accessor: (m: any) => m.membershipId },
        { header: 'Full Name', accessor: (m: any) => m.name },
        { header: 'Email', accessor: (m: any) => m.email },
        { header: 'Tier', accessor: (m: any) => m.tier },
        { header: 'Dues Paid', accessor: (m: any) => (m.duesPaid ? 'Yes (₹250)' : 'Unpaid') },
        { header: 'Expires At', accessor: (m: any) => m.duesExpiresAt },
        { header: 'Discounts', accessor: (m: any) => (m.discountEligible ? 'Eligible' : 'Regular') },
      ];
      exportToCsv('membership_roster_export', cols, mockMembers);
    } else {
      const sampleData = [
        { RecordID: 'REC-101', Title: report.title, Status: 'Reconciled', Amount: '₹25,000', Timestamp: '2026-10-10' },
        { RecordID: 'REC-102', Title: report.title, Status: 'Audited', Amount: '₹42,500', Timestamp: '2026-10-09' },
        { RecordID: 'REC-103', Title: report.title, Status: 'Processed', Amount: '₹18,000', Timestamp: '2026-10-08' },
      ];
      const cols = [
        { header: 'Record ID', accessor: (r: any) => r.RecordID },
        { header: 'Report Title', accessor: (r: any) => r.Title },
        { header: 'Status', accessor: (r: any) => r.Status },
        { header: 'Value', accessor: (r: any) => r.Amount },
        { header: 'Date', accessor: (r: any) => r.Timestamp },
      ];
      exportToCsv(`${report.id.toLowerCase()}_export`, cols, sampleData);
    }

    setDownloadSuccessNotice(`"${report.title}" CSV successfully exported and downloaded to your computer.`);
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Page Header ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
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
                color: '#16a34a',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Auditing & Compliance
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Institutional Data Exports
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Reports & Data Exports
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Generate and download auditable CSV records for campus finances, membership rosters, and event attendance.
          </p>
        </div>
      </div>

      {downloadSuccessNotice && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{downloadSuccessNotice}</span>
        </div>
      )}

      {/* ── 2. Report Templates Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        {REPORT_TEMPLATES.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.2s',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: report.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} color={report.color} />
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {report.category}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
                  {report.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {report.description}
                </p>
              </div>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#94a3b8',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                    marginBottom: '14px',
                  }}
                >
                  <span>Records: {report.recordCount}</span>
                  <span>Last: {report.lastGenerated}</span>
                </div>

                <button
                  onClick={() => handleDownload(report)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    background: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  Download CSV
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
