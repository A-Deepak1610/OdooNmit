import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { MembershipModule } from '../../components/modules/memberships/MembershipModule';
import { UserAccount, INITIAL_USERS } from './data/users';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);

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
  const [activeTab, setActiveTab] = useState<'memberships' | 'system_users'>('memberships');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Member' as UserAccount['role'],
    department: 'Computer Science',
    semester: 6,
  });

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── Page Header with Tab Navigation ── */}
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
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Administrator Workspace
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Campus Central User & Membership Governance
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            User Accounts & Membership Governance
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Unified command center to monitor student club passes, collect dues, and manage institutional system roles.
          </p>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => setActiveTab('memberships')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'memberships' ? 'white' : 'transparent',
                color: activeTab === 'memberships' ? '#1e3a8a' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'memberships' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <CreditCard size={15} />
              Member Passes & Dues
            </button>
            <button
              onClick={() => setActiveTab('system_users')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'system_users' ? 'white' : 'transparent',
                color: activeTab === 'system_users' ? '#1e3a8a' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'system_users' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Users size={15} />
              System Users & RBAC
            </button>
          </div>
        </div>
      </div>

      {/* ── Active Tab View ── */}
      {activeTab === 'memberships' ? (
        <MembershipModule />
      ) : (
        /* System Users & RBAC Directory View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Bar */}
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
              <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '400px' }}>
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
              </div>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
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
              <Plus size={16} />
              Add System Account
            </button>
          </div>

          {/* User Accounts Table */}
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
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>USER ACCOUNT</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>ASSIGNED ROLE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>DEPARTMENT & SEM</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>ORGANIZATION SCOPE</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px' }}>STATUS</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const isThirumurugan = u.email.includes('thirumurugank');
                    const roleColorMap: Record<string, { bg: string; text: string }> = {
                      'Super Admin': { bg: '#dcfce7', text: '#15803d' },
                      'Club President': { bg: '#ede9fe', text: '#6d28d9' },
                      Treasurer: { bg: '#fef3c7', text: '#b45309' },
                      'Event Organizer': { bg: '#fed7aa', text: '#c2410c' },
                      Volunteer: { bg: '#cffafe', text: '#0e7490' },
                      Member: { bg: '#e0e7ff', text: '#3730a3' },
                    };
                    const roleStyle = roleColorMap[u.role] || { bg: '#f1f5f9', text: '#475569' };

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isThirumurugan ? '#f0fdf4' : 'transparent',
                        }}
                      >
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
                              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {u.name}
                                {isThirumurugan && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      background: '#16a34a',
                                      color: 'white',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    Current Session
                                  </span>
                                )}
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
                              gap: '4px',
                              color: u.status === 'Active' ? '#16a34a' : '#ea580c',
                              fontWeight: 600,
                              fontSize: '12px',
                            }}
                          >
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: u.status === 'Active' ? '#16a34a' : '#ea580c',
                              }}
                            />
                            {u.status}
                          </span>
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              onClick={() => setEditingUser(u)}
                              style={{
                                background: '#f1f5f9',
                                color: '#1e3a8a',
                                border: 'none',
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
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
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
                  }
                  setEditingUser(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
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
              Add New Campus User
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              Create an institutional account with designated permissions.
            </p>

            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Full Name
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
                    Institutional Email
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
                      Role
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
