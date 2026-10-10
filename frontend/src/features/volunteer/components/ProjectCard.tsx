import React from 'react';
import { VolunteerProject } from '../types/volunteer.types';
import { Calendar, User, CheckCircle2, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  project: VolunteerProject;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const taskProgress = project.totalTasks > 0
    ? Math.round((project.completedTasks / project.totalTasks) * 100)
    : 0;

  const fundProgress = project.targetFund && project.targetFund > 0
    ? Math.round(((project.raisedFund || 0) / project.targetFund) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            {project.category}
          </span>

          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              project.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {project.status}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {project.name}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Coordinator & Deadline info */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">
              {project.coordinatorName} ({project.coordinatorRole})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: {project.deadline}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {/* Task Completion Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Task Execution
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {project.completedTasks} / {project.totalTasks} ({taskProgress}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {/* Fundraiser Progress if applicable */}
        {project.targetFund && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                Fundraising Goal
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{project.raisedFund?.toLocaleString()} / ₹{project.targetFund.toLocaleString()} ({fundProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(fundProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* My Responsibility Tag */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500">My Assigned Tasks:</span>
          <span className="font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
            {project.myTasksCount > 0 ? `${project.myTasksCount} Active Duties` : 'None Currently'}
          </span>
        </div>
      </div>
    </div>
  );
};
