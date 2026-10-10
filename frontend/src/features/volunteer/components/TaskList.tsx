import React from 'react';
import { VolunteerTask, TaskStatus } from '../types/volunteer.types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskCard } from './TaskCard';
import {
  Search,
  AlertCircle,
  Play,
  CheckCircle2,
  RotateCcw,
  Loader2,
  CheckSquare,
  RefreshCw,
} from 'lucide-react';

interface TaskListProps {
  tasks: VolunteerTask[];
  loading: boolean;
  error: string | null;
  updatingTaskId: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onRefresh: () => void;
  stats?: {
    total: number;
    todo: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
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
  onStatusChange,
  onRefresh,
  stats,
}) => {
  return (
    <div className="space-y-4">
      {/* ── 1. FILTERS & SEARCH TOOLBAR ────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title, project, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Tabs / Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses {stats ? `(${stats.total})` : ''}</option>
              <option value="TODO">To Do {stats ? `(${stats.todo})` : ''}</option>
              <option value="IN_PROGRESS">In Progress {stats ? `(${stats.inProgress})` : ''}</option>
              <option value="COMPLETED">Completed {stats ? `(${stats.completed})` : ''}</option>
            </select>

            {/* Priority Dropdown */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Baking">Baking</option>
              <option value="Supplies">Supplies</option>
              <option value="Table Staffing">Table Staffing</option>
              <option value="Promotion">Promotion</option>
              <option value="Logistics">Logistics</option>
              <option value="General">General</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh Tasks"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Pill Indicator Row */}
        {stats && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Quick Stats:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Total: {stats.total}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
              To Do: {stats.todo}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">
              In Progress: {stats.inProgress}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
              Completed: {stats.completed}
            </span>
            {stats.overdue > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Overdue: {stats.overdue}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 2. ERROR STATE ────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="font-medium underline hover:text-rose-800 dark:hover:text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 3. LOADING SKELETON ────────────────────────────────────── */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading volunteer tasks...</p>
        </div>
      )}

      {/* ── 4. EMPTY STATE ────────────────────────────────────────── */}
      {!loading && tasks.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
          <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No Tasks Matching Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'
              ? 'Try resetting the search filters above to view all tasks.'
              : 'You have no volunteer tasks currently assigned. Check back when coordinators allocate new duties.'}
          </p>
        </div>
      )}

      {/* ── 5. DESKTOP TABLE VIEW (Hidden on small mobile screens) ─── */}
      {!loading && tasks.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((task) => {
                  const isUpdating = updatingTaskId === task.id;
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Title & Project */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {task.title}
                        </div>
                        {task.projectName && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">
                            📁 {task.projectName}
                          </div>
                        )}
                        {task.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {task.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3">
                        <TaskPriorityBadge priority={task.priority} />
                      </td>

                      {/* Due Date & Overdue */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {task.dueDate}
                        </span>
                        {task.isOverdue && task.status !== 'COMPLETED' && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 mt-0.5 block">
                            <AlertCircle className="w-2.5 h-2.5" />
                            Overdue
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <TaskStatusBadge status={task.status} size="sm" />
                      </td>

                      {/* Transition Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {task.status === 'TODO' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>Start Task</span>
                          </button>
                        )}

                        {task.status === 'IN_PROGRESS' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'COMPLETED')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 transition-colors disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            <span>Mark Done</span>
                          </button>
                        )}

                        {task.status === 'COMPLETED' && (
                          <button
                            disabled={isUpdating}
                            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            title="Reopen task"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3 h-3" />
                            )}
                            <span>Reopen</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── 6. MOBILE CARD VIEW (Displayed on mobile/tablet screens) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:hidden gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isUpdating={updatingTaskId === task.id}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
