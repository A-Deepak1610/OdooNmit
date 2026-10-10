import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { getPermittedNavigationItems } from '../../config/navigation';
import { ROLE_DISPLAY_NAMES } from '../../config/roles';
import { GraduationCap, LogOut } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const permittedItems = getPermittedNavigationItems(role);

  // Group items according to their designated section group
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof permittedItems> = {};
    permittedItems.forEach((item) => {
      const groupKey = item.group || 'MAIN';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [permittedItems]);

  const handleSignOut = async () => {
    await logout();
  };

  const avatarSeed = encodeURIComponent(user?.name || 'Deepak');

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
      {/* 1. Sidebar Logo Block (height 60px, padding 0 24px) */}
      <div
        style={{
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
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
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--primary)',
            letterSpacing: '-0.3px',
          }}
        >
          CampusMitra
        </span>
      </div>

      {/* 2. Navigation Area (flex: 1, overflow-y: auto, padding: 16px 12px, gap: 4px) */}
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
        {Object.entries(groupedItems).map(([groupTitle, items]) => (
          <div key={groupTitle} style={{ marginBottom: '8px' }}>
            {/* Nav Group Section Header Label */}
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--muted-foreground)',
                fontWeight: 600,
                padding: '12px 12px 6px',
              }}
            >
              {groupTitle}
            </div>

            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s',
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
                  <span style={{ truncate: true } as any}>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Sidebar User Footer (padding: 16px, borderTop: 1px var(--border)) */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`}
            alt={user?.name || 'User avatar'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--foreground)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Student Member'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {role ? (ROLE_DISPLAY_NAMES[role] || role) : 'Student'}
            </div>
          </div>
        </div>

        {/* Logout button (hover destructive) */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--muted-foreground)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background)';
            e.currentTarget.style.color = 'var(--muted-foreground)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <LogOut style={{ width: '14px', height: '14px' }} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
