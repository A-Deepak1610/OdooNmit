import React from 'react';
import { useVolunteerEvents } from '../hooks/useVolunteerEvents';
import { EventCard } from '../components/EventCard';
import { Calendar, Loader2, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

export const VolunteerEvents: React.FC = () => {
  const { events, loading, error, refreshEvents } = useVolunteerEvents();

  return (
    <div className="space-y-5">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Event Duty & Shift Assignments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed volunteering shifts, venue locations, and on-duty instructions.
          </p>
        </div>

        <button
          onClick={refreshEvents}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Security notice clarifying non-exposure of attendee personal data */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Volunteer View: Displays your allocated shift responsibilities. Attendee registries and payment journals are maintained by event organizers.
        </span>
      </div>

      {/* ── Error State ───────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshEvents}
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
          <p className="text-xs text-slate-500">Loading scheduled event shifts...</p>
        </div>
      )}

      {/* ── Events Grid ───────────────────────────────────────────── */}
      {!loading && events.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No Active Event Shifts
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            You do not have any upcoming event shifts assigned yet.
          </p>
        </div>
      )}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((assignment) => (
            <EventCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </div>
  );
};
