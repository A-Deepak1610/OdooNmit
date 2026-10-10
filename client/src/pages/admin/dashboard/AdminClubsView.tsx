import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Edit3,
  UserX,
  ExternalLink,
  Globe,
  Instagram,
  Linkedin,
  Eye,
  X,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { ClubItem, adminService } from '../../../services/admin.service';

interface AdminClubsViewProps {
  clubs: ClubItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onClubsUpdated: (updatedClubs: ClubItem[]) => void;
  showToast: (text: string, type?: 'success' | 'error') => void;
}

// Category color mappings for gradient fallbacks and tags
const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Technology: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    gradient: 'from-indigo-600 via-indigo-700 to-purple-800',
  },
  'Technology & AI': {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    gradient: 'from-indigo-600 via-indigo-700 to-purple-800',
  },
  'Arts & Media': {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    gradient: 'from-pink-500 via-rose-600 to-amber-600',
  },
  'Visual Arts': {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    gradient: 'from-rose-500 via-pink-600 to-purple-600',
  },
  Engineering: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-700',
  },
  'Computer Science': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
  },
  'Finance & Business': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    gradient: 'from-amber-600 via-emerald-600 to-teal-800',
  },
  'Information Security': {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    gradient: 'from-slate-800 via-slate-900 to-indigo-950',
  },
  Sustainability: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    gradient: 'from-teal-600 via-emerald-600 to-green-700',
  },
  Humanities: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    gradient: 'from-purple-600 via-indigo-600 to-blue-700',
  },
  Culture: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    gradient: 'from-violet-600 via-purple-700 to-pink-700',
  },
  'Life Sciences': {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    gradient: 'from-sky-600 via-cyan-600 to-blue-700',
  },
};

const getCategoryStyle = (category?: string | null) => {
  const cat = category || 'General';
  return (
    CATEGORY_STYLES[cat] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      gradient: 'from-slate-700 via-indigo-800 to-slate-900',
    }
  );
};

// Format membership fee in INR paise or rupees
const formatInr = (feeInPaiseOrRupees?: number | null) => {
  if (feeInPaiseOrRupees === undefined || feeInPaiseOrRupees === null || feeInPaiseOrRupees === 0) {
    return 'Free';
  }
  // If stored in paise (>= 1000), convert to rupees
  const rupees = feeInPaiseOrRupees >= 1000 ? feeInPaiseOrRupees / 100 : feeInPaiseOrRupees;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
};

// Safe Image Components with robust error states
export const SafeCoverImage: React.FC<{
  src?: string | null;
  alt: string;
  category?: string | null;
  className?: string;
}> = ({ src, alt, category, className = 'h-36' }) => {
  const [hasError, setHasError] = useState(false);
  const style = getCategoryStyle(category);

  if (!src || hasError) {
    return (
      <div className={`w-full ${className} bg-gradient-to-r ${style.gradient} flex items-center justify-between px-6 relative overflow-hidden select-none`}>
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 bg-black/20 px-2 py-0.5 rounded backdrop-blur-xs">
            {category || 'Campus Club'}
          </span>
          <h4 className="text-white font-black text-sm drop-shadow-xs mt-1 truncate max-w-[200px]">{alt}</h4>
        </div>
        <Building2 className="w-12 h-12 text-white/20 relative z-10" />
      </div>
    );
  }

  return (
    <div className={`w-full ${className} relative overflow-hidden bg-slate-100 group`}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export const SafeLogo: React.FC<{
  src?: string | null;
  name: string;
  className?: string;
}> = ({ src, name, className = 'w-12 h-12 text-base' }) => {
  const [hasError, setHasError] = useState(false);

  // Generate 2 initials
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'CM';
  }, [name]);

  // Deterministic gradient hue based on name
  const gradientClass = useMemo(() => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-indigo-600 to-violet-700',
      'from-blue-600 to-cyan-600',
      'from-emerald-600 to-teal-700',
      'from-amber-500 to-orange-600',
      'from-rose-600 to-pink-600',
      'from-purple-600 to-indigo-700',
    ];
    return gradients[hash % gradients.length];
  }, [name]);

  if (!src || hasError) {
    return (
      <div
        className={`${className} rounded-2xl bg-gradient-to-br ${gradientClass} text-white font-extrabold flex items-center justify-center shadow-md border-2 border-white select-none shrink-0`}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`${className} rounded-2xl object-cover shadow-md border-2 border-white bg-white shrink-0`}
    />
  );
};

export const SafeAvatar: React.FC<{
  src?: string | null;
  name: string;
  className?: string;
}> = ({ src, name, className = 'w-7 h-7 text-xs' }) => {
  const [hasError, setHasError] = useState(false);

  const initial = (name.trim()[0] || 'U').toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={`${className} rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center border border-slate-300 select-none shrink-0`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`${className} rounded-full object-cover border border-slate-200 shrink-0`}
    />
  );
};

export const AdminClubsView: React.FC<AdminClubsViewProps> = ({
  clubs,
  isLoading,
  onRefresh,
  onClubsUpdated,
  showToast,
}) => {
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'members' | 'name' | 'fee'>('newest');

  // Modals & Action State
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedClubForView, setSelectedClubForView] = useState<ClubItem | null>(null);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState<ClubItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignPresidentModal, setAssignPresidentModal] = useState<{
    open: boolean;
    club: ClubItem | null;
  }>({ open: false, club: null });
  const [deactivateConfirmClub, setDeactivateConfirmClub] = useState<ClubItem | null>(null);

  // Users state for Assign President selection
  const [allUsers, setAllUsers] = useState<
    Array<{
      id: string;
      username: string;
      fullName: string;
      email: string;
      avatarUrl?: string | null;
    }>
  >([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch users when Assign President modal opens
  useEffect(() => {
    if (assignPresidentModal.open) {
      adminService
        .getAllUsers()
        .then((users) => {
          setAllUsers(users);
          setSelectedUserId(assignPresidentModal.club?.president?.id || '');
        })
        .catch(() => {
          // If endpoint fails, admin can still paste UUID
        });
    }
  }, [assignPresidentModal.open]);

  // Dynamic category options from current clubs
  const categories = useMemo(() => {
    const set = new Set<string>();
    clubs.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [clubs]);

  // Filtered & Sorted Clubs
  const filteredClubs = useMemo(() => {
    return clubs
      .filter((club) => {
        // Status filter
        if (statusFilter === 'active' && !club.isActive) return false;
        if (statusFilter === 'inactive' && club.isActive) return false;

        // Category filter
        if (categoryFilter !== 'ALL' && club.category !== categoryFilter) return false;

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = club.name.toLowerCase().includes(q);
          const matchSlug = club.slug.toLowerCase().includes(q);
          const matchCat = (club.category || '').toLowerCase().includes(q);
          const matchDesc = (club.description || '').toLowerCase().includes(q);
          const matchPres = (club.president?.fullName || '').toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchCat && !matchDesc && !matchPres) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'members') return b.memberCount - a.memberCount;
        if (sortBy === 'fee') return (b.membershipFee || 0) - (a.membershipFee || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [clubs, statusFilter, categoryFilter, search, sortBy]);

  // Counts
  const totalCount = clubs.length;
  const activeCount = clubs.filter((c) => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Toggle Status
  const handleToggleStatus = async (club: ClubItem) => {
    if (club.isActive) {
      // Trigger confirmation dialog for deactivation
      setDeactivateConfirmClub(club);
      return;
    }

    // Direct activation
    setActionLoading(true);
    try {
      await adminService.updateClubStatus(club.id, true);
      showToast(`Club "${club.name}" activated successfully!`, 'success');
      const updated = await adminService.getClubs();
      onClubsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to activate club', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateConfirmClub) return;
    setActionLoading(true);
    try {
      await adminService.updateClubStatus(deactivateConfirmClub.id, false);
      showToast(`Club "${deactivateConfirmClub.name}" deactivated.`, 'success');
      setDeactivateConfirmClub(null);
      const updated = await adminService.getClubs();
      onClubsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to deactivate club', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Assign President
  const handleAssignPresident = async () => {
    if (!assignPresidentModal.club) return;
    setActionLoading(true);
    try {
      await adminService.assignPresident(
        assignPresidentModal.club.id,
        selectedUserId || null
      );
      showToast(
        selectedUserId
          ? `President updated for ${assignPresidentModal.club.name}!`
          : `President position marked as Vacant for ${assignPresidentModal.club.name}.`,
        'success'
      );
      setAssignPresidentModal({ open: false, club: null });
      const updated = await adminService.getClubs();
      onClubsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to assign leadership', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Club Submit
  const handleEditClubSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClubForEdit) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const feeInRupees = parseFloat(formData.get('fee') as string) || 0;
    const feeInPaise = Math.round(feeInRupees * 100);

    const updatePayload = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      membershipFee: feeInPaise,
      logoUrl: (formData.get('logoUrl') as string).trim() || null,
      coverUrl: (formData.get('coverUrl') as string).trim() || null,
      websiteUrl: (formData.get('websiteUrl') as string).trim() || null,
      instagramUrl: (formData.get('instagramUrl') as string).trim() || null,
      linkedinUrl: (formData.get('linkedinUrl') as string).trim() || null,
    };

    setActionLoading(true);
    try {
      await adminService.updateClub(selectedClubForEdit.id, updatePayload as any);
      showToast(`Club "${updatePayload.name}" updated successfully!`, 'success');
      setSelectedClubForEdit(null);
      const updated = await adminService.getClubs();
      onClubsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to update organization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Club Submit
  const handleCreateClubSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const feeInRupees = parseFloat(formData.get('fee') as string) || 0;
    const feeInPaise = Math.round(feeInRupees * 100);

    const createPayload = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      membershipFee: feeInPaise,
      logoUrl: (formData.get('logoUrl') as string).trim() || undefined,
      coverUrl: (formData.get('coverUrl') as string).trim() || undefined,
    };

    setActionLoading(true);
    try {
      await adminService.createClub(createPayload);
      showToast(`Chartered club "${createPayload.name}" successfully!`, 'success');
      setShowCreateModal(false);
      const updated = await adminService.getClubs();
      onClubsUpdated(updated);
    } catch (err: any) {
      showToast(err.message || 'Failed to charter organization', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. KPI Summary Bar ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Clubs</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</div>
          </div>
          <Building2 className="w-6 h-6 text-indigo-500/70" />
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Active Chapters</div>
            <div className="text-xl font-black text-emerald-800 mt-0.5">{activeCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/70" />
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Inactive / Frozen</div>
            <div className="text-xl font-black text-slate-700 mt-0.5">{inactiveCount}</div>
          </div>
          <ShieldAlert className="w-6 h-6 text-slate-400" />
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-indigo-700 tracking-wider">Registered Members</div>
            <div className="text-xl font-black text-indigo-900 mt-0.5">
              {clubs.reduce((acc, c) => acc + (c.memberCount || 0), 0)}
            </div>
          </div>
          <Users className="w-6 h-6 text-indigo-500/70" />
        </div>
      </div>

      {/* ── 2. Search, Status Tabs & Action Toolbar ───────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 focus-within:border-indigo-500 focus-within:bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search organizations, domain, or president..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs + Category Filter + Sort + Charter Button */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills with real count badges */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>All</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {totalCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'active'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Active</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                  {activeCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${statusFilter === 'inactive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <span>Inactive</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                  {inactiveCount}
                </span>
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 cursor-pointer outline-none hover:bg-slate-100 transition-colors"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="members">Sort: Most Members</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="fee">Sort: Highest Fee</option>
              </select>
            </div>

            {/* Sync Data Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Sync organizations with database"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Charter Club Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Charter Club</span>
            </button>
          </div>
        </div>

        {/* Filter Summary & Result Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredClubs.length}</span> of {totalCount} organizations
            {(search || categoryFilter !== 'ALL' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('ALL');
                  setStatusFilter('all');
                }}
                className="ml-2 text-indigo-600 hover:underline font-bold cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Realtime data synced with TiDB MySQL
          </div>
        </div>
      </div>

      {/* ── 3. Loading Skeletons ───────────────────────────────────────── */}
      {isLoading && clubs.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
            >
              <div>
                <div className="h-36 bg-slate-200 w-full" />
                <div className="p-5 pt-0 relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-300 -mt-7 border-2 border-white mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-4" />
                  <div className="space-y-1.5 mb-4">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 h-14" />
            </div>
          ))}
        </div>
      )}

      {/* ── 4. Empty State ────────────────────────────────────────────── */}
      {!isLoading && filteredClubs.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No organizations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No campus clubs match your current search criteria or status filter. Try clearing filters or search term.
            </p>
          </div>
          <button
            onClick={() => {
              setSearch('');
              setCategoryFilter('ALL');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* ── 5. Responsive Organization Cards Grid ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => {
          const catStyle = getCategoryStyle(club.category);

          return (
            <div
              key={club.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md ${club.isActive
                  ? 'border-slate-200/90 hover:border-indigo-300'
                  : 'border-slate-200/60 bg-slate-50/40 opacity-90'
                }`}
            >
              {/* Card Top: Cover Image + Status Badge */}
              <div>
                <div className="relative">
                  <SafeCoverImage
                    src={club.coverUrl}
                    alt={club.name}
                    category={club.category}
                    className="h-36"
                  />

                  {/* Active / Inactive Status Badge (Interactive toggle) */}
                  <div className="absolute top-3 right-3 z-20">
                    <button
                      onClick={() => handleToggleStatus(club)}
                      disabled={actionLoading}
                      title={`Click to ${club.isActive ? 'deactivate' : 'activate'} this club`}
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full border shadow-sm transition-all cursor-pointer backdrop-blur-md flex items-center gap-1.5 ${club.isActive
                          ? 'bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600'
                          : 'bg-slate-700/90 text-slate-200 border-slate-600 hover:bg-slate-800'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${club.isActive ? 'bg-white animate-pulse' : 'bg-slate-400'
                          }`}
                      />
                      <span>{club.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 pt-0 relative">
                  {/* Logo overlapping banner */}
                  <div className="flex items-end justify-between -mt-7 mb-3 relative z-10">
                    <SafeLogo
                      src={club.logoUrl}
                      name={club.name}
                      className="w-14 h-14 text-lg border-2 border-white shadow-md"
                    />

                    {/* Category pill */}
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {club.category || 'General'}
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <div className="mb-2.5">
                    <h3
                      className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1"
                      title={club.name}
                    >
                      {club.name}
                    </h3>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      /{club.slug}
                    </div>
                  </div>

                  {/* Description with comfortable line height */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 min-h-[3.75rem]">
                    {club.description || 'Chartered campus student organization dedicated to collaborative learning and student projects.'}
                  </p>

                  {/* Key Stats Bar (INR Membership Fee, Member Count, Est.) */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
                    <div className="text-center">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Fee</div>
                      <div className="font-extrabold text-slate-900 truncate mt-0.5">
                        {formatInr(club.membershipFee)}
                      </div>
                    </div>

                    <div className="text-center border-x border-slate-200/80">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Members</div>
                      <div className="font-extrabold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{club.memberCount}</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Chartered</div>
                      <div className="font-extrabold text-slate-900 truncate mt-0.5">
                        {new Date(club.createdAt).getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Leadership Section */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Leadership</span>
                      <button
                        onClick={() => setAssignPresidentModal({ open: true, club })}
                        className="text-[10px] text-indigo-600 hover:text-indigo-800 font-extrabold cursor-pointer hover:underline"
                      >
                        {club.president ? 'Change' : 'Assign'}
                      </button>
                    </div>

                    {club.president ? (
                      <div className="flex items-center gap-2.5 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                        <SafeAvatar
                          src={club.president.avatarUrl}
                          name={club.president.fullName}
                          className="w-8 h-8 text-xs"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {club.president.fullName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            @{club.president.username} • President
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-800">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-amber-900 leading-tight">
                              Vacant Position
                            </div>
                            <div className="text-[10px] text-amber-700">No president ratified</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setAssignPresidentModal({ open: true, club })}
                          className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer shadow-xs transition-colors shrink-0"
                        >
                          Appoint
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedClubForView(club)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedClubForEdit(club)}
                    className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
                    title="Edit club details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleStatus(club)}
                    disabled={actionLoading}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors border shadow-2xs ${club.isActive
                        ? 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                  >
                    {club.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 6. View Club Details Modal ─────────────────────────────────── */}
      {selectedClubForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95">
            {/* Modal Banner */}
            <div className="relative">
              <SafeCoverImage
                src={selectedClubForView.coverUrl}
                alt={selectedClubForView.name}
                category={selectedClubForView.category}
                className="h-48"
              />
              <button
                onClick={() => setSelectedClubForView(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Header with Logo */}
              <div className="flex items-start justify-between gap-4 -mt-12 relative z-10">
                <SafeLogo
                  src={selectedClubForView.logoUrl}
                  name={selectedClubForView.name}
                  className="w-20 h-20 text-2xl border-4 border-white shadow-lg"
                />

                <div className="flex items-center gap-2 mt-4">
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border ${selectedClubForView.isActive
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                  >
                    {selectedClubForView.isActive ? 'Active Charter' : 'Deactivated / Inactive'}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedClubForView.category || 'General'}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedClubForView.name}</h2>
                <div className="text-xs font-mono text-slate-500 mt-0.5">
                  Slug: {selectedClubForView.slug} • ID: {selectedClubForView.id}
                </div>
              </div>

              {/* Full Description */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  About Organization
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedClubForView.description || 'No detailed mission statement provided yet.'}
                </p>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Membership Fee</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {formatInr(selectedClubForView.membershipFee)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Enrolled Members</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedClubForView.memberCount} Students
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Support Tickets</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedClubForView.ticketCount} Tickets
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Elections Held</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {selectedClubForView.electionCount} Annual
                  </div>
                </div>
              </div>

              {/* Current President Info */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current President / Student Executive
                </div>
                {selectedClubForView.president ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <SafeAvatar
                        src={selectedClubForView.president.avatarUrl}
                        name={selectedClubForView.president.fullName}
                        className="w-10 h-10 text-sm"
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {selectedClubForView.president.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          @{selectedClubForView.president.username} • {selectedClubForView.president.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClubForView(null);
                        setAssignPresidentModal({ open: true, club: selectedClubForView });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                    >
                      Change Leader
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2.5">
                      <UserX className="w-5 h-5 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">Vacant Leadership Position</div>
                        <div className="text-[11px] text-amber-700">Appoint a student president or announce yearly elections</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedClubForView(null);
                        setAssignPresidentModal({ open: true, club: selectedClubForView });
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Appoint Now
                    </button>
                  </div>
                )}
              </div>

              {/* Web & Social Links */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  External Channels & Portals
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedClubForView.websiteUrl ? (
                    <a
                      href={selectedClubForView.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Website</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  ) : null}

                  {selectedClubForView.instagramUrl ? (
                    <a
                      href={selectedClubForView.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                      <ExternalLink className="w-3 h-3 text-pink-400" />
                    </a>
                  ) : null}

                  {selectedClubForView.linkedinUrl ? (
                    <a
                      href={selectedClubForView.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3 text-blue-400" />
                    </a>
                  ) : null}

                  {!selectedClubForView.websiteUrl &&
                    !selectedClubForView.instagramUrl &&
                    !selectedClubForView.linkedinUrl && (
                      <span className="text-xs text-slate-400 italic">No external social handles configured.</span>
                    )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const club = selectedClubForView;
                  setSelectedClubForView(null);
                  setSelectedClubForEdit(club);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                onClick={() => setSelectedClubForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. Edit Organization Modal ─────────────────────────────────── */}
      {selectedClubForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Organization</h3>
                <p className="text-xs text-slate-500">Update metadata, branding assets & membership pricing</p>
              </div>
              <button
                onClick={() => setSelectedClubForEdit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditClubSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-800">Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={selectedClubForEdit.name}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">Domain / Category *</label>
                  <select
                    name="category"
                    defaultValue={selectedClubForEdit.category || 'Technology'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Arts & Media">Arts & Media</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Finance & Business">Finance & Business</option>
                    <option value="Information Security">Information Security</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Culture">Culture</option>
                    <option value="Life Sciences">Life Sciences</option>
                    <option value="Visual Arts">Visual Arts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={selectedClubForEdit.description || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Annual Membership Fee (INR ₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    name="fee"
                    min="0"
                    step="50"
                    defaultValue={
                      selectedClubForEdit.membershipFee >= 1000
                        ? selectedClubForEdit.membershipFee / 100
                        : selectedClubForEdit.membershipFee
                    }
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Enter 0 for free student membership.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-800">Logo Image URL</label>
                  <input
                    type="url"
                    name="logoUrl"
                    placeholder="https://..."
                    defaultValue={selectedClubForEdit.logoUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">Cover Banner URL</label>
                  <input
                    type="url"
                    name="coverUrl"
                    placeholder="https://..."
                    defaultValue={selectedClubForEdit.coverUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 text-slate-800">Website</label>
                  <input
                    type="url"
                    name="websiteUrl"
                    placeholder="https://..."
                    defaultValue={selectedClubForEdit.websiteUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">Instagram</label>
                  <input
                    type="url"
                    name="instagramUrl"
                    placeholder="https://instagram.com/..."
                    defaultValue={selectedClubForEdit.instagramUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-800">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    placeholder="https://linkedin.com/..."
                    defaultValue={selectedClubForEdit.linkedinUrl || ''}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedClubForEdit(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 8. Charter / Create Club Modal ─────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Charter New Club</h3>
                <p className="text-xs text-slate-500">Register a new student organization in CampusMitra</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClubSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1 text-slate-800">Organization Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Artificial Intelligence Research Society"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-800">Domain / Category *</label>
                  <select
                    name="category"
                    defaultValue="Technology & AI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Technology & AI">Technology & AI</option>
                    <option value="Arts & Media">Arts & Media</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Finance & Business">Finance & Business</option>
                    <option value="Information Security">Information Security</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Culture">Culture</option>
                    <option value="Life Sciences">Life Sciences</option>
                    <option value="Visual Arts">Visual Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">Membership Fee (INR ₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="fee"
                      min="0"
                      step="50"
                      defaultValue={500}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-800">Mission Statement / Description</label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Collegiate club objectives, target student body, and planned activities..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-800">Logo Image URL</label>
                  <input
                    type="url"
                    name="logoUrl"
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-800">Cover Banner URL</label>
                  <input
                    type="url"
                    name="coverUrl"
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Charter Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 9. Assign President Modal ──────────────────────────────────── */}
      {assignPresidentModal.open && assignPresidentModal.club && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Appoint Club President</h3>
                <p className="text-xs text-slate-500">
                  Assign student leader for <span className="font-bold text-slate-800">{assignPresidentModal.club.name}</span>
                </p>
              </div>
              <button
                onClick={() => setAssignPresidentModal({ open: false, club: null })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* Current Status */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Leadership</span>
                  <span className="font-bold text-slate-800">
                    {assignPresidentModal.club.president
                      ? `${assignPresidentModal.club.president.fullName} (@${assignPresidentModal.club.president.username})`
                      : 'Vacant Position'}
                  </span>
                </div>
                {assignPresidentModal.club.president && (
                  <button
                    type="button"
                    onClick={() => setSelectedUserId('')}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Vacate Position
                  </button>
                )}
              </div>

              {/* Student Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Search Student Directory</label>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-300 focus-within:border-indigo-500 focus-within:bg-white transition-colors">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by name, username, or campus email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* User Selection List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                {allUsers
                  .filter((u) => {
                    if (!userSearchTerm.trim()) return true;
                    const q = userSearchTerm.toLowerCase();
                    return (
                      u.fullName.toLowerCase().includes(q) ||
                      u.username.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q)
                    );
                  })
                  .slice(0, 15)
                  .map((user) => {
                    const isSelected = selectedUserId === user.id;

                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className={`p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                            : 'bg-white hover:bg-slate-100 border-transparent text-slate-700'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SafeAvatar
                            src={user.avatarUrl}
                            name={user.fullName}
                            className="w-8 h-8 text-xs"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{user.fullName}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              @{user.username} • {user.email}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}

                {allUsers.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                    Loading campus students...
                  </div>
                )}
              </div>

              {/* Or manual user UUID entry */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Or Selected User UUID
                </label>
                <input
                  type="text"
                  placeholder="Paste student UUID directly or select from list above"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAssignPresidentModal({ open: false, club: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAssignPresident}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                {selectedUserId ? 'Confirm Appointment' : 'Mark Position as Vacant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 10. Deactivation Confirmation Modal ────────────────────────── */}
      {deactivateConfirmClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Deactivate "{deactivateConfirmClub.name}"?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Deactivating this organization will freeze its portal, hide public membership enrollment, and suspend event publishing until reactivated.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeactivateConfirmClub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
