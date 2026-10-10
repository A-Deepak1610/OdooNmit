import React from 'react';
import { useAuthStore } from '../../stores/auth.store';
import { ROLE_DISPLAY_NAMES, UserRole } from '../../config/roles';
import {
  Calendar,
  Users,
  Trophy,
  IndianRupee,
  Plus,
  Ticket,
  Compass,
  FileText,
  UserCheck,
  CheckSquare,
  Receipt,
  Vote,
  PieChart,
  Building2,
  Sparkles,
} from 'lucide-react';

interface RoleDashboardProps {
  role: UserRole;
}

interface StatConfig {
  label: string;
  value: string;
  sub: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  icon: React.ElementType;
}

interface ActionConfig {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';
}

const ROLE_CONFIGS: Record<
  string,
  {
    title: string;
    actionLabel: string;
    stats: StatConfig[];
    actions: ActionConfig[];
  }
> = {
  STUDENT: {
    title: 'Student Dashboard',
    actionLabel: 'Explore Events',
    stats: [
      { label: 'Registered Events', value: '4', sub: '2 upcoming this week', color: 'blue', icon: Calendar },
      { label: 'Club Memberships', value: '2', sub: 'Approved campus clubs', color: 'emerald', icon: Users },
      { label: 'Event Tickets', value: '3', sub: 'Ready for scanning', color: 'amber', icon: Ticket },
      { label: 'Applications', value: '1', sub: 'Under faculty review', color: 'purple', icon: FileText },
    ],
    actions: [
      { title: 'Explore Events', desc: 'Browse campus hackathons & workshops', icon: Compass, color: 'blue' },
      { title: 'Apply for Club', desc: 'Join student technical & cultural clubs', icon: UserCheck, color: 'emerald' },
      { title: 'My Tickets', desc: 'Access your entry QR passes', icon: Ticket, color: 'amber' },
      { title: 'Campus Announcements', desc: 'Stay updated with college notices', icon: Sparkles, color: 'purple' },
    ],
  },
  MEMBER: {
    title: 'Club Member Dashboard',
    actionLabel: 'View Schedule',
    stats: [
      { label: 'Club Events', value: '7', sub: '5 active initiatives', color: 'blue', icon: Calendar },
      { label: 'My Tickets', value: '2', sub: 'VIP member access', color: 'emerald', icon: Ticket },
      { label: 'Active Teams', value: '3', sub: 'Competitive project teams', color: 'amber', icon: Users },
      { label: 'Club Points', value: '420', sub: '+50 points this month', color: 'purple', icon: Trophy },
    ],
    actions: [
      { title: 'Club Calendar', desc: 'Upcoming workshops & meetings', icon: Calendar, color: 'blue' },
      { title: 'Exclusive Passes', desc: 'Claim priority member tickets', icon: Ticket, color: 'emerald' },
      { title: 'Club Merchandise', desc: 'Order official club apparel', icon: Trophy, color: 'amber' },
      { title: 'Member Forum', desc: 'Collaborate with fellow club members', icon: Users, color: 'purple' },
    ],
  },
  VOLUNTEER: {
    title: 'Volunteer Dashboard',
    actionLabel: 'View Duties',
    stats: [
      { label: 'Assigned Tasks', value: '6', sub: '2 due today', color: 'blue', icon: CheckSquare },
      { label: 'Active Duty Events', value: '2', sub: 'Campus coordination', color: 'emerald', icon: Calendar },
      { label: 'Hours Logged', value: '28h', sub: 'Verified by officers', color: 'amber', icon: Sparkles },
      { label: 'Expense Claims', value: '₹1,450', sub: '1 claim pending', color: 'purple', icon: Receipt },
    ],
    actions: [
      { title: 'My Tasks', desc: 'Track and complete on-ground duties', icon: CheckSquare, color: 'blue' },
      { title: 'Submit Expense', desc: 'File reimbursements for event items', icon: Receipt, color: 'emerald' },
      { title: 'Event Roster', desc: 'View shift timings and duty stations', icon: Calendar, color: 'amber' },
      { title: 'Coordination Chat', desc: 'Connect with team leaders', icon: Users, color: 'purple' },
    ],
  },
  EVENT_ORGANIZER: {
    title: 'Organizer Dashboard',
    actionLabel: 'Create Event',
    stats: [
      { label: 'Managed Events', value: '3', sub: '1 live today', color: 'blue', icon: Calendar },
      { label: 'Total Registrations', value: '640', sub: '+85 today', color: 'emerald', icon: Users },
      { label: 'Checked-in Attendees', value: '412', sub: '64% check-in rate', color: 'amber', icon: Ticket },
      { label: 'Pending Tasks', value: '5', sub: 'Venue setup & logistics', color: 'purple', icon: CheckSquare },
    ],
    actions: [
      { title: 'Create Event', desc: 'Set up registration, tracks & schedule', icon: Plus, color: 'blue' },
      { title: 'Manage Attendees', desc: 'Export participant lists and teams', icon: Users, color: 'emerald' },
      { title: 'Check-in Desk', desc: 'Scan QR tickets at event entrance', icon: Ticket, color: 'amber' },
      { title: 'Logistics Tasks', desc: 'Assign work to student volunteers', icon: CheckSquare, color: 'purple' },
    ],
  },
  TREASURER: {
    title: 'Treasurer Dashboard',
    actionLabel: 'New Transaction',
    stats: [
      { label: 'Total Allocated', value: '₹250,000', sub: 'Annual college grant', color: 'blue', icon: IndianRupee },
      { label: 'Disbursed Funds', value: '₹118,500', sub: 'Across 6 events', color: 'emerald', icon: IndianRupee },
      { label: 'Pending Claims', value: '4', sub: '₹8,200 awaiting review', color: 'amber', icon: Receipt },
      { label: 'Available Balance', value: '₹131,500', sub: '52.6% remaining', color: 'purple', icon: PieChart },
    ],
    actions: [
      { title: 'Record Transaction', desc: 'Log verified vendor expenditure', icon: IndianRupee, color: 'blue' },
      { title: 'Review Claims', desc: 'Approve volunteer & team reimbursements', icon: Receipt, color: 'emerald' },
      { title: 'Financial Reports', desc: 'Download audited balance statements', icon: PieChart, color: 'amber' },
      { title: 'Budget Allocation', desc: 'Assign funds to upcoming events', icon: Users, color: 'purple' },
    ],
  },
  PRESIDENT: {
    title: 'President Dashboard',
    actionLabel: 'Executive Summary',
    stats: [
      { label: 'Club Members', value: '320', sub: 'Across 4 student chapters', color: 'blue', icon: Users },
      { label: 'Annual Initiatives', value: '14', sub: '9 completed successfully', color: 'emerald', icon: Trophy },
      { label: 'Active Committees', value: '5', sub: 'All leads reporting', color: 'amber', icon: Users },
      { label: 'Budget Utilization', value: '74%', sub: 'Healthy balance sheet', color: 'purple', icon: IndianRupee },
    ],
    actions: [
      { title: 'Executive Overview', desc: 'Review club metrics and health', icon: PieChart, color: 'blue' },
      { title: 'Member Governance', desc: 'Approve officers and leadership leads', icon: Users, color: 'emerald' },
      { title: 'Club Elections', desc: 'Oversee democratic balloting', icon: Vote, color: 'amber' },
      { title: 'Presidential Notices', desc: 'Broadcast to entire campus community', icon: Sparkles, color: 'purple' },
    ],
  },
};

export const RoleDashboardPage: React.FC<RoleDashboardProps> = ({ role }) => {
  const { user, collegeName } = useAuthStore();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-100/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-100/60',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100/60',
    rose: 'bg-rose-50 text-rose-500 border-rose-100/60',
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header matching UI reference */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {config.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your {ROLE_DISPLAY_NAMES[role] || role} workspace overview.
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
            <span>{config.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {config.stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs flex items-center gap-4"
            >
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${colorStyles[stat.color]}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.actions.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs hover:border-slate-300 transition-colors flex items-center gap-3.5 cursor-pointer group"
              >
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border ${colorStyles[act.color]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{act.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{act.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
