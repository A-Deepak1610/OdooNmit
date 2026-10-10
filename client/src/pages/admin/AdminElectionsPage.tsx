import React, { useState } from 'react';
import {
  Vote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
  Plus,
  Play,
  Square,
  Search,
  Building2,
  TrendingUp,
  Printer,
  FileCheck,
} from 'lucide-react';
import { useClubStore, Candidate } from '../../stores/club.store';
import { useAuthStore } from '../../stores/auth.store';

export const AdminElectionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    clubElections,
    electionAuditLogs,
    createClubElection,
    updateElectionStatus,
    ratifyPresident,
    simulateVote,
  } = useClubStore();

  // Active view filters
  const [activeTab, setActiveTab] = useState<'control' | 'all_elections' | 'decrees' | 'audit'>('control');
  const [selectedElectionId, setSelectedElectionId] = useState<string>(
    clubElections[0]?.id || 'elec-skyline-2026'
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showRatifyModal, setShowRatifyModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [selectedCandidateForRatification, setSelectedCandidateForRatification] = useState<Candidate | null>(null);
  const [ratificationSuccessNotice, setRatificationSuccessNotice] = useState<string | null>(null);
  const [activeDecree, setActiveDecree] = useState<any | null>(null);

  // New Election Form State
  const [newClubName, setNewClubName] = useState('Coding Club & DSC');
  const [newTerm, setNewTerm] = useState('2026 - 2027 Executive Board');
  const [newStartDate, setNewStartDate] = useState('2026-05-01');
  const [newEndDate, setNewEndDate] = useState('2026-05-15');
  const [newQuorum, setNewQuorum] = useState<number>(50);
  const [newEligibleVoters, setNewEligibleVoters] = useState<number>(200);

  // Candidate 1
  const [cand1Name, setCand1Name] = useState('');
  const [cand1Dept, setCand1Dept] = useState('');
  const [cand1Role, setCand1Role] = useState('');
  const [cand1Platform, setCand1Platform] = useState('');

  // Candidate 2
  const [cand2Name, setCand2Name] = useState('');
  const [cand2Dept, setCand2Dept] = useState('');
  const [cand2Role, setCand2Role] = useState('');
  const [cand2Platform, setCand2Platform] = useState('');

  // Get currently selected election
  const currentElection =
    clubElections.find((e) => e.id === selectedElectionId) || clubElections[0];

  // Selected election's President position
  const presidentPosition = currentElection?.positions.find(
    (p) => p.id === 'pos-president' || p.title.toLowerCase().includes('president')
  ) || currentElection?.positions[0];

  // Calculate winner / leader for president position
  const candidatesSorted = presidentPosition
    ? [...presidentPosition.candidates].sort((a, b) => b.votes - a.votes)
    : [];
  const topCandidate = candidatesSorted[0];
  const secondCandidate = candidatesSorted[1];
  const totalPresVotes = presidentPosition
    ? presidentPosition.candidates.reduce((sum, c) => sum + c.votes, 0)
    : 0;
  const voteLead = topCandidate && secondCandidate ? topCandidate.votes - secondCandidate.votes : 0;

  // Turnout stats
  const turnoutPercent = currentElection
    ? Math.round((currentElection.totalBallotsCast / currentElection.totalEligibleVoters) * 100)
    : 0;
  const isQuorumMet = currentElection ? turnoutPercent >= currentElection.quorumPercentage : false;

  // Filtered elections list
  const filteredElections = clubElections.filter((e) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch =
      e.clubName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.term.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // KPI calculations
  const totalElectionsCount = clubElections.length;
  const activeElectionsCount = clubElections.filter((e) => e.status === 'ACTIVE').length;
  const pendingRatificationCount = clubElections.filter((e) => e.status === 'CLOSED').length;
  const totalBallotsAllClubs = clubElections.reduce((sum, e) => sum + e.totalBallotsCast, 0);

  // Handle Ratification
  const handleOpenRatifyModal = (candidate: Candidate) => {
    setSelectedCandidateForRatification(candidate);
    setShowRatifyModal(true);
  };

  const handleConfirmRatification = () => {
    if (!currentElection || !presidentPosition || !selectedCandidateForRatification) return;

    const adminName = user?.name || 'Super Administrator';
    const result = ratifyPresident(
      currentElection.id,
      presidentPosition.id,
      selectedCandidateForRatification.id,
      adminName
    );

    if (result.success) {
      setRatificationSuccessNotice(
        `Presidential appointment ratified: ${result.candidateName} is formally appointed as President of ${currentElection.clubName}!`
      );
      setShowRatifyModal(false);

      // Setup decree certificate
      setActiveDecree({
        candidateName: result.candidateName,
        clubName: currentElection.clubName,
        term: currentElection.term,
        department: selectedCandidateForRatification.department,
        votes: selectedCandidateForRatification.votes,
        totalVotes: totalPresVotes,
        ratifiedBy: adminName,
        ratifiedAt: new Date().toLocaleString(),
        ratificationHash: result.hash,
      });

      setShowCertificateModal(true);
      setTimeout(() => setRatificationSuccessNotice(null), 6000);
    }
  };

  // Handle Create Election
  const handleCreateElectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim() || !cand1Name.trim() || !cand2Name.trim()) {
      alert('Please fill out the club name and both presidential candidates.');
      return;
    }

    const newElectionId = createClubElection({
      clubId: `CLUB-${Date.now()}`,
      clubName: newClubName.trim(),
      term: newTerm.trim(),
      status: 'ACTIVE',
      startDate: newStartDate,
      endDate: newEndDate,
      quorumPercentage: newQuorum,
      totalEligibleVoters: newEligibleVoters,
      positions: [
        {
          id: 'pos-president',
          title: 'Club President',
          description: 'Chief executive officer overseeing organization governance, budget, and activities.',
          candidates: [
            {
              id: `cand-${Date.now()}-1`,
              name: cand1Name.trim(),
              role: cand1Role.trim() || 'Presidential Nominee',
              department: cand1Dept.trim() || 'Engineering',
              year: '3rd Year',
              email: `${cand1Name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
              avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(cand1Name)}&backgroundColor=b6e3f4`,
              platform: cand1Platform.trim() || 'Advancing club initiatives, workshops, and student fellowships.',
              votes: 0,
            },
            {
              id: `cand-${Date.now()}-2`,
              name: cand2Name.trim(),
              role: cand2Role.trim() || 'Presidential Nominee',
              department: cand2Dept.trim() || 'Engineering',
              year: '3rd Year',
              email: `${cand2Name.toLowerCase().replace(/\s+/g, '.')}@campus.edu`,
              avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(cand2Name)}&backgroundColor=ffd5dc`,
              platform: cand2Platform.trim() || 'Fostering innovation, student support, and annual hackathons.',
              votes: 0,
            },
          ],
        },
      ],
    });

    setSelectedElectionId(newElectionId);
    setShowCreateModal(false);
    // Reset inputs
    setCand1Name('');
    setCand1Dept('');
    setCand1Role('');
    setCand1Platform('');
    setCand2Name('');
    setCand2Dept('');
    setCand2Role('');
    setCand2Platform('');
  };

  return (
    <div style={{ fontFamily: 'var(--font-family-body)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '3px 9px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                border: '1px solid #bfdbfe',
                letterSpacing: '0.4px',
              }}
              className="dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              Super Admin Console
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              Institutional Democratic Governance
            </span>
          </div>

          <h1
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--foreground, #0f172a)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
            className="text-slate-900 dark:text-slate-100"
          >
            <Vote style={{ width: '28px', height: '28px', color: '#1e3a8a' }} className="dark:text-blue-400" />
            <span>Annual Officer Elections & Presidential Appointments</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '780px' }} className="text-slate-500 dark:text-slate-400">
            Conduct annual club elections, monitor certified student ballots and turnout quorums in real-time,
            and formally ratify elected Club Presidents into official institutional leadership.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (presidentPosition && topCandidate) {
                simulateVote(currentElection.id, presidentPosition.id, topCandidate.id);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 15px',
              background: '#f8fafc',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
            title="Simulate a verified member vote to preview live tally changes"
          >
            <TrendingUp style={{ width: '15px', height: '15px', color: '#059669' }} />
            <span>Simulate Vote (+1)</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(30,58,138,0.2)',
            }}
            className="hover:bg-blue-900 transition-colors"
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            <span>Conduct Annual Election</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {ratificationSuccessNotice && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            padding: '14px 18px',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 6px rgba(16,185,129,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award style={{ width: '20px', height: '20px', color: '#059669', flexShrink: 0 }} />
            <span>{ratificationSuccessNotice}</span>
          </div>
          <button
            onClick={() => setRatificationSuccessNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 2. Top Executive Metrics KPI Bar (4-columns) ─────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-blue-950 dark:text-blue-300"
          >
            <Building2 style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Chartered Elections
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--foreground, #0f172a)' }}>
              {totalElectionsCount} Cycles
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
              {activeElectionsCount} currently active
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-emerald-950 dark:text-emerald-300"
          >
            <CheckCircle2 style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Ballots Cast
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--foreground, #0f172a)' }}>
              {totalBallotsAllClubs} Ballots
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>100% Cryptographically signed</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-amber-950 dark:text-amber-300"
          >
            <Clock style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Pending Ratification
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#b45309' }}>
              {pendingRatificationCount} Awaiting
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Voting complete & tallied</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#f3e8ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-purple-950 dark:text-purple-300"
          >
            <ShieldCheck style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Voter Quorum Health
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed' }}>
              {turnoutPercent}% Turnout
            </div>
            <div style={{ fontSize: '11px', color: isQuorumMet ? '#15803d' : '#d97706', fontWeight: 600 }}>
              {isQuorumMet ? '✓ Minimum quorum met' : 'Quorum pending'}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Navigation Tabs ────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '2px',
        }}
        className="border-slate-200 dark:border-slate-800"
      >
        <button
          onClick={() => setActiveTab('control')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'control' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'control' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'control' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Vote style={{ width: '16px', height: '16px' }} />
          <span>Election Command Center</span>
        </button>

        <button
          onClick={() => setActiveTab('all_elections')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'all_elections' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'all_elections' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'all_elections' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Building2 style={{ width: '16px', height: '16px' }} />
          <span>All Campus Club Elections ({clubElections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('decrees')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'decrees' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'decrees' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'decrees' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <Award style={{ width: '16px', height: '16px' }} />
          <span>Official Presidential Appointments & Decrees</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            background: activeTab === 'audit' ? '#1e3a8a' : 'transparent',
            color: activeTab === 'audit' ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className={activeTab !== 'audit' ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}
        >
          <ShieldCheck style={{ width: '16px', height: '16px' }} />
          <span>Ballot Integrity & Audit Log</span>
        </button>
      </div>

      {/* ── TAB 1: ELECTION COMMAND CENTER (FOCUS ON PRESIDENT ELECTION) ──── */}
      {activeTab === 'control' && currentElection && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Election Selector & Controls Bar */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Active Election:
              </label>
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: 'var(--input-bg, #ffffff)',
                  color: 'var(--foreground, #0f172a)',
                  outline: 'none',
                  minWidth: '300px',
                }}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                {clubElections.map((elec) => (
                  <option key={elec.id} value={elec.id}>
                    {elec.clubName} — {elec.term} ({elec.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Lifecycle Status Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {currentElection.status === 'ACTIVE' && (
                <button
                  onClick={() => updateElectionStatus(currentElection.id, 'CLOSED')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Conclude voting and finalize certified ballot tallies"
                >
                  <Square style={{ width: '14px', height: '14px' }} />
                  <span>Close Voting Window</span>
                </button>
              )}

              {currentElection.status === 'CLOSED' && (
                <>
                  <button
                    onClick={() => updateElectionStatus(currentElection.id, 'ACTIVE')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Play style={{ width: '14px', height: '14px' }} />
                    <span>Re-open Balloting</span>
                  </button>

                  {topCandidate && (
                    <button
                      onClick={() => handleOpenRatifyModal(topCandidate)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        background: '#15803d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(21,128,61,0.25)',
                      }}
                    >
                      <Award style={{ width: '16px', height: '16px' }} />
                      <span>Ratify Winner & Appoint President</span>
                    </button>
                  )}
                </>
              )}

              {currentElection.status === 'RATIFIED' && (
                <button
                  onClick={() => {
                    setActiveDecree({
                      candidateName: currentElection.appointedPresident?.name || topCandidate?.name,
                      clubName: currentElection.clubName,
                      term: currentElection.term,
                      department: currentElection.appointedPresident?.department || topCandidate?.department,
                      votes: topCandidate?.votes,
                      totalVotes: totalPresVotes,
                      ratifiedBy: currentElection.ratifiedBy || 'Super Administrator',
                      ratifiedAt: currentElection.ratifiedAt || 'Today',
                      ratificationHash: currentElection.appointedPresident?.ratificationHash || 'SHA256-RAT-VERIFIED',
                    });
                    setShowCertificateModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#eff6ff',
                    color: '#1e3a8a',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <FileCheck style={{ width: '15px', height: '15px' }} />
                  <span>View Appointment Certificate</span>
                </button>
              )}
            </div>
          </div>

          {/* Election Profile Hero Banner */}
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              border: '1px solid var(--border-color, #e2e8f0)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                    {currentElection.clubName}
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background:
                        currentElection.status === 'ACTIVE'
                          ? '#dcfce7'
                          : currentElection.status === 'RATIFIED'
                          ? '#eff6ff'
                          : '#fef3c7',
                      color:
                        currentElection.status === 'ACTIVE'
                          ? '#15803d'
                          : currentElection.status === 'RATIFIED'
                          ? '#1e3a8a'
                          : '#b45309',
                    }}
                  >
                    {currentElection.status === 'ACTIVE'
                      ? '● LIVE BALLOTING ACTIVE'
                      : currentElection.status === 'RATIFIED'
                      ? '✓ PRESIDENT RATIFIED & APPOINTED'
                      : '⏳ VOTING CLOSED — PENDING RATIFICATION'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Academic Term: <strong>{currentElection.term}</strong> • Window: {currentElection.startDate} to {currentElection.endDate}
                </p>
              </div>

              {/* Turnout Quorum Status Gauge */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  minWidth: '280px',
                }}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Turnout Quorum ({turnoutPercent}%)</span>
                  <span style={{ color: isQuorumMet ? '#15803d' : '#d97706' }}>
                    {isQuorumMet ? '✓ Quorum Met (≥50%)' : 'Quorum Pending'}
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }} className="dark:bg-slate-700">
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(turnoutPercent, 100)}%`,
                      background: isQuorumMet ? '#15803d' : '#d97706',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{currentElection.totalBallotsCast} Ballots Cast</span>
                  <span>{currentElection.totalEligibleVoters} Eligible Dues-Paid Members</span>
                </div>
              </div>
            </div>

            {/* Official Presidential Ratification Banner if Ratified */}
            {currentElection.status === 'RATIFIED' && currentElection.appointedPresident && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
                className="dark:bg-slate-800 dark:border-blue-900"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#1e3a8a',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Award style={{ width: '26px', height: '26px' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                      Certified Presidential Decree Issued
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }} className="dark:text-slate-100">
                      {currentElection.appointedPresident.name} is the Appointed President
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      Department: {currentElection.appointedPresident.department} • Ratified by {currentElection.ratifiedBy} on {currentElection.appointedPresident.appointedAt}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', background: 'white', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    Hash: {currentElection.appointedPresident.ratificationHash}
                  </div>
                </div>
              </div>
            )}

            {/* ── CLUB PRESIDENTIAL CANDIDATES SECTION ──────────────────── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                    Club President — Nominated Candidates & Certified Ballot Standings
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                    {totalPresVotes} verified ballots recorded for the office of Club President.
                    {voteLead > 0 && ` Current leader has a ${voteLead}-vote margin.`}
                  </p>
                </div>

                {currentElection.status === 'ACTIVE' && (
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    Live Ballot Streaming Active
                  </span>
                )}
              </div>

              {/* Candidate Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '18px',
                }}
              >
                {presidentPosition?.candidates.map((cand, idx) => {
                  const votePercentage = totalPresVotes > 0 ? Math.round((cand.votes / totalPresVotes) * 100) : 0;
                  const isTopVoteGetter = idx === 0 && cand.votes > 0;
                  const isRatifiedPresident = currentElection.appointedPresident?.name === cand.name;

                  return (
                    <div
                      key={cand.id}
                      style={{
                        borderRadius: '12px',
                        border: isRatifiedPresident
                          ? '2px solid #16a34a'
                          : isTopVoteGetter
                          ? '2px solid #2563eb'
                          : '1px solid var(--border-color, #e2e8f0)',
                        background: isRatifiedPresident
                          ? '#f0fdf4'
                          : isTopVoteGetter
                          ? '#f8fafc'
                          : 'var(--card-bg, #ffffff)',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        position: 'relative',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      }}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    >
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {isRatifiedPresident ? (
                          <span
                            style={{
                              background: '#15803d',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Award style={{ width: '12px', height: '12px' }} />
                            OFFICIAL APPOINTED PRESIDENT
                          </span>
                        ) : isTopVoteGetter ? (
                          <span
                            style={{
                              background: '#2563eb',
                              color: 'white',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <TrendingUp style={{ width: '12px', height: '12px' }} />
                            LEADING CANDIDATE (+{voteLead})
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            Nominated Candidate #{idx + 1}
                          </span>
                        )}

                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                          {cand.votes} Votes ({votePercentage}%)
                        </span>
                      </div>

                      {/* Candidate Avatar & Bio */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={cand.avatar}
                          alt={cand.name}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e2e8f0',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--foreground, #0f172a)' }}>
                            {cand.name}
                          </h4>
                          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                            {cand.role}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {cand.department} • {cand.year || '3rd Year'}
                          </div>
                        </div>
                      </div>

                      {/* Platform / Manifesto Statement */}
                      <div
                        style={{
                          background: 'rgba(0,0,0,0.02)',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          fontSize: '12px',
                          lineHeight: 1.5,
                          color: '#334155',
                          fontStyle: 'italic',
                          borderLeft: '3px solid #2563eb',
                        }}
                        className="dark:text-slate-300 dark:bg-slate-800"
                      >
                        "{cand.platform}"
                      </div>

                      {/* Live Vote Share Progress Bar */}
                      <div>
                        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }} className="dark:bg-slate-700">
                          <div
                            style={{
                              height: '100%',
                              width: `${votePercentage}%`,
                              background: isRatifiedPresident ? '#15803d' : isTopVoteGetter ? '#2563eb' : '#64748b',
                              borderRadius: '4px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>

                      {/* Action Button: Ratify or Test Vote */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                        <button
                          onClick={() => simulateVote(currentElection.id, presidentPosition.id, cand.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#334155',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                          }}
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          <span>+1 Ballot Test</span>
                        </button>

                        {currentElection.status !== 'RATIFIED' && (
                          <button
                            onClick={() => handleOpenRatifyModal(cand)}
                            style={{
                              flex: 1.5,
                              padding: '8px 14px',
                              borderRadius: '6px',
                              border: 'none',
                              background: isTopVoteGetter ? '#15803d' : '#1e3a8a',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <Award style={{ width: '14px', height: '14px' }} />
                            <span>Ratify & Appoint</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Positions (e.g. Treasurer) */}
            {currentElection.positions.length > 1 && (
              <div style={{ borderTop: '1px solid var(--border-color, #e2e8f0)', paddingTop: '18px' }} className="border-slate-200 dark:border-slate-800">
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
                  Other Executive Positions in This Election Cycle
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {currentElection.positions
                    .filter((p) => p.id !== presidentPosition?.id)
                    .map((pos) => {
                      const totalPosVotes = pos.candidates.reduce((sum, c) => sum + c.votes, 0);
                      const leader = [...pos.candidates].sort((a, b) => b.votes - a.votes)[0];
                      return (
                        <div
                          key={pos.id}
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '14px 16px',
                            border: '1px solid #e2e8f0',
                          }}
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        >
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground, #0f172a)' }}>
                            {pos.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                            {totalPosVotes} votes cast • {pos.candidates.length} candidates
                          </div>
                          {leader && (
                            <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 600 }}>
                              Current Leader: <strong>{leader.name}</strong> ({leader.votes} votes)
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: ALL CAMPUS CLUB ELECTIONS TABLE ───────────────────── */}
      {activeTab === 'all_elections' && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          {/* Filter Bar */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
            className="border-slate-100 dark:border-slate-800"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '15px',
                    height: '15px',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search club or cycle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '12px',
                    outline: 'none',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #0f172a)',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'var(--input-bg, #ffffff)',
                  color: 'var(--foreground, #0f172a)',
                  outline: 'none',
                }}
                className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Live Balloting Active</option>
                <option value="CLOSED">Closed (Awaiting Ratification)</option>
                <option value="RATIFIED">President Ratified</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#1e3a8a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              <span>Charter New Election</span>
            </button>
          </div>

          {/* Elections Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }} className="dark:bg-slate-800 dark:border-slate-700">
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>CAMPUS ORGANIZATION</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ACADEMIC TERM</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>VOTER TURNOUT</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ELECTED / LEADING PRESIDENT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredElections.map((elec) => {
                  const presPos = elec.positions.find((p) => p.title.toLowerCase().includes('president')) || elec.positions[0];
                  const leader = presPos ? [...presPos.candidates].sort((a, b) => b.votes - a.votes)[0] : null;
                  const turnout = Math.round((elec.totalBallotsCast / elec.totalEligibleVoters) * 100);

                  return (
                    <tr
                      key={elec.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--foreground, #0f172a)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 style={{ width: '16px', height: '16px', color: '#1e3a8a' }} className="dark:text-blue-400" />
                          <span>{elec.clubName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 14px', color: '#475569' }}>{elec.term}</td>
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background:
                              elec.status === 'ACTIVE'
                                ? '#dcfce7'
                                : elec.status === 'RATIFIED'
                                ? '#eff6ff'
                                : '#fef3c7',
                            color:
                              elec.status === 'ACTIVE'
                                ? '#15803d'
                                : elec.status === 'RATIFIED'
                                ? '#1e3a8a'
                                : '#b45309',
                          }}
                        >
                          {elec.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700 }}>
                            {turnout}% ({elec.totalBallotsCast}/{elec.totalEligibleVoters})
                          </span>
                          <span style={{ fontSize: '11px', color: turnout >= elec.quorumPercentage ? '#15803d' : '#d97706' }}>
                            {turnout >= elec.quorumPercentage ? 'Quorum Met' : 'Quorum Pending'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        {elec.appointedPresident ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700 }}>
                            <Award style={{ width: '14px', height: '14px' }} />
                            <span>{elec.appointedPresident.name} (Ratified)</span>
                          </div>
                        ) : leader ? (
                          <div style={{ color: '#1e293b', fontWeight: 600 }}>
                            {leader.name} ({leader.votes} votes)
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            setSelectedElectionId(elec.id);
                            setActiveTab('control');
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#1e3a8a',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-blue-400"
                        >
                          Inspect & Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: OFFICIAL PRESIDENTIAL APPOINTMENTS & DECREES ───────── */}
      {activeTab === 'decrees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '12px',
              padding: '20px 24px',
              border: '1px solid var(--border-color, #e2e8f0)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--foreground, #0f172a)' }}>
              Registry of Ratified Club Presidents
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Official record of student leaders whose election victory was vetted and ratified by the Super Administrator.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
            }}
          >
            {clubElections
              .filter((e) => e.appointedPresident)
              .map((elec) => {
                const app = elec.appointedPresident!;
                return (
                  <div
                    key={elec.id}
                    style={{
                      background: 'var(--card-bg, #ffffff)',
                      borderRadius: '14px',
                      border: '1px solid #bfdbfe',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                    className="bg-white dark:bg-slate-900 dark:border-blue-900"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#1e3a8a',
                          background: '#eff6ff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        OFFICIAL APPOINTMENT
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Term: {app.term}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#1e3a8a',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Award style={{ width: '26px', height: '26px' }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--foreground, #0f172a)' }}>
                          {app.name}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                          President — {elec.clubName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {app.department} • {app.email}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        fontSize: '11px',
                        color: '#475569',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all',
                      }}
                      className="bg-slate-50 dark:bg-slate-800"
                    >
                      Certificate Seal: {app.ratificationHash}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 'auto' }}>
                      Ratified on {app.appointedAt} by Super Administrator
                    </div>

                    <button
                      onClick={() => {
                        setActiveDecree({
                          candidateName: app.name,
                          clubName: elec.clubName,
                          term: app.term,
                          department: app.department,
                          votes: elec.positions[0]?.candidates[0]?.votes || 148,
                          totalVotes: elec.totalBallotsCast,
                          ratifiedBy: elec.ratifiedBy || 'Super Administrator',
                          ratifiedAt: app.appointedAt,
                          ratificationHash: app.ratificationHash,
                        });
                        setShowCertificateModal(true);
                      }}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        background: '#1e3a8a',
                        color: 'white',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <FileCheck style={{ width: '14px', height: '14px' }} />
                      <span>View & Print Formal Decree</span>
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── TAB 4: CRYPTOGRAPHIC BALLOT INTEGRITY & AUDIT LOG ───────── */}
      {activeTab === 'audit' && (
        <div
          style={{
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
          }}
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        >
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            className="border-slate-100 dark:border-slate-800"
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                Immutable Election Audit Ledger
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Every vote cast and administrative decree is cryptographically hashed with timestamp verification.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
              <ShieldCheck style={{ width: '16px', height: '16px' }} />
              <span>Tamper-Resistant</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }} className="dark:bg-slate-800 dark:border-slate-700">
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>EVENT TYPE</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>ACTOR</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>DETAILS</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>VERIFICATION HASH</th>
                </tr>
              </thead>
              <tbody>
                {electionAuditLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                    className="border-slate-100 dark:border-slate-800"
                  >
                    <td style={{ padding: '12px 18px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            log.action.includes('RATIFIED')
                              ? '#dcfce7'
                              : log.action.includes('BALLOT')
                              ? '#eff6ff'
                              : '#f1f5f9',
                          color:
                            log.action.includes('RATIFIED')
                              ? '#15803d'
                              : log.action.includes('BALLOT')
                              ? '#1e3a8a'
                              : '#475569',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--foreground, #0f172a)' }}>
                      {log.actor}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{log.details}</td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{log.timestamp}</td>
                    <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontSize: '11px', color: '#2563eb' }}>
                      {log.hash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: CONDUCT NEW ELECTION ───────────────────────────── */}
      {showCreateModal && (
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
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Charter New Annual Club Election
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Initialize an official election cycle for an academic club or society.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateElectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                  Target Campus Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coding Club & DSC, Campus Robotics, IEEE"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '13px',
                    outline: 'none',
                    background: 'var(--input-bg, #ffffff)',
                    color: 'var(--foreground, #0f172a)',
                  }}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Academic Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '13px',
                      outline: 'none',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--foreground, #0f172a)',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Eligible Member Electorate *
                  </label>
                  <input
                    type="number"
                    min={10}
                    value={newEligibleVoters}
                    onChange={(e) => setNewEligibleVoters(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '13px',
                      outline: 'none',
                      background: 'var(--input-bg, #ffffff)',
                      color: 'var(--foreground, #0f172a)',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    Quorum Threshold (%)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={100}
                    value={newQuorum}
                    onChange={(e) => setNewQuorum(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Candidate 1 Section */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' }}>
                  Candidate 1 for Club President *
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Ramesh K)"
                    value={cand1Name}
                    onChange={(e) => setCand1Name(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    className="bg-white dark:bg-slate-750"
                  />
                  <input
                    type="text"
                    placeholder="Department (e.g. CSE 3rd Year)"
                    value={cand1Dept}
                    onChange={(e) => setCand1Dept(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    className="bg-white dark:bg-slate-750"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Manifesto Platform (e.g. Transparent accounting, open workshops)"
                  value={cand1Platform}
                  onChange={(e) => setCand1Platform(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  className="bg-white dark:bg-slate-750"
                />
              </div>

              {/* Candidate 2 Section */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px' }}>
                  Candidate 2 for Club President *
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Ananya Roy)"
                    value={cand2Name}
                    onChange={(e) => setCand2Name(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    className="bg-white dark:bg-slate-750"
                  />
                  <input
                    type="text"
                    placeholder="Department (e.g. ECE 3rd Year)"
                    value={cand2Dept}
                    onChange={(e) => setCand2Dept(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                    className="bg-white dark:bg-slate-750"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Manifesto Platform (e.g. Industry mentors, community hackathons)"
                  value={cand2Platform}
                  onChange={(e) => setCand2Platform(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                  className="bg-white dark:bg-slate-750"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Authorize & Charter Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RATIFY & APPOINT PRESIDENT MODAL ────────────────── */}
      {showRatifyModal && selectedCandidateForRatification && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color, #e2e8f0)',
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award style={{ width: '24px', height: '24px', color: '#15803d' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--foreground, #0f172a)' }}>
                  Ratify Presidential Appointment
                </h3>
              </div>
              <button
                onClick={() => setShowRatifyModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                As Super Administrator, you are formally ratifying the democratic election results and appointing the certified winning candidate as the executive <strong>Club President</strong>.
              </p>

              {/* Nominee Profile summary */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              >
                <img
                  src={selectedCandidateForRatification.avatar}
                  alt={selectedCandidateForRatification.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }} className="dark:text-slate-100">
                    {selectedCandidateForRatification.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600 }}>
                    Target Role: President — {currentElection?.clubName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {selectedCandidateForRatification.votes} Ballots Won ({totalPresVotes > 0 ? Math.round((selectedCandidateForRatification.votes / totalPresVotes) * 100) : 0}% of certified vote)
                  </div>
                </div>
              </div>

              {/* Legal confirmation checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                  <span>Verified 100% dues-paid voter eligibility criteria</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                  <span>Quorum requirements fulfilled (§4 Constitution Bylaw)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                  <span>Authorizes presidential role access in platform RBAC matrix</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowRatifyModal(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: '1px solid #cbd5e1',
                    background: 'transparent',
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRatification}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    background: '#15803d',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(21,128,61,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Award style={{ width: '16px', height: '16px' }} />
                  <span>Authorize Presidential Decree</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: OFFICIAL PRESIDENTIAL APPOINTMENT CERTIFICATE ───── */}
      {showCertificateModal && activeDecree && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '4px double #1e3a8a',
              width: '100%',
              maxWidth: '650px',
              padding: '36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => setShowCertificateModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#94a3b8',
              }}
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(30,58,138,0.3)',
                }}
              >
                <Award style={{ width: '36px', height: '36px' }} />
              </div>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '1px', textTransform: 'uppercase' }}>
              INSTITUTIONAL STUDENT SENATE & ADMINISTRATIVE BOARD
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: '6px 0 16px 0', fontFamily: 'serif' }}>
              Certificate of Presidential Appointment
            </h2>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 20px auto' }}>
              By virtue of democratic election pursuant to institutional bylaws and certification of certified student voter ballots, this official charter appoints
            </div>

            {/* Candidate Name highlight */}
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#1e3a8a', textDecoration: 'underline', marginBottom: '8px' }}>
              {activeDecree.candidateName}
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
              As Club President of <u>{activeDecree.clubName}</u>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>
              For Academic Tenure <strong>{activeDecree.term}</strong> • Certified Ballots: {activeDecree.votes} of {activeDecree.totalVotes}
            </div>

            {/* Signatures & Seal Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '20px',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Ratified & Authorized By:</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{activeDecree.ratifiedBy}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Super Administrator, Campus Governance</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Cryptographic Hash:</div>
                <div style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: '#1e3a8a' }}>
                  {activeDecree.ratificationHash}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Issued: {activeDecree.ratifiedAt}</div>
              </div>
            </div>

            {/* Bottom button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  color: '#334155',
                }}
              >
                <Printer style={{ width: '15px', height: '15px' }} />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                style={{
                  padding: '9px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1e3a8a',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
