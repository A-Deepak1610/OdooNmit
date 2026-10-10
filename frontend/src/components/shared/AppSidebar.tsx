import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { getPermittedNavigationItems } from '../../config/navigation';
import { ROLE_DISPLAY_NAMES } from '../../config/roles';
import { cn } from '../../utils/cn';
import { GraduationCap, LogOut, X } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const { user, role, logout } = useAuthStore();
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

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

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white select-none">
      {/* Top Branding Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-base font-bold tracking-tight text-blue-600">
                CampusMitra
              </span>
            )}
          </NavLink>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {Object.entries(groupedItems).map(([groupTitle, items]) => (
            <div key={groupTitle} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {groupTitle}
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                        sidebarCollapsed && 'justify-center px-2'
                      )
                    }
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile & Sign Out at Sidebar Bottom (matches screenshot) */}
      <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User avatar'}
                className="h-9 w-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CM'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || 'CampusMitra User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {role ? (ROLE_DISPLAY_NAMES[role] || role) : 'Student'}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors',
            sidebarCollapsed && 'px-2'
          )}
          title="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transition-transform duration-200 ease-in-out md:hidden border-r border-slate-200',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 select-none shadow-xs',
          sidebarCollapsed ? 'w-18' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
