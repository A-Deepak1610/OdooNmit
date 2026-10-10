import React from 'react';
import { useVolunteerProjects } from '../hooks/useVolunteerProjects';
import { ProjectCard } from '../components/ProjectCard';
import { Layers, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export const VolunteerProjects: React.FC = () => {
  const { projects, loading, error, refreshProjects } = useVolunteerProjects();

  return (
    <div className="space-y-5">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Projects & Fundraisers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active club initiatives, charity fundraisers, and campus events driven by volunteers.
          </p>
        </div>

        <button
          onClick={refreshProjects}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Error State ───────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshProjects}
            className="font-medium underline hover:text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading State ─────────────────────────────────────────── */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading projects & fundraisers...</p>
        </div>
      )}

      {/* ── Projects Grid ─────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
