import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUiStore } from '../../stores/ui.store';
import { getPermittedNavigationItems } from '../../config/navigation';
import { cn } from '../../utils/cn';
import { LayoutGrid, Layers, ChevronRight, X } from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const role = useAuthStore((state) => state.role);
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  const permittedItems = getPermittedNavigationItems(role);

  // Group items if any group is specified
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof permittedItems> = {};
    permittedItems.forEach((item) => {
      const groupKey = item.group || 'Navigation';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [permittedItems]);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      {/* Top Branding Header */}
      <div className="space-y-6">
        <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200/80">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-700 transition-colors">
              <Layers className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-surface-900 leading-tight">
                  Hackathon App
                </span>
                <span className="text-[11px] font-medium text-surface-400">
                  Starter Template
                </span>
              </div>
            )}
          </NavLink>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-surface-400 hover:text-surface-700 hover:bg-surface-100"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="px-3">
          {permittedItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-200 bg-surface-50/50 p-4 text-center my-4">
              <LayoutGrid className="mx-auto h-6 w-6 text-surface-400 mb-2" />
              {!sidebarCollapsed && (
                <>
                  <p className="text-xs font-semibold text-surface-700">No Features Registered</p>
                  <p className="mt-1 text-[11px] text-surface-400 leading-normal">
                    Add feature links to navigation.ts once modules are built.
                  </p>
                </>
              )}
            </div>
          ) : (
            <nav className="space-y-4">
              {Object.entries(groupedItems).map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-1">
                  {!sidebarCollapsed && groupTitle !== 'Navigation' && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-surface-400">
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
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                            isActive
                              ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                              : 'text-surface-600 hover:bg-surface-100/80 hover:text-surface-900',
                            sidebarCollapsed && 'justify-center px-2'
                          )
                        }
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                        {!sidebarCollapsed && (
                          <>
                            <span className="truncate flex-1">{item.label}</span>
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Role State Indicator at bottom */}
      <div className="p-3 border-t border-surface-200/80">
        <div
          className={cn(
            'rounded-lg bg-surface-100/80 p-2.5 text-xs text-surface-600',
            sidebarCollapsed ? 'text-center' : 'flex items-center justify-between'
          )}
        >
          {!sidebarCollapsed ? (
            <>
              <span className="font-medium text-surface-500">Active Role:</span>
              <span className="font-semibold text-surface-800">
                {role ? String(role) : 'Public / None'}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-surface-500">
              {role ? String(role).substring(0, 3).toUpperCase() : 'PUB'}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-950/40 backdrop-blur-xs transition-opacity md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-200 ease-in-out md:hidden',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-surface-200 bg-white transition-all duration-200 shrink-0 select-none',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
