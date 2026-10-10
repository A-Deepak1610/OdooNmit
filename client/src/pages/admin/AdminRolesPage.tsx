import React, { useState } from 'react';
import {
  Check,
  X,
  UserCheck,
  CheckCircle2,
  Building2,
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

interface ClubLeadershipItem {
  id: string;
  clubName: string;
  president: string;
  treasurer: string;
  organizer: string;
  term: string;
}

const INITIAL_LEADERSHIP: ClubLeadershipItem[] = [
  {
    id: 'lead-1',
    clubName: 'Skyline Student Association',
    president: 'Elena Rostova (elena.r@campus.edu)',
    treasurer: 'Deepak A (deepak.a@campus.edu)',
    organizer: 'Marcus Brody',
    term: 'AY 2025-26',
  },
  {
    id: 'lead-2',
    clubName: 'Campus Robotics & AI Society',
    president: 'Aarav Patel (aarav.p@campus.edu)',
    treasurer: 'Sneha Rao (sneha.r@campus.edu)',
    organizer: 'Devin Vance',
    term: 'AY 2025-26',
  },
  {
    id: 'lead-3',
    clubName: 'IEEE Student Chapter',
    president: 'Karthik Raja (karthik.r@campus.edu)',
    treasurer: 'Priya Iyer (priya.i@campus.edu)',
    organizer: 'Ananya Roy',
    term: 'AY 2025-26',
  },
  {
    id: 'lead-4',
    clubName: 'Literary & Debating Union',
    president: 'Meera Nair (meera.n@campus.edu)',
    treasurer: 'Rohan Mehra (rohan.m@campus.edu)',
    organizer: 'Zoya Khan',
    term: 'AY 2025-26',
  },
];

export const AdminRolesPage: React.FC = () => {
  const [leadership, setLeadership] = useState<ClubLeadershipItem[]>(INITIAL_LEADERSHIP);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [selectedClub, setSelectedClub] = useState('Skyline Student Association');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'PRESIDENT' | 'TREASURER' | 'ORGANIZER'>('PRESIDENT');

  const handleAssignLeadership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateEmail.trim()) return;

    setLeadership((prev) =>
      prev.map((item) => {
        if (item.clubName === selectedClub) {
          return {
            ...item,
            president: selectedRole === 'PRESIDENT' ? candidateEmail : item.president,
            treasurer: selectedRole === 'TREASURER' ? candidateEmail : item.treasurer,
            organizer: selectedRole === 'ORGANIZER' ? candidateEmail : item.organizer,
          };
        }
        return item;
      })
    );

    setNotification(`Successfully assigned ${candidateEmail} as ${selectedRole} for ${selectedClub}.`);
    setShowAssignModal(false);
    setCandidateEmail('');
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Page Header ── */}
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
              Access Control & Governance
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Leadership Appointments & Granular RBAC
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Club Leadership & Role Permissions
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Appoint student leadership for chartered organizations and inspect the institutional permission matrix.
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
        >
          <UserCheck size={16} />
          <span>Assign Club Leadership</span>
        </button>
      </div>

      {notification && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* ── Section 1: Appointed Club Leadership Roster ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Active Club Leadership Appointments
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              Designated executive officers across recognized institutional organizations.
            </p>
          </div>
          <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
            {leadership.length} CHARTERS APPOINTED
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>ORGANIZATION</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CLUB PRESIDENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TREASURER</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>EVENT LEAD</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>TENURE</th>
              </tr>
            </thead>
            <tbody>
              {leadership.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} color="#1e3a8a" />
                      {item.clubName}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>{item.president}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Executive Authority</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>{item.treasurer}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Ledger Signatory</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#0f172a', fontWeight: 500 }}>{item.organizer}</div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Door Scanner Lead</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1e3a8a', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {item.term}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 2: Permissions Table ── */}
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
            Role Permissions & Capability Matrix
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            System-enforced access boundaries mapped across administrative and student club roles.
          </p>
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

      {/* ── Modal: Assign Leadership ── */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                  Assign Club Leadership
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignLeadership} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Select Club Charter *
                </label>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc' }}
                >
                  {leadership.map((l) => (
                    <option key={l.id} value={l.clubName}>
                      {l.clubName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Leadership Position *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  style={{ width: '100%', height: '38px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#f8fafc' }}
                >
                  <option value="PRESIDENT">Club President (Full Governance)</option>
                  <option value="TREASURER">Treasurer (Budget, Dues & Ledger)</option>
                  <option value="ORGANIZER">Event Organizer (Door Scanner & Tickets)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Candidate Student Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. candidate@campus.edu"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
