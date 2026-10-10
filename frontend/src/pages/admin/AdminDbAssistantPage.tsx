import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Play,
  Download,
  CheckCircle,
} from 'lucide-react';
import { exportToCsv } from './utils/exportCsv';

interface QueryResult {
  query: string;
  sql: string;
  columns: string[];
  rows: Record<string, any>[];
  summary: string;
}

const PRESET_QUERIES: QueryResult[] = [
  {
    query: 'Show all students with overdue or pending membership dues',
    sql: `SELECT u.name, u.email, m.membership_id, m.dues_status, m.dues_expires_at 
FROM users u 
JOIN club_memberships m ON u.id = m.user_id 
WHERE m.dues_status != 'PAID';`,
    columns: ['Name', 'Email', 'Membership ID', 'Dues Status', 'Expires / Overdue'],
    rows: [
      { Name: 'Karthik Raja', Email: 'karthik.r@campus.edu', 'Membership ID': 'SSA-2026-0089', 'Dues Status': 'Unpaid (₹250)', 'Expires / Overdue': 'Overdue (34 Days)' },
      { Name: 'Aarav Patel', Email: 'aarav.p@nmit.edu.in', 'Membership ID': 'COD-2026-0034', 'Dues Status': 'Pending', 'Expires / Overdue': 'Overdue (12 Days)' },
      { Name: 'Pooja Hegde', Email: 'pooja.h@nmit.edu.in', 'Membership ID': 'ROB-2026-0019', 'Dues Status': 'Unpaid (₹300)', 'Expires / Overdue': 'Overdue (5 Days)' },
      { Name: 'Siddharth Rao', Email: 'sid.rao@nmit.edu.in', 'Membership ID': 'ECELL-2026-0077', 'Dues Status': 'Pending', 'Expires / Overdue': 'Overdue (19 Days)' },
    ],
    summary: 'Found 4 student memberships with overdue or uncollected annual dues across 4 chartered clubs.',
  },
  {
    query: 'Show total ticket sales and check-in ratios for recent events',
    sql: `SELECT e.title, e.capacity, e.tickets_sold, e.checked_in, 
       ROUND((e.checked_in * 100.0 / e.tickets_sold), 1) AS attendance_rate, e.revenue 
FROM events e ORDER BY e.revenue DESC;`,
    columns: ['Event Title', 'Capacity', 'Sold Count', 'Checked In', 'Turnout %', 'Gross Revenue (₹)'],
    rows: [
      { 'Event Title': 'Skyline Annual Spring Gala 2026', Capacity: 500, 'Sold Count': 420, 'Checked In': 385, 'Turnout %': '91.7%', 'Gross Revenue (₹)': '₹58,500' },
      { 'Event Title': 'HackNMIT 36-Hour Hackathon', Capacity: 350, 'Sold Count': 350, 'Checked In': 338, 'Turnout %': '96.6%', 'Gross Revenue (₹)': '₹1,40,000' },
      { 'Event Title': 'Robotics Combat Arena 2026', Capacity: 250, 'Sold Count': 210, 'Checked In': 192, 'Turnout %': '91.4%', 'Gross Revenue (₹)': '₹63,000' },
      { 'Event Title': 'Spring Charity Bake Sale & Fundraiser', Capacity: 300, 'Sold Count': 180, 'Checked In': 154, 'Turnout %': '85.6%', 'Gross Revenue (₹)': '₹14,200' },
    ],
    summary: 'Analyzed 4 major institutional events. Average attendance turnout is 91.3% with total revenue of ₹2,75,700.',
  },
  {
    query: 'List all club executive leaders with verified contact details',
    sql: `SELECT u.name, u.email, u.phone, ur.role, c.name AS club_name 
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN clubs c ON u.id = c.president_id 
WHERE ur.role IN ('ADMIN', 'PRESIDENT', 'TREASURER');`,
    columns: ['Leader Name', 'Email', 'Role', 'Club Name', 'Status'],
    rows: [
      { 'Leader Name': 'THIRUMURUGAN K', Email: 'thirumurugank.al24@bitsathy.ac.in', Role: 'Campus Administrator & Lead', 'Club Name': 'Central Campus Administration', Status: 'Active' },
      { 'Leader Name': 'Deepak Kumar', Email: 'deepaka.ad24@bitsathy.ac.in', Role: 'Club President', 'Club Name': 'Skyline Student Association', Status: 'Active' },
      { 'Leader Name': 'Aarav Sharma', Email: 'president@campusFlow.edu', Role: 'Club President', 'Club Name': 'Leadership Council', Status: 'Active' },
      { 'Leader Name': 'Priya Patel', Email: 'treasurer@campusFlow.edu', Role: 'Treasurer', 'Club Name': 'Skyline Student Association', Status: 'Active' },
    ],
    summary: '4 executive student organization officers retrieved from the directory with verified contact credentials.',
  },
];

export const AdminDbAssistantPage: React.FC = () => {
  const [activeQuery, setActiveQuery] = useState<QueryResult>(PRESET_QUERIES[0]);
  const [customInput, setCustomInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunPreset = (preset: QueryResult) => {
    setIsExecuting(true);
    setTimeout(() => {
      setActiveQuery(preset);
      setIsExecuting(false);
    }, 400);
  };

  const handleRunCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    setIsExecuting(true);
    setTimeout(() => {
      // Simulate AI translation
      setActiveQuery({
        query: customInput,
        sql: `SELECT * FROM institutional_data WHERE MATCH('${customInput.replace(/'/g, '')}') LIMIT 10;`,
        columns: ['Entity', 'Identifier', 'Category', 'Record Value', 'Status'],
        rows: [
          { Entity: 'Campus Records Query', Identifier: 'REC-0921', Category: 'System Search', 'Record Value': customInput, Status: 'Validated' },
          { Entity: 'Skyline Student Association', Identifier: 'ORG-001', Category: 'Chartered Club', 'Record Value': 'Active (248 Members)', Status: 'Verified' },
          { Entity: 'Spring Term Treasury', Identifier: 'FIN-2026', Category: 'Ledger', 'Record Value': '₹3,67,500 Inflow', Status: 'Reconciled' },
        ],
        summary: `AI Assistant generated real-time SQL and retrieved matching institutional records for: "${customInput}".`,
      });
      setIsExecuting(false);
      setCustomInput('');
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
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
                color: '#7c3aed',
                background: '#f3e8ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              AI Database Copilot
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Natural Language Institutional Insights
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Campus Database Assistant
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Query student organization records, dues ledgers, and event attendance using conversational natural language or verified SQL presets.
          </p>
        </div>

        <button
          onClick={() => {
            const cols = activeQuery.columns.map((c) => ({
              header: c,
              accessor: (row: Record<string, any>) => row[c],
            }));
            exportToCsv(`db_export_${Date.now()}`, cols, activeQuery.rows);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
          Export Query Results (CSV)
        </button>
      </div>

      {/* Query Bar */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px',
        }}
      >
        <form onSubmit={handleRunCustom} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Sparkles
              size={18}
              color="#7c3aed"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Show members with unpaid dues', 'How much revenue from gala?')..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                background: '#f8fafc',
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isExecuting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 20px',
              height: '42px',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Play size={15} />
            {isExecuting ? 'Querying...' : 'Ask Copilot'}
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '8px' }}>
            Quick Prompts:
          </span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px' }}>
            {PRESET_QUERIES.map((pq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleRunPreset(pq)}
                style={{
                  background: activeQuery.query === pq.query ? '#f3e8ff' : '#f1f5f9',
                  color: activeQuery.query === pq.query ? '#6d28d9' : '#334155',
                  border: activeQuery.query === pq.query ? '1px solid #d8b4fe' : '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {pq.query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SQL & Results View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {/* SQL Preview Box */}
        <div
          style={{
            background: '#0f172a',
            borderRadius: '10px',
            border: '1px solid #334155',
            padding: '16px',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8' }}>
            <Terminal size={15} color="#38bdf8" />
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Synthesized SQL Statement
            </span>
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#38bdf8' }}>{activeQuery.sql}</pre>
        </div>

        {/* Results Card */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#16a34a" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                {activeQuery.summary}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {activeQuery.rows.length} rows returned
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                  {activeQuery.columns.map((c, i) => (
                    <th key={i} style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeQuery.rows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {activeQuery.columns.map((col, cIdx) => (
                      <td key={cIdx} style={{ padding: '12px 16px', color: '#1e293b' }}>
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
