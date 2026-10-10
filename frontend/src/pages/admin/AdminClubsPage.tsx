import React, { useState } from 'react';
import {
  Building2,
  Users,
  IndianRupee,
  Search,
  Plus,
  Download,
  MapPin,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
  Coins,
  Info,
  X,
  Phone,
} from 'lucide-react';
import { CampusClub, INITIAL_CLUBS } from './data/clubs';
import { exportToCsv } from './utils/exportCsv';

export const AdminClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<CampusClub[]>(INITIAL_CLUBS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClubForView, setSelectedClubForView] = useState<CampusClub | null>(null);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState<CampusClub | null>(null);
  const [selectedClubForBudget, setSelectedClubForBudget] = useState<CampusClub | null>(null);
  const [budgetTopUpAmount, setBudgetTopUpAmount] = useState<number>(25000);
  const [budgetTopUpReason, setBudgetTopUpReason] = useState<string>('Annual Institutional Grant');
  const [clubToDelete, setClubToDelete] = useState<CampusClub | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New club form state
  const [newClub, setNewClub] = useState<{
    name: string;
    slug: string;
    category: CampusClub['category'];
    tagline: string;
    description: string;
    presidentName: string;
    presidentEmail: string;
    presidentPhone: string;
    facultyAdvisor: string;
    advisorEmail: string;
    duesAmount: number;
    allocatedBudget: number;
    meetingVenue: string;
    officialEmail: string;
    accentColor: string;
  }>({
    name: '',
    slug: '',
    category: 'Technical',
    tagline: '',
    description: '',
    presidentName: '',
    presidentEmail: '',
    presidentPhone: '',
    facultyAdvisor: '',
    advisorEmail: '',
    duesAmount: 250,
    allocatedBudget: 50000,
    meetingVenue: 'Student Activity Center',
    officialEmail: '',
    accentColor: '#1e3a8a',
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered clubs
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(search.toLowerCase()) ||
      club.slug.toLowerCase().includes(search.toLowerCase()) ||
      club.presidentName.toLowerCase().includes(search.toLowerCase()) ||
      club.facultyAdvisor.toLowerCase().includes(search.toLowerCase()) ||
      club.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || club.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || club.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter((c) => c.status === 'Active').length;
  const pendingClubs = clubs.filter((c) => c.status === 'Pending Review').length;
  const totalMembers = clubs.reduce((acc, c) => acc + c.memberCount, 0);
  const totalTreasury = clubs.reduce((acc, c) => acc + c.treasuryBalance, 0);
  const avgDues = Math.round(clubs.reduce((acc, c) => acc + c.duesAmount, 0) / (clubs.length || 1));

  // CSV Export
  const handleExportCsv = () => {
    exportToCsv(
      'campus_clubs_registry',
      [
        { header: 'Club ID', accessor: (c) => c.id },
        { header: 'Club Name', accessor: (c) => c.name },
        { header: 'Slug', accessor: (c) => c.slug },
        { header: 'Category', accessor: (c) => c.category },
        { header: 'Status', accessor: (c) => c.status },
        { header: 'President', accessor: (c) => c.presidentName },
        { header: 'President Email', accessor: (c) => c.presidentEmail },
        { header: 'Faculty Advisor', accessor: (c) => c.facultyAdvisor },
        { header: 'Member Count', accessor: (c) => c.memberCount },
        { header: 'Annual Dues (INR)', accessor: (c) => c.duesAmount },
        { header: 'Treasury Balance (INR)', accessor: (c) => c.treasuryBalance },
        { header: 'Allocated Budget (INR)', accessor: (c) => c.allocatedBudget },
        { header: 'Meeting Venue', accessor: (c) => c.meetingVenue },
        { header: 'Charter Expiry', accessor: (c) => c.charterExpiry },
      ],
      filteredClubs
    );
  };

  // Create Club
  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClub.name.trim()) return;

    const generatedSlug =
      newClub.slug.trim() ||
      newClub.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const created: CampusClub = {
      id: `CLUB-00${clubs.length + 1}`,
      name: newClub.name,
      slug: generatedSlug,
      category: newClub.category,
      tagline: newClub.tagline || 'Student organization fostering campus growth.',
      description: newClub.description || 'Chartered student chapter under campus administration oversight.',
      status: 'Active',
      presidentName: newClub.presidentName || 'Designated Lead',
      presidentEmail: newClub.presidentEmail || 'lead@nmit.edu.in',
      presidentPhone: newClub.presidentPhone || '+91 98000 00000',
      facultyAdvisor: newClub.facultyAdvisor || 'Faculty In-Charge',
      advisorEmail: newClub.advisorEmail || 'advisor@nmit.edu.in',
      memberCount: 0,
      duesAmount: Number(newClub.duesAmount) || 250,
      duesInterval: 'Annual',
      treasuryBalance: Number(newClub.allocatedBudget) || 50000,
      allocatedBudget: Number(newClub.allocatedBudget) || 50000,
      foundedYear: new Date().getFullYear(),
      meetingVenue: newClub.meetingVenue || 'Student Center',
      officialEmail: newClub.officialEmail || `${generatedSlug}@nmit.edu.in`,
      activeEventsCount: 0,
      charterExpiry: `${new Date().getFullYear() + 2}-06-30`,
      accentColor: newClub.accentColor || '#1e3a8a',
      establishedDate: new Date().toISOString().split('T')[0],
    };

    setClubs([created, ...clubs]);
    setShowCreateModal(false);
    showToast(`Successfully chartered "${created.name}" tenant!`);
    // Reset form
    setNewClub({
      name: '',
      slug: '',
      category: 'Technical',
      tagline: '',
      description: '',
      presidentName: '',
      presidentEmail: '',
      presidentPhone: '',
      facultyAdvisor: '',
      advisorEmail: '',
      duesAmount: 250,
      allocatedBudget: 50000,
      meetingVenue: 'Student Activity Center',
      officialEmail: '',
      accentColor: '#1e3a8a',
    });
  };

  // Edit Club
  const handleUpdateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForEdit) return;

    setClubs((prev) =>
      prev.map((c) => (c.id === selectedClubForEdit.id ? selectedClubForEdit : c))
    );
    showToast(`Updated details for "${selectedClubForEdit.name}".`);
    setSelectedClubForEdit(null);
  };

  // Top Up Budget
  const handleApplyBudgetGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForBudget) return;

    const amount = Number(budgetTopUpAmount) || 0;
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === selectedClubForBudget.id) {
          return {
            ...c,
            treasuryBalance: c.treasuryBalance + amount,
            allocatedBudget: c.allocatedBudget + amount,
          };
        }
        return c;
      })
    );
    showToast(
      `Disbursed ₹${amount.toLocaleString()} grant to ${selectedClubForBudget.name} treasury!`
    );
    setSelectedClubForBudget(null);
  };

  // Delete Club
  const handleConfirmDelete = () => {
    if (!clubToDelete) return;
    setClubs((prev) => prev.filter((c) => c.id !== clubToDelete.id));
    showToast(`Charter for "${clubToDelete.name}" has been revoked.`);
    setClubToDelete(null);
  };

  // Toggle quick status
  const handleToggleStatus = (clubId: string, newStatus: CampusClub['status']) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: newStatus } : c))
    );
    showToast(`Status updated to "${newStatus}".`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
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
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span>{notification}</span>
        </div>
      )}

      {/* ── 1. Page Header ── */}
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
                color: '#1e3a8a',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Multi-Tenant Governance
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Institutional Student Organization Registry
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Campus Clubs Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Charter new student bodies, monitor treasury accounts, govern presidencies, and regulate dues policies.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
          >
            <Download style={{ width: '15px', height: '15px', color: '#64748b' }} />
            <span>Export Directory</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#172554')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#1e3a8a')}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            <span>New Club</span>
          </button>
        </div>
      </div>

      {/* ── 2. KPI Summary Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Total Clubs */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Building2 style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Recognized Chapters
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              {totalClubs} Clubs
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', marginTop: '4px', fontWeight: 600 }}>
              {activeClubs} Active • {pendingClubs} Under Review
            </div>
          </div>
        </div>

        {/* Card 2: Enrolled Members */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#dcfce7',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Users style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Total Club Members
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              {totalMembers.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Verified digital membership passes
            </div>
          </div>
        </div>

        {/* Card 3: Aggregate Treasury */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#f3e8ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IndianRupee style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Campus Club Reserves
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              ₹{totalTreasury.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px', fontWeight: 600 }}>
              Isolated ledger multi-tenancy
            </div>
          </div>
        </div>

        {/* Card 4: Average Dues */}
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#fef3c7',
              color: '#b45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Coins style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Average Annual Dues
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
              ₹{avgDues} / yr
            </div>
            <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: 600 }}>
              Range: ₹150 - ₹400
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Filters, Search & View Switcher ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
          {/* Search Bar */}
          <div
            style={{
              position: 'relative',
              width: '280px',
            }}
          >
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
              placeholder="Search club, president, advisor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Domain:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: 'white',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Domains</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Academic">Academic</option>
              <option value="Entrepreneurship">Entrepreneurship</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                background: 'white',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active Charter</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? '#1e293b' : '#64748b',
              boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LayoutGrid style={{ width: '14px', height: '14px' }} />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'table' ? 'white' : 'transparent',
              color: viewMode === 'table' ? '#1e293b' : '#64748b',
              boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <List style={{ width: '14px', height: '14px' }} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── 4. Main Content: Grid vs Table ── */}
      {filteredClubs.length === 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <Building2 style={{ width: '40px', height: '40px', color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px 0' }}>
            No Matching Clubs Found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
            Try adjusting your search criteria or register a new campus student chapter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
              setStatusFilter('ALL');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── GRID CARD VIEW ── */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredClubs.map((club) => {
            const isSuspended = club.status === 'Suspended';
            const isPending = club.status === 'Pending Review';

            return (
              <div
                key={club.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Colored Top Accent Bar */}
                <div style={{ height: '5px', background: club.accentColor || '#1e3a8a' }} />

                {/* Card Header */}
                <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              club.category === 'Technical'
                                ? '#eff6ff'
                                : club.category === 'Cultural'
                                ? '#fdf2f8'
                                : club.category === 'Entrepreneurship'
                                ? '#fffbeb'
                                : '#f0fdf4',
                            color:
                              club.category === 'Technical'
                                ? '#1d4ed8'
                                : club.category === 'Cultural'
                                ? '#be185d'
                                : club.category === 'Entrepreneurship'
                                ? '#b45309'
                                : '#15803d',
                          }}
                        >
                          {club.category}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#64748b',
                            fontFamily: 'monospace',
                            background: '#f8fafc',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {club.slug}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#1e293b',
                          margin: 0,
                          lineHeight: 1.3,
                        }}
                      >
                        {club.name}
                      </h3>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() =>
                        handleToggleStatus(
                          club.id,
                          isSuspended ? 'Active' : isPending ? 'Active' : 'Suspended'
                        )
                      }
                      title={`Click to ${isSuspended || isPending ? 'Activate' : 'Suspend'} Charter`}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        background: isSuspended ? '#fee2e2' : isPending ? '#fef3c7' : '#dcfce7',
                        color: isSuspended ? '#b91c1c' : isPending ? '#b45309' : '#15803d',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isSuspended ? '#dc2626' : isPending ? '#d97706' : '#16a34a',
                        }}
                      />
                      {club.status}
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: '12px',
                      color: '#64748b',
                      margin: '8px 0 0',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {club.tagline}
                  </p>
                </div>

                {/* Leadership Info */}
                <div style={{ padding: '12px 18px', background: '#fafbfc', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: club.accentColor,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {club.presidentName.charAt(0)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#1e293b', minWidth: 0, flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>President: </span>
                        <span>{club.presidentName}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserCheck style={{ width: '14px', height: '14px', color: '#64748b', flexShrink: 0 }} />
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#475569',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>Advisor: </span>
                        <span>{club.facultyAdvisor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Numbers Bar */}
                <div
                  style={{
                    padding: '12px 18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    textAlign: 'center',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Members</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                      {club.memberCount}
                    </div>
                  </div>
                  <div style={{ borderRight: '1px solid #f1f5f9', paddingRight: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Annual Dues</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d', marginTop: '2px' }}>
                      ₹{club.duesAmount}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Treasury</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', marginTop: '2px' }}>
                      ₹{club.treasuryBalance.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Meeting Venue & Events */}
                <div
                  style={{
                    padding: '10px 18px',
                    fontSize: '11px',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                    <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {club.meetingVenue}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#475569' }}>
                    {club.activeEventsCount} Active Events
                  </div>
                </div>

                {/* Card Action Footer */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '12px 18px',
                    background: '#ffffff',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => setSelectedClubForView(club)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Info style={{ width: '13px', height: '13px' }} />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => setSelectedClubForBudget(club)}
                    title="Top-up Treasury Grant"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #bfdbfe',
                      background: '#eff6ff',
                      color: '#1e3a8a',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Coins style={{ width: '13px', height: '13px' }} />
                    <span>Grant</span>
                  </button>

                  <button
                    onClick={() => setSelectedClubForEdit(club)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Edit3 style={{ width: '13px', height: '13px' }} />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── DENSE TABLE VIEW ── */
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
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Club Tenant</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Leadership</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Members</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Annual Dues</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Treasury Balance</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.map((club) => {
                  const isSuspended = club.status === 'Suspended';
                  const isPending = club.status === 'Pending Review';

                  return (
                    <tr
                      key={club.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                    >
                      {/* Name & Slug */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{club.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                          {club.slug} • Est. {club.foundedYear}
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                          }}
                        >
                          {club.category}
                        </span>
                      </td>

                      {/* Leadership */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#334155', fontSize: '12px' }}>
                          {club.presidentName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Advisor: {club.facultyAdvisor.split(',')[0]}
                        </div>
                      </td>

                      {/* Members */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '12px',
                          }}
                        >
                          {club.memberCount}
                        </span>
                      </td>

                      {/* Dues */}
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>
                        ₹{club.duesAmount}/yr
                      </td>

                      {/* Treasury */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#1e3a8a' }}>
                          ₹{club.treasuryBalance.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          Budget: ₹{club.allocatedBudget.toLocaleString()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: isSuspended ? '#fee2e2' : isPending ? '#fef3c7' : '#dcfce7',
                            color: isSuspended ? '#b91c1c' : isPending ? '#b45309' : '#15803d',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: isSuspended ? '#dc2626' : isPending ? '#d97706' : '#16a34a',
                            }}
                          />
                          {club.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedClubForView(club)}
                            title="Inspect Profile"
                            style={{
                              padding: '5px 8px',
                              background: '#f1f5f9',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#475569',
                            }}
                          >
                            <Info style={{ width: '14px', height: '14px' }} />
                          </button>

                          <button
                            onClick={() => setSelectedClubForBudget(club)}
                            title="Grant Budget"
                            style={{
                              padding: '5px 8px',
                              background: '#eff6ff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#1e3a8a',
                            }}
                          >
                            <Coins style={{ width: '14px', height: '14px' }} />
                          </button>

                          <button
                            onClick={() => setSelectedClubForEdit(club)}
                            title="Manage Club"
                            style={{
                              padding: '5px 8px',
                              background: '#eff6ff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#2563eb',
                            }}
                          >
                            <Edit3 style={{ width: '14px', height: '14px' }} />
                          </button>

                          <button
                            onClick={() => setClubToDelete(club)}
                            title="Revoke Charter"
                            style={{
                              padding: '5px 8px',
                              background: '#fef2f2',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: CHARTER NEW CLUB ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Charter New Campus Club / Student Chapter
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                  Register multi-tenant organization, appoint executive leadership, and allocate opening budget.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleCreateClub} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Section 1: Basic Identity */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Organization Identity
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Club Official Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Artificial Intelligence Guild"
                      value={newClub.name}
                      onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Domain / Category *
                    </label>
                    <select
                      value={newClub.category}
                      onChange={(e) =>
                        setNewClub({ ...newClub, category: e.target.value as CampusClub['category'] })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        background: 'white',
                      }}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Academic">Academic</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="Sports">Sports</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Custom URL Slug (Leave blank for auto)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ai-guild"
                      value={newClub.slug}
                      onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Accent Theme Color
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {['#1e3a8a', '#059669', '#7c3aed', '#d97706', '#db2777', '#ea580c'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewClub({ ...newClub, accentColor: color })}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: color,
                            border: newClub.accentColor === color ? '2px solid #000' : 'none',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Mission Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Short motto or focus of the club"
                    value={newClub.tagline}
                    onChange={(e) => setNewClub({ ...newClub, tagline: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Section 2: Leadership */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>
                  2. Executive Leadership & Advisory
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Club President Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deepak A"
                      value={newClub.presidentName}
                      onChange={(e) => setNewClub({ ...newClub, presidentName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      President Student Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="president@nmit.edu.in"
                      value={newClub.presidentEmail}
                      onChange={(e) => setNewClub({ ...newClub, presidentEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Faculty Advisor Name & Department *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ramesh Babu, CSE"
                      value={newClub.facultyAdvisor}
                      onChange={(e) => setNewClub({ ...newClub, facultyAdvisor: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Faculty Advisor Email
                    </label>
                    <input
                      type="email"
                      placeholder="advisor@nmit.edu.in"
                      value={newClub.advisorEmail}
                      onChange={(e) => setNewClub({ ...newClub, advisorEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Section 3: Financial Parameters */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>
                  3. Dues Policy & Treasury Allocation
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Annual Member Dues (₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newClub.duesAmount}
                      onChange={(e) => setNewClub({ ...newClub, duesAmount: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Initial Treasury Grant (₹) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newClub.allocatedBudget}
                      onChange={(e) => setNewClub({ ...newClub, allocatedBudget: Number(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Section 4: Logistics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Primary Meeting Venue / Lab
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Student Union Hall 204"
                      value={newClub.meetingVenue}
                      onChange={(e) => setNewClub({ ...newClub, meetingVenue: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Official Inquiries Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. club@nmit.edu.in"
                      value={newClub.officialEmail}
                      onChange={(e) => setNewClub({ ...newClub, officialEmail: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '12px',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      color: '#475569',
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
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Charter & Activate Club
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MANAGE / EDIT CLUB ── */}
      {selectedClubForEdit && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Manage Club: {selectedClubForEdit.name}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                  Update charter status, presidential leadership, and financial boundaries.
                </p>
              </div>
              <button
                onClick={() => setSelectedClubForEdit(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleUpdateClub} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Charter Status
                    </label>
                    <select
                      value={selectedClubForEdit.status}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          status: e.target.value as CampusClub['status'],
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: 'white',
                      }}
                    >
                      <option value="Active">Active Charter</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Charter Renewal">Charter Renewal</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Category / Domain
                    </label>
                    <select
                      value={selectedClubForEdit.category}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          category: e.target.value as CampusClub['category'],
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: 'white',
                      }}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Academic">Academic</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="Sports">Sports</option>
                      <option value="Social">Social</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      President Name
                    </label>
                    <input
                      type="text"
                      value={selectedClubForEdit.presidentName}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          presidentName: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      President Email
                    </label>
                    <input
                      type="email"
                      value={selectedClubForEdit.presidentEmail}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          presidentEmail: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Faculty Advisor
                  </label>
                  <input
                    type="text"
                    value={selectedClubForEdit.facultyAdvisor}
                    onChange={(e) =>
                      setSelectedClubForEdit({
                        ...selectedClubForEdit,
                        facultyAdvisor: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Annual Dues (₹)
                    </label>
                    <input
                      type="number"
                      value={selectedClubForEdit.duesAmount}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          duesAmount: Number(e.target.value),
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                      Primary Meeting Venue
                    </label>
                    <input
                      type="text"
                      value={selectedClubForEdit.meetingVenue}
                      onChange={(e) =>
                        setSelectedClubForEdit({
                          ...selectedClubForEdit,
                          meetingVenue: e.target.value,
                        })
                      }
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Club Tagline
                  </label>
                  <input
                    type="text"
                    value={selectedClubForEdit.tagline}
                    onChange={(e) =>
                      setSelectedClubForEdit({
                        ...selectedClubForEdit,
                        tagline: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Modal Footer */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setClubToDelete(selectedClubForEdit);
                      setSelectedClubForEdit(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#dc2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                    <span>Revoke Charter</span>
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedClubForEdit(null)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#475569',
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
                        padding: '8px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#1e3a8a',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: VIEW CLUB PROFILE DETAILS ── */}
      {selectedClubForView && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                height: '8px',
                background: selectedClubForView.accentColor || '#1e3a8a',
                borderTopLeftRadius: '14px',
                borderTopRightRadius: '14px',
              }}
            />
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                    }}
                  >
                    {selectedClubForView.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 600,
                      background: selectedClubForView.status === 'Active' ? '#dcfce7' : '#fef3c7',
                      color: selectedClubForView.status === 'Active' ? '#15803d' : '#b45309',
                    }}
                  >
                    {selectedClubForView.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  {selectedClubForView.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                  {selectedClubForView.tagline}
                </p>
              </div>

              <button
                onClick={() => setSelectedClubForView(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Description */}
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {selectedClubForView.description}
              </div>

              {/* Financial Health Progress */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Treasury Reserves vs Allocated Budget
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>
                    ₹{selectedClubForView.treasuryBalance.toLocaleString()} / ₹{selectedClubForView.allocatedBudget.toLocaleString()}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: selectedClubForView.accentColor || '#1e3a8a',
                      width: `${Math.min(100, (selectedClubForView.treasuryBalance / (selectedClubForView.allocatedBudget || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  <span>Annual Member Dues: ₹{selectedClubForView.duesAmount}/yr</span>
                  <span>Active Members: {selectedClubForView.memberCount}</span>
                </div>
              </div>

              {/* Leadership Contacts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Club President
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    {selectedClubForView.presidentName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    <Mail style={{ width: '12px', height: '12px' }} />
                    <span>{selectedClubForView.presidentEmail}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    <Phone style={{ width: '12px', height: '12px' }} />
                    <span>{selectedClubForView.presidentPhone}</span>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Faculty Advisor
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    {selectedClubForView.facultyAdvisor}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    <Mail style={{ width: '12px', height: '12px' }} />
                    <span>{selectedClubForView.advisorEmail}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    <MapPin style={{ width: '12px', height: '12px' }} />
                    <span>{selectedClubForView.meetingVenue}</span>
                  </div>
                </div>
              </div>

              {/* Charter details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Chartered Date</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedClubForView.establishedDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Charter Expiration</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedClubForView.charterExpiry}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Events Coordinated</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginTop: '2px' }}>
                    {selectedClubForView.activeEventsCount} Active
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  onClick={() => setSelectedClubForView(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedClubForEdit(selectedClubForView);
                    setSelectedClubForView(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 style={{ width: '14px', height: '14px' }} />
                  <span>Edit Club Governance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: BUDGET TOP-UP GRANT ── */}
      {selectedClubForBudget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Allocate Institutional Grant
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                  Direct university subsidy transfer to {selectedClubForBudget.name} treasury.
                </p>
              </div>
              <button
                onClick={() => setSelectedClubForBudget(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <form onSubmit={handleApplyBudgetGrant} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#eff6ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 600 }}>
                    Current Treasury Reserves: ₹{selectedClubForBudget.treasuryBalance.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    President: {selectedClubForBudget.presidentName}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Grant Allocation Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={budgetTopUpAmount}
                    onChange={(e) => setBudgetTopUpAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      fontWeight: 600,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Grant Justification / Ledger Memo *
                  </label>
                  <input
                    type="text"
                    required
                    value={budgetTopUpReason}
                    onChange={(e) => setBudgetTopUpReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    marginTop: '12px',
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedClubForBudget(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      color: '#475569',
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
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#15803d',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Disburse ₹{budgetTopUpAmount.toLocaleString()} Grant
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 5: REVOKE CHARTER CONFIRMATION ── */}
      {clubToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle style={{ width: '22px', height: '22px' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Revoke Club Charter?
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Are you sure you want to revoke the charter for <strong>{clubToDelete.name}</strong>? This will freeze its multi-tenant ledger and deactivate all member passes.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setClubToDelete(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Yes, Revoke Charter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
