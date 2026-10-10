import React from 'react';
import { TaskPriority } from '../types/volunteer.types';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
          Urgent
        </span>
      );

    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800">
          High
        </span>
      );

    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
          Medium
        </span>
      );

    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
          Low
        </span>
      );
  }
};
