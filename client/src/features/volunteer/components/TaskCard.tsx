import React from 'react';
import { VolunteerTask, TaskStatus } from '../types/volunteer.types';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Calendar, AlertCircle, Play, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';

interface TaskCardProps {
  task: VolunteerTask;
  isUpdating?: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isUpdating = false, onStatusChange }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <TaskStatusBadge status={task.status} size="sm" />
            <TaskPriorityBadge priority={task.priority} />
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {task.category}
            </span>
          </div>

          {task.isOverdue && task.status !== 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.projectName && (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2">
            📁 {task.projectName}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due: {task.dueDate}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {task.status === 'TODO' && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              <span>Start</span>
            </button>
          )}

          {task.status === 'IN_PROGRESS' && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(task.id, 'COMPLETED')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              <span>Complete</span>
            </button>
          )}

          {task.status === 'COMPLETED' && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Reopen task"
            >
              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
