import React, { useState } from 'react';
import {
  UserCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  Sparkles,
  Building2,
  ShieldCheck,
  ArrowRight,
  Vote,
  Ticket,
  ShoppingBag,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { useAuthStore } from '../../../stores/auth.store';
import { RazorpayPaymentModal } from '../../shared/RazorpayPaymentModal';
import { INITIAL_CLUBS } from '../../../pages/admin/data/clubs';

export const StudentMembershipModule: React.FC = () => {
  const { user } = useAuthStore();
  const { members, annualDuesAmount, registerNewMember, renewMembership } = useClubStore();

  const [activeTab, setActiveTab] = useState<'status' | 'register'>('status');

  // Registration Form State
  const [selectedClub, setSelectedClub] = useState(INITIAL_CLUBS[0].name);
  const [studentName, setStudentName] = useState(user?.name || 'Deepak Kumar');
  const [studentEmail, setStudentEmail] = useState(user?.email || 'deepaka.ad24@bitsathy.ac.in');
  const [rollNo, setRollNo] = useState('24CS108');
  const [dept, setDept] = useState('Computer Science & Engineering');

  // Razorpay Checkout Trigger State
  const [checkoutTarget, setCheckoutTarget] = useState<{
    type: 'REGISTER' | 'RENEW';
    memberId?: string;
    name: string;
    email: string;
    amount: number;
    title: string;
    purpose: string;
  } | null>(null);

  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  // Match current student's membership or fallback to first mock member
  const currentMember =
    members.find(
      (m) =>
        m.email.toLowerCase() === user?.email?.toLowerCase() ||
        m.name.toLowerCase() === user?.name?.toLowerCase()
    ) || members[0];

  const handleStartRenewal = () => {
    setCheckoutTarget({
      type: 'RENEW',
      memberId: currentMember.id,
      name: currentMember.name,
      email: currentMember.email,
      amount: annualDuesAmount,
      title: `Renew Annual Membership: ${currentMember.name}`,
      purpose: `Annual Membership Renewal (2026-2027) for ${currentMember.membershipId}`,
    });
  };

  const handleStartRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail) return;

    setCheckoutTarget({
      type: 'REGISTER',
      name: studentName,
      email: studentEmail,
      amount: annualDuesAmount,
      title: `Join ${selectedClub} & Annual Dues`,
      purpose: `New Membership Enrollment & Dues for ${selectedClub}`,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. HEADER ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
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
              MEMBERSHIP GOVERNANCE
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Annual Dues: ₹{annualDuesAmount} • Secure Razorpay Verification
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
            Membership Status, Benefits & Registration
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '640px' }}>
            Check your active club membership card, view entitlement discounts, renew annual dues, or register for campus organizations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('status')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeTab === 'status' ? 700 : 500,
              border: activeTab === 'status' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'status' ? '#1e3a8a' : '#ffffff',
              color: activeTab === 'status' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <UserCheck style={{ width: '15px', height: '15px' }} />
            <span>My Membership & Benefits</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: activeTab === 'register' ? 700 : 500,
              border: activeTab === 'register' ? '1px solid #1e3a8a' : '1px solid #cbd5e1',
              backgroundColor: activeTab === 'register' ? '#1e3a8a' : '#ffffff',
              color: activeTab === 'register' ? '#ffffff' : '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CreditCard style={{ width: '15px', height: '15px' }} />
            <span>Register for Organization</span>
          </button>
        </div>
      </div>

      {alertNotice && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#15803d',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px' }} />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* ── TAB 1: MY MEMBERSHIP STATUS & BENEFITS ───────────────── */}
      {activeTab === 'status' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) minmax(360px, 1fr)', gap: '20px' }}>
          {/* DIGITAL MEMBERSHIP CARD */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* CARD TOP BRAND */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                padding: '24px 20px',
                color: '#ffffff',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    CAMPUS MITRA • CHARTERED CLUB
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 2px 0' }}>
                    Skyline Student Association
                  </h3>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    Annual Member Identification
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: currentMember.duesPaid ? '#dcfce7' : '#fee2e2',
                    color: currentMember.duesPaid ? '#15803d' : '#b91c1c',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 style={{ width: '12px', height: '12px' }} />
                  {currentMember.duesPaid ? 'ACTIVE' : 'DUES PENDING'}
                </div>
              </div>
            </div>

            {/* CARD BODY: QR & DETAILS */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QrCode style={{ width: '70px', height: '70px', color: '#0f172a' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                    {currentMember.name}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    {currentMember.email}
                  </div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: 700, color: '#1e3a8a' }}>
                    ID: {currentMember.membershipId}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Membership Tier:</span>
                  <strong style={{ color: '#0f172a' }}>{currentMember.tier} Membership</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Discount Entitlement:</span>
                  <span style={{ color: currentMember.discountEligible ? '#15803d' : '#b45309', fontWeight: 600 }}>
                    {currentMember.discountEligible ? '20% Member Rates Active' : 'Standard Rate'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Membership Expiry Date:</span>
                  <strong style={{ color: '#15803d' }}>{currentMember.duesExpiresAt}</strong>
                </div>
              </div>

              {/* RENEWAL CALL TO ACTION */}
              <button
                type="button"
                onClick={handleStartRenewal}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(21, 128, 61, 0.25)',
                }}
              >
                <Sparkles style={{ width: '15px', height: '15px' }} />
                <span>Renew Membership (₹250 via Razorpay)</span>
              </button>
            </div>
          </div>

          {/* BENEFITS & PRIVILEGES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
              }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Your Unlocked Member Benefits & Perks
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                Having an active membership with paid annual dues unlocks full participation in club governance and campus privileges.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <Ticket style={{ width: '20px', height: '20px', color: '#1e40af', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#1e3a8a', display: 'block', marginBottom: '2px' }}>
                      20% Discount on Event Tickets
                    </strong>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      Pay ₹150 for Spring Gala instead of the ₹250 general non-member rate.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f3e8ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <Vote style={{ width: '20px', height: '20px', color: '#7c3aed', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#6b21a8', display: 'block', marginBottom: '2px' }}>
                      Democratic Voting Eligibility
                    </strong>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      Only members with paid dues can vote for President & Treasurer elections.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <ShoppingBag style={{ width: '20px', height: '20px', color: '#b45309', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#92400e', display: 'block', marginBottom: '2px' }}>
                      Priority Merchandise Access
                    </strong>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      First reservation rights on embroidered hoodies and limited edition stickers.
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <ShieldCheck style={{ width: '20px', height: '20px', color: '#15803d', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#14532d', display: 'block', marginBottom: '2px' }}>
                      Member-Only Announcements
                    </strong>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      Direct updates on venue changes, project grants, and leadership nominations.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: REGISTER FOR AN ORGANIZATION ──────────────────── */}
      {activeTab === 'register' && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '28px',
            maxWidth: '680px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#1e3a8a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
              }}
            >
              <Building2 style={{ width: '26px', height: '26px' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Register for Campus Organization
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Complete the form below and settle annual membership dues (₹250) via Razorpay standard dialog.
            </p>
          </div>

          <form onSubmit={handleStartRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Select Organization
              </label>
              <select
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              >
                {INITIAL_CLUBS.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.category}) — Dues ₹{c.duesAmount}/yr
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Total Payable Dues</span>
                <strong style={{ fontSize: '18px', color: '#15803d' }}>₹250.00</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right' }}>
                Instant Gateway Token Generation<br />
                Secured by Razorpay India
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '13px',
                backgroundColor: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.25)',
              }}
            >
              <span>Pay Annual Dues (₹250) & Register via Razorpay</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </form>
        </div>
      )}

      {/* RAZORPAY CHECKOUT MODAL */}
      {checkoutTarget && (
        <RazorpayPaymentModal
          isOpen={true}
          onClose={() => setCheckoutTarget(null)}
          title={checkoutTarget.title}
          purpose={checkoutTarget.purpose}
          amount={checkoutTarget.amount}
          payerName={checkoutTarget.name}
          payerEmail={checkoutTarget.email}
          onSuccess={(receipt) => {
            if (checkoutTarget.type === 'RENEW' && checkoutTarget.memberId) {
              renewMembership(checkoutTarget.memberId, receipt);
              setAlertNotice(
                `Membership Renewed! Annual dues of ₹250 paid via Razorpay (Payment ID: ${receipt.paymentId}). Validity extended to Dec 31, 2027.`
              );
            } else {
              const created = registerNewMember(
                {
                  name: studentName,
                  email: studentEmail,
                  tier: 'STANDARD',
                  duesPaid: true,
                  duesExpiresAt: 'December 31, 2026',
                  renewalAlert: false,
                  discountEligible: true,
                },
                receipt
              );
              setAlertNotice(
                `Welcome ${created.name}! Digital pass created with ID ${created.membershipId}. Annual dues of ₹250 paid via Razorpay.`
              );
              setActiveTab('status');
            }
            setCheckoutTarget(null);
          }}
        />
      )}
    </div>
  );
};
