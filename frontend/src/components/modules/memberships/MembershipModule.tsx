import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Award,
  Search,
  CreditCard,
  Send,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { RazorpayPaymentModal } from '../../shared/RazorpayPaymentModal';
import { MockMember } from '../../../data/mockClubData';

export const MembershipModule: React.FC = () => {
  const {
    members,
    activeMemberCount,
    annualDuesAmount,
    payMembershipDues,
    registerNewMember,
  } = useClubStore();

  const [selectedMember, setSelectedMember] = useState<MockMember>(members[0]);
  const [search, setSearch] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // New Student Registration Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNo: '',
    dept: 'Computer Science',
    tier: 'STANDARD' as const,
  });

  // Razorpay Modal Trigger State
  const [checkoutTarget, setCheckoutTarget] = useState<{
    type: 'REGISTER' | 'RENEW';
    memberId?: string;
    name: string;
    email: string;
    amount: number;
    title: string;
    purpose: string;
  } | null>(null);

  const [registeredNotice, setRegisteredNotice] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    setCheckoutTarget({
      type: 'REGISTER',
      name: newStudent.name,
      email: newStudent.email,
      amount: annualDuesAmount,
      title: 'New Student Membership & Annual Dues',
      purpose: `Annual Membership Dues (${newStudent.tier}) for ${newStudent.name}`,
    });
  };

  const handleStartRenewal = (member: MockMember) => {
    setCheckoutTarget({
      type: 'RENEW',
      memberId: member.id,
      name: member.name,
      email: member.email,
      amount: annualDuesAmount,
      title: `Renew Membership: ${member.name}`,
      purpose: `Annual Membership Renewal (2026-2027) for ${member.membershipId}`,
    });
  };

  const handleSendBatchReminders = () => {
    setIsSendingBatch(true);
    setTimeout(() => {
      setIsSendingBatch(false);
      setBatchNotice(
        'Automated renewal notifications & SMS payment links dispatched to all students with pending or lapsing dues.'
      );
      setTimeout(() => setBatchNotice(null), 5000);
    }, 1000);
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
                color: '#15803d',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              MEMBERSHIP LIFECYCLE & DUES ENGINE
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Problem Scene: "A new student joins, dues payment & reminders"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '2px 0 2px 0' }}>
            Digital Membership Sign-ups, Verification & Dues Renewal
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Instant digital pass generation with dues payment, real-time discount entitlements, and automated renewal reminders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSendBatchReminders}
            disabled={isSendingBatch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSendingBatch ? 'wait' : 'pointer',
            }}
          >
            <Send style={{ width: '14px', height: '14px' }} />
            <span>{isSendingBatch ? 'Dispatching...' : 'Broadcast Renewal Reminders'}</span>
          </button>

          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#1e3a8a',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <UserPlus style={{ width: '16px', height: '16px' }} />
            <span>Sign Up New Student</span>
          </button>
        </div>
      </div>

      {batchNotice && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e3a8a',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✓ {batchNotice}
        </div>
      )}

      {registeredNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
            <span>{registeredNotice}</span>
          </div>
          <button
            onClick={() => setRegisteredNotice(null)}
            style={{ background: 'none', border: 'none', color: '#065f46', fontWeight: 700, cursor: 'pointer' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── NEW STUDENT SIGNUP FORM (COLLAPSIBLE) ───────────── */}
      {showRegisterForm && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '2px solid #2563eb',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Campus Table Registration Desk
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Sign up a new student right at the orientation table. Annual dues: ₹250.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterForm(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleStartRegistration} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Full Student Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Rao"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Campus Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. vikram.r@campus.edu"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                College Roll / Registration No.
              </label>
              <input
                type="text"
                placeholder="e.g. 7376241CS109"
                value={newStudent.rollNo}
                onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Department
              </label>
              <select
                value={newStudent.dept}
                onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              >
                <option value="Computer Science">Computer Science & Engineering</option>
                <option value="Information Science">Information Technology</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Design">Visual Design & Arts</option>
              </select>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CreditCard style={{ width: '16px', height: '16px' }} />
                <span>Pay ₹250 & Register</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 2. MAIN LAYOUT: MEMBER ROSTER + DIGITAL PASS PREVIEW ────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Member Directory */}
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
              Registered Student Members Directory ({members.length})
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>
              {activeMemberCount} Dues-Paid Active Members
            </span>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#94a3b8',
              }}
            />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. SSA-2026-0001), or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Membership ID</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Student Name</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Dues Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569' }}>Expires At</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      background: selectedMember.id === m.id ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                      {m.membershipId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{m.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{m.email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {m.duesPaid ? (
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          ✓ Dues Paid
                        </span>
                      ) : (
                        <span
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                        >
                          ⚠️ Overdue
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: m.duesPaid ? '#475569' : '#dc2626', fontSize: '12px' }}>
                      {m.duesExpiresAt}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {!m.duesPaid ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRenewal(m);
                          }}
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
                          Pay Dues
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                          Pass Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Member Digital Card Preview */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award style={{ width: '16px', height: '16px' }} />
                Digital Membership ID Card
              </span>
              <span
                style={{
                  background: selectedMember.duesPaid ? '#dcfce7' : '#fee2e2',
                  color: selectedMember.duesPaid ? '#15803d' : '#dc2626',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {selectedMember.duesPaid ? 'Verified Member' : 'Dues Unpaid'}
              </span>
            </div>

            {/* Member Details */}
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Member Name</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>{selectedMember.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{selectedMember.email}</div>
            </div>

            {/* Pass QR Box */}
            <div
              style={{
                background: 'var(--muted)',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <img
                src="/qr-code.png"
                alt="Membership Pass QR Code"
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto',
                  objectFit: 'contain',
                  borderRadius: '6px',
                  display: 'block',
                }}
              />
              <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a', marginTop: '8px' }}>
                {selectedMember.membershipId}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Valid Thru: {selectedMember.duesExpiresAt}
              </div>
            </div>

            {/* Entitlements Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: selectedMember.duesPaid ? '#15803d' : '#94a3b8' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                <span>60% discount on Gala tickets (₹100 vs ₹250)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: selectedMember.duesPaid ? '#15803d' : '#94a3b8' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                <span>20% off on official club hoodies & T-shirts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: selectedMember.duesPaid ? '#15803d' : '#94a3b8' }}>
                <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                <span>Voting eligibility in annual officer elections</span>
              </div>
            </div>
          </div>

          {/* Renewal Action if unpaid */}
          {!selectedMember.duesPaid && (
            <button
              onClick={() => handleStartRenewal(selectedMember)}
              style={{
                marginTop: '16px',
                padding: '10px',
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <CreditCard style={{ width: '16px', height: '16px' }} />
              <span>Renew Membership (₹250)</span>
            </button>
          )}
        </div>
      </div>

      {/* Razorpay Dues Checkout Modal */}
      {checkoutTarget && (
        <RazorpayPaymentModal
          isOpen={Boolean(checkoutTarget)}
          onClose={() => setCheckoutTarget(null)}
          title={checkoutTarget.title}
          purpose={checkoutTarget.purpose}
          amount={checkoutTarget.amount}
          payerName={checkoutTarget.name}
          payerEmail={checkoutTarget.email}
          onSuccess={(receipt) => {
            if (checkoutTarget.type === 'REGISTER') {
              const created = registerNewMember(
                {
                  name: newStudent.name,
                  email: newStudent.email,
                  tier: newStudent.tier,
                  duesPaid: true,
                  duesExpiresAt: 'May 31, 2027',
                  renewalAlert: false,
                  discountEligible: true,
                },
                receipt
              );
              setRegisteredNotice(
                `Welcome ${created.name}! Digital pass created with ID ${created.membershipId}. Annual dues of ₹250 paid successfully.`
              );
              setShowRegisterForm(false);
              setSelectedMember(created);
            } else if (checkoutTarget.type === 'RENEW' && checkoutTarget.memberId) {
              payMembershipDues(checkoutTarget.memberId, receipt);
              setRegisteredNotice(
                `Membership Renewed! Dues paid for ${checkoutTarget.name}. Valid until May 31, 2027.`
              );
            }
            setCheckoutTarget(null);
          }}
        />
      )}
    </div>
  );
};
