import React, { useState } from 'react';
import {
  Vote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useClubStore } from '../../../stores/club.store';
import { useAuthStore } from '../../../stores/auth.store';
import { RazorpayPaymentModal } from '../../shared/RazorpayPaymentModal';

export const ElectionsVotingModule: React.FC = () => {
  const { user } = useAuthStore();
  const { elections, members, castBallot, payMembershipDues } = useClubStore();

  const [selectedCandidate, setSelectedCandidate] = useState<Record<string, string>>({});
  const [ballotReceipt, setBallotReceipt] = useState<{ positionTitle: string; receiptToken: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDuesModal, setShowDuesModal] = useState(false);

  // Check current user's membership and dues status
  const currentMember = members.find(
    (m) =>
      m.email.toLowerCase() === user?.email?.toLowerCase() ||
      m.name.toLowerCase() === user?.name?.toLowerCase()
  ) || members[0]; // fallback to first mock member for showcase

  const isEligibleVoter = currentMember?.duesPaid === true;

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    if (elections.userVotedPositions[positionId]) return;
    setSelectedCandidate((prev) => ({ ...prev, [positionId]: candidateId }));
    setErrorMessage(null);
  };

  const handleCastVote = (positionId: string, positionTitle: string) => {
    const candidateId = selectedCandidate[positionId];
    if (!candidateId) {
      setErrorMessage('Please select a candidate before casting your ballot.');
      return;
    }

    if (!isEligibleVoter) {
      setErrorMessage('Only club members with paid annual dues are eligible to cast ballots.');
      return;
    }

    const result = castBallot(positionId, candidateId, currentMember.id);
    if (result.success && result.receiptToken) {
      setBallotReceipt({
        positionTitle,
        receiptToken: result.receiptToken,
      });
      setErrorMessage(null);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const turnoutPercentage = Math.round(
    (elections.totalBallotsCast / elections.totalEligibleVoters) * 100
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── 1. ELECTIONS HEADER ────────────────────────────────────────── */}
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
                color: '#7c3aed',
                background: '#f3e8ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              DEMOCRATIC GOVERNANCE
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Academic Term: {elections.term}
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
            Annual Executive Officer Elections
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '650px' }}>
            Every spring semester, club members elect new leadership. Certified ballots are cryptographically recorded and results updated live.
          </p>
        </div>

        {/* Turnout Statistics Badge */}
        <div
          style={{
            background: 'var(--muted)',
            padding: '12px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Voter Turnout
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>
              {turnoutPercentage}%
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Total Ballots Cast</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
              {elections.totalBallotsCast} of {elections.totalEligibleVoters} members
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. VOTER ELIGIBILITY BANNER ─────────────────────────────────── */}
      <div
        style={{
          background: isEligibleVoter ? '#f0fdf4' : '#fffbeb',
          border: isEligibleVoter ? '1px solid #bbf7d0' : '1px solid #fde68a',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isEligibleVoter ? (
            <ShieldCheck style={{ width: '24px', height: '24px', color: '#16a34a', flexShrink: 0 }} />
          ) : (
            <AlertCircle style={{ width: '24px', height: '24px', color: '#d97706', flexShrink: 0 }} />
          )}
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isEligibleVoter ? '#166534' : '#92400e',
              }}
            >
              {isEligibleVoter
                ? `Voter Status: Active Member (${currentMember?.name}) — Eligible to Vote`
                : `Voter Status: Dues Pending (${currentMember?.name}) — Ineligible to Vote`}
            </div>
            <div style={{ fontSize: '12px', color: isEligibleVoter ? '#15803d' : '#b45309' }}>
              {isEligibleVoter
                ? `Membership ID: ${currentMember?.membershipId} • Valid until ${currentMember?.duesExpiresAt}. You are entitled to 1 vote per executive office.`
                : 'Constitution Bylaw §4: Annual dues (₹250) must be paid to unlock voting rights and elect club officers.'}
            </div>
          </div>
        </div>

        {!isEligibleVoter && (
          <button
            onClick={() => setShowDuesModal(true)}
            style={{
              padding: '8px 16px',
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CreditCard style={{ width: '16px', height: '16px' }} />
            <span>Pay Dues (₹250) to Vote</span>
          </button>
        )}
      </div>

      {/* Ballot Success Notice */}
      {ballotReceipt && (
        <div
          style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
                Official Ballot Recorded for {ballotReceipt.positionTitle}!
              </span>
              <div style={{ fontSize: '12px', color: '#3b82f6', fontFamily: 'monospace' }}>
                Ballot Verification Token: {ballotReceipt.receiptToken}
              </div>
            </div>
          </div>
          <button
            onClick={() => setBallotReceipt(null)}
            style={{ background: 'none', border: 'none', color: '#1e3a8a', cursor: 'pointer', fontWeight: 600 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* ── 3. BALLOTS BY POSITION ─────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {elections.positions.map((pos) => {
          const alreadyVotedCandidateId = elections.userVotedPositions[pos.id];
          const hasVotedThisPosition = Boolean(alreadyVotedCandidateId);
          const totalVotesForPosition = pos.candidates.reduce((sum, c) => sum + c.votes, 0);

          return (
            <div
              key={pos.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                    {pos.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    {pos.description}
                  </p>
                </div>

                {hasVotedThisPosition && (
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    Ballot Cast
                  </span>
                )}
              </div>

              {/* Candidate Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {pos.candidates.map((cand) => {
                  const isSelected = selectedCandidate[pos.id] === cand.id;
                  const isVotedWinner = alreadyVotedCandidateId === cand.id;
                  const votePercentage = totalVotesForPosition > 0
                    ? Math.round((cand.votes / totalVotesForPosition) * 100)
                    : 0;

                  return (
                    <div
                      key={cand.id}
                      onClick={() => !hasVotedThisPosition && handleSelectCandidate(pos.id, cand.id)}
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        border: isVotedWinner
                          ? '2px solid #16a34a'
                          : isSelected
                          ? '2px solid #2563eb'
                          : '1px solid #e2e8f0',
                        backgroundColor: isVotedWinner
                          ? '#f0fdf4'
                          : isSelected
                          ? '#eff6ff'
                          : '#ffffff',
                        cursor: hasVotedThisPosition ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        position: 'relative',
                      }}
                    >
                      {/* Candidate Avatar & Bio */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                            {cand.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                            {cand.role}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {cand.department}
                          </div>
                        </div>
                      </div>

                      {/* Manifesto Statement */}
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#334155',
                          lineHeight: 1.5,
                          background: 'rgba(0,0,0,0.02)',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          fontStyle: 'italic',
                        }}
                      >
                        "{cand.platform}"
                      </div>

                      {/* Live Tally Bar */}
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                          <span style={{ color: '#64748b' }}>Live Count</span>
                          <span style={{ color: '#1e293b' }}>{cand.votes} votes ({votePercentage}%)</span>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${votePercentage}%`,
                              background: isVotedWinner ? '#16a34a' : '#2563eb',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {!hasVotedThisPosition && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '6px',
                            borderRadius: '6px',
                            background: isSelected ? '#2563eb' : '#f1f5f9',
                            color: isSelected ? '#ffffff' : '#64748b',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          <Vote style={{ width: '14px', height: '14px' }} />
                          <span>{isSelected ? 'Selected for Ballot' : 'Click to Select Candidate'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Cast Vote Action Button */}
              {!hasVotedThisPosition && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    onClick={() => handleCastVote(pos.id, pos.title)}
                    disabled={!selectedCandidate[pos.id] || !isEligibleVoter}
                    style={{
                      padding: '10px 22px',
                      background: selectedCandidate[pos.id] && isEligibleVoter ? '#1e3a8a' : '#94a3b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: selectedCandidate[pos.id] && isEligibleVoter ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Vote style={{ width: '16px', height: '16px' }} />
                    <span>Cast Official Ballot for {pos.title}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dues Payment Modal */}
      <RazorpayPaymentModal
        isOpen={showDuesModal}
        onClose={() => setShowDuesModal(false)}
        title="Annual Membership Dues & Voting Activation"
        purpose="Annual Membership Dues (2026-2027) with Executive Voting Rights"
        amount={250}
        payerName={currentMember?.name}
        payerEmail={currentMember?.email}
        onSuccess={(receipt) => {
          payMembershipDues(currentMember?.id || 'mem-001', receipt);
          setShowDuesModal(false);
        }}
      />
    </div>
  );
};
