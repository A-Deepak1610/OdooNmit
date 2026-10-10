import React, { useState, useId } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  UserCheck,
  X,
  UploadCloud,
  Download,
  FileText,
  Mail,
  RefreshCw,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';
import { UserAccount, INITIAL_USERS } from './data/users';
import { exportToCsv } from './utils/exportCsv';

interface ParsedUserRow {
  name: string;
  email: string;
  role: UserAccount['role'];
  department: string;
  semester: number;
  phone: string;
}

export const AdminUsersPage: React.FC = () => {
  const fileInputId = useId();
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Single Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [recoveringUser, setRecoveringUser] = useState<UserAccount | null>(null);
  const [recoveryNotice, setRecoveryNotice] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Bulk Upload Modal State
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadTab, setBulkUploadTab] = useState<'file' | 'paste'>('file');
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Bulk Recovery Modal State
  const [showBulkRecoveryModal, setShowBulkRecoveryModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Member' as UserAccount['role'],
    department: 'Computer Science',
    semester: 6,
  });

  const updateUser = (id: string, updates: Partial<UserAccount>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const createUser = (user: Omit<UserAccount, 'id' | 'joinedAt' | 'lastActive'>) => {
    const newUserRecord: UserAccount = {
      ...user,
      id: `USR-${Date.now()}`,
      joinedAt: 'Today',
      lastActive: 'Just now',
    };
    setUsers((prev) => [newUserRecord, ...prev]);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ── Multi-select handlers ──────────────────────────────────────────────────
  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.has(u.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedUserIds(new Set());
    } else {
      const next = new Set(selectedUserIds);
      filteredUsers.forEach((u) => next.add(u.id));
      setSelectedUserIds(next);
    }
  };

  const toggleSelectUser = (id: string) => {
    const next = new Set(selectedUserIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedUserIds(next);
  };

  // ── Single User Actions ────────────────────────────────────────────────────
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    createUser({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || '+91 98000 00000',
      role: newUser.role,
      department: newUser.department,
      semester: Number(newUser.semester),
      organizationIds: ['ORG-001'],
      organizationNames: ['Skyline Student Association'],
      status: 'Active',
      avatarColor: '#2563EB',
    });

    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'Member',
      department: 'Computer Science',
      semester: 6,
    });
    setRecoveryNotice(`User account ${newUser.email} created successfully.`);
    setTimeout(() => setRecoveryNotice(null), 4000);
  };

  const handleTriggerPasswordReset = (user: UserAccount) => {
    setRecoveryNotice(`Password recovery instructions & secure token dispatched to ${user.email}.`);
    setRecoveringUser(null);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleReset2FA = (user: UserAccount) => {
    setRecoveryNotice(`Two-factor authentication (2FA) reset for ${user.name}. Re-enrollment required.`);
    setRecoveringUser(null);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleToggleLock = (user: UserAccount) => {
    const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    updateUser(user.id, { status: nextStatus as any });
    setRecoveryNotice(`Account status for ${user.name} changed to ${nextStatus}.`);
    setRecoveringUser(null);
    setTimeout(() => setRecoveryNotice(null), 4000);
  };

  // ── Bulk Access Recovery Actions ───────────────────────────────────────────
  const handleBulkPasswordReset = () => {
    const count = selectedUserIds.size;
    if (count === 0) return;
    setRecoveryNotice(`Dispatched password reset recovery tokens to ${count} selected accounts.`);
    setSelectedUserIds(new Set());
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleBulkReset2FA = () => {
    const count = selectedUserIds.size;
    if (count === 0) return;
    setRecoveryNotice(`Cleared 2FA security bindings for ${count} accounts. Users must re-register 2FA.`);
    setSelectedUserIds(new Set());
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleBulkUnlock = () => {
    const count = selectedUserIds.size;
    if (count === 0) return;
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.has(u.id) ? { ...u, status: 'Active' as const } : u))
    );
    setRecoveryNotice(`Unlocked & activated ${count} selected accounts.`);
    setSelectedUserIds(new Set());
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleBulkSuspend = () => {
    const count = selectedUserIds.size;
    if (count === 0) return;
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.has(u.id) ? { ...u, status: 'Suspended' as const } : u))
    );
    setRecoveryNotice(`Suspended access for ${count} selected accounts.`);
    setSelectedUserIds(new Set());
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleUnlockAllSuspended = () => {
    const suspended = users.filter((u) => u.status === 'Suspended');
    if (suspended.length === 0) {
      setRecoveryNotice('No suspended accounts currently found in the system.');
      setShowBulkRecoveryModal(false);
      setTimeout(() => setRecoveryNotice(null), 4000);
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (u.status === 'Suspended' ? { ...u, status: 'Active' as const } : u))
    );
    setRecoveryNotice(`Successfully restored all ${suspended.length} suspended accounts to Active status.`);
    setShowBulkRecoveryModal(false);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const handleDispatchRecoveryToAllLocked = () => {
    const locked = users.filter((u) => u.status === 'Suspended');
    setRecoveryNotice(`Dispatched account recovery instructions to all ${locked.length} locked accounts.`);
    setShowBulkRecoveryModal(false);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  // ── CSV Parsing & Bulk Upload Handlers ─────────────────────────────────────
  const parseCsvContent = (text: string) => {
    setCsvError(null);
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setCsvError('CSV must include a header row and at least 1 data record.');
      setParsedRows([]);
      return;
    }

    const rows: ParsedUserRow[] = [];
    const roleValues = ['Super Admin', 'Club President', 'Treasurer', 'Event Organizer', 'Volunteer', 'Member'];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const name = parts[0];
        const email = parts[1];
        const rawRole = parts[2] || 'Member';
        const matchedRole = (roleValues.find(
          (r) => r.toLowerCase() === rawRole.toLowerCase()
        ) || 'Member') as UserAccount['role'];
        const department = parts[3] || 'Computer Science';
        const semester = Number(parts[4]) || 1;
        const phone = parts[5] || '+91 98000 00000';

        rows.push({
          name,
          email,
          role: matchedRole,
          department,
          semester,
          phone,
        });
      }
    }

    if (rows.length === 0) {
      setCsvError('No valid student or user records could be parsed. Check column formats.');
    } else {
      setParsedRows(rows);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawCsvText(content);
      parseCsvContent(content);
    };
    reader.readAsText(file);
  };

  const handleLoadDemoRoster = () => {
    const sample = `Full Name,Email,Role,Department,Semester,Phone
Rohan Sharma,rohan.s@campus.edu,Member,Computer Science,4,+91 98111 22233
Pooja Hegde,pooja.h@campus.edu,Volunteer,AI & Data Science,6,+91 98222 33344
Varun Dhawan,varun.d@campus.edu,Event Organizer,Mechanical Eng,6,+91 98333 44455
Ananya Roy,ananya.r@campus.edu,Member,Electronics,2,+91 98444 55566
Aditya Verma,aditya.v@campus.edu,Member,Biotechnology,4,+91 98555 66677`;

    setRawCsvText(sample);
    parseCsvContent(sample);
  };

  const handleDownloadSampleCsv = () => {
    const cols = [
      { header: 'Full Name', accessor: (r: any) => r.name },
      { header: 'Email', accessor: (r: any) => r.email },
      { header: 'Role', accessor: (r: any) => r.role },
      { header: 'Department', accessor: (r: any) => r.dept },
      { header: 'Semester', accessor: (r: any) => r.sem },
      { header: 'Phone', accessor: (r: any) => r.phone },
    ];
    const sampleData = [
      { name: 'Arun Kumar', email: 'arun.k@campus.edu', role: 'Member', dept: 'Computer Science', sem: 4, phone: '+91 98765 43210' },
      { name: 'Divya Nair', email: 'divya.n@campus.edu', role: 'Volunteer', dept: 'Information Science', sem: 6, phone: '+91 98765 43211' },
      { name: 'Siddharth Rao', email: 'siddharth.r@campus.edu', role: 'Event Organizer', dept: 'Electrical Eng', sem: 6, phone: '+91 98765 43212' },
    ];
    exportToCsv('campus_user_accounts_template', cols, sampleData);
  };

  const handleCommitBulkUpload = () => {
    if (parsedRows.length === 0) return;

    const newAccounts: UserAccount[] = parsedRows.map((row, idx) => ({
      id: `USR-BULK-${Date.now()}-${idx}`,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      organizationIds: ['ORG-001'],
      organizationNames: ['Skyline Student Association'],
      status: 'Active',
      joinedAt: 'Today',
      lastActive: 'Just now',
      avatarColor: ['#2563EB', '#10B981', '#7C3AED', '#D97706', '#059669'][idx % 5],
      department: row.department,
      semester: row.semester,
    }));

    setUsers((prev) => [...newAccounts, ...prev]);
    setShowBulkUploadModal(false);
    setRawCsvText('');
    setParsedRows([]);
    setRecoveryNotice(`Successfully bulk provisioned ${newAccounts.length} user accounts with access credentials.`);
    setTimeout(() => setRecoveryNotice(null), 5000);
  };

  const activeCount = users.filter((u) => u.status === 'Active').length;
  const officerCount = users.filter((u) => u.role !== 'Member').length;
  const suspendedCount = users.filter((u) => u.status !== 'Active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Page Header ── */}
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
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Access & Identity Management
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Platform Identity & Security Controls
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Accounts & Access Recovery
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Provision user accounts in bulk via CSV, configure institutional permissions, initiate batch credential recovery, and manage account lockouts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* Bulk Upload Modal Trigger */}
          <button
            onClick={() => setShowBulkUploadModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: '#eff6ff',
              color: '#1e3a8a',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <UploadCloud size={16} />
            <span>Bulk Upload (CSV)</span>
          </button>

          {/* New Account */}
          <button
            onClick={() => setShowAddUserModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            <Plus size={16} />
            <span>New Account</span>
          </button>
        </div>
      </div>

      {/* ── Notification Feedback Alert ── */}
      {recoveryNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{recoveryNotice}</span>
        </div>
      )}

      {/* ── Stat Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e3a8a',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total User Accounts</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{users.length}</div>
            <div style={{ fontSize: '11px', color: '#16a34a' }}>{activeCount} Active Sessions</div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#15803d',
            }}
          >
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Appointed Officers</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{officerCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Presidents & Staff</div>
          </div>
        </div>

        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626',
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Locked / Suspended</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#dc2626' }}>{suspendedCount}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Access restricted</div>
          </div>
        </div>
      </div>

      {/* ── Sticky Multi-Select Bulk Action Toolbar (Active when users selected) ── */}
      {selectedUserIds.size > 0 && (
        <div
          style={{
            background: '#1e293b',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                background: '#2563eb',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {selectedUserIds.size} Selected
            </span>
            <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
              Execute batch access recovery & status updates:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleBulkPasswordReset}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#334155',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Mail size={13} />
              <span>Send Reset Links</span>
            </button>

            <button
              onClick={handleBulkReset2FA}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#334155',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={13} />
              <span>Reset 2FA</span>
            </button>

            <button
              onClick={handleBulkUnlock}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Unlock size={13} />
              <span>Unlock Accounts</span>
            </button>

            <button
              onClick={handleBulkSuspend}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Lock size={13} />
              <span>Suspend</span>
            </button>

            <button
              onClick={() => setSelectedUserIds(new Set())}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                cursor: 'pointer',
                marginLeft: '8px',
                textDecoration: 'underline',
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Controls Bar ── */}
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
          <div style={{ position: 'relative', minWidth: '260px', flex: 1, maxWidth: '400px' }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
              <option value="ALL">All Roles ({users.length})</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Club President">Club President</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Event Organizer">Event Organizer</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Member">Member</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── User Accounts Table ── */}
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
                <th style={{ width: '40px', padding: '12px 14px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allFilteredSelected ? (
                      <CheckSquare size={16} color="#2563eb" />
                    ) : (
                      <Square size={16} color="#94a3b8" />
                    )}
                  </button>
                </th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>USER ACCOUNT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>ASSIGNED ROLE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>DEPARTMENT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>ORGANIZATION SCOPE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const roleColorMap: Record<string, { bg: string; text: string }> = {
                  'Super Admin': { bg: '#dcfce7', text: '#15803d' },
                  'Club President': { bg: '#ede9fe', text: '#6d28d9' },
                  Treasurer: { bg: '#fef3c7', text: '#b45309' },
                  'Event Organizer': { bg: '#fed7aa', text: '#c2410c' },
                  Volunteer: { bg: '#cffafe', text: '#0e7490' },
                  Member: { bg: '#e0e7ff', text: '#3730a3' },
                };
                const roleStyle = roleColorMap[u.role] || { bg: '#f1f5f9', text: '#475569' };
                const isActive = u.status === 'Active';
                const isSelected = selectedUserIds.has(u.id);

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isSelected ? '#eff6ff' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => toggleSelectUser(u.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        {isSelected ? (
                          <CheckSquare size={16} color="#2563eb" />
                        ) : (
                          <Square size={16} color="#cbd5e1" />
                        )}
                      </button>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: u.avatarColor || '#3b82f6',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            flexShrink: 0,
                          }}
                        >
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          background: roleStyle.bg,
                          color: roleStyle.text,
                          padding: '3px 10px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '11px',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      <div>{u.department}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Semester {u.semester}</div>
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      {u.organizationNames.join(', ')}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: isActive ? '#16a34a' : '#dc2626',
                          background: isActive ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${isActive ? '#bbf7d0' : '#fecaca'}`,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '11px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isActive ? '#16a34a' : '#dc2626',
                          }}
                        />
                        {u.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => setRecoveringUser(u)}
                          title="Manage Access & Password Recovery"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#eff6ff',
                            color: '#1e3a8a',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <KeyRound size={13} />
                          <span>Recovery</span>
                        </button>

                        <button
                          onClick={() => setEditingUser(u)}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Edit Role
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

      {/* ── Modal: Bulk Upload via CSV ── */}
      {showBulkUploadModal && (
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
              background: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UploadCloud size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                  Bulk Upload Accounts (CSV)
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setParsedRows([]);
                  setCsvError(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Provision multiple campus users simultaneously by importing a formatted CSV roster or pasting text data directly.
            </p>

            {/* Sub-tabs: File vs Paste */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setBulkUploadTab('file')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: bulkUploadTab === 'file' ? '#1e3a8a' : '#f8fafc',
                  color: bulkUploadTab === 'file' ? 'white' : '#475569',
                  borderColor: bulkUploadTab === 'file' ? '#1e3a8a' : '#cbd5e1',
                }}
              >
                Upload CSV File
              </button>
              <button
                type="button"
                onClick={() => setBulkUploadTab('paste')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  background: bulkUploadTab === 'paste' ? '#1e3a8a' : '#f8fafc',
                  color: bulkUploadTab === 'paste' ? 'white' : '#475569',
                  borderColor: bulkUploadTab === 'paste' ? '#1e3a8a' : '#cbd5e1',
                }}
              >
                Direct CSV Input / Demo
              </button>
            </div>

            {bulkUploadTab === 'file' ? (
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '10px',
                    padding: '24px',
                    textAlign: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <UploadCloud size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    Select or Drag & Drop User CSV
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Columns: Full Name, Email, Role, Department, Semester, Phone
                  </div>
                  <label
                    htmlFor={fileInputId}
                    style={{
                      display: 'inline-block',
                      marginTop: '12px',
                      padding: '8px 16px',
                      background: '#1e3a8a',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Browse Files
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleDownloadSampleCsv}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <Download size={13} />
                    <span>Download CSV Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoRoster}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'none',
                      border: 'none',
                      color: '#059669',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <FileText size={13} />
                    <span>Load 5 Sample Students</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Paste CSV Data (Header: Full Name,Email,Role,Department,Semester,Phone)
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadDemoRoster}
                    style={{
                      fontSize: '11px',
                      color: '#2563eb',
                      background: 'none',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Insert 5 Demo Records
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={rawCsvText}
                  onChange={(e) => {
                    setRawCsvText(e.target.value);
                    parseCsvContent(e.target.value);
                  }}
                  placeholder={`Full Name,Email,Role,Department,Semester,Phone\nArun Kumar,arun@campus.edu,Member,Computer Science,4,+91 98765 43210`}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    background: '#f8fafc',
                  }}
                />
              </div>
            )}

            {csvError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={15} />
                <span>{csvError}</span>
              </div>
            )}

            {/* Live Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
                    ✓ {parsedRows.length} Valid Records Ready to Import
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Pre-validated for platform provisioning
                  </span>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                        <th style={{ padding: '8px 12px' }}>Name</th>
                        <th style={{ padding: '8px 12px' }}>Email</th>
                        <th style={{ padding: '8px 12px' }}>Role</th>
                        <th style={{ padding: '8px 12px' }}>Department</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.name}</td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{r.email}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{ background: '#eff6ff', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                              {r.role}
                            </span>
                          </td>
                          <td style={{ padding: '8px 12px', color: '#64748b' }}>{r.department} (Sem {r.semester})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setParsedRows([]);
                  setCsvError(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0}
                onClick={handleCommitBulkUpload}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: parsedRows.length > 0 ? '#1e3a8a' : '#cbd5e1',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                Import {parsedRows.length} Accounts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Dedicated Bulk Access Recovery ── */}
      {showBulkRecoveryModal && (
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
              background: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                  Institutional Bulk Access Recovery
                </h3>
              </div>
              <button
                onClick={() => setShowBulkRecoveryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Execute platform-wide emergency credential reset and unlock operations across locked or restricted users.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Option 1: Unlock All Suspended */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    Restore All Suspended Accounts ({suspendedCount})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Immediately reactivates all currently locked/suspended users
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUnlockAllSuspended}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: '#16a34a',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Unlock All
                </button>
              </div>

              {/* Option 2: Dispatch recovery notice to locked */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    Dispatch Recovery Links to Locked Users
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Sends email verification tokens to locked students
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDispatchRecoveryToAllLocked}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Dispatch
                </button>
              </div>

              {/* Option 3: Global 2FA reset notice */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
                    Reset 2FA for Filtered Users ({filteredUsers.length})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Requires MFA re-enrollment on next session login
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryNotice(`MFA/2FA credentials reset for ${filteredUsers.length} accounts.`);
                    setShowBulkRecoveryModal(false);
                    setTimeout(() => setRecoveryNotice(null), 5000);
                  }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset 2FA
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowBulkRecoveryModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Single User Access Recovery ── */}
      {recoveringUser && (
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
              background: 'white',
              borderRadius: '14px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                  Account Access Recovery
                </h3>
              </div>
              <button
                onClick={() => setRecoveringUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Execute access recovery procedures for <strong>{recoveringUser.name}</strong> ({recoveringUser.email}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Password Reset Link</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Email a cryptographically secure 1-hour password reset link</div>
                </div>
                <button
                  onClick={() => handleTriggerPasswordReset(recoveringUser)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#1e3a8a',
                    color: 'white',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send Link
                </button>
              </div>

              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Reset 2FA Credentials</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Clear authenticator app binding & require re-enrollment</div>
                </div>
                <button
                  onClick={() => handleReset2FA(recoveringUser)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset 2FA
                </button>
              </div>

              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>Account Status Lock</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Current status: <strong>{recoveringUser.status}</strong>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleLock(recoveringUser)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: recoveringUser.status === 'Active' ? '#fef2f2' : '#f0fdf4',
                    color: recoveringUser.status === 'Active' ? '#dc2626' : '#15803d',
                    border: `1px solid ${recoveringUser.status === 'Active' ? '#fecaca' : '#bbf7d0'}`,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {recoveringUser.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRecoveringUser(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Role ── */}
      {editingUser && (
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
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
              Assign System Role
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Updating role permissions for <strong>{editingUser.name}</strong> ({editingUser.email})
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Select Role Level
              </label>
              <select
                defaultValue={editingUser.role}
                id="role-select"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#f8fafc',
                }}
              >
                <option value="Super Admin">Super Admin (Full Root Permissions)</option>
                <option value="Club President">Club President (Executive Oversight)</option>
                <option value="Treasurer">Treasurer (Finances & Reimbursements)</option>
                <option value="Event Organizer">Event Organizer (Ticketing & Doors)</option>
                <option value="Volunteer">Volunteer (Fundraiser Tasks)</option>
                <option value="Member">Member (Club Verification & Discounts)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setEditingUser(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const sel = document.getElementById('role-select') as HTMLSelectElement;
                  if (sel) {
                    updateUser(editingUser.id, { role: sel.value as UserAccount['role'] });
                    setRecoveryNotice(`Role for ${editingUser.name} updated to ${sel.value}.`);
                    setTimeout(() => setRecoveryNotice(null), 4000);
                  }
                  setEditingUser(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1e3a8a',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add User ── */}
      {showAddUserModal && (
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
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#1e293b' }}>
              New User Account
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Create an institutional account with designated permissions and access recovery defaults.
            </p>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thirumurugan K"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. user@bitsathy.ac.in"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Initial Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Club President">Club President</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Event Organizer">Event Organizer</option>
                      <option value="Volunteer">Volunteer</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AI & Data Science"
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    color: '#64748b',
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
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#1e3a8a',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
