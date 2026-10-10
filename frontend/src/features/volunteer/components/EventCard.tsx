import React from 'react';
import { VolunteerEventAssignment } from '../types/volunteer.types';
import { Calendar, Clock, MapPin, CheckCircle, Info } from 'lucide-react';

interface EventCardProps {
  assignment: VolunteerEventAssignment;
}

export const EventCard: React.FC<EventCardProps> = ({ assignment }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            {assignment.assignmentStatus}
          </span>

          <span className="text-xs text-slate-500 font-medium">
            Shift Assignment
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {assignment.eventTitle}
        </h3>

        <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {assignment.date}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{assignment.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{assignment.location}</span>
          </div>
        </div>

        {/* Assigned Responsibility */}
        <div className="mt-4 p-3 rounded-md bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Assigned Volunteer Responsibility:
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">
            {assignment.responsibility}
          </div>
        </div>

        {/* Briefing Instructions */}
        {assignment.briefingInstructions.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Shift Day Briefing:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {assignment.briefingInstructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Identification: Volunteer Badge Required</span>
        <span className="text-blue-600 dark:text-blue-400 font-medium">Ready for Check-in</span>
      </div>
    </div>
  );
};
