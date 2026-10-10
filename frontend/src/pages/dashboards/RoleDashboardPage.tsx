import React, { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { ROLE_DISPLAY_NAMES, UserRole } from "../../config/roles";
import {
  Calendar,
  Users,
  Trophy,
  IndianRupee,
  Plus,
  Ticket,
  FileText,
  UserCheck,
  CheckSquare,
  Receipt,
  PieChart,
  Building2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import {
  TeamWorkstreamBanner,
  WorkstreamId,
} from "../../components/modules/TeamWorkstreamBanner";
import { EventsTicketingModule } from "../../components/modules/events/EventsTicketingModule";
import { MembershipModule } from "../../components/modules/memberships/MembershipModule";
import { MerchandiseTaskModule } from "../../components/modules/merchandise/MerchandiseTaskModule";
import { FinanceLedgerModule } from "../../components/modules/finance/FinanceLedgerModule";
import { AnnouncementBoardModule } from "../../components/modules/announcements/AnnouncementBoardModule";

interface RoleDashboardProps {
  role: UserRole;
}

interface StatConfig {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "emerald" | "amber" | "purple";
  icon: React.ElementType;
}

interface ActionConfig {
  title: string;
  desc: string;
  icon: React.ElementType;
  color: "blue" | "emerald" | "amber" | "purple" | "cyan" | "rose";
  targetStream?: WorkstreamId;
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
    title: "Student Dashboard",
    actionLabel: "Join Skyline Club",
    stats: [
      {
        label: "Spring Gala Pass",
        value: "₹100 (Member)",
        sub: "₹250 Non-Member rate",
        color: "blue",
        icon: Ticket,
      },
      {
        label: "Club Membership",
        value: "Sign-up Open",
        sub: "₹250/yr with perks",
        color: "emerald",
        icon: Users,
      },
      {
        label: "Official Merch",
        value: "4 Sizes",
        sub: "Embroidered hoodies in stock",
        color: "amber",
        icon: ShoppingBag,
      },
      {
        label: "Campus Notices",
        value: "3 Active",
        sub: "Auditorium Gala updates",
        color: "purple",
        icon: Sparkles,
      },
    ],
    actions: [
      {
        title: "Spring Gala Tickets",
        desc: "Differential member discounts & QR pass",
        icon: Ticket,
        color: "blue",
        targetStream: "events",
      },
      {
        title: "Join Skyline Association",
        desc: "Campus table sign-up & digital ID card",
        icon: UserCheck,
        color: "emerald",
        targetStream: "memberships",
      },
      {
        title: "Club Hoodie Store",
        desc: "Order apparel online with size tracking",
        icon: ShoppingBag,
        color: "amber",
        targetStream: "merch_tasks",
      },
      {
        title: "Notice Board",
        desc: "Official updates replacing WhatsApp groups",
        icon: Sparkles,
        color: "purple",
        targetStream: "finance_announcements",
      },
    ],
  },
  MEMBER: {
    title: "Club Member Workspace",
    actionLabel: "View Member ID",
    stats: [
      {
        label: "Membership Status",
        value: "Active",
        sub: "ID: SSA-2026-0042 (Paid)",
        color: "emerald",
        icon: Users,
      },
      {
        label: "Gala Discount",
        value: "60% Off",
        sub: "₹100 member tier claimed",
        color: "blue",
        icon: Ticket,
      },
      {
        label: "Hoodie Discount",
        value: "20% Off",
        sub: "₹700 member pricing active",
        color: "amber",
        icon: ShoppingBag,
      },
      {
        label: "Annual Dues",
        value: "Valid",
        sub: "Expires May 31, 2026",
        color: "purple",
        icon: Trophy,
      },
    ],
    actions: [
      {
        title: "Digital Membership ID",
        desc: "View QR pass & dues validity",
        icon: Users,
        color: "emerald",
        targetStream: "memberships",
      },
      {
        title: "Spring Gala VIP Pass",
        desc: "Book priority seats at member rate",
        icon: Ticket,
        color: "blue",
        targetStream: "events",
      },
      {
        title: "Club Merch Store",
        desc: "Reserve hoodie size before stock runs out",
        icon: ShoppingBag,
        color: "amber",
        targetStream: "merch_tasks",
      },
      {
        title: "Member Announcements",
        desc: "General body meeting notices",
        icon: Sparkles,
        color: "purple",
        targetStream: "finance_announcements",
      },
    ],
  },
  VOLUNTEER: {
    title: "Volunteer Operations Desk",
    actionLabel: "Log Shift Duty",
    stats: [
      {
        label: "Fundraiser Tasks",
        value: "5 Tasks",
        sub: "Baking & cashier shifts",
        color: "blue",
        icon: CheckSquare,
      },
      {
        label: "Shift Roster",
        value: "May 2",
        sub: "10 AM - 12 PM Quad Table",
        color: "emerald",
        icon: Calendar,
      },
      {
        label: "Expense Claims",
        value: "₹1,450",
        sub: "Ingredients claim submitted",
        color: "amber",
        icon: Receipt,
      },
      {
        label: "Hours Contributed",
        value: "18h",
        sub: "Verified by Skyline officers",
        color: "purple",
        icon: Trophy,
      },
    ],
    actions: [
      {
        title: "Bake Sale Tasks",
        desc: "Who is baking, buying & staffing tables",
        icon: CheckSquare,
        color: "blue",
        targetStream: "merch_tasks",
      },
      {
        title: "Submit Expense Claim",
        desc: "Upload ingredient receipts for reimbursement",
        icon: Receipt,
        color: "emerald",
        targetStream: "finance_announcements",
      },
      {
        title: "Door QR Check-in",
        desc: "Scan guest tickets at Gala entrance",
        icon: Ticket,
        color: "amber",
        targetStream: "events",
      },
      {
        title: "Volunteer Notices",
        desc: "Meeting briefings and prep instructions",
        icon: Sparkles,
        color: "purple",
        targetStream: "finance_announcements",
      },
    ],
  },
  EVENT_ORGANIZER: {
    title: "Event Organizer Console",
    actionLabel: "Manage Spring Gala",
    stats: [
      {
        label: "Gala Capacity",
        value: "420 / 500",
        sub: "84% seats sold online",
        color: "blue",
        icon: Ticket,
      },
      {
        label: "Ticket Revenue",
        value: "₹58,500",
        sub: "Direct online collections",
        color: "emerald",
        icon: IndianRupee,
      },
      {
        label: "Turnout Rate",
        value: "91.6%",
        sub: "385 checked in at the door",
        color: "amber",
        icon: Users,
      },
      {
        label: "Logistics Tasks",
        value: "5 Active",
        sub: "Fundraiser & gala prep",
        color: "purple",
        icon: CheckSquare,
      },
    ],
    actions: [
      {
        title: "Door Check-in Desk",
        desc: "Scan passes in seconds without paper sheets",
        icon: Ticket,
        color: "blue",
        targetStream: "events",
      },
      {
        title: "Ticket Tiers & Quotas",
        desc: "Adjust member pricing & seat availability",
        icon: Calendar,
        color: "emerald",
        targetStream: "events",
      },
      {
        title: "Fundraiser Task Board",
        desc: "Assign setup & table staffing to volunteers",
        icon: CheckSquare,
        color: "amber",
        targetStream: "merch_tasks",
      },
      {
        title: "Post-Event Turnout",
        desc: "Analyze attendance & financial balance",
        icon: PieChart,
        color: "purple",
        targetStream: "finance_announcements",
      },
    ],
  },
  TREASURER: {
    title: "Treasurer Ledger & Books",
    actionLabel: "Close The Books",
    stats: [
      {
        label: "Net Closing Balance",
        value: "₹101,300",
        sub: "Balanced semester ledger",
        color: "emerald",
        icon: IndianRupee,
      },
      {
        label: "Semester Inflow",
        value: "₹155,300",
        sub: "Dues + Gala tickets + Merch",
        color: "blue",
        icon: IndianRupee,
      },
      {
        label: "Semester Outflow",
        value: "₹99,000",
        sub: "Venue, catering & production",
        color: "amber",
        icon: Receipt,
      },
      {
        label: "Pending Claims",
        value: "1 Claim",
        sub: "₹850 awaiting receipt review",
        color: "purple",
        icon: FileText,
      },
    ],
    actions: [
      {
        title: "Closing The Books",
        desc: "Complete audited semester income & expense balance",
        icon: PieChart,
        color: "blue",
        targetStream: "finance_announcements",
      },
      {
        title: "Volunteer Reimbursements",
        desc: "Audit digital receipts & disburse funds",
        icon: Receipt,
        color: "emerald",
        targetStream: "finance_announcements",
      },
      {
        title: "Membership Dues Ledger",
        desc: "Verify 194 paid student membership dues",
        icon: Users,
        color: "amber",
        targetStream: "memberships",
      },
      {
        title: "Gala & Merch Revenue",
        desc: "Track ticket and hoodie collections",
        icon: IndianRupee,
        color: "purple",
        targetStream: "events",
      },
    ],
  },
  PRESIDENT: {
    title: "President Executive Suite",
    actionLabel: "Broadcast Notice",
    stats: [
      {
        label: "Total Membership",
        value: "248 Members",
        sub: "Skyline Student Association",
        color: "blue",
        icon: Users,
      },
      {
        label: "Spring Gala Target",
        value: "84% Booked",
        sub: "₹58,500 ticket revenue",
        color: "emerald",
        icon: Ticket,
      },
      {
        label: "Treasury Balance",
        value: "₹101,300",
        sub: "Healthy semester surplus",
        color: "purple",
        icon: IndianRupee,
      },
      {
        label: "Fundraiser Status",
        value: "On Track",
        sub: "Charity bake sale May 2",
        color: "amber",
        icon: Trophy,
      },
    ],
    actions: [
      {
        title: "Executive Overview",
        desc: "Unified view across all 4 club modules",
        icon: PieChart,
        color: "blue",
        targetStream: "all",
      },
      {
        title: "Official Broadcast",
        desc: "Post announcements replacing WhatsApp chats",
        icon: Sparkles,
        color: "purple",
        targetStream: "finance_announcements",
      },
      {
        title: "Membership Governance",
        desc: "Track renewals, dues & new joiners",
        icon: Users,
        color: "emerald",
        targetStream: "memberships",
      },
      {
        title: "Semester Financials",
        desc: "Review closing ledger & approved expenses",
        icon: IndianRupee,
        color: "amber",
        targetStream: "finance_announcements",
      },
    ],
  },
};

export const RoleDashboardPage: React.FC<RoleDashboardProps> = ({ role }) => {
  const { user, collegeName } = useAuthStore();
  const [activeStream, setActiveStream] = useState<WorkstreamId>("all");
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.STUDENT;

  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100/60",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100/60",
    amber: "bg-amber-50 text-amber-600 border-amber-100/60",
    purple: "bg-purple-50 text-purple-600 border-purple-100/60",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100/60",
    rose: "bg-rose-50 text-rose-500 border-rose-100/60",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 4-Developer Workstream Team Banner */}
      <TeamWorkstreamBanner
        activeStream={activeStream}
        onSelectStream={(s) => setActiveStream(s)}
      />

      {/* Main Content Area: Renders either the specific Workstream Module or the Role Synthesized Dashboard */}
      {activeStream === "events" ? (
        <EventsTicketingModule />
      ) : activeStream === "memberships" ? (
        <MembershipModule />
      ) : activeStream === "merch_tasks" ? (
        <MerchandiseTaskModule />
      ) : activeStream === "finance_announcements" ? (
        <div className="space-y-8">
          <FinanceLedgerModule />
          <AnnouncementBoardModule />
        </div>
      ) : (
        /* SYNTHESIZED DASHBOARD FOR ACTIVE ROLE */
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Role Workspace: {ROLE_DISPLAY_NAMES[role] || role}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Skyline Student Association
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Welcome back{user?.name ? `, ${user.name}` : ""}! Running
                events, members, and money in one place.
              </p>
            </div>

            {/* Right Header Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                  {collegeName}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  A++
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (role === "EVENT_ORGANIZER") setActiveStream("events");
                  else if (role === "TREASURER")
                    setActiveStream("finance_announcements");
                  else if (role === "VOLUNTEER") setActiveStream("merch_tasks");
                  else setActiveStream("memberships");
                }}
                className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
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
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border ${colorStyles[stat.color]}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions to jump to streams */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">
              Operational Feature Modules
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {config.actions.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div
                    key={idx}
                    onClick={() =>
                      act.targetStream && setActiveStream(act.targetStream)
                    }
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-400 transition-all flex items-center gap-3.5 cursor-pointer group"
                  >
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border ${colorStyles[act.color]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {act.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role-Specific Showcase Section */}
          {role === "STUDENT" && (
            <div className="space-y-8">
              <EventsTicketingModule />
              <MembershipModule />
            </div>
          )}

          {role === "MEMBER" && (
            <div className="space-y-8">
              <MembershipModule />
              <MerchandiseTaskModule />
            </div>
          )}

          {role === "VOLUNTEER" && (
            <div className="space-y-8">
              <MerchandiseTaskModule />
              <EventsTicketingModule />
            </div>
          )}

          {role === "EVENT_ORGANIZER" && (
            <div className="space-y-8">
              <EventsTicketingModule />
              <MerchandiseTaskModule />
            </div>
          )}

          {role === "TREASURER" && (
            <div className="space-y-8">
              <FinanceLedgerModule />
              <MembershipModule />
            </div>
          )}

          {role === "PRESIDENT" && (
            <div className="space-y-8">
              <FinanceLedgerModule />
              <AnnouncementBoardModule />
              <EventsTicketingModule />
              <MembershipModule />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
