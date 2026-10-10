import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth.store';
import {
  Calendar,
  Users,
  Trophy,
  IndianRupee,
  Plus,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { activeClub } from '../../data/mockClubData';
import { TeamWorkstreamBanner, WorkstreamId } from '../../components/modules/TeamWorkstreamBanner';
import { EventsTicketingModule } from '../../components/modules/events/EventsTicketingModule';
import { MembershipModule } from '../../components/modules/memberships/MembershipModule';
import { MerchandiseTaskModule } from '../../components/modules/merchandise/MerchandiseTaskModule';
import { FinanceLedgerModule } from '../../components/modules/finance/FinanceLedgerModule';
import { AnnouncementBoardModule } from '../../components/modules/announcements/AnnouncementBoardModule';

export const AdminDashboardPage: React.FC = () => {
  const { user, collegeName } = useAuthStore();
  const [activeStream, setActiveStream] = useState<WorkstreamId>('all');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 4-Developer Workstream Banner */}
      <TeamWorkstreamBanner
        activeStream={activeStream}
        onSelectStream={(s) => setActiveStream(s)}
      />

      {/* Module Inspector or Admin Overview */}
      {activeStream === 'events' ? (
        <EventsTicketingModule />
      ) : activeStream === 'memberships' ? (
        <MembershipModule />
      ) : activeStream === 'merch_tasks' ? (
        <MerchandiseTaskModule />
      ) : activeStream === 'finance_announcements' ? (
        <div className="space-y-8">
          <FinanceLedgerModule />
          <AnnouncementBoardModule />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Campus Admin Console
                </span>
                <span className="text-xs text-slate-500 font-medium">Multi-Tenant Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Welcome back{user?.name ? `, ${user.name}` : ''}! Managing club organizations, events, and campus finances.
              </p>
            </div>

            {/* Right Header Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">{collegeName}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  A++
                </span>
              </div>

              <button
                type="button"
                className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Club Tenant</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Events</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">10</p>
                <p className="text-[11px] text-slate-400 mt-0.5">9 active this semester</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Club Members</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">1,013</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">↗+16% across 6 clubs</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Active Clubs</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">6</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Skyline SA, Coding, Roboclub</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Fund Inflow</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">₹367,500</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Dues & Gala tickets</p>
              </div>
            </div>
          </div>

          {/* Multi-Tenant Club Management Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                  Campus Club Tenants (Multi-Tenant Architecture)
                </h3>
                <p className="text-xs text-slate-500">
                  Each student club operates as an isolated tenant with dedicated membership dues, role hierarchies, and treasury books.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Club Organization</th>
                    <th className="py-3 px-4">Tenant Slug</th>
                    <th className="py-3 px-4">Annual Dues</th>
                    <th className="py-3 px-4">Active Members</th>
                    <th className="py-3 px-4">Treasury Balance</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                          SSA
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{activeClub.name}</p>
                          <p className="text-[11px] text-slate-400">Primary Student Association</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{activeClub.slug}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹{activeClub.duesAmount}/yr</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {activeClub.memberCount} Members
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">₹{activeClub.activeBudget.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveStream('finance_announcements')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Audit Ledger →
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                          DSC
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Developer Student Club</p>
                          <p className="text-[11px] text-slate-400">Technical Hackathon Chapter</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">dsc-chapter</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">₹300/yr</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        185 Members
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">₹64,200</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Workstream Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventsTicketingModule />
            <FinanceLedgerModule />
          </div>
        </div>
      )}
    </div>
  );
};
