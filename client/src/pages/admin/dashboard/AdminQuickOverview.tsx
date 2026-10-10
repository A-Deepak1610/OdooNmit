import React from 'react';
import {
  Building2,
  Ticket,
  Vote,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  PieChart,
  ShieldCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import {
  AdminKpis,
  ClubItem,
  SupportTicketItem,
  ElectionItem,
} from '../../../services/admin.service';

interface AdminQuickOverviewProps {
  overviewData: {
    kpis: AdminKpis;
    roleDistribution: Record<string, number>;
    recentTickets: SupportTicketItem[];
    recentNotifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      link?: string | null;
      isRead: boolean;
      createdAt: string;
    }>;
  };
  clubs: ClubItem[];
  tickets: SupportTicketItem[];
  elections: ElectionItem[];
  onOpenTicket: (ticket: SupportTicketItem) => void;
  onNavigateTab: (path: string) => void;
}

export const AdminQuickOverview: React.FC<AdminQuickOverviewProps> = ({
  overviewData,
  clubs,
  tickets,
  elections,
  onOpenTicket,
  onNavigateTab,
}) => {
  const { kpis, roleDistribution, recentTickets, recentNotifications } = overviewData;

  // ── Derived Analytics from Real Fetched Data ────────────────────────────────

  // 1. Ticket status percentages for Donut chart
  const totalTickets = kpis.totalTickets || 1;
  const openPct = Math.round((kpis.openTickets / totalTickets) * 100);
  const inProgressPct = Math.round((kpis.inProgressTickets / totalTickets) * 100);
  const resolvedPct = Math.max(0, 100 - openPct - inProgressPct);
  const resolutionRate = kpis.totalTickets > 0 ? Math.round((kpis.resolvedTickets / kpis.totalTickets) * 100) : 100;

  // Donut SVG circumference calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const openStroke = (openPct / 100) * circumference;
  const inProgressStroke = (inProgressPct / 100) * circumference;
  const resolvedStroke = (resolvedPct / 100) * circumference;

  // 2. Ticket priority breakdown from tickets in memory
  const priorityCounts = {
    URGENT: tickets.filter((t) => t.priority === 'URGENT').length,
    HIGH: tickets.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tickets.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tickets.filter((t) => t.priority === 'LOW').length,
  };

  // 3. Club category distribution from clubs array in memory
  const categoryMap = clubs.reduce((acc, club) => {
    const cat = club.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...Object.values(categoryMap), 1);

  // 4. Role distribution array
  const roleEntries = Object.entries(roleDistribution || {}).sort((a, b) => b[1] - a[1]);
  const totalRoleUsers = Object.values(roleDistribution || {}).reduce((a, b) => a + b, 0) || kpis.totalUsers || 1;

  // Category palette colors
  const categoryColors = [
    'bg-indigo-600',
    'bg-sky-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
  ];

  return (
    <div className="space-y-6">
      {/* ── 1. KPI SUMMARY METRIC CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Club Management */}
        <div
          onClick={() => onNavigateTab('/admin/clubs')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Club Management
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {kpis.totalClubs} Total
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              {kpis.totalClubs}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{kpis.activeClubs} Active</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
              <span>{kpis.inactiveClubs} Inactive</span>
            </div>
          </div>
        </div>

        {/* Card 2: Support Ticket Inquiries */}
        <div
          onClick={() => onNavigateTab('/admin/tickets')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Ticket className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ticket Support
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                {kpis.openTickets} Open
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              {kpis.totalTickets}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-indigo-600">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
              <span>{kpis.inProgressTickets} In Progress</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-emerald-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>{kpis.resolvedTickets} Resolved</span>
            </div>
          </div>
        </div>

        {/* Card 3: Annual Elections */}
        <div
          onClick={() => onNavigateTab('/admin/elections')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Vote className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Annual Elections
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {kpis.activeElections} Active
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              {kpis.totalElections}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-600">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              <span>{kpis.activeElections} In Voting</span>
            </div>
            <span className="text-slate-400 font-medium">
              {elections.reduce((sum, el) => sum + (el._count?.votes || 0), 0)} Ballots Cast
            </span>
          </div>
        </div>

        {/* Card 4: DB Query Assistant */}
        <div
          onClick={() => onNavigateTab('/admin/assistant')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100/80 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  DB Assistant
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                TiDB Cloud
              </span>
            </div>

            <div className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
              Natural Query
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
            <span className="text-purple-600 font-medium flex items-center gap-1">
              Ask DB in plain English
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* ── 2. VISUAL ANALYTICS CHARTS (DERIVED FROM FETCHED DATA) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart A: Support Tickets Status & Resolution Analytics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Support Ticket Breakdown</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {resolutionRate}% Resolved
              </span>
            </div>

            {/* Donut Chart Visualization */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  {/* Resolved Segment (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${resolvedStroke} ${circumference}`}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                  />
                  {/* In Progress Segment (Indigo) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray={`${inProgressStroke} ${circumference}`}
                    strokeDashoffset={-resolvedStroke}
                    strokeLinecap="round"
                  />
                  {/* Open Segment (Amber) */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    strokeDasharray={`${openStroke} ${circumference}`}
                    strokeDashoffset={-(resolvedStroke + inProgressStroke)}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {kpis.totalTickets}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">
                    Tickets
                  </span>
                </div>
              </div>
            </div>

            {/* Legend with Counts */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-1.5 rounded-xl bg-amber-50/60 border border-amber-100/60">
                <span className="text-[10px] font-bold text-amber-700 block">Open</span>
                <span className="text-sm font-black text-amber-900">{kpis.openTickets}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-indigo-50/60 border border-indigo-100/60">
                <span className="text-[10px] font-bold text-indigo-700 block">In Progress</span>
                <span className="text-sm font-black text-indigo-900">{kpis.inProgressTickets}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100/60">
                <span className="text-[10px] font-bold text-emerald-700 block">Resolved</span>
                <span className="text-sm font-black text-emerald-900">{kpis.resolvedTickets}</span>
              </div>
            </div>
          </div>

          {/* Priority Levels */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Urgency Levels
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Urgent / High</span>
                </span>
                <span className="font-bold text-slate-900">
                  {priorityCounts.URGENT + priorityCounts.HIGH}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Normal / Low</span>
                </span>
                <span className="font-bold text-slate-900">
                  {priorityCounts.MEDIUM + priorityCounts.LOW}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart B: Organization Categories Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Club Categorization</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {clubs.length} Clubs
              </span>
            </div>

            {/* Active vs Inactive ratio progress bar */}
            <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-700 font-bold">Charter Status</span>
                <span className="text-slate-500 font-semibold">
                  {kpis.activeClubs} Active / {kpis.inactiveClubs} Inactive
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(kpis.activeClubs / Math.max(kpis.totalClubs, 1)) * 100}%` }}
                />
                <div
                  className="bg-slate-300 h-full transition-all"
                  style={{ width: `${(kpis.inactiveClubs / Math.max(kpis.totalClubs, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Category breakdown bars */}
            <div className="space-y-2.5">
              {sortedCategories.slice(0, 5).map(([category, count], idx) => {
                const pct = Math.round((count / maxCategoryCount) * 100);
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{category}</span>
                      <span className="font-bold text-slate-900">{count} {count === 1 ? 'club' : 'clubs'}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`${color} h-full rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Platform Total</span>
            <button
              onClick={() => onNavigateTab('/admin/clubs')}
              className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Clubs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chart C: Platform Participant Role Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">User Role Composition</h3>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                {kpis.totalUsers} Registered
              </span>
            </div>

            {/* Stacked Composition Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-4">
              {roleEntries.map(([role, count], idx) => {
                const widthPct = (count / totalRoleUsers) * 100;
                const colors = ['bg-indigo-600', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-slate-400'];
                return (
                  <div
                    key={role}
                    style={{ width: `${widthPct}%` }}
                    className={`${colors[idx % colors.length]} h-full transition-all`}
                    title={`${role}: ${count}`}
                  />
                );
              })}
            </div>

            {/* Role List */}
            <div className="space-y-2">
              {roleEntries.slice(0, 5).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-slate-700 capitalize">
                      {role.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Security Verified</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RBAC Enforced</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. RECENT QUERIES & PLATFORM ACTIVITY BROADCASTS ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Recent Support Queries Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Support Queries</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {recentTickets.length}
                </span>
              </div>
              <button
                onClick={() => onNavigateTab('/admin/tickets')}
                className="text-xs text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View All Tickets</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentTickets.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentTickets.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onNavigateTab('/admin/tickets');
                      onOpenTicket(t);
                    }}
                    className="py-3 px-2 rounded-xl hover:bg-slate-50/80 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {t.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            t.status === 'OPEN'
                              ? 'bg-amber-100 text-amber-800'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.status}
                        </span>
                        {t.priority && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              t.priority === 'URGENT'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : t.priority === 'HIGH'
                                ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {t.priority}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {t.subject}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>By {t.createdBy?.fullName || 'Student'}</span>
                        {t.organization?.name && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">{t.organization.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No support queries logged in system.
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct ticket resolution & reply drawer supported</span>
            <button
              onClick={() => onNavigateTab('/admin/tickets')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Open Queue →
            </button>
          </div>
        </div>

        {/* Panel 2: Platform Activity Broadcasts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Platform Activity Broadcasts</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {recentNotifications.length}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Real-time Feed</span>
            </div>

            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((n: any) => {
                  const isElection = n.type?.includes('ELECTION') || n.title?.toLowerCase().includes('election');
                  const isMember = n.type?.includes('MEMBERSHIP') || n.title?.toLowerCase().includes('member');

                  return (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                          isElection
                            ? 'bg-blue-100 text-blue-700'
                            : isMember
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {isElection ? (
                          <Vote className="w-3.5 h-3.5" />
                        ) : isMember ? (
                          <UserCheck className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                          <span>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {n.link && (
                            <span className="text-indigo-600 font-semibold inline-flex items-center gap-0.5 hover:underline">
                              <span>Details</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No recent platform notifications recorded.
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated campus system updates</span>
            <span className="text-slate-400 font-medium">Broadcast Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
