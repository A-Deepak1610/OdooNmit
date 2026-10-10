import React from 'react';
import { useVolunteerTasks } from '../hooks/useVolunteerTasks';
import { TaskList } from '../components/TaskList';
import { CheckSquare, AlertCircle } from 'lucide-react';

export const VolunteerTasks: React.FC = () => {
  const {
    filteredTasks,
    loading,
    error,
    updatingTaskId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    updateTaskStatus,
    refreshTasks,
    stats,
  } = useVolunteerTasks();

  return (
    <div className="space-y-5">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              My Volunteer Tasks
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your assigned responsibilities across Skyline Student Association events and fundraisers.
          </p>
        </div>

        {stats.overdue > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-semibold self-start sm:self-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{stats.overdue} Task{stats.overdue > 1 ? 's' : ''} Overdue</span>
          </div>
        )}
      </div>

      {/* ── Task Management List & Filters ────────────────────────── */}
      <TaskList
        tasks={filteredTasks}
        loading={loading}
        error={error}
        updatingTaskId={updatingTaskId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        onStatusChange={updateTaskStatus}
        onRefresh={refreshTasks}
        stats={stats}
      />
    </div>
  );
};
