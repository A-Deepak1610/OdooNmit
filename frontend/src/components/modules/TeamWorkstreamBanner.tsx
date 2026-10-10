import React from "react";
import {
  Calendar,
  Users,
  ShoppingBag,
  Landmark,
  Sparkles,
  Layers,
} from "lucide-react";

export type WorkstreamId =
  | "all"
  | "events"
  | "memberships"
  | "merch_tasks"
  | "finance_announcements";

interface TeamWorkstreamBannerProps {
  activeStream: WorkstreamId;
  onSelectStream: (stream: WorkstreamId) => void;
}

export const TeamWorkstreamBanner: React.FC<TeamWorkstreamBannerProps> = ({
  activeStream,
  onSelectStream,
}) => {
  const streams = [
    {
      id: "all" as WorkstreamId,
      label: "All Streams (Role Overview)",
      sub: "Synthesized role dashboard",
      icon: Layers,
      color: "bg-slate-900 text-white",
    },
    {
      id: "events" as WorkstreamId,
      label: "Dev 1: Events & Gala Tickets",
      sub: "Spring Gala, Member vs Non-member, Door QR",
      icon: Calendar,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "memberships" as WorkstreamId,
      label: "Dev 2: Memberships & Dues",
      sub: "Sign-ups, Digital ID, Dues status, Expiry alert",
      icon: Users,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "merch_tasks" as WorkstreamId,
      label: "Dev 3: Merch & Fundraiser Tasks",
      sub: "Hoodie sizes/stock, Bake sale task board",
      icon: ShoppingBag,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "finance_announcements" as WorkstreamId,
      label: "Dev 4: Treasury & Announcements",
      sub: "Closing the books, Reimbursements, Notice board",
      icon: Landmark,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Skyline Student Association — 4-Member Engineering Team Setup
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Multi-Tenant Architecture
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Work parallelized across 4 developers. Click any developer
              workstream tab to inspect its dedicated screens & static
              functionality:
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
        {streams.map((s) => {
          const Icon = s.icon;
          const isActive = activeStream === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectStream(s.id)}
              className={`text-left p-3 rounded-xl border transition-all text-xs ${
                isActive
                  ? "bg-white text-slate-900 border-white shadow-md scale-[1.02] font-semibold"
                  : "bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span className="font-bold truncate">{s.label}</span>
              </div>
              <p
                className={`text-[11px] leading-tight line-clamp-1 ${isActive ? "text-slate-600" : "text-slate-400"}`}
              >
                {s.sub}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
