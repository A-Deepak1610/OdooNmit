import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { exportToCsv } from './utils/exportCsv';

interface WinnerEntry {
  id: string;
  rank: number;
  event: string;
  category: string;
  teamName: string;
  members: string[];
  projectTitle: string;
  prizeAmount: number;
  score: string;
  date: string;
}

const INITIAL_WINNERS: WinnerEntry[] = [
  {
    id: 'WIN-001',
    rank: 1,
    event: 'HackNMIT 36-Hour National Hackathon',
    category: 'Full-Stack & Web3 Track',
    teamName: 'Team ByteForce',
    members: ['THIRUMURUGAN K', 'DEEPAK A', 'HEMANTH S V', 'RITHISH S'],
    projectTitle: 'CampusFlow & CampusFlow Sovereign Club ERP',
    prizeAmount: 50000,
    score: '98.5 / 100',
    date: 'Oct 2026',
  },
  {
    id: 'WIN-002',
    rank: 2,
    event: 'HackNMIT 36-Hour National Hackathon',
    category: 'AI & Smart Governance',
    teamName: 'NeuralCrafters',
    members: ['Vikram Malhotra', 'Pooja Hegde', 'Aarav Patel'],
    projectTitle: 'Smart Campus AI Timetable & Room Allocator',
    prizeAmount: 30000,
    score: '94.2 / 100',
    date: 'Oct 2026',
  },
  {
    id: 'WIN-003',
    rank: 3,
    event: 'HackNMIT 36-Hour National Hackathon',
    category: 'Fintech & Dues Automation',
    teamName: 'LedgerPros',
    members: ['Ananya Iyer', 'Karthik Raja', 'Meera Nambiar'],
    projectTitle: 'Decentralized Student Dues & Micro-Grants Pool',
    prizeAmount: 15000,
    score: '89.7 / 100',
    date: 'Oct 2026',
  },
  {
    id: 'WIN-004',
    rank: 1,
    event: 'Robotics Combat Arena 2026',
    category: 'Heavyweight Battlebots',
    teamName: 'IronVortex',
    members: ['Siddharth Rao', 'Rohit Sen', 'Farhan Khan'],
    projectTitle: 'Titanium Crusher Bot v3',
    prizeAmount: 25000,
    score: 'Knockout (Finals)',
    date: 'Sep 2026',
  },
  {
    id: 'WIN-005',
    rank: 1,
    event: 'Campus Innovation Pitch Challenge',
    category: 'Startup Incubation',
    teamName: 'SolarFlow CleanTech',
    members: ['Kavya Sundaram', 'Tanvi Mehta'],
    projectTitle: 'Rooftop IoT Microgrid for Academic Labs',
    prizeAmount: 40000,
    score: '96.0 / 100',
    date: 'Aug 2026',
  },
];

export const AdminWinnersPage: React.FC = () => {
  const [winners] = useState<WinnerEntry[]>(INITIAL_WINNERS);
  const [eventFilter, setEventFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredWinners = winners.filter((w) => {
    const matchesEvent = eventFilter === 'ALL' || w.event === eventFilter;
    const matchesSearch =
      w.teamName.toLowerCase().includes(search.toLowerCase()) ||
      w.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      w.members.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    return matchesEvent && matchesSearch;
  });

  const top3 = filteredWinners.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
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
                color: '#b45309',
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Institutional Honor Roll
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Academic & Competition Excellence
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Competition Winners & Hall of Fame
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Official records of campus hackathons, technical symposia, and cultural competitions with prize disbursement ledgers.
          </p>
        </div>

        <button
          onClick={() => {
            const cols = [
              { header: 'Rank', accessor: (w: WinnerEntry) => w.rank },
              { header: 'Team', accessor: (w: WinnerEntry) => w.teamName },
              { header: 'Project', accessor: (w: WinnerEntry) => w.projectTitle },
              { header: 'Event', accessor: (w: WinnerEntry) => w.event },
              { header: 'Category', accessor: (w: WinnerEntry) => w.category },
              { header: 'Members', accessor: (w: WinnerEntry) => w.members.join(', ') },
              { header: 'Prize (INR)', accessor: (w: WinnerEntry) => w.prizeAmount },
              { header: 'Score', accessor: (w: WinnerEntry) => w.score },
            ];
            exportToCsv('campus_winners_ledger', cols, winners);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: '#1e3a8a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Download size={15} />
          Export Honor Roll (CSV)
        </button>
      </div>

      {/* Podium Showcase (Top 3) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {top3.map((w) => {
          const isFirst = w.rank === 1;
          const isSecond = w.rank === 2;
          const badgeBg = isFirst ? '#fef3c7' : isSecond ? '#f1f5f9' : '#fed7aa';
          const badgeColor = isFirst ? '#b45309' : isSecond ? '#475569' : '#c2410c';
          const medalTitle = isFirst ? '1st Place • Champion' : isSecond ? '2nd Place • Runner-Up' : '3rd Place • 2nd Runner-Up';

          return (
            <div
              key={w.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: isFirst ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isFirst ? '0 10px 25px -5px rgba(245, 158, 11, 0.15)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      background: badgeBg,
                      color: badgeColor,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Trophy size={13} />
                    {medalTitle}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                    ₹{w.prizeAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
                  {w.teamName}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  {w.projectTitle}
                </div>
                <div style={{ fontSize: '11px', color: '#818cf8', fontWeight: 600, marginBottom: '12px' }}>
                  {w.event} • {w.category}
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '10px',
                    border: '1px solid #f1f5f9',
                    fontSize: '12px',
                    color: '#334155',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                    Team Roster:
                  </span>
                  {w.members.join(' • ')}
                </div>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: '#94a3b8',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '10px',
                }}
              >
                <span>Score: {w.score}</span>
                <span>Disbursed: {w.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search teams, projects, or students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              paddingLeft: '38px',
              paddingRight: '12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              background: '#f8fafc',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
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
            <option value="ALL">All Competitions ({winners.length})</option>
            <option value="HackNMIT 36-Hour National Hackathon">HackNMIT 36-Hour Hackathon</option>
            <option value="Robotics Combat Arena 2026">Robotics Combat Arena</option>
            <option value="Campus Innovation Pitch Challenge">Campus Innovation Pitch</option>
          </select>
        </div>
      </div>

      {/* Complete Table */}
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
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>RANK</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>TEAM & PROJECT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>EVENT & TRACK</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>MEMBERS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>PRIZE (₹)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>CERTIFICATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.map((w) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        fontWeight: 700,
                        fontSize: '12px',
                        background: w.rank === 1 ? '#fef3c7' : w.rank === 2 ? '#f1f5f9' : '#fed7aa',
                        color: w.rank === 1 ? '#b45309' : w.rank === 2 ? '#475569' : '#c2410c',
                      }}
                    >
                      #{w.rank}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{w.teamName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{w.projectTitle}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ color: '#1e3a8a', fontWeight: 500 }}>{w.event}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{w.category}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12px' }}>
                    {w.members.join(', ')}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#16a34a' }}>
                    ₹{w.prizeAmount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#2563eb',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <Award size={14} />
                      Verified
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
