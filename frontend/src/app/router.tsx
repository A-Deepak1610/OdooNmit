import React, { useState, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingState } from '../components/shared/LoadingState';
import { useAuthStore } from '../stores/auth.store';
import { apiClient } from '../services/api-client';
import { SystemHealthSummary } from '../types';
import {
  Server,
  Database,
  Cpu,
  Layers,
  FileCode2,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderTree,
} from 'lucide-react';

/**
 * Reusable Route Guard Component
 * NOTE: Client-side guards only improve UX by guiding users.
 * Real security and authorization must ALWAYS be enforced by the backend API.
 */
export const RouteGuard: React.FC<{
  allowedRoles?: string[];
  children?: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { role } = useAuthStore();

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="Access Restricted"
          description="Your current role does not have permission to access this module."
        />
      );
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

/**
 * Neutral Application Shell Landing Page
 * Contains zero business assumptions. Demonstrates live system infrastructure health,
 * clean design system tokens, and clear architectural workflow for the 4 hackathon developers.
 */
const WelcomeShell: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<SystemHealthSummary>('/health');
      setHealth(response.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to backend service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Hackathon Starter Shell"
        description="Neutral, production-grade full-stack infrastructure template. No business assumptions have been made. Ready for the 4-developer team to implement the announced problem statement."
        badge={
          <Badge variant={health?.status === 'healthy' ? 'success' : 'warning'}>
            {health?.status === 'healthy' ? 'Infrastructure Ready' : 'Degraded'}
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            isLoading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh Health
          </Button>
        }
      />

      {/* System Health Status Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Backend API Service */}
        <Card className="border-surface-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-surface-700">
              Backend Service
            </CardTitle>
            <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState size="sm" message="Querying /live..." />
            ) : error ? (
              <div className="text-xs text-rose-600 font-medium">{error}</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Process Status</span>
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> OK
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Uptime</span>
                  <span className="text-xs font-mono font-medium text-surface-800">
                    {health?.uptimeSeconds ?? 0}s
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TiDB Database */}
        <Card className="border-surface-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-surface-700">
              TiDB Cluster
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState size="sm" message="Querying /ready..." />
            ) : error ? (
              <div className="text-xs text-rose-600 font-medium">Database unreachable</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Connection</span>
                  <Badge
                    variant={
                      health?.checks.database.status === 'connected' ? 'success' : 'danger'
                    }
                  >
                    {health?.checks.database.status ?? 'disconnected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">Ping Latency</span>
                  <span className="text-xs font-mono font-medium text-surface-800">
                    {health?.checks.database.latencyMs !== undefined
                      ? `${health.checks.database.latencyMs}ms`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Architecture Status */}
        <Card className="border-surface-200/90 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-surface-700">
              Modular Monolith
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Cpu className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Frontend Stack</span>
                <span className="text-xs font-medium text-surface-700">React + TS + Vite</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500">Backend Stack</span>
                <span className="text-xs font-medium text-surface-700">Node ESM + Prisma</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Architectural Guidelines */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-brand-600" />
              <CardTitle className="text-base">Adding Feature Modules</CardTitle>
            </div>
            <CardDescription>
              Each developer works independently in dedicated feature directories to avoid Git conflicts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-surface-600 leading-relaxed">
            <div className="rounded-lg bg-surface-100 p-3 font-mono text-[11px] text-surface-800 space-y-1">
              <div className="text-brand-700 font-semibold"># Frontend Feature Convention:</div>
              <div>frontend/src/modules/&lt;feature-name&gt;/</div>
              <div className="pl-4">├── pages/</div>
              <div className="pl-4">├── components/</div>
              <div className="pl-4">├── services/</div>
              <div className="pl-4">├── types/</div>
              <div className="pl-4">└── hooks/</div>
            </div>
            <div className="rounded-lg bg-surface-100 p-3 font-mono text-[11px] text-surface-800 space-y-1">
              <div className="text-brand-700 font-semibold"># Backend Feature Convention:</div>
              <div>backend/src/modules/&lt;feature-name&gt;/</div>
              <div className="pl-4">├── &lt;feature&gt;.routes.js</div>
              <div className="pl-4">├── &lt;feature&gt;.controller.js</div>
              <div className="pl-4">├── &lt;feature&gt;.service.js</div>
              <div className="pl-4">├── &lt;feature&gt;.repository.js</div>
              <div className="pl-4">└── &lt;feature&gt;.validation.js</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Team Coordination Rules</CardTitle>
            </div>
            <CardDescription>
              Rules enforced by AGENTS.md for parallel 4-developer productivity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-surface-600 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <FileCode2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Shared navigation:</strong> Register new pages in{' '}
                <code className="text-brand-700 font-mono">config/navigation.ts</code>. The AppSidebar
                automatically renders and filters them based on role.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Layers className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Centralized API Client:</strong> Import{' '}
                <code className="text-brand-700 font-mono">apiClient</code> from{' '}
                <code className="text-brand-700 font-mono">services/api-client.ts</code>. Do not create
                duplicate Axios instances.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <Database className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>TiDB Schema updates:</strong> Coordinate changes in{' '}
                <code className="text-brand-700 font-mono">prisma/schema.prisma</code>, then execute{' '}
                <code className="text-brand-700 font-mono">npm run prisma:generate</code>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * Fallback Not Found Page
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <EmptyState
        title="Page Not Found"
        description="The route you requested does not exist or has not yet been registered."
        action={
          <Button variant="primary" size="sm" onClick={() => (window.location.href = '/')}>
            Return to Welcome Shell
          </Button>
        }
      />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <WelcomeShell />,
      },
      // Future feature modules will plug their routes here:
      // {
      //   path: 'feature',
      //   element: <RouteGuard allowedRoles={['ROLE']}><FeaturePage /></RouteGuard>,
      // }
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/" replace />,
      },
      // Future login/register routes can go here
    ],
  },
]);
