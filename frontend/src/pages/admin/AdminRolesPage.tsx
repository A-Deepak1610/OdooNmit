import React from 'react';
import {
  Check,
  X,
} from 'lucide-react';

interface PermissionMatrixRow {
  permission: string;
  category: string;
  admin: boolean;
  president: boolean;
  treasurer: boolean;
  organizer: boolean;
  volunteer: boolean;
  member: boolean;
}

const PERMISSION_ROWS: PermissionMatrixRow[] = [
  { permission: 'Manage All Chartered Clubs', category: 'Institutional Governance', admin: true, president: false, treasurer: false, organizer: false, volunteer: false, member: false },
  { permission: 'Assign & Revoke User Roles', category: 'Institutional Governance', admin: true, president: false, treasurer: false, organizer: false, volunteer: false, member: false },
  { permission: 'Access Forensic Audit Logs', category: 'Institutional Governance', admin: true, president: false, treasurer: false, organizer: false, volunteer: false, member: false },
  { permission: 'Create & Host Campus Events', category: 'Event Operations', admin: true, president: true, treasurer: false, organizer: true, volunteer: false, member: false },
  { permission: 'Perform Door Check-ins (QR Scanner)', category: 'Event Operations', admin: true, president: true, treasurer: false, organizer: true, volunteer: true, member: false },
  { permission: 'Set Ticket Tiers & Member Prices', category: 'Event Operations', admin: true, president: true, treasurer: true, organizer: true, volunteer: false, member: false },
  { permission: 'Approve Reimbursement Expense Claims', category: 'Financial Controls', admin: true, president: true, treasurer: true, organizer: false, volunteer: false, member: false },
  { permission: 'Record Annual Membership Dues (₹250)', category: 'Financial Controls', admin: true, president: true, treasurer: true, organizer: false, volunteer: false, member: false },
  { permission: 'Submit Out-of-Pocket Expense Receipts', category: 'Financial Controls', admin: true, president: true, treasurer: true, organizer: true, volunteer: true, member: false },
  { permission: 'Broadcast Announcements (Campus-Wide)', category: 'Communications', admin: true, president: true, treasurer: false, organizer: false, volunteer: false, member: false },
  { permission: 'Claim 60% Member Event Discounts', category: 'Member Privileges', admin: true, president: true, treasurer: true, organizer: true, volunteer: true, member: true },
];

export const AdminRolesPage: React.FC = () => {
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
              Access Control & Security
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Granular Role-Based Permissions (RBAC)
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Role Permissions & Matrix
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Inspect permissions mapped across Campus Administrator, Club Presidents, Treasurers, and Members.
          </p>
        </div>
      </div>

      {/* Permissions Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Institutional Capability Matrix
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>CAPABILITY / ACTION</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>ADMIN</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>PRESIDENT</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>TREASURER</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>ORGANIZER</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>VOLUNTEER</th>
                <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'center' }}>MEMBER</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_ROWS.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{row.permission}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{row.category}</div>
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.admin ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.president ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.treasurer ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.organizer ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.volunteer ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
                  </td>
                  <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                    {row.member ? <Check size={16} color="#16a34a" style={{ margin: '0 auto' }} /> : <X size={16} color="#cbd5e1" style={{ margin: '0 auto' }} />}
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
