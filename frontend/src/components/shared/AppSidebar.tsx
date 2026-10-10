import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { getPermittedNavigationItems } from '../../config/navigation';
import { ROLE_DISPLAY_NAMES } from '../../config/roles';
import { GraduationCap, LogOut, X } from 'lucide-react';

export interface AppSidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const { user, role, logout } = useAuthStore();
  const { sidebarCollapsed } = useUiStore();
  const isCollapsed = !isMobileDrawer && sidebarCollapsed;
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
  const roleTitle = role ? (ROLE_DISPLAY_NAMES[role] || role) : 'Student';

  return (
    <aside
      style={{
        width: isMobileDrawer ? '100%' : isCollapsed ? '72px' : '260px',
        backgroundColor: 'var(--background)',
        borderRight: isMobileDrawer ? 'none' : '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        position: isMobileDrawer ? 'relative' : 'sticky',
        top: 0,
        userSelect: 'none',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Sidebar Logo Block */}
      <div
        style={{
          height: '60px',
          padding: isCollapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              background: 'var(--primary)',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0,
            }}
            title="CampusFlow"
          >
            <GraduationCap style={{ width: '18px', height: '18px' }} />
          </div>
          {!isCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '-0.3px',
                  lineHeight: 1.2,
                }}
              >
                CampusFlow
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--muted-foreground)',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase',
                }}
              >
                {roleTitle}
              </span>
            </div>
          )}
        </div>

        {isMobileDrawer && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        )}
      </div>

      {/* 2. Navigation Items */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isCollapsed ? '16px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {Object.entries(groupedItems).map(([groupTitle, items]) => (
          <div key={groupTitle} style={{ marginBottom: isCollapsed ? '12px' : '8px' }}>
            {/* Section Header */}
            {!isCollapsed ? (
              <div
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--muted-foreground)',
                  fontWeight: 700,
                  padding: '10px 12px 6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {groupTitle}
              </div>
            ) : (
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--border)',
                  margin: '8px 4px',
                }}
              />
            )}

            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => {
                    if (onCloseMobile) {
                      onCloseMobile();
                    }
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? '0' : '10px',
                    padding: isCollapsed ? '10px 0' : '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary)' : 'var(--foreground)',
                    backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '13.5px',
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
                  <Icon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
                  {!isCollapsed && (
                    <span
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. User Footer */}
      <div
        style={{
          padding: isCollapsed ? '12px 8px' : '14px 16px',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          display: 'flex',
          flexDirection: isCollapsed ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: isCollapsed ? '10px' : '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 0,
            overflow: 'hidden',
            width: isCollapsed ? 'auto' : '100%',
          }}
        >
          <img
            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${avatarSeed}&backgroundColor=b6e3f4`}
            alt={user?.name || 'User avatar'}
            title={user?.name || 'User profile'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
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
                {user?.name || 'Member'}
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
                {roleTitle}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          aria-label="Sign Out"
          style={{
            background: 'transparent',
            border: isCollapsed ? 'none' : '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--muted-foreground)',
            cursor: 'pointer',
            padding: isCollapsed ? '6px' : '7px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-foreground)';
            e.currentTarget.style.borderColor = isCollapsed ? 'transparent' : 'var(--border)';
          }}
        >
          <LogOut style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
    </aside>
  );
};
