import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import {
  LayoutDashboard,
  CheckSquare,
  QrCode,
  Calendar,
  Receipt,
  User,
  GraduationCap,
  LogOut,
  X,
  Menu,
} from 'lucide-react';

interface VolunteerSidebarProps {
  onCloseMobile?: () => void;
}

const NAVIGATION_GROUPS = [
  {
    groupTitle: 'VOLUNTEER OPERATIONS',
    items: [
      {
        id: 'volunteer-dashboard',
        label: 'Operations Hub',
        path: '/volunteer/dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'volunteer-tasks',
        label: 'Fundraiser Tasks',
        path: '/volunteer/tasks',
        icon: CheckSquare,
      },
      {
        id: 'volunteer-events',
        label: 'Event Duties & Shifts',
        path: '/volunteer/events',
        icon: Calendar,
      },
      {
        id: 'volunteer-expenses',
        label: 'Reimbursement Claims',
        path: '/volunteer/expenses',
        icon: Receipt,
      },
      {
        id: 'volunteer-scanner',
        label: 'Ticket & Member Check-in',
        path: '/volunteer/scanner',
        icon: QrCode,
      },
    ],
  },
  {
    groupTitle: 'IDENTITY & CREDENTIALS',
    items: [
      {
        id: 'volunteer-profile',
        label: 'Volunteer Pass & ID',
        path: '/volunteer/profile',
        icon: User,
      },
    ],
  },
];

export const VolunteerSidebar: React.FC<VolunteerSidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuthStore();

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--background)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        userSelect: 'none',
      }}
    >
      {/* ── 1. Logo Block (height 60px, padding 0 24px) ─────────────── */}
      <div
        style={{
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              background: 'var(--primary)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <GraduationCap style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '-0.3px',
                lineHeight: 1.1,
              }}
            >
              CampusMitra
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#15803d',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Volunteer Portal
            </div>
          </div>
        </div>

        {onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        ) : (
          <div
            className="hidden md:flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            title="Volunteer Portal"
          >
            <Menu style={{ width: '18px', height: '18px' }} />
          </div>
        )}
      </div>

      {/* ── 2. Navigation Area ─────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {NAVIGATION_GROUPS.map((group) => (
          <div key={group.groupTitle} style={{ marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--muted-foreground)',
                fontWeight: 600,
                padding: '8px 12px 6px',
              }}
            >
              {group.groupTitle}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={onCloseMobile}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease-in-out',
                    marginBottom: '2px',
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.getAttribute('aria-current')) {
                      e.currentTarget.style.backgroundColor = 'var(--secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.getAttribute('aria-current')) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── 3. Sidebar User Footer ─────────────────────────────────── */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || 'Volunteer'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'V'}
            </div>
          )}
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--foreground)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Volunteer'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#15803d',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Role: VOLUNTEER
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--muted-foreground)';
          }}
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </aside>
  );
};
