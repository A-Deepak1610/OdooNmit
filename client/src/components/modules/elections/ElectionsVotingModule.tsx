import React, { useState, useEffect, useMemo } from 'react';
import {
  Vote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Calendar,
  Trophy,
  Award,
  Search,
  X,
  Plus,
  RefreshCw,
  FilterX,
  Check,
  Loader2,
} from 'lucide-react';
import {
  studentService,
  StudentElectionItem,
  StudentCandidateItem,
} from '../../../services/student.service';
import { useAuthStore } from '../../../stores/auth.store';

export const ElectionsVotingModule: React.FC = () => {
  const { user } = useAuthStore();

  // State
  const [elections, setElections] = useState<StudentElectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VOTING_OPEN' | 'NOMINATION_OPEN' | 'COMPLETED'>('ALL');

  // Candidate selection per election before casting
  const [selectedCandidate, setSelectedCandidate] = useState<Record<string, string>>({});

  // Ballot confirmation modal
  const [confirmVoteModal, setConfirmVoteModal] = useState<{
    open: boolean;
    election: StudentElectionItem | null;
    candidate: StudentCandidateItem | null;
  }>({
    open: false,
    election: null,
    candidate: null,
  });

  // Digital Ballot Receipt modal
  const [ballotReceipt, setBallotReceipt] = useState<{
    electionTitle: string;
    clubName: string;
    candidateName: string;
    receiptId: string;
    timestamp: string;
    voterName: string;
  } | null>(null);

  // Apply for President Nomination modal
  const [nominationModal, setNominationModal] = useState<{
    open: boolean;
    election: StudentElectionItem | null;
  }>({
    open: false,
    election: null,
  });

  const [nominationForm, setNominationForm] = useState({
    statementOfPurpose: '',
    experience: '',
    manifesto: '',
  });

  // View My Nomination details modal
  const [viewNominationModal, setViewNominationModal] = useState<{
    open: boolean;
    nomination: StudentCandidateItem | null;
    election: StudentElectionItem | null;
  }>({
    open: false,
    nomination: null,
    election: null,
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch real elections from backend
  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getElections();
      setElections(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load live elections data from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElections();
  }, []);

  // Filtered elections
  const filteredElections = useMemo(() => {
    return elections.filter((elec) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && elec.status !== statusFilter) {
        return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = elec.title?.toLowerCase().includes(q);
        const orgMatch = elec.organization?.name?.toLowerCase().includes(q);
        const candidateMatch = elec.candidates?.some(
          (c) =>
            c.user?.fullName?.toLowerCase().includes(q) ||
            c.user?.username?.toLowerCase().includes(q) ||
            c.manifesto?.toLowerCase().includes(q)
        );
        return titleMatch || orgMatch || candidateMatch;
      }

      return true;
    });
  }, [elections, statusFilter, searchQuery]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const totalElections = elections.length;
    const votingActive = elections.filter((e) => e.status === 'VOTING_OPEN').length;
    const nominationsOpen = elections.filter((e) => e.status === 'NOMINATION_OPEN').length;
    const completed = elections.filter((e) => e.status === 'COMPLETED').length;
    const ballotsVoted = elections.filter((e) => e.hasVoted).length;
    const myNominationsCount = elections.filter((e) => Boolean(e.myNomination)).length;

    return {
      totalElections,
      votingActive,
      nominationsOpen,
      completed,
      ballotsVoted,
      myNominationsCount,
    };
  }, [elections]);

  // Selection handler
  const handleSelectCandidate = (electionId: string, candidateId: string) => {
    const election = elections.find((e) => e.id === electionId);
    if (election?.hasVoted) return;
    setSelectedCandidate((prev) => ({ ...prev, [electionId]: candidateId }));
  };

  // Open confirmation modal for casting vote
  const handleInitiateVote = (election: StudentElectionItem, candidate: StudentCandidateItem) => {
    if (election.hasVoted) return;
    setConfirmVoteModal({
      open: true,
      election,
      candidate,
    });
  };

  // Submit atomic 1-time vote to backend
  const handleConfirmVote = async () => {
    if (!confirmVoteModal.election || !confirmVoteModal.candidate) return;

    const election = confirmVoteModal.election;
    const candidate = confirmVoteModal.candidate;

    setActionLoading(true);
    try {
      await studentService.castVote(election.id, candidate.id);
      showToast(`Ballot cast successfully for ${candidate.user.fullName}!`, 'success');

      // Generate verification receipt
      const receiptId = `BAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      setBallotReceipt({
        electionTitle: election.title,
        clubName: election.organization.name,
        candidateName: candidate.user.fullName,
        receiptId,
        timestamp: new Date().toLocaleString(),
        voterName: user?.fullName || 'Verified Student Member',
      });

      setConfirmVoteModal({ open: false, election: null, candidate: null });

      // Refresh live election state from backend
      const updated = await studentService.getElections();
      setElections(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to register ballot.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit President Nomination to backend
  const handleSubmitNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominationModal.election) return;

    if (!nominationForm.statementOfPurpose.trim() || !nominationForm.manifesto.trim()) {
      showToast('Please provide both Statement of Purpose and Campaign Manifesto.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await studentService.applyNomination(nominationModal.election.id, nominationForm);
      showToast('President nomination submitted! Sent to Super Admin for credentials review.', 'success');
      setNominationModal({ open: false, election: null });
      setNominationForm({ statementOfPurpose: '', experience: '', manifesto: '' });

      // Refresh live election state from backend
      const updated = await studentService.getElections();
      setElections(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to submit nomination.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold border ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ── 1. HEADER BANNER ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              CAMPUS DEMOCRACY & GOVERNANCE
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Academic Term 2026-2027
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Annual Executive Elections & Voting
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Vote for verified student leadership nominees with atomic 1-time ballot integrity, or apply to run as Club President for your recognized organization.
          </p>
        </div>

        <button
          onClick={fetchElections}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
          title="Refresh elections data from backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Sync Live Data</span>
        </button>
      </div>

      {/* ── 2. METRICS & PARTICIPATION STRIP ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Elections</span>
            <Vote className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1.5">{stats.totalElections}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Campus chartered clubs</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider">Voting Active</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5">{stats.votingActive}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cast official ballots now</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Your Ballots Cast</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1.5">{stats.ballotsVoted}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Elections voted in</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Your Candidacies</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1.5">{stats.myNominationsCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Presidential applications</div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH TOOLBAR ────────────────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(
            [
              { id: 'ALL', label: 'All Elections', count: stats.totalElections },
              { id: 'VOTING_OPEN', label: 'Voting Open', count: stats.votingActive },
              { id: 'NOMINATION_OPEN', label: 'Nominations Open', count: stats.nominationsOpen },
              { id: 'COMPLETED', label: 'Completed', count: stats.completed },
            ] as const
          ).map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                    isSelected ? 'bg-indigo-700/60 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search club, election, candidate..."
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">
            {filteredElections.length} election(s)
          </span>
        </div>
      </div>

      {/* ── 4. SKELETON LOADING ────────────────────────────────────── */}
      {isLoading && elections.length === 0 && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`skel-${i}`} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-6 w-52 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-96 bg-slate-200 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="h-40 bg-slate-100 rounded-xl"></div>
                <div className="h-40 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. EMPTY STATES ───────────────────────────────────────── */}
      {!isLoading && filteredElections.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center shadow-xs">
          {elections.length === 0 ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
                <Vote className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">No Active Elections</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                There are currently no active or historical elections scheduled in the system. Check back soon for upcoming officer elections.
              </p>
              <button
                onClick={fetchElections}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Page</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <FilterX className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">No Matching Elections</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No elections found matching "{searchQuery || statusFilter}".
              </p>
              <button
                onClick={() => {
                  setStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold cursor-pointer border border-indigo-200/60"
              >
                Reset Filters & Search
              </button>
            </>
          )}
        </div>
      )}

      {/* ── 6. LIVE ELECTION CARDS ─────────────────────────────────── */}
      <div className="space-y-6">
        {filteredElections.map((elec) => {
          const approvedCandidates = elec.candidates.filter((c) => c.status === 'APPROVED');
          const isVotingOpen = elec.status === 'VOTING_OPEN';
          const isNominationOpen = elec.status === 'NOMINATION_OPEN';
          const isCompleted = elec.status === 'COMPLETED';

          // Calculate total verified votes in this election
          const totalElectionVotes = approvedCandidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

          // Find winner if completed
          const winnerCandidate = isCompleted
            ? elec.candidates.find((c) => c.user?.id === elec.winnerCandidateId) ||
              approvedCandidates.reduce((prev, curr) => (curr.voteCount > (prev?.voteCount || 0) ? curr : prev), approvedCandidates[0])
            : null;

          return (
            <div
              key={elec.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 transition-shadow hover:shadow-sm"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {elec.organization?.name}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">Term {elec.academicYear}</span>
                    <span className="text-slate-300">•</span>

                    {/* Stage Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isVotingOpen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isNominationOpen
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : isCompleted
                          ? 'bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isVotingOpen
                            ? 'bg-emerald-500 animate-pulse'
                            : isNominationOpen
                            ? 'bg-indigo-500 animate-pulse'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{elec.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{elec.title}</h2>
                  {elec.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{elec.description}</p>
                  )}
                </div>

                {/* Right Header Status / Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* If user has voted */}
                  {elec.hasVoted && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Official Ballot Cast</span>
                    </div>
                  )}

                  {/* My Presidential Nomination status badge */}
                  {elec.myNomination ? (
                    <button
                      onClick={() =>
                        setViewNominationModal({
                          open: true,
                          nomination: elec.myNomination,
                          election: elec,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 cursor-pointer transition-colors"
                      title="Click to view nomination details"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        President Nomination: {elec.myNomination.status}
                      </span>
                    </button>
                  ) : (
                    /* Apply for President button if nominations open */
                    isNominationOpen && (
                      <button
                        onClick={() => setNominationModal({ open: true, election: elec })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Apply for Club President</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Milestones Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl text-xs font-medium text-slate-600 border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Nomination Closes</div>
                    <span className="font-bold text-slate-800">
                      {new Date(elec.nominationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Voting Period</div>
                    <span className="font-bold text-slate-800">
                      {new Date(elec.votingStartDate).toLocaleDateString()} –{' '}
                      {new Date(elec.votingEndDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Ballots Recorded</div>
                    <span className="font-bold text-slate-800">
                      {totalElectionVotes} Total Verified
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Ballot Status</div>
                    <span className="font-bold text-slate-800">
                      {elec.hasVoted ? (
                        <span className="text-emerald-600">Your Ballot Cast</span>
                      ) : isVotingOpen ? (
                        <span className="text-indigo-600">1 Ballot Available</span>
                      ) : (
                        <span>Voting Inactive</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Completed Winner Ratification Ribbon ──────────────── */}
              {isCompleted && winnerCandidate && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-950">
                        Official Election Ratified: {winnerCandidate.user?.fullName} Elected President
                      </div>
                      <div className="text-[11px] text-amber-800 mt-0.5">
                        Promoted to President of {elec.organization.name} with {winnerCandidate.voteCount} verified ballots.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Candidates / Nominees Section ────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span>Approved Candidates ({approvedCandidates.length})</span>
                    {isVotingOpen && !elec.hasVoted && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Select a candidate to cast your ballot
                      </span>
                    )}
                  </h3>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Strict atomic 1-time ballot
                  </span>
                </div>

                {approvedCandidates.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50/50 border border-slate-200/60 text-center">
                    <p className="text-xs text-slate-500">
                      {isNominationOpen
                        ? 'Nominations are open! Submit your credentials above to run as Club President.'
                        : 'No approved candidates are currently listed for this election.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {approvedCandidates.map((cand) => {
                      const isVotedForThis = elec.hasVoted && elec.votedCandidateId === cand.id;
                      const isSelected = selectedCandidate[elec.id] === cand.id;
                      const isWinner = isCompleted && cand.user?.id === elec.winnerCandidateId;

                      const voteShare = totalElectionVotes > 0
                        ? Math.round((cand.voteCount / totalElectionVotes) * 100)
                        : 0;

                      return (
                        <div
                          key={cand.id}
                          onClick={() => {
                            if (isVotingOpen && !elec.hasVoted) {
                              handleSelectCandidate(elec.id, cand.id);
                            }
                          }}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isVotedForThis
                              ? 'bg-emerald-50/40 border-emerald-400 ring-2 ring-emerald-500/10 shadow-xs'
                              : isWinner
                              ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                              : isSelected && !elec.hasVoted
                              ? 'bg-indigo-50/30 border-indigo-400 ring-2 ring-indigo-500/10 shadow-xs cursor-pointer'
                              : isVotingOpen && !elec.hasVoted
                              ? 'bg-white border-slate-200/80 hover:border-slate-300 cursor-pointer shadow-2xs'
                              : 'bg-white border-slate-200/80 shadow-2xs'
                          }`}
                        >
                          <div>
                            {/* Candidate Profile Header */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-slate-300/60">
                                  {cand.user?.avatarUrl ? (
                                    <img
                                      src={cand.user.avatarUrl}
                                      alt={cand.user.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    cand.user?.fullName?.charAt(0).toUpperCase() || 'C'
                                  )}
                                </div>

                                <div>
                                  <div className="text-xs font-bold text-slate-900 leading-snug">
                                    {cand.user?.fullName}
                                  </div>
                                  <div className="text-[10px] text-slate-500">@{cand.user?.username}</div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {isWinner && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                    <Trophy className="w-3 h-3 text-amber-600" />
                                    <span>Elected</span>
                                  </span>
                                )}

                                {isVotedForThis && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Your Vote</span>
                                  </span>
                                )}

                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  APPROVED
                                </span>
                              </div>
                            </div>

                            {/* Why Running / Statement of Purpose */}
                            {cand.statementOfPurpose && (
                              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mb-2">
                                <span className="font-bold text-slate-500 uppercase text-[9px] block">
                                  Why Running:
                                </span>
                                {cand.statementOfPurpose}
                              </div>
                            )}

                            {/* Leadership Experience */}
                            {cand.experience && (
                              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mb-2">
                                <span className="font-bold text-slate-500 uppercase text-[9px] block">
                                  Experience & Leadership:
                                </span>
                                {cand.experience}
                              </div>
                            )}

                            {/* Campaign Manifesto */}
                            <div className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed mb-3">
                              <span className="font-bold text-slate-500 uppercase text-[9px] block mb-0.5">
                                Campaign Platform:
                              </span>
                              "{cand.manifesto}"
                            </div>
                          </div>

                          {/* Candidate Footer: Live Count & Vote Action */}
                          <div className="space-y-2 pt-2.5 border-t border-slate-100">
                            {/* Live Percentage Bar */}
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-slate-500">
                                {cand.voteCount} Ballots Recorded
                              </span>
                              <span className="text-slate-700">{voteShare}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isVotedForThis
                                    ? 'bg-emerald-500'
                                    : isWinner
                                    ? 'bg-amber-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${voteShare}%` }}
                              />
                            </div>

                            {/* Ballot Button or Indicator */}
                            <div className="pt-1 flex items-center justify-between">
                              {isVotingOpen ? (
                                elec.hasVoted ? (
                                  isVotedForThis ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                      <span>Your Choice • Recorded on Chain</span>
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-slate-400 font-medium">
                                      Ballot already cast
                                    </span>
                                  )
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInitiateVote(elec, cand);
                                    }}
                                    disabled={actionLoading}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                                  >
                                    <Vote className="w-3.5 h-3.5" />
                                    <span>
                                      {isSelected ? `Vote for ${cand.user.fullName}` : 'Cast Ballot'}
                                    </span>
                                  </button>
                                )
                              ) : isCompleted ? (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {isWinner ? 'Ratified Winner' : 'Election Concluded'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-indigo-600 font-medium">
                                  Voting opens on {new Date(elec.votingStartDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 7. CONFIRM 1-TIME VOTE MODAL ───────────────────────────── */}
      {confirmVoteModal.open && confirmVoteModal.election && confirmVoteModal.candidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Vote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Official Ballot</h3>
                <p className="text-xs text-slate-500">Atomic 1-time democratic vote</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Election:</span>
                <span className="font-bold text-slate-900">{confirmVoteModal.election.title}</span>
              </div>

              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Club:</span>
                <span className="font-bold text-indigo-700">{confirmVoteModal.election.organization.name}</span>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-500 block text-[10px] uppercase">Candidate:</span>
                <span className="text-sm font-extrabold text-emerald-700">
                  {confirmVoteModal.candidate.user.fullName} (@{confirmVoteModal.candidate.user.username})
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Strict Governance Rule:</strong> Each member is permitted strictly one vote per election. Once submitted, your ballot cannot be altered or retracted.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmVoteModal({ open: false, election: null, candidate: null })}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Confirm & Cast Vote</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. DIGITAL BALLOT RECEIPT MODAL ────────────────────────── */}
      {ballotReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Official Ballot Recorded</h3>
              </div>
              <button
                onClick={() => setBallotReceipt(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Vote Authenticated</h4>
              <p className="text-xs text-slate-500">Your ballot has been atomically recorded into the database.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs font-medium text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Hash:</span>
                <span className="font-mono font-bold text-slate-900">{ballotReceipt.receiptId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-bold text-emerald-700">{ballotReceipt.candidateName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Organization:</span>
                <span className="font-bold text-slate-900">{ballotReceipt.clubName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Election:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{ballotReceipt.electionTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Voter:</span>
                <span className="font-bold text-slate-900">{ballotReceipt.voterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recorded At:</span>
                <span className="font-bold text-slate-900">{ballotReceipt.timestamp}</span>
              </div>
            </div>

            <button
              onClick={() => setBallotReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Done & Return to Elections
            </button>
          </div>
        </div>
      )}

      {/* ── 9. APPLY FOR PRESIDENT NOMINATION MODAL ────────────────── */}
      {nominationModal.open && nominationModal.election && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply for Club President</h3>
                <p className="text-xs text-slate-500">{nominationModal.election.organization.name}</p>
              </div>
              <button
                onClick={() => setNominationModal({ open: false, election: null })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNomination} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statement of Purpose & Leadership Vision *
                </label>
                <textarea
                  rows={3}
                  required
                  value={nominationForm.statementOfPurpose}
                  onChange={(e) =>
                    setNominationForm({ ...nominationForm, statementOfPurpose: e.target.value })
                  }
                  placeholder="Why are you applying for Club President? What are your key leadership goals?"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Relevant Experience & Activities
                </label>
                <textarea
                  rows={2}
                  value={nominationForm.experience}
                  onChange={(e) =>
                    setNominationForm({ ...nominationForm, experience: e.target.value })
                  }
                  placeholder="Past club roles, event organizing, hackathons, or leadership credentials..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campaign Manifesto & Core Promises *
                </label>
                <textarea
                  rows={3}
                  required
                  value={nominationForm.manifesto}
                  onChange={(e) =>
                    setNominationForm({ ...nominationForm, manifesto: e.target.value })
                  }
                  placeholder="State your top 2-3 core pledges to students and members for this term..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] text-indigo-800 leading-relaxed">
                Platform Super Admins will review your credentials and manifesto before placing your candidacy on the voting ballot.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNominationModal({ open: false, election: null })}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Submit Nomination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 10. VIEW MY NOMINATION MODAL ────────────────────────────── */}
      {viewNominationModal.open && viewNominationModal.nomination && viewNominationModal.election && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your President Nomination</h3>
                <p className="text-xs text-slate-500">{viewNominationModal.election.organization.name}</p>
              </div>
              <button
                onClick={() => setViewNominationModal({ open: false, nomination: null, election: null })}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs text-slate-600 font-semibold">Review Status:</span>
                <span
                  className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    viewNominationModal.nomination.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : viewNominationModal.nomination.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {viewNominationModal.nomination.status}
                </span>
              </div>

              {viewNominationModal.nomination.statementOfPurpose && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">
                    Statement of Purpose:
                  </div>
                  <p className="text-slate-700">{viewNominationModal.nomination.statementOfPurpose}</p>
                </div>
              )}

              {viewNominationModal.nomination.experience && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">
                    Leadership Experience:
                  </div>
                  <p className="text-slate-700">{viewNominationModal.nomination.experience}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">
                  Campaign Manifesto:
                </div>
                <p className="text-slate-700">"{viewNominationModal.nomination.manifesto}"</p>
              </div>
            </div>

            <button
              onClick={() => setViewNominationModal({ open: false, nomination: null, election: null })}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionsVotingModule;
