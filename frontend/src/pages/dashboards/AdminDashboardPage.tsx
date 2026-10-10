import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  Calendar,
  Users,
  Trophy,
  IndianRupee,
  Plus,
  PlusCircle,
  TrendingUp,
  BellRing,
  Building2,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, collegeName } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header (Matches UI reference) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's an overview of {collegeName}
          </p>
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-xs">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-medium truncate max-w-[200px] sm:max-w-none">{collegeName}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              A++
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row (Matches UI reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Events */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Events</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">10</p>
            <p className="text-[11px] text-slate-400 mt-0.5">9 active</p>
          </div>
        </div>

        {/* Card 2: Participants */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Participants</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">1,013</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">↗+16% +24 this week</p>
          </div>
        </div>

        {/* Card 3: Winners */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Winners</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">3</p>
            <p className="text-[11px] text-slate-400 mt-0.5">From completed events</p>
          </div>
        </div>

        {/* Card 4: Revenue Generated */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Revenue Generated</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">₹367,500</p>
            <p className="text-[11px] text-slate-400 mt-0.5">From registration fees</p>
          </div>
        </div>
      </div>

      {/* Quick Actions (Matches UI reference) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Action 1 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Create Event</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Host a new hackathon, workshop, or seminar
              </p>
            </div>
          </div>

          {/* Action 2 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">My Events</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage your hosted events</p>
            </div>
          </div>

          {/* Action 3 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Declare Winners</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Announce winners for completed events</p>
            </div>
          </div>

          {/* Action 4 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Registered Teams</p>
              <p className="text-[11px] text-slate-400 mt-0.5">View and manage team registrations</p>
            </div>
          </div>

          {/* Action 5 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Event Analytics</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Insights and performance metrics</p>
            </div>
          </div>

          {/* Action 6 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Incoming Events</p>
              <p className="text-[11px] text-slate-400 mt-0.5">External events from partner colleges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events & Event Status (Matches UI reference bottom cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Events (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Events</h3>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 overflow-hidden">
                <span className="text-[10px]">CTF</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Cybersecurity CTF Challenge</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Hackathon • May 1</p>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Pending
            </span>
          </div>
        </div>

        {/* Event Status (1 column on lg) */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Event Status</h3>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-900">Ongoing</span>
            </div>
            <span className="text-base font-bold text-emerald-900">0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
