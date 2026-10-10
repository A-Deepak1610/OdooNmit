import React, { useState } from 'react';
import {
  Search,
} from 'lucide-react';

interface AuditItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

const AUDIT_LOGS: AuditItem[] = [
  { id: 'LOG-001', actor: 'THIRUMURUGAN K (Admin)', action: 'UPDATE_USER_ROLE', target: 'thirumurugank.al24@bitsathy.ac.in', ip: '192.168.1.104', timestamp: 'Today, 2:40 PM', severity: 'INFO' },
  { id: 'LOG-002', actor: 'Priya Patel (Treasurer)', action: 'RECONCILE_DUES_LEDGER', target: 'Skyline Student Association', ip: '192.168.1.88', timestamp: 'Today, 1:12 PM', severity: 'INFO' },
  { id: 'LOG-003', actor: 'System Daemon', action: 'BATCH_RENEWAL_DISPATCH', target: '18 Expiring Student Members', ip: '127.0.0.1 (Local)', timestamp: 'Today, 11:30 AM', severity: 'INFO' },
  { id: 'LOG-004', actor: 'Aarav Sharma (President)', action: 'APPROVE_EXPENSE_CLAIM', target: 'Claim #CLM-004 (₹4,200)', ip: '10.0.4.12', timestamp: 'Yesterday, 5:20 PM', severity: 'WARN' },
  { id: 'LOG-005', actor: 'Security Probe', action: 'ADMIN_SESSION_INITIATED', target: 'Institutional Workspace', ip: '192.168.1.104', timestamp: 'Yesterday, 9:00 AM', severity: 'INFO' },
];

export const AdminAuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredLogs = AUDIT_LOGS.filter((l) => {
    const matchesSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || l.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Forensic Security
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Immutable System Activity Ledger
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Activity & Audit Logs
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Read-only chronological trail of administrative permissions, dues modifications, and treasury approvals.
          </p>
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search actor or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                background: '#f8fafc',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              height: '38px',
              padding: '0 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              background: '#f8fafc',
              color: '#334155',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>TIMESTAMP</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>ACTOR</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>ACTION PERFORMED</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>AFFECTED TARGET</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>IP ADDRESS</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontSize: '12px' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>
                    {log.actor}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
                    {log.action}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#334155' }}>
                    {log.target}
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b', fontFamily: 'monospace', fontSize: '12px' }}>
                    {log.ip}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <span
                      style={{
                        background: log.severity === 'WARN' ? '#fef3c7' : log.severity === 'CRITICAL' ? '#fee2e2' : '#f1f5f9',
                        color: log.severity === 'WARN' ? '#b45309' : log.severity === 'CRITICAL' ? '#dc2626' : '#475569',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        fontSize: '11px',
                      }}
                    >
                      {log.severity}
                    </span>
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
