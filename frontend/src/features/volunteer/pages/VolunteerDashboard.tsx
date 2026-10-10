import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { useVolunteerTasks } from '../hooks/useVolunteerTasks';
import { useVolunteerEvents } from '../hooks/useVolunteerEvents';
import { useVolunteerProjects } from '../hooks/useVolunteerProjects';
import { useVolunteerExpenses } from '../hooks/useVolunteerExpenses';
import { TaskCard } from '../components/TaskCard';
import { EventCard } from '../components/EventCard';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Receipt,
  ArrowRight,
} from 'lucide-react';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { tasks, stats: taskStats, updatingTaskId, updateTaskStatus } = useVolunteerTasks();
  const { events } = useVolunteerEvents();
  const { projects } = useVolunteerProjects();
  const { stats: expenseStats } = useVolunteerExpenses();

  // Tasks requiring immediate volunteer attention (To Do or In Progress)
  const urgentTasks = tasks
    .filter((t) => t.status !== 'COMPLETED')
    .slice(0, 3);

  // Next upcoming event shift
  const upcomingShift = events[0];

  return (
    <div className="space-y-6">
      {/* ── 1. WELCOME BANNER ───────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Skyline Student Association
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Volunteer Operations Hub
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.name || 'Volunteer'}!
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your event shifts, execute fundraiser tasks, and claim out-of-pocket reimbursements.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/volunteer/tasks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Manage Tasks</span>
          </Link>
          <Link
            to="/volunteer/expenses"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Submit Claim</span>
          </Link>
        </div>
      </div>

      {/* ── 2. METRICS OVERVIEW (4 Meaningful Cards) ────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pending Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">To Do Tasks</span>
            <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {taskStats.todo}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting start</p>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">In Progress</span>
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {taskStats.inProgress}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actively executing</p>
        </div>

        {/* Overdue / Due Soon */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Overdue Tasks</span>
            <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {taskStats.overdue}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires immediate action</p>
        </div>

        {/* Reimbursed Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Reimbursed</span>
            <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ₹{expenseStats.reimbursedTotal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">₹{expenseStats.pendingTotal.toLocaleString()} pending review</p>
        </div>
      </div>

      {/* ── 3. TWO-COLUMN LAYOUT: TASKS & EVENT SHIFTS ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Tasks Requiring Attention
              </h2>
              <p className="text-xs text-slate-500">
                Your highest priority and in-progress assignments.
              </p>
            </div>
            <Link
              to="/volunteer/tasks"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>View All Tasks ({tasks.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {urgentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isUpdating={updatingTaskId === task.id}
                onStatusChange={updateTaskStatus}
              />
            ))}
          </div>

          {urgentTasks.length === 0 && (
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
              🎉 All assigned tasks are currently completed! Great job.
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Next Event Shift */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Upcoming Event Shift
              </h2>
              <p className="text-xs text-slate-500">
                Next scheduled on-campus commitment.
              </p>
            </div>
            <Link
              to="/volunteer/events"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>All Shifts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingShift ? (
            <EventCard assignment={upcomingShift} />
          ) : (
            <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
              No event shifts assigned right now.
            </div>
          )}
        </div>
      </div>

      {/* ── 4. ACTIVE PROJECTS PREVIEW ─────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Active Fundraisers & Projects
            </h2>
            <p className="text-xs text-slate-500">
              Campaigns you are supporting across the Skyline Student Association.
            </p>
          </div>
          <Link
            to="/volunteer/projects"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            <span>See Project Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.slice(0, 2).map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="overflow-hidden">
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {project.category}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 truncate">
                  {project.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Coordinator: {project.coordinatorName} • Target: {project.deadline}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {project.completedTasks}/{project.totalTasks} Done
                </span>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {project.myTasksCount} tasks for you
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
