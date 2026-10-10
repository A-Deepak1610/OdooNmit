import React, { useEffect, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeft, Activity, Shield } from 'lucide-react';
import { useUiStore } from '../../stores/ui.store';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '../../services/api-client';
import { SystemHealthSummary } from '../../types';
import { Badge } from '../ui/Badge';

export const AppHeader: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, toggleMobileSidebar } = useUiStore();
  const { role, setRole } = useAuthStore();
  const [health, setHealth] = useState<SystemHealthSummary | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState<boolean>(true);

  // Poll backend health indicator on mount
  useEffect(() => {
    let isMounted = true;

    const checkSystemHealth = async () => {
      try {
        const response = await apiClient.get<SystemHealthSummary>('/health');
        if (isMounted) {
          setHealth(response.data);
          setIsCheckingHealth(false);
        }
      } catch {
        if (isMounted) {
          setHealth({
            status: 'error',
            service: 'backend',
            uptimeSeconds: 0,
            timestamp: new Date().toISOString(),
            checks: {
              process: 'error',
              database: { status: 'disconnected' },
            },
          });
          setIsCheckingHealth(false);
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 15000); // 15s refresh
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      {/* Left: Sidebar toggle controls */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-800 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="hidden rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-800 md:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <span className="hidden sm:inline-block h-4 w-px bg-surface-200" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
            Workspace
          </span>
          <span className="text-xs font-medium text-surface-400">/</span>
          <span className="text-xs font-medium text-surface-800">
            Hackathon Production Shell
          </span>
        </div>
      </div>

      {/* Right: Health indicator & Role Simulator */}
      <div className="flex items-center gap-4">
        {/* Live Backend & TiDB Health Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <Activity className="h-4 w-4 text-surface-400" />
          <span className="text-surface-500 font-medium">Backend:</span>
          {isCheckingHealth ? (
            <Badge variant="outline">checking...</Badge>
          ) : health?.status === 'healthy' ? (
            <Badge variant="success" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy ({health.checks.database.latencyMs ?? 0}ms)
            </Badge>
          ) : (
            <Badge variant="danger" className="gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              {health?.status || 'Offline'}
            </Badge>
          )}
        </div>

        {/* Role Simulator Selector for 4-person team testing */}
        <div className="flex items-center gap-2 border-l border-surface-200 pl-4">
          <Shield className="h-3.5 w-3.5 text-surface-400 hidden lg:inline" />
          <label htmlFor="role-select" className="text-xs font-medium text-surface-500 hidden lg:inline">
            Role:
          </label>
          <select
            id="role-select"
            value={role || ''}
            onChange={(e) => setRole(e.target.value || null)}
            className="h-8 rounded-lg border border-surface-300 bg-white px-2 text-xs font-medium text-surface-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
          >
            <option value="">No Role (Public)</option>
            <option value="DEVELOPER">DEVELOPER</option>
            <option value="ADMIN">ADMIN (Demo)</option>
            <option value="USER">USER (Demo)</option>
          </select>
        </div>
      </div>
    </header>
  );
};
