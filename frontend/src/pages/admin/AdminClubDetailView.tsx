import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Users,
  IndianRupee,
  Calendar,
  MapPin,
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Ticket,
  Download,
  Coins,
  Edit3,
  Search,
  Filter,
  Send,
  Check,
} from 'lucide-react';
import { CampusClub } from './data/clubs';
import { exportToCsv } from './utils/exportCsv';

export interface AdminClubDetailViewProps {
  club: CampusClub;
  onBack: () => void;
  onEdit: (club: CampusClub) => void;
  onGrantBudget: (club: CampusClub) => void;
}

interface ClubMemberRecord {
  id: string;
  name: string;
  email: string;
  membershipId: string;
  department: string;
  semester: number;
  joinedDate: string;
  duesStatus: 'PAID' | 'PENDING' | 'OVERDUE';
  duesAmount: number;
  paidAt?: string;
  receiptNumber?: string;
  tier: 'Standard' | 'Premium';
}

interface ClubEventRecord {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  capacity: number;
  soldCount: number;
  checkedInCount: number;
  revenue: number;
  memberPrice: number;
  generalPrice: number;
}

// Generate realistic roster data tailored to this club
function getClubMembers(club: CampusClub): ClubMemberRecord[] {
  const basePrefix = club.slug.toUpperCase().slice(0, 3);
  return [
    {
      id: `${club.id}-m1`,
      name: 'THIRUMURUGAN K',
      email: 'thirumurugank.al24@bitsathy.ac.in',
      membershipId: `${basePrefix}-2026-0001`,
      department: 'Artificial Intelligence & DS',
      semester: 7,
      joinedDate: 'Aug 12, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Aug 14, 2025',
      receiptNumber: `RCP-${club.slug}-101`,
      tier: 'Premium',
    },
    {
      id: `${club.id}-m2`,
      name: club.presidentName || 'Deepak Kumar',
      email: club.presidentEmail || 'deepaka.ad24@bitsathy.ac.in',
      membershipId: `${basePrefix}-2026-0002`,
      department: 'Computer Science',
      semester: 7,
      joinedDate: 'Aug 10, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Aug 10, 2025',
      receiptNumber: `RCP-${club.slug}-102`,
      tier: 'Premium',
    },
    {
      id: `${club.id}-m3`,
      name: 'Hemanth S V',
      email: 'hemanthsv.al24@bitsathy.ac.in',
      membershipId: `${basePrefix}-2026-0003`,
      department: 'AI & Data Science',
      semester: 7,
      joinedDate: 'Aug 15, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Aug 16, 2025',
      receiptNumber: `RCP-${club.slug}-103`,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m4`,
      name: 'Priya Sundaram',
      email: 'priya.sundaram@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0014`,
      department: 'Information Science',
      semester: 5,
      joinedDate: 'Sep 01, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Sep 02, 2025',
      receiptNumber: `RCP-${club.slug}-104`,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m5`,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0022`,
      department: 'Electronics & Comm.',
      semester: 5,
      joinedDate: 'Sep 10, 2025',
      duesStatus: 'PENDING',
      duesAmount: club.duesAmount,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m6`,
      name: 'Sneha Patel',
      email: 'sneha.patel@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0035`,
      department: 'Computer Science',
      semester: 3,
      joinedDate: 'Oct 02, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Oct 03, 2025',
      receiptNumber: `RCP-${club.slug}-105`,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m7`,
      name: 'Rohan Mehra',
      email: 'rohan.mehra@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0048`,
      department: 'Mechanical Eng.',
      semester: 5,
      joinedDate: 'Oct 15, 2025',
      duesStatus: 'PENDING',
      duesAmount: club.duesAmount,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m8`,
      name: 'Divya Nair',
      email: 'divya.nair@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0051`,
      department: 'Biotechnology',
      semester: 3,
      joinedDate: 'Nov 01, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Nov 01, 2025',
      receiptNumber: `RCP-${club.slug}-106`,
      tier: 'Premium',
    },
    {
      id: `${club.id}-m9`,
      name: 'Vikram Aditya',
      email: 'vikram.aditya@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0062`,
      department: 'Civil Engineering',
      semester: 5,
      joinedDate: 'Nov 12, 2025',
      duesStatus: 'OVERDUE',
      duesAmount: club.duesAmount,
      tier: 'Standard',
    },
    {
      id: `${club.id}-m10`,
      name: 'Kavya Sen',
      email: 'kavya.sen@nmit.edu.in',
      membershipId: `${basePrefix}-2026-0075`,
      department: 'AI & Machine Learning',
      semester: 3,
      joinedDate: 'Dec 05, 2025',
      duesStatus: 'PAID',
      duesAmount: club.duesAmount,
      paidAt: 'Dec 06, 2025',
      receiptNumber: `RCP-${club.slug}-107`,
      tier: 'Standard',
    },
  ];
}

// Generate realistic events organized by this club
function getClubEvents(club: CampusClub): ClubEventRecord[] {
  if (club.category === 'Technical') {
    return [
      {
        id: `${club.id}-e1`,
        title: `${club.name} HackNMIT 36-Hr National Hackathon`,
        date: 'May 15-17, 2026',
        time: '9:00 AM - 9:00 PM',
        venue: 'Turing Block Auditorium & Tech Hub',
        status: 'ACTIVE',
        capacity: 450,
        soldCount: 380,
        checkedInCount: 342,
        revenue: 76000,
        memberPrice: 100,
        generalPrice: 250,
      },
      {
        id: `${club.id}-e2`,
        title: 'Full-Stack Distributed Systems Bootcamp',
        date: 'June 02, 2026',
        time: '2:00 PM - 6:00 PM',
        venue: 'Computer Center Lab 4',
        status: 'UPCOMING',
        capacity: 150,
        soldCount: 112,
        checkedInCount: 0,
        revenue: 16800,
        memberPrice: 50,
        generalPrice: 150,
      },
      {
        id: `${club.id}-e3`,
        title: 'Open Source Demo Day & Project Showcase',
        date: 'March 20, 2026',
        time: '10:00 AM - 4:00 PM',
        venue: 'Main Seminar Hall B',
        status: 'COMPLETED',
        capacity: 200,
        soldCount: 195,
        checkedInCount: 188,
        revenue: 19500,
        memberPrice: 0,
        generalPrice: 100,
      },
    ];
  }

  return [
    {
      id: `${club.id}-e1`,
      title: `${club.name} Annual Spring Gala 2026`,
      date: 'April 24, 2026',
      time: '6:30 PM - 10:30 PM',
      venue: 'Main Campus Grand Auditorium',
      status: 'ACTIVE',
      capacity: 500,
      soldCount: 420,
      checkedInCount: 385,
      revenue: 58500,
      memberPrice: 100,
      generalPrice: 250,
    },
    {
      id: `${club.id}-e2`,
      title: 'Spring Charity Bake Sale & Community Drive',
      date: 'May 02, 2026',
      time: '10:00 AM - 4:00 PM',
      venue: 'Student Union Plaza Quad',
      status: 'UPCOMING',
      capacity: 300,
      soldCount: 180,
      checkedInCount: 0,
      revenue: 14400,
      memberPrice: 80,
      generalPrice: 100,
    },
    {
      id: `${club.id}-e3`,
      title: 'Campus Talent Night & Acoustic Showcase',
      date: 'March 14, 2026',
      time: '5:00 PM - 9:00 PM',
      venue: 'Open Air Amphitheatre',
      status: 'COMPLETED',
      capacity: 600,
      soldCount: 560,
      checkedInCount: 512,
      revenue: 56000,
      memberPrice: 50,
      generalPrice: 150,
    },
  ];
}

export const AdminClubDetailView: React.FC<AdminClubDetailViewProps> = ({
  club,
  onBack,
  onEdit,
  onGrantBudget,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'events' | 'leadership' | 'treasury'>('members');
  const [members, setMembers] = useState<ClubMemberRecord[]>(() => getClubMembers(club));
  const [events] = useState<ClubEventRecord[]>(() => getClubEvents(club));
  const [searchMember, setSearchMember] = useState('');
  const [duesFilter, setDuesFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSendDuesReminder = (member: ClubMemberRecord) => {
    showToast(`Dues payment reminder sent to ${member.name} (${member.email}).`);
  };

  const handleMarkDuesPaid = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? {
              ...m,
              duesStatus: 'PAID' as const,
              paidAt: 'Just now',
              receiptNumber: `RCP-ADMIN-${Date.now().toString().slice(-4)}`,
            }
          : m
      )
    );
    showToast('Member dues marked as paid. Digital receipt generated.');
  };

  const handleExportRoster = () => {
    exportToCsv(
      `${club.slug}_members_roster`,
      [
        { header: 'Member ID', accessor: (m) => m.membershipId },
        { header: 'Full Name', accessor: (m) => m.name },
        { header: 'Email', accessor: (m) => m.email },
        { header: 'Department', accessor: (m) => m.department },
        { header: 'Semester', accessor: (m) => m.semester },
        { header: 'Tier', accessor: (m) => m.tier },
        { header: 'Dues Status', accessor: (m) => m.duesStatus },
        { header: 'Dues Amount (INR)', accessor: (m) => m.duesAmount },
        { header: 'Paid Date', accessor: (m) => m.paidAt || 'N/A' },
        { header: 'Receipt #', accessor: (m) => m.receiptNumber || 'N/A' },
      ],
      filteredMembers
    );
  };

  // Calculations
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.email.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.department.toLowerCase().includes(searchMember.toLowerCase());
    const matchesDues = duesFilter === 'ALL' || m.duesStatus === duesFilter;
    return matchesSearch && matchesDues;
  });

  const paidCount = members.filter((m) => m.duesStatus === 'PAID').length;
  const pendingCount = members.filter((m) => m.duesStatus !== 'PAID').length;
  const totalCollectedDues = paidCount * club.duesAmount;
  const totalPendingDues = pendingCount * club.duesAmount;
  const totalEventRevenue = events.reduce((acc, e) => acc + e.revenue, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-family-body)' }}>
      {/* ── Notification Toast ── */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#1e293b',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* ── Top Navigation Bar: Back Button & Actions ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: 'white',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Organizations</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportRoster}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'white',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Download size={15} color="#64748b" />
            <span>Export Roster CSV</span>
          </button>

          <button
            onClick={() => onGrantBudget(club)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1e3a8a',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Coins size={15} />
            <span>Grant Treasury</span>
          </button>

          <button
            onClick={() => onEdit(club)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#1e3a8a',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Edit3 size={15} />
            <span>Edit Charter</span>
          </button>
        </div>
      </div>

      {/* ── Hero Organization Identity Banner ── */}
      <div
        style={{
          background: 'white',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ height: '8px', background: club.accentColor || '#1e3a8a' }} />
        <div
          style={{
            padding: '24px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flex: 1, minWidth: '320px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '14px',
                background: club.accentColor || '#1e3a8a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '22px',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              {club.name.slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                    textTransform: 'uppercase',
                  }}
                >
                  {club.category} Domain
                </span>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: club.status === 'Active' ? '#dcfce7' : '#fef2f2',
                    color: club.status === 'Active' ? '#15803d' : '#dc2626',
                    border: `1px solid ${club.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                  }}
                >
                  {club.status} Charter
                </span>

                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                  slug: <code>/{club.slug}</code>
                </span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                {club.name}
              </h1>

              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.5, maxWidth: '780px' }}>
                {club.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="#64748b" />
                  <strong>Meeting Venue:</strong> {club.meetingVenue}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} color="#64748b" />
                  <strong>Charter Expiry:</strong> {club.charterExpiry}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Mail size={14} color="#64748b" />
                  {club.officialEmail}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Metrics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Enrolled Members</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{club.memberCount} Students</div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>{paidCount} Verified Dues Paid</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
            <IndianRupee size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Annual Dues Rate</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#15803d' }}>₹{club.duesAmount} / yr</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>₹{totalCollectedDues.toLocaleString()} Collected</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#be185d' }}>
            <Ticket size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Events Organized</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{events.length} Flagship Events</div>
            <div style={{ fontSize: '11px', color: '#be185d', fontWeight: 600 }}>₹{totalEventRevenue.toLocaleString()} Ticket Revenue</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <Coins size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Treasury Reserves</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#7c3aed' }}>₹{club.treasuryBalance.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Budget: ₹{club.allocatedBudget.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: 'white',
          borderRadius: '12px 12px 0 0',
          padding: '4px 8px 0 8px',
          gap: '6px',
        }}
      >
        <button
          onClick={() => setActiveTab('members')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'members' ? '3px solid #1e3a8a' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'members' ? '#1e3a8a' : '#64748b',
            fontWeight: activeTab === 'members' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Users size={16} />
          <span>Members List & Dues Status ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'events' ? '3px solid #1e3a8a' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'events' ? '#1e3a8a' : '#64748b',
            fontWeight: activeTab === 'events' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Calendar size={16} />
          <span>Events Organized & Tickets ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leadership')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'leadership' ? '3px solid #1e3a8a' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'leadership' ? '#1e3a8a' : '#64748b',
            fontWeight: activeTab === 'leadership' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <UserCheck size={16} />
          <span>Executive Leadership & Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('treasury')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            border: 'none',
            borderBottom: activeTab === 'treasury' ? '3px solid #1e3a8a' : '3px solid transparent',
            background: 'none',
            color: activeTab === 'treasury' ? '#1e3a8a' : '#64748b',
            fontWeight: activeTab === 'treasury' ? 700 : 500,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Coins size={16} />
          <span>Treasury, Ledger & Grants</span>
        </button>
      </div>

      {/* ── TAB 1: MEMBERS LIST & DUES STATUS ── */}
      {activeTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dues Progress Bar Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                  Annual Dues Collection Progress
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                  ₹{club.duesAmount} per member annual renewal
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#15803d' }}>
                ₹{totalCollectedDues.toLocaleString()} of ₹{(members.length * club.duesAmount).toLocaleString()} ({Math.round((paidCount / members.length) * 100)}%)
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  background: '#16a34a',
                  width: `${(paidCount / members.length) * 100}%`,
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {paidCount} Members Paid</span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>⏳ {pendingCount} Pending Dues (₹{totalPendingDues.toLocaleString()})</span>
            </div>
          </div>

          {/* Members Table Controls Bar */}
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '380px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search member by name, email, or ID..."
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  style={{
                    width: '100%',
                    height: '36px',
                    paddingLeft: '36px',
                    paddingRight: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    background: '#f8fafc',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} color="#64748b" />
                <select
                  value={duesFilter}
                  onChange={(e) => setDuesFilter(e.target.value as any)}
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: 'white',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Dues Statuses ({members.length})</option>
                  <option value="PAID">Paid Only ({paidCount})</option>
                  <option value="PENDING">Pending / Overdue ({pendingCount})</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportRoster}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Members Table */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                    <th style={{ padding: '12px 18px', fontWeight: 600 }}>MEMBER NAME</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>MEMBERSHIP ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>DEPARTMENT & SEM</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>TIER</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>DUES STATUS</th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => {
                    const isPaid = m.duesStatus === 'PAID';

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: club.accentColor,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{m.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{m.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e3a8a', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                            {m.membershipId}
                          </span>
                        </td>

                        <td style={{ padding: '14px 14px', color: '#475569' }}>
                          <div>{m.department}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Semester {m.semester}</div>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: m.tier === 'Premium' ? '#7c3aed' : '#475569', background: m.tier === 'Premium' ? '#f3e8ff' : '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                            {m.tier}
                          </span>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          {isPaid ? (
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                                <Check size={12} /> PAID (₹{m.duesAmount})
                              </span>
                              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                                Ref: {m.receiptNumber}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                                <Clock size={12} /> DUE (₹{m.duesAmount})
                              </span>
                              <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '2px' }}>
                                Payment pending
                              </div>
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            {!isPaid ? (
                              <>
                                <button
                                  onClick={() => handleSendDuesReminder(m)}
                                  title="Send Email Reminder"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 10px',
                                    background: '#eff6ff',
                                    color: '#1e3a8a',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Send size={11} />
                                  <span>Remind</span>
                                </button>
                                <button
                                  onClick={() => handleMarkDuesPaid(m.id)}
                                  style={{
                                    padding: '5px 10px',
                                    background: '#16a34a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Mark Paid
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>
                                ✓ Verified Active
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: EVENTS ORGANIZED ── */}
      {activeTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {events.map((evt) => {
              const turnoutRate = evt.soldCount > 0 ? Math.round((evt.checkedInCount / evt.soldCount) * 100) : 0;
              const isPast = evt.status === 'COMPLETED';

              return (
                <div
                  key={evt.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: evt.status === 'ACTIVE' ? '#dcfce7' : evt.status === 'UPCOMING' ? '#eff6ff' : '#f1f5f9',
                          color: evt.status === 'ACTIVE' ? '#15803d' : evt.status === 'UPCOMING' ? '#1e3a8a' : '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {evt.status}
                      </span>
                      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '8px 0 4px 0' }}>
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#1e3a8a" />
                      <span>{evt.date} • {evt.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="#1e3a8a" />
                      <span>{evt.venue}</span>
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Member Rate: </span>
                      <strong style={{ color: '#15803d' }}>₹{evt.memberPrice}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>General Public: </span>
                      <strong style={{ color: '#1e293b' }}>₹{evt.generalPrice}</strong>
                    </div>
                  </div>

                  {/* Attendance & Turnout Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b' }}>Tickets Sold & Capacity:</span>
                      <strong style={{ color: '#1e293b' }}>
                        {evt.soldCount} / {evt.capacity} Capacity ({Math.round((evt.soldCount / evt.capacity) * 100)}%)
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#2563eb', width: `${(evt.soldCount / evt.capacity) * 100}%` }} />
                    </div>

                    {!isPast && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                        <span>Door Check-in Turnout:</span>
                        <span style={{ color: '#15803d', fontWeight: 600 }}>{evt.checkedInCount} Admitted ({turnoutRate}%)</span>
                      </div>
                    )}
                  </div>

                  {/* Revenue Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Gross Gate Revenue:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>
                      ₹{evt.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: EXECUTIVE LEADERSHIP & CONTACTS ── */}
      {activeTab === 'leadership' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {/* President Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e3a8a' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>
                  Designated Executive Lead
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>
                  Club President
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Officer Name</div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{club.presidentName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Institutional Email</div>
                <div style={{ color: '#1e3a8a', fontWeight: 500 }}>{club.presidentEmail}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Official Phone</div>
                <div style={{ color: '#475569' }}>{club.presidentPhone}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Governance Scope</div>
                <div style={{ color: '#15803d', fontWeight: 600 }}>Full Organization Administrator Authority</div>
              </div>
            </div>
          </div>

          {/* Faculty Advisor Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#15803d' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                  Institutional Mentor
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>
                  Faculty Advisor
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Faculty Name & Title</div>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{club.facultyAdvisor}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Advisor Email</div>
                <div style={{ color: '#1e3a8a', fontWeight: 500 }}>{club.advisorEmail}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Charter Accreditation</div>
                <div style={{ color: '#475569' }}>Verified Academic Dean Office</div>
              </div>
            </div>
          </div>

          {/* Charter Governance Specifications */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <Building2 size={24} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Institutional Charter
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>
                  Meeting & Venues
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Official Meeting Venue</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{club.meetingVenue}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Charter Inception</div>
                <div style={{ color: '#475569' }}>Established {club.establishedDate} (Founded {club.foundedYear})</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Accreditation Tenure Expiration</div>
                <div style={{ color: '#b45309', fontWeight: 600 }}>Active until {club.charterExpiry}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: TREASURY, LEDGER & GRANTS ── */}
      {activeTab === 'treasury' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Treasury Reserves</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e3a8a', margin: '6px 0' }}>
                ₹{club.treasuryBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                100% Isolated tenant financial ledger
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Institutional Budget Allocation</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                ₹{club.allocatedBudget.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Annual central grant from campus dean
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Member Dues Revenue Inflow</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#15803d', margin: '6px 0' }}>
                ₹{totalCollectedDues.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {paidCount} members @ ₹{club.duesAmount}/yr
              </div>
            </div>
          </div>

          {/* Quick Grant Top-up Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: 'white',
              borderRadius: '12px',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0' }}>
                Allocate Campus Grant to {club.name}
              </h3>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.9 }}>
                Directly inject central institutional funds into this club's operating ledger for equipment, workshops, or galas.
              </p>
            </div>

            <button
              onClick={() => onGrantBudget(club)}
              style={{
                padding: '10px 20px',
                background: '#ffffff',
                color: '#1e3a8a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              }}
            >
              Top-up Grant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
