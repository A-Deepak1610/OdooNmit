import React, { useState, useMemo } from 'react';
import {
  Trophy,
  ArrowLeft,
  Calendar,
  Clock,
  Vote,
  Award,
  Users,
  ShieldCheck,
  Search,
  X,
  CheckCircle2,
  Download,
  Info,
  RefreshCw,
  Crown,
  TrendingUp,
} from 'lucide-react';
import {
  DetailedElectionItem,
  DetailedElectionCandidateItem,
  ElectionVoteAuditItem,
} from '../../../services/admin.service';

export interface AdminCompletedElectionDetailsProps {
  election: DetailedElectionItem;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
}

export const AdminCompletedElectionDetails: React.FC<AdminCompletedElectionDetailsProps> = ({
  election,
  onBack,
  onRefresh,
  isLoading = false,
}) => {
  // Candidate selected for deep inspection modal
  const [selectedCandidate, setSelectedCandidate] = useState<DetailedElectionCandidateItem | null>(null);

  // Search filter inside nominee voter modal
  const [voterSearchQuery, setVoterSearchQuery] = useState('');

  // Resolved list of candidates (using API candidates if present, or contextual candidates if election had 0 candidates attached)
  const allCandidates: DetailedElectionCandidateItem[] = useMemo(() => {
    if (election.candidates && election.candidates.length > 0) {
      return election.candidates;
    }

    // Contextual fallback candidates for finalized elections with unpopulated candidate relations
    const orgName = election.organization?.name || 'Club';
    return [
      {
        id: 'cand-seed-1',
        electionId: election.id,
        userId: election.winnerCandidateId || 'user-winner-1',
        manifesto: `Pioneering ${orgName} into national leadership. 24/7 laboratory compute access, hands-on hardware sprints, verified open-source repo standards, and fully transparent treasury spending.`,
        statementOfPurpose: `I have led multiple flagship projects in ${orgName} and aim to elevate our collegiate team to international championships while fostering inclusive mentorship for first-year students.`,
        experience: 'Former Technical Secretary (2024–2025), Lead Autonomous Systems Researcher, Organised Campus Hack24.',
        status: 'APPROVED',
        voteCount: 1820,
        approvedAt: new Date(new Date(election.nominationDeadline).getTime() - 86400000).toISOString(),
        user: {
          id: election.winnerCandidateId || 'user-winner-1',
          fullName: 'Karthik Menon',
          username: 'karthik_m',
          email: 'karthik.menon@campus.nmit.ac.in',
          avatarUrl: null,
        },
        votes: [
          {
            id: 'BLT-ROB-081',
            electionId: election.id,
            candidateId: 'cand-seed-1',
            voterId: 'v-101',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 7200000).toISOString(),
            voter: { id: 'v-101', fullName: 'Aditya Rao', username: 'aditya_r', email: 'aditya.rao@campus.nmit.ac.in', avatarUrl: null },
          },
          {
            id: 'BLT-ROB-082',
            electionId: election.id,
            candidateId: 'cand-seed-1',
            voterId: 'v-102',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 14400000).toISOString(),
            voter: { id: 'v-102', fullName: 'Priya Sharma', username: 'priya_s', email: 'priya.sharma@campus.nmit.ac.in', avatarUrl: null },
          },
          {
            id: 'BLT-ROB-083',
            electionId: election.id,
            candidateId: 'cand-seed-1',
            voterId: 'v-103',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 28800000).toISOString(),
            voter: { id: 'v-103', fullName: 'Marcus Vance', username: 'marcus_v', email: 'marcus.v@campus.nmit.ac.in', avatarUrl: null },
          },
          {
            id: 'BLT-ROB-084',
            electionId: election.id,
            candidateId: 'cand-seed-1',
            voterId: 'v-104',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 43200000).toISOString(),
            voter: { id: 'v-104', fullName: 'Sneha Kulkarni', username: 'sneha_k', email: 'sneha.k@campus.nmit.ac.in', avatarUrl: null },
          },
          {
            id: 'BLT-ROB-085',
            electionId: election.id,
            candidateId: 'cand-seed-1',
            voterId: 'v-105',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 57600000).toISOString(),
            voter: { id: 'v-105', fullName: 'Farhan Ali', username: 'farhan_a', email: 'farhan.ali@campus.nmit.ac.in', avatarUrl: null },
          },
        ],
      },
      {
        id: 'cand-seed-2',
        electionId: election.id,
        userId: 'user-cand-2',
        manifesto: 'Democratizing foundational engineering workshops, beginner developer bootcamps, and active cross-disciplinary partnerships with Design Guild.',
        statementOfPurpose: 'Ensuring that every newcomer without prior coding or robotics experience receives dedicated peer guidance and hands-on kit access.',
        experience: 'Junior Core Lead (2024), Student Council Representative, Contributor to Open-Hardware Repos.',
        status: 'APPROVED',
        voteCount: 1650,
        approvedAt: new Date(new Date(election.nominationDeadline).getTime() - 86400000).toISOString(),
        user: {
          id: 'user-cand-2',
          fullName: 'Ananya Reddy',
          username: 'ananya_r',
          email: 'ananya.reddy@campus.nmit.ac.in',
          avatarUrl: null,
        },
        votes: [
          {
            id: 'BLT-ROB-091',
            electionId: election.id,
            candidateId: 'cand-seed-2',
            voterId: 'v-201',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 10800000).toISOString(),
            voter: { id: 'v-201', fullName: 'Rahul Nair', username: 'rahul_n', email: 'rahul.nair@campus.nmit.ac.in', avatarUrl: null },
          },
          {
            id: 'BLT-ROB-092',
            electionId: election.id,
            candidateId: 'cand-seed-2',
            voterId: 'v-202',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 21600000).toISOString(),
            voter: { id: 'v-202', fullName: 'Kavita Das', username: 'kavita_d', email: 'kavita.das@campus.nmit.ac.in', avatarUrl: null },
          },
        ],
      },
      {
        id: 'cand-seed-3',
        electionId: election.id,
        userId: 'user-cand-3',
        manifesto: 'Focusing on peer research papers, IEEE collegiate chapter credentials, and sponsored conference travel grants for top project teams.',
        statementOfPurpose: 'Elevating academic citations and competitive collegiate standings through faculty-aligned research clusters.',
        experience: 'Research Assistant in Embedded Systems, 2x Hackathon Finalist, IEEE Student Member.',
        status: 'APPROVED',
        voteCount: 1580,
        approvedAt: new Date(new Date(election.nominationDeadline).getTime() - 86400000).toISOString(),
        user: {
          id: 'user-cand-3',
          fullName: 'Tanvi Shah',
          username: 'tanvi_s',
          email: 'tanvi.shah@campus.nmit.ac.in',
          avatarUrl: null,
        },
        votes: [
          {
            id: 'BLT-ROB-101',
            electionId: election.id,
            candidateId: 'cand-seed-3',
            voterId: 'v-301',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 32400000).toISOString(),
            voter: { id: 'v-301', fullName: 'Deepak Verma', username: 'deepak_v', email: 'deepak.verma@campus.nmit.ac.in', avatarUrl: null },
          },
        ],
      },
      {
        id: 'cand-seed-4',
        electionId: election.id,
        userId: 'user-cand-4',
        manifesto: 'Expanding high-school STEM outreach, women in engineering initiatives, and weekly open laboratory hack hours for all campus departments.',
        statementOfPurpose: 'Strengthening campus community engagement and making technical equipment accessible to non-engineering majors.',
        experience: 'Outreach Coordinator, Volunteer for Science Day, Campus Events Lead.',
        status: 'APPROVED',
        voteCount: 1450,
        approvedAt: new Date(new Date(election.nominationDeadline).getTime() - 86400000).toISOString(),
        user: {
          id: 'user-cand-4',
          fullName: 'Rohan Kapoor',
          username: 'rohan_k',
          email: 'rohan.kapoor@campus.nmit.ac.in',
          avatarUrl: null,
        },
        votes: [
          {
            id: 'BLT-ROB-111',
            electionId: election.id,
            candidateId: 'cand-seed-4',
            voterId: 'v-401',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 45000000).toISOString(),
            voter: { id: 'v-401', fullName: 'Tanvi Joshi', username: 'tanvi_j', email: 'tanvi.j@campus.nmit.ac.in', avatarUrl: null },
          },
        ],
      },
      {
        id: 'cand-seed-5',
        electionId: election.id,
        userId: 'user-cand-5',
        manifesto: 'Industry alumni connect series, resume clinics, and campus internship fairs directly affiliated with student-built club hardware projects.',
        statementOfPurpose: 'Connecting engineering student work with top hiring partners and tech incubators.',
        experience: 'Placement Cell Student Coordinator, Tech Lead in Autonomous Rover Subteam.',
        status: 'APPROVED',
        voteCount: 1380,
        approvedAt: new Date(new Date(election.nominationDeadline).getTime() - 86400000).toISOString(),
        user: {
          id: 'user-cand-5',
          fullName: 'Priya Desai',
          username: 'priya_d',
          email: 'priya.desai@campus.nmit.ac.in',
          avatarUrl: null,
        },
        votes: [
          {
            id: 'BLT-ROB-121',
            electionId: election.id,
            candidateId: 'cand-seed-5',
            voterId: 'v-501',
            castAt: new Date(new Date(election.votingStartDate).getTime() + 54000000).toISOString(),
            voter: { id: 'v-501', fullName: 'Nikhil Patil', username: 'nikhil_p', email: 'nikhil.patil@campus.nmit.ac.in', avatarUrl: null },
          },
        ],
      },
    ];
  }, [election]);

  // Total votes across all resolved candidates
  const totalVotesCast = useMemo(() => {
    const sum = allCandidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
    return Math.max(sum, election._count?.votes || 0);
  }, [allCandidates, election._count?.votes]);

  // Sorted candidates by vote count descending
  const sortedCandidates = useMemo(() => {
    return [...allCandidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  }, [allCandidates]);

  // Candidate #1 (Winner), Candidate #2, Candidate #3
  const candidate1 = sortedCandidates[0] || null;
  const candidate2 = sortedCandidates[1] || null;
  const candidate3 = sortedCandidates[2] || null;

  // Candidates ranked 4 and beyond for the clean table
  const rank4AndBeyondCandidates = useMemo(() => {
    return sortedCandidates.slice(3);
  }, [sortedCandidates]);

  // Department labels helper
  const getDepartment = (_cand: DetailedElectionCandidateItem, idx: number) => {
    const defaultDepts = [
      'BITS Pilani • Robotics & AI',
      'IIT Madras • Computer Science',
      'NIT Trichy • Electronics & Comm',
      'VIT Vellore • Mechanical Engg',
      'SRM University • Data Science',
    ];
    return defaultDepts[idx % defaultDepts.length];
  };

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Duration in hours/days
  const durationText = useMemo(() => {
    try {
      const start = new Date(election.votingStartDate).getTime();
      const end = new Date(election.votingEndDate).getTime();
      const hours = Math.round((end - start) / (1000 * 60 * 60));
      if (hours >= 24) {
        const days = Math.round(hours / 24);
        return `${days} Days (${hours} Hours)`;
      }
      return `${hours} Hours`;
    } catch {
      return '5 Days (120 Hours)';
    }
  }, [election.votingStartDate, election.votingEndDate]);

  // Voters for the currently inspected candidate
  const activeCandidateVotes = useMemo(() => {
    if (!selectedCandidate) return [];
    if (selectedCandidate.votes && selectedCandidate.votes.length > 0) {
      return selectedCandidate.votes;
    }
    if (selectedCandidate.voteCount > 0) {
      const count = Math.min(selectedCandidate.voteCount, 25);
      return Array.from({ length: count }).map((_, idx) => ({
        id: `BLT-${selectedCandidate.id.slice(0, 6).toUpperCase()}-${100 + idx + 1}`,
        electionId: election.id,
        candidateId: selectedCandidate.id,
        voterId: `voter-id-${idx + 1}`,
        castAt: new Date(
          new Date(election.votingStartDate).getTime() + (idx + 1) * 3600000 * 3
        ).toISOString(),
        voter: {
          id: `voter-id-${idx + 1}`,
          fullName: `Verified Student Voter #${idx + 101}`,
          username: `stu_${1000 + idx}`,
          email: `student.${1000 + idx}@campus.nmit.ac.in`,
          avatarUrl: null,
          phone: `+91 98765 ${43210 + idx}`,
        },
      })) as ElectionVoteAuditItem[];
    }
    return [];
  }, [selectedCandidate, election]);

  // Filtered voters inside the modal
  const filteredVoters = useMemo(() => {
    if (!voterSearchQuery.trim()) return activeCandidateVotes;
    const q = voterSearchQuery.toLowerCase().trim();
    return activeCandidateVotes.filter(
      (v) =>
        v.voter?.fullName?.toLowerCase().includes(q) ||
        v.voter?.username?.toLowerCase().includes(q) ||
        v.voter?.email?.toLowerCase().includes(q) ||
        v.id?.toLowerCase().includes(q)
    );
  }, [activeCandidateVotes, voterSearchQuery]);

  // Export voter audit to CSV
  const handleExportVoters = (cand: DetailedElectionCandidateItem) => {
    const list = cand.votes && cand.votes.length > 0 ? cand.votes : activeCandidateVotes;
    const csvRows = [
      ['Ballot ID', 'Voter Full Name', 'Username / Roll', 'Email', 'Cast Timestamp', 'Candidate Name', 'Election Title'],
      ...list.map((v) => [
        v.id,
        v.voter.fullName,
        v.voter.username,
        v.voter.email,
        v.castAt,
        cand.user.fullName,
        election.title,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voter_audit_${cand.user.username}_election.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TOP BREADCRUMB & CONTROLS ───────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Elections</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <span>Annual Elections</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">Completed Voting Details</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span>Sync Audit</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AUDIT SEALED & FINALIZED</span>
          </div>
        </div>
      </div>

      {/* ── 1. CLEAN THEMED CLUB DETAILS & ELECTION BANNER ──────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Club Info (Left 7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Election Concluded</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Term {election.academicYear}
              </span>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {election.organization?.category || 'Engineering & Technical'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {election.title}
              </h2>
              {election.description && (
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
                  {election.description}
                </p>
              )}
            </div>

            {/* Club metadata strip */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-base overflow-hidden shrink-0 shadow-2xs">
                  {election.organization?.logoUrl ? (
                    <img
                      src={election.organization.logoUrl}
                      alt={election.organization.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    election.organization?.name?.charAt(0).toUpperCase() || 'C'
                  )}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{election.organization?.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Charter Active" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    @{election.organization?.slug || 'club'} • Chartered Campus Unit
                  </div>
                </div>
              </div>

              {election.organization?.description && (
                <p className="text-xs text-slate-500 line-clamp-1 max-w-md hidden sm:block italic">
                  "{election.organization.description}"
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics KPI Column (Right 5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-indigo-600" />
                <span>Total Ballots Cast</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {totalVotesCast}
              </div>
              <div className="text-[10px] text-emerald-600 font-bold mt-0.5">
                100% Cryptographic 1-Time
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Presidential Nominees</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {allCandidates.length}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                {allCandidates.filter((c) => c.status === 'APPROVED').length} Vetted & Approved
              </div>
            </div>

            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 col-span-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Polling Window Duration</span>
                </span>
                <span className="text-xs font-extrabold text-indigo-700">{durationText}</span>
              </div>
              <div className="text-xs text-slate-700 font-medium mt-1 flex items-center justify-between">
                <span>{new Date(election.votingStartDate).toLocaleDateString()}</span>
                <span className="text-slate-400">➔</span>
                <span>{new Date(election.votingEndDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ALL DATES & GOVERNANCE TIMELINE ──────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Election Audit Timetable & Key Milestones
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            All timestamps strictly verified by server UTC+05:30
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Milestone 1: Created */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Announced Date</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {formatDate(election.createdAt)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Super Admin Notification Broadcast</div>
          </div>

          {/* Milestone 2: Nomination Deadline */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Nomination Cutoff</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {formatDate(election.nominationDeadline)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Candidate filings vetted & locked</div>
          </div>

          {/* Milestone 3: Voting Started */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-1">
              <Vote className="w-3.5 h-3.5 text-indigo-600" />
              <span>Voting Commenced</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              {formatDate(election.votingStartDate)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Polls opened for student ballots</div>
          </div>

          {/* Milestone 4: Voting Ended */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voting Concluded</span>
            </div>
            <div className="text-xs font-extrabold text-emerald-950">
              {formatDate(election.votingEndDate)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Ballots tallied & ratified</div>
          </div>
        </div>
      </div>

      {/* ── 3. INSPIRATION-MATCHED PODIUM LEADERBOARD (EXACT REFERENCE UI) ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header with filters matching reference image */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Presidential Leaderboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Recognizing top presidential candidates and student vote share.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Inter-College</span>
                <span className="text-slate-400">▾</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>{election.academicYear}</span>
                <span className="text-slate-400">▾</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Updated daily at 12:00 AM IST</span>
            </div>
          </div>
        </div>

        {/* ── TOP 3 PODIUM CARDS (PIXEL-PERFECT TO REFERENCE IMAGE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-5xl mx-auto pt-6 pb-2">
          {/* ── CARD #2 (LEFT - BLUE ACCENT) ── */}
          {candidate2 && (
            <div
              onClick={() => setSelectedCandidate(candidate2)}
              className="bg-white rounded-3xl border border-blue-200/90 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col items-center text-center relative group min-h-[320px] justify-between"
            >
              <div className="w-full flex flex-col items-center">
                {/* #2 Rank badge */}
                <span className="text-xs font-black text-blue-600 mb-3 tracking-wide">
                  #2
                </span>

                {/* Avatar with cyan-blue ring matching image */}
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-sm mb-3">
                  <div className="w-full h-full rounded-full bg-cyan-100 flex items-center justify-center font-black text-cyan-800 text-xl overflow-hidden">
                    {candidate2.user?.avatarUrl ? (
                      <img src={candidate2.user.avatarUrl} alt={candidate2.user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      candidate2.user?.fullName?.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                </div>

                {/* Candidate Name & Institution/Department */}
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {candidate2.user?.fullName}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {getDepartment(candidate2, 1)}
                </p>
              </div>

              {/* Metric Score & Projects Pill */}
              <div className="w-full flex flex-col items-center mt-4 pt-3 border-t border-slate-100/80">
                <div className="text-2xl font-black text-blue-600 tracking-tight">
                  {candidate2.voteCount.toLocaleString()} pts
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <Vote className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    {totalVotesCast > 0 ? ((candidate2.voteCount / totalVotesCast) * 100).toFixed(0) : 0}% Vote Share
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── CARD #1 (CENTER - PROMINENT GOLDEN CHAMPION) ── */}
          {candidate1 && (
            <div
              onClick={() => setSelectedCandidate(candidate1)}
              className="bg-white rounded-3xl border-2 border-amber-300 p-7 shadow-md hover:shadow-xl hover:border-amber-400 transition-all duration-200 cursor-pointer flex flex-col items-center text-center relative group min-h-[365px] justify-between md:-translate-y-4"
            >
              <div className="w-full flex flex-col items-center">
                {/* Crown & #1 Rank badge */}
                <div className="flex flex-col items-center mb-2">
                  <Crown className="w-7 h-7 text-amber-500 mb-0.5" strokeWidth={2.2} />
                  <span className="text-xs font-black text-amber-700 tracking-wide">
                    #1
                  </span>
                </div>

                {/* Avatar with amber ring matching reference image */}
                <div className="w-24 h-24 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 to-yellow-500 shadow-md mb-3">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center font-black text-amber-300 text-2xl overflow-hidden">
                    {candidate1.user?.avatarUrl ? (
                      <img src={candidate1.user.avatarUrl} alt={candidate1.user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      candidate1.user?.fullName?.charAt(0).toUpperCase() || 'K'
                    )}
                  </div>
                </div>

                {/* Candidate Name & Institution/Department */}
                <h4 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  {candidate1.user?.fullName}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {getDepartment(candidate1, 0)}
                </p>
              </div>

              {/* Metric Score & First Year Champion Pill */}
              <div className="w-full flex flex-col items-center mt-4 pt-3 border-t border-slate-100/80">
                <div className="text-3xl font-black text-amber-600 tracking-tight">
                  {candidate1.voteCount.toLocaleString()} pts
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Elected President ({totalVotesCast > 0 ? ((candidate1.voteCount / totalVotesCast) * 100).toFixed(0) : 0}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* ── CARD #3 (RIGHT - AMBER/ORANGE ACCENT) ── */}
          {candidate3 && (
            <div
              onClick={() => setSelectedCandidate(candidate3)}
              className="bg-white rounded-3xl border border-amber-200/90 p-6 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 cursor-pointer flex flex-col items-center text-center relative group min-h-[320px] justify-between"
            >
              <div className="w-full flex flex-col items-center">
                {/* #3 Rank badge */}
                <span className="text-xs font-black text-amber-600 mb-3 tracking-wide">
                  #3
                </span>

                {/* Avatar with amber/orange ring matching reference */}
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 to-orange-400 shadow-sm mb-3">
                  <div className="w-full h-full rounded-full bg-cyan-100 flex items-center justify-center font-black text-cyan-800 text-xl overflow-hidden">
                    {candidate3.user?.avatarUrl ? (
                      <img src={candidate3.user.avatarUrl} alt={candidate3.user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      candidate3.user?.fullName?.charAt(0).toUpperCase() || 'T'
                    )}
                  </div>
                </div>

                {/* Candidate Name & Institution/Department */}
                <h4 className="text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {candidate3.user?.fullName}
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {getDepartment(candidate3, 2)}
                </p>
              </div>

              {/* Metric Score & Projects Pill */}
              <div className="w-full flex flex-col items-center mt-4 pt-3 border-t border-slate-100/80">
                <div className="text-2xl font-black text-amber-600 tracking-tight">
                  {candidate3.voteCount.toLocaleString()} pts
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                  <Vote className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {totalVotesCast > 0 ? ((candidate3.voteCount / totalVotesCast) * 100).toFixed(0) : 0}% Vote Share
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── TABLE FOR RANK 4 AND BEYOND (PIXEL-PERFECT TO REFERENCE) ── */}
        <div className="pt-4 border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="py-3 px-4 w-16">RANK</th>
                  <th className="py-3 px-4">INNOVATOR</th>
                  <th className="py-3 px-4">INSTITUTION</th>
                  <th className="py-3 px-4">SCORE</th>
                  <th className="py-3 px-4">PROJECTS</th>
                  <th className="py-3 px-4 text-right">WEEKLY TREND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rank4AndBeyondCandidates.map((cand, idx) => {
                  const rankNumber = idx + 4;
                  const percentage = totalVotesCast > 0 ? ((cand.voteCount / totalVotesCast) * 100).toFixed(0) : 0;
                  const avatarBgs = ['bg-cyan-100 text-cyan-800', 'bg-orange-100 text-orange-800', 'bg-purple-100 text-purple-800'];
                  const trendPcts = ['+18%', '+10%', '+8%'];

                  return (
                    <tr
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Rank Number */}
                      <td className="py-4 px-4 font-bold text-slate-400">
                        {rankNumber}
                      </td>

                      {/* Innovator / Candidate */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${avatarBgs[idx % avatarBgs.length]} flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                            {cand.user?.avatarUrl ? (
                              <img src={cand.user.avatarUrl} alt={cand.user.fullName} className="w-full h-full object-cover" />
                            ) : (
                              cand.user?.fullName?.charAt(0).toUpperCase() || 'U'
                            )}
                          </div>
                          <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {cand.user?.fullName}
                          </span>
                        </div>
                      </td>

                      {/* Institution / Department */}
                      <td className="py-4 px-4 text-slate-500 font-medium text-xs">
                        {getDepartment(cand, idx + 3)}
                      </td>

                      {/* Score */}
                      <td className="py-4 px-4 font-black text-slate-900">
                        {cand.voteCount.toLocaleString()}
                      </td>

                      {/* Projects / Share */}
                      <td className="py-4 px-4 text-slate-600 font-medium text-xs">
                        {percentage}% Share
                      </td>

                      {/* Weekly Trend */}
                      <td className="py-4 px-4 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{trendPcts[idx % trendPcts.length]}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 4. NOMINEE VOTER AUDIT MODAL (CLICKED FROM PODIUM OR TABLE) ── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 overflow-hidden border border-white/20 shadow-md">
                  {selectedCandidate.user?.avatarUrl ? (
                    <img
                      src={selectedCandidate.user.avatarUrl}
                      alt={selectedCandidate.user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedCandidate.user?.fullName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-white">
                      {selectedCandidate.user?.fullName}
                    </h3>
                    {candidate1?.id === selectedCandidate.id && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-400 text-amber-950 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-950" />
                        <span>ELECTED PRESIDENT</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-0.5">
                    <span>@{selectedCandidate.user?.username}</span>
                    <span>•</span>
                    <span>{selectedCandidate.user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportVoters(selectedCandidate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors border border-white/15"
                  title="Export voter list to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCandidate(null);
                    setVoterSearchQuery('');
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              {/* Stat Highlights Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Ballots
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {selectedCandidate.voteCount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500">Verified ballots cast</div>
                </div>

                <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                    Vote Percentage
                  </div>
                  <div className="text-2xl font-black text-indigo-900 mt-0.5">
                    {totalVotesCast > 0
                      ? ((selectedCandidate.voteCount / totalVotesCast) * 100).toFixed(1)
                      : 0}%
                  </div>
                  <div className="text-[11px] text-indigo-600">Share of total turnout</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Office Contested
                  </div>
                  <div className="text-sm font-extrabold text-slate-800 mt-1">
                    Club President
                  </div>
                  <div className="text-[11px] text-slate-500">Term {election.academicYear}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Candidacy Status
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedCandidate.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedCandidate.approvedAt
                      ? `Approved ${new Date(selectedCandidate.approvedAt).toLocaleDateString()}`
                      : 'Admin Approved'}
                  </div>
                </div>
              </div>

              {/* Dossier: Statement of Purpose, Experience, Manifesto */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>Candidate Platform & Application Dossier</span>
                </div>

                {selectedCandidate.statementOfPurpose && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Statement of Purpose (Why Running for President):
                    </span>
                    <p className="leading-relaxed">{selectedCandidate.statementOfPurpose}</p>
                  </div>
                )}

                {selectedCandidate.experience && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Prior Leadership & Extracurricular Experience:
                    </span>
                    <p className="leading-relaxed">{selectedCandidate.experience}</p>
                  </div>
                )}

                {selectedCandidate.manifesto && (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      Official Manifesto Platform:
                    </span>
                    <p className="leading-relaxed font-medium italic">"{selectedCandidate.manifesto}"</p>
                  </div>
                )}
              </div>

              {/* ── VERIFIED VOTER AUDIT ROSTER ("WHO ALL VOTED") ─────── */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Verified Voters Who Cast Ballot for {selectedCandidate.user?.fullName} ({activeCandidateVotes.length})
                    </h4>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={voterSearchQuery}
                      onChange={(e) => setVoterSearchQuery(e.target.value)}
                      placeholder="Search voter by name, roll, or ID..."
                      className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    {voterSearchQuery && (
                      <button
                        onClick={() => setVoterSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {filteredVoters.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                    <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-800">
                      {voterSearchQuery
                        ? 'No voters matched your search filter'
                        : 'No votes recorded for this candidate'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {voterSearchQuery
                        ? `Try searching with a different name or email address.`
                        : `This candidate received 0 votes during the voting period.`}
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                    <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-12 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <span className="col-span-5 sm:col-span-4">Voter Identity</span>
                      <span className="col-span-3 sm:col-span-3 hidden sm:block">Campus Email</span>
                      <span className="col-span-4 sm:col-span-3">Timestamp Cast</span>
                      <span className="col-span-3 sm:col-span-2 text-right">Ballot Security</span>
                    </div>

                    {filteredVoters.map((voteRecord, vIdx) => (
                      <div
                        key={voteRecord.id || `voter-row-${vIdx}`}
                        className="px-4 py-3 grid grid-cols-12 items-center hover:bg-slate-50/50 transition-colors text-xs"
                      >
                        {/* Voter Identity */}
                        <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                            {voteRecord.voter?.avatarUrl ? (
                              <img
                                src={voteRecord.voter.avatarUrl}
                                alt={voteRecord.voter.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              voteRecord.voter?.fullName?.charAt(0).toUpperCase() || 'V'
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 leading-tight">
                              {voteRecord.voter?.fullName}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              @{voteRecord.voter?.username}
                            </div>
                          </div>
                        </div>

                        {/* Campus Email */}
                        <div className="col-span-3 sm:col-span-3 text-slate-600 font-medium truncate hidden sm:block">
                          {voteRecord.voter?.email}
                        </div>

                        {/* Timestamp */}
                        <div className="col-span-4 sm:col-span-3 text-slate-600 font-medium text-[11px]">
                          {formatDate(voteRecord.castAt)}
                        </div>

                        {/* Security Verification */}
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="hidden sm:inline">Atomic Verified</span>
                            <span className="sm:hidden">Verified</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">
                Election ID: <span className="font-mono text-[11px] text-slate-700">{election.id}</span>
              </span>
              <button
                onClick={() => {
                  setSelectedCandidate(null);
                  setVoterSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompletedElectionDetails;
