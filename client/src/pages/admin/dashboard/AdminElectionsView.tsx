import React, { useState, useMemo } from 'react';
import {
  Vote,
  Plus,
  Clock,
  Trophy,
  X,
  Search,
  FilterX,
  Calendar,
  ShieldCheck,
  Award,
  UserCheck,
  UserX,
  RefreshCw,
  Users,
} from 'lucide-react';
import {
  ElectionItem,
  ClubItem,
  adminService,
  DetailedElectionItem,
} from '../../../services/admin.service';
import { AdminCompletedElectionDetails } from './AdminCompletedElectionDetails';

export interface AdminElectionsViewProps {
  elections: ElectionItem[];
  clubs: ClubItem[];
  isLoading: boolean;
  actionLoading: boolean;
  onRefresh: () => Promise<void>;
  onElectionsUpdated: (updated: ElectionItem[]) => void;
  onClubsUpdated?: (updated: ClubItem[]) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

export const AdminElectionsView: React.FC<AdminElectionsViewProps> = ({
  elections,
  clubs,
  isLoading,
  actionLoading,
  onRefresh,
  onElectionsUpdated,
  onClubsUpdated,
  showToast,
}) => {
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Election Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [submittingCreate, setSubmittingCreate] = useState<boolean>(false);
  const [newElectionForm, setNewElectionForm] = useState({
    title: '',
    organizationId: '',
    academicYear: '2026-2027',
    description: '',
    nominationDeadline: '2026-05-15',
    votingStartDate: '2026-05-16',
    votingEndDate: '2026-05-20',
  });

  // Action progress states
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);
  const [processingElectionId, setProcessingElectionId] = useState<string | null>(null);

  // Dedicated Completed Voting Details page state
  const [selectedElectionDetails, setSelectedElectionDetails] = useState<DetailedElectionItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Status Filter options
  const filterTabs = [
    { id: 'ALL', label: 'ALL' },
    { id: 'VOTING_OPEN', label: 'VOTING OPEN' },
    { id: 'NOMINATION_OPEN', label: 'NOMINATIONS OPEN' },
    { id: 'COMPLETED', label: 'COMPLETED' },
  ];

  // Dynamic counts
  const counts = useMemo(() => {
    return {
      ALL: elections.length,
      VOTING_OPEN: elections.filter((e) => e.status === 'VOTING_OPEN').length,
      NOMINATION_OPEN: elections.filter((e) => e.status === 'NOMINATION_OPEN').length,
      COMPLETED: elections.filter((e) => e.status === 'COMPLETED').length,
      totalBallots: elections.reduce((sum, e) => sum + (e._count?.votes || 0), 0),
      pendingNominees: elections.reduce(
        (sum, e) => sum + e.candidates.filter((c) => c.status === 'PENDING').length,
        0
      ),
    };
  }, [elections]);

  // Filtered elections
  const filteredElections = useMemo(() => {
    return elections.filter((elec) => {
      // 1. Status filter
      if (statusFilter !== 'ALL' && elec.status !== statusFilter) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = elec.title?.toLowerCase().includes(query);
        const clubMatch = elec.organization?.name?.toLowerCase().includes(query);
        const candidateMatch = elec.candidates.some(
          (c) =>
            c.user?.fullName?.toLowerCase().includes(query) ||
            c.user?.username?.toLowerCase().includes(query) ||
            c.manifesto?.toLowerCase().includes(query)
        );
        return titleMatch || clubMatch || candidateMatch;
      }

      return true;
    });
  }, [elections, statusFilter, searchQuery]);

  // Handlers
  const handleNomineeStatusChange = async (candidateId: string, status: 'APPROVED' | 'REJECTED') => {
    setProcessingCandidateId(candidateId);
    try {
      await adminService.updateCandidateStatus(candidateId, status);
      showToast(`Candidate nomination ${status.toLowerCase()} successfully.`);
      const updated = await adminService.getElections();
      onElectionsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update candidate', 'error');
    } finally {
      setProcessingCandidateId(null);
    }
  };

  const handleCastVote = async (electionId: string, candidateId: string) => {
    setProcessingCandidateId(candidateId);
    try {
      await adminService.castVote(electionId, candidateId);
      showToast('Ballot registered! Atomic 1-time vote verified.');
      const updated = await adminService.getElections();
      onElectionsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Vote rejected', 'error');
    } finally {
      setProcessingCandidateId(null);
    }
  };

  const handleUpdateStatus = async (electionId: string, nextStatus: string) => {
    setProcessingElectionId(electionId);
    try {
      await adminService.updateElectionStatus(electionId, nextStatus);
      showToast(`Election advanced to ${nextStatus.replace('_', ' ')}!`);
      const updated = await adminService.getElections();
      onElectionsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update election status', 'error');
    } finally {
      setProcessingElectionId(null);
    }
  };

  const handleFinalizeElection = async (electionId: string) => {
    if (!window.confirm('Finalize this election? The top approved candidate will be officially declared winner and promoted to Club President.')) {
      return;
    }

    setProcessingElectionId(electionId);
    try {
      const res = await adminService.finalizeElection(electionId);
      showToast(`Election finalized! ${res.winner.fullName} is now President of ${res.organization}!`);
      const updated = await adminService.getElections();
      onElectionsUpdated(updated);
      if (onClubsUpdated) {
        const updatedClubs = await adminService.getClubs();
        onClubsUpdated(updatedClubs);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to finalize election', 'error');
    } finally {
      setProcessingElectionId(null);
    }
  };

  const handleCreateElectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newElectionForm.title.trim() || !newElectionForm.organizationId) {
      showToast('Please provide an election title and target club.', 'error');
      return;
    }

    setSubmittingCreate(true);
    try {
      await adminService.createElection(newElectionForm);
      showToast('Election announced! Campus notification broadcasted.');
      setShowCreateModal(false);
      setNewElectionForm({
        title: '',
        organizationId: '',
        academicYear: '2026-2027',
        description: '',
        nominationDeadline: '2026-05-15',
        votingStartDate: '2026-05-16',
        votingEndDate: '2026-05-20',
      });
      const updated = await adminService.getElections();
      onElectionsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to announce election', 'error');
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Helper for election stage status
  const getStageInfo = (elec: ElectionItem) => {
    switch (elec.status) {
      case 'NOMINATION_OPEN':
        return {
          step: 2,
          stepLabel: 'Stage 2: Nominations Open',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dotClass: 'bg-indigo-500 animate-pulse',
        };
      case 'VOTING_OPEN':
        return {
          step: 3,
          stepLabel: 'Stage 3: Voting Active',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dotClass: 'bg-emerald-500 animate-pulse',
        };
      case 'COMPLETED':
        return {
          step: 4,
          stepLabel: 'Stage 4: Finalized & Ratified',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
          dotClass: 'bg-emerald-600',
        };
      default:
        return {
          step: 1,
          stepLabel: 'Stage 1: Announced',
          badgeClass: 'bg-slate-50 text-slate-600 border-slate-200/80',
          dotClass: 'bg-slate-400',
        };
    }
  };

  const handleViewCompletedDetails = async (electionId: string) => {
    setLoadingDetails(true);
    try {
      const details = await adminService.getElectionDetails(electionId);
      setSelectedElectionDetails(details);
    } catch (err: any) {
      // Graceful fallback from list item
      const found = elections.find((e) => e.id === electionId);
      if (found) {
        const club = clubs.find((c) => c.id === found.organizationId) || {
          ...found.organization,
          category: 'Chartered Organization',
          description: 'Official student organization and chartered campus unit.',
          isActive: true,
          memberCount: 0,
          ticketCount: 0,
          electionCount: 1,
          membershipFee: 500,
          createdAt: found.createdAt,
          president: null,
        };
        setSelectedElectionDetails({
          ...found,
          organization: club as any,
          candidates: found.candidates.map((cand) => ({
            ...cand,
            votes: [],
          })),
        });
      } else {
        showToast(err.message || 'Failed to load election details', 'error');
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // If a specific election's completed details page is open, render the dedicated view
  if (selectedElectionDetails) {
    return (
      <AdminCompletedElectionDetails
        election={selectedElectionDetails}
        onBack={() => setSelectedElectionDetails(null)}
        onRefresh={async () => {
          await handleViewCompletedDetails(selectedElectionDetails.id);
        }}
        isLoading={loadingDetails}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* ── 1. INTRODUCTORY BANNER & ANNOUNCE ACTION ─────────────── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900">
              Yearly Club Elections & Leadership Ratification
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              GOVERNANCE
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Announce yearly elections, review candidate nominations, enforce atomic 1-time voting, and promote elected winners to President.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Announce Election</span>
        </button>
      </div>

      {/* ── 2. METRICS & KPI STRIP ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Elections</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{counts.ALL}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Campus chartered clubs</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Voting Open</div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1">{counts.VOTING_OPEN}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active ballot collection</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Pending Review</div>
          <div className="text-xl font-extrabold text-indigo-700 mt-1">{counts.pendingNominees}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting admin vetting</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ballots Cast</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{counts.totalBallots}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Atomic verified votes</div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH TOOLBAR ────────────────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTabs.map((tab) => {
            const isSelected = statusFilter === tab.id;
            const count = counts[tab.id as keyof typeof counts] || 0;
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
                  {count}
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

      {/* ── 4. SKELETON LOADING STATE ─────────────────────────────── */}
      {isLoading && elections.length === 0 && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`elec-skeleton-${i}`} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-96 bg-slate-200 rounded-md"></div>
              <div className="h-12 bg-slate-100 rounded-xl"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-32 bg-slate-100 rounded-xl"></div>
                <div className="h-32 bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 5. EMPTY STATES ───────────────────────────────────────── */}
      {!isLoading && filteredElections.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center">
          {elections.length === 0 ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-100">
                <Vote className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">No elections scheduled</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                There are currently no active or historical elections recorded. Announce an election to open nominations.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Announce Election</span>
                </button>
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Data</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <FilterX className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">No matching elections found</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No elections match the filter{' '}
                <span className="font-bold text-slate-700">"{statusFilter.replace('_', ' ')}"</span>
                {searchQuery && (
                  <>
                    {' '}
                    or query <span className="font-bold text-slate-700">"{searchQuery}"</span>
                  </>
                )}
                .
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

      {/* ── 6. ELECTION OVERVIEW CARDS ─────────────────────────────── */}
      <div className="space-y-6">
        {filteredElections.map((elec) => {
          const stageInfo = getStageInfo(elec);
          const approvedCandidates = elec.candidates.filter((c) => c.status === 'APPROVED');
          const pendingCandidates = elec.candidates.filter((c) => c.status === 'PENDING');
          const isFinalized = elec.status === 'COMPLETED';

          return (
            <div
              key={elec.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 transition-shadow hover:shadow-sm"
            >
              {/* Card Header: Club info, Title & Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {elec.organization?.name}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">Term {elec.academicYear}</span>
                    <span className="text-slate-300">•</span>

                    {/* Stage badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${stageInfo.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotClass}`} />
                      <span>{elec.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 leading-snug">{elec.title}</h4>
                  {elec.description && (
                    <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{elec.description}</p>
                  )}
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Transition: NOMINATION_OPEN -> VOTING_OPEN */}
                  {elec.status === 'NOMINATION_OPEN' && (
                    <button
                      onClick={() => handleUpdateStatus(elec.id, 'VOTING_OPEN')}
                      disabled={processingElectionId === elec.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                      title="Advance to voting stage"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>Open Voting Period</span>
                    </button>
                  )}

                  {/* Finalize button */}
                  {!isFinalized && approvedCandidates.length > 0 && (
                    <button
                      onClick={() => handleFinalizeElection(elec.id)}
                      disabled={processingElectionId === elec.id || actionLoading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Finalize & Promote President</span>
                    </button>
                  )}

                  {/* Finalized Banner & Completed Details Button */}
                  {isFinalized && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleViewCompletedDetails(elec.id)}
                        disabled={loadingDetails}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all hover:shadow-sm"
                        title="View Leaderboard, Winner Showcase and Full Verified Voter Audit"
                      >
                        <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Completed Voting Details & Audit</span>
                      </button>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Leadership Ratified</span>
                      </span>
                    </div>
                  )}

                  {!isFinalized && (elec._count?.votes || 0) > 0 && (
                    <button
                      onClick={() => handleViewCompletedDetails(elec.id)}
                      disabled={loadingDetails}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                      title="Inspect live ballots and voter list"
                    >
                      <Vote className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Live Audit Tally</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline & Real Metrics Strip */}
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
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Voting Window</div>
                    <span className="font-bold text-slate-800">
                      {new Date(elec.votingStartDate).toLocaleDateString()} - {new Date(elec.votingEndDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Ballots Cast</div>
                    <span className="font-bold text-slate-800">
                      {elec._count?.votes || 0} Total Ballots
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Nominees</div>
                    <span className="font-bold text-slate-800">
                      {approvedCandidates.length} Approved / {elec.candidates.length} Total
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 7. NOMINEES SECTION ──────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <span>Candidates & Nominees ({elec.candidates.length})</span>
                    {pendingCandidates.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {pendingCandidates.length} Pending Review
                      </span>
                    )}
                  </h5>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Sorted by verified vote tally
                  </span>
                </div>

                {elec.candidates.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50/50 border border-slate-200/60 text-center">
                    <p className="text-xs text-slate-500">
                      No candidate nominations submitted yet for this election. Students can submit nominations via the campus election portal.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {elec.candidates.map((cand) => {
                      const isWinner = isFinalized && cand.user?.id === elec.winnerCandidateId;

                      return (
                        <div
                          key={cand.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isWinner
                              ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                              : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                          }`}
                        >
                          <div>
                            {/* Candidate Header */}
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                  {cand.user?.avatarUrl ? (
                                    <img
                                      src={cand.user.avatarUrl}
                                      alt={cand.user.fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    cand.user?.fullName?.charAt(0).toUpperCase() || 'U'
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

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    cand.status === 'APPROVED'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : cand.status === 'PENDING'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-red-50 text-red-800 border-red-200'
                                  }`}
                                >
                                  {cand.status}
                                </span>
                              </div>
                            </div>

                            {/* Statement of Purpose */}
                            {cand.statementOfPurpose && (
                              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mb-2">
                                <span className="font-bold text-slate-500 uppercase text-[9px] block">
                                  Why Applying:
                                </span>
                                {cand.statementOfPurpose}
                              </div>
                            )}

                            {/* Leadership Experience */}
                            {cand.experience && (
                              <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200/60 mb-2">
                                <span className="font-bold text-slate-500 uppercase text-[9px] block">
                                  Leadership Experience:
                                </span>
                                {cand.experience}
                              </div>
                            )}

                            {/* Manifesto */}
                            <div className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed mb-3">
                              <span className="font-bold text-slate-500 uppercase text-[9px] block mb-0.5">
                                Manifesto Platform:
                              </span>
                              "{cand.manifesto}"
                            </div>
                          </div>

                          {/* Candidate Card Footer: Vote Count & Actions */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                            <span className="text-xs font-bold text-indigo-700 bg-indigo-50/60 px-2.5 py-1 rounded-md border border-indigo-100/60">
                              {cand.voteCount} Ballots Cast
                            </span>

                            <div className="flex items-center gap-1.5">
                              {/* Pending Review Actions */}
                              {cand.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleNomineeStatusChange(cand.id, 'APPROVED')}
                                    disabled={processingCandidateId === cand.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer disabled:opacity-50 transition-colors"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    <span>Approve</span>
                                  </button>
                                  <button
                                    onClick={() => handleNomineeStatusChange(cand.id, 'REJECTED')}
                                    disabled={processingCandidateId === cand.id}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-bold cursor-pointer border border-red-200/60 disabled:opacity-50 transition-colors"
                                  >
                                    <UserX className="w-3 h-3" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : cand.status === 'APPROVED' && elec.status === 'VOTING_OPEN' ? (
                                <button
                                  onClick={() => handleCastVote(elec.id, cand.id)}
                                  disabled={actionLoading || processingCandidateId === cand.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  <span>Cast 1-Time Ballot</span>
                                </button>
                              ) : null}

                              {isFinalized && (
                                <button
                                  onClick={() => handleViewCompletedDetails(elec.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                                  title="Inspect candidate vote percentage and voter roster"
                                >
                                  <Users className="w-3 h-3" />
                                  <span>Voter Audit</span>
                                </button>
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

      {/* ── 8. ANNOUNCE ELECTION MODAL ────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Announce Annual Election</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateElectionSubmit} className="space-y-3.5 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-800">Election Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-2027 Executive Officer Election"
                  value={newElectionForm.title}
                  onChange={(e) => setNewElectionForm({ ...newElectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-800">Target Chartered Club</label>
                  <select
                    value={newElectionForm.organizationId}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, organizationId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                  >
                    <option value="">Select a Club</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">Academic Year</label>
                  <input
                    type="text"
                    value={newElectionForm.academicYear}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1 text-slate-800">Nomination Closes</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.nominationDeadline}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, nominationDeadline: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">Voting Starts</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.votingStartDate}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, votingStartDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">Voting Ends</label>
                  <input
                    type="date"
                    required
                    value={newElectionForm.votingEndDate}
                    onChange={(e) => setNewElectionForm({ ...newElectionForm, votingEndDate: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Description & Eligibility Guidelines</label>
                <textarea
                  rows={2}
                  placeholder="Voting eligibility and atomic 1-time ballot policy..."
                  value={newElectionForm.description}
                  onChange={(e) => setNewElectionForm({ ...newElectionForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submittingCreate ? 'Broadcasting...' : 'Broadcast Election'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminElectionsView;
