import React, { useState } from "react";
import {
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  QrCode,
  Search,
} from "lucide-react";
import { mockEvents, mockDoorTickets } from "../../../data/mockClubData";

export const EventsTicketingModule: React.FC = () => {
  const [tickets, setTickets] = useState(mockDoorTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "checkin" | "analytics"
  >("overview");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const springGala = mockEvents[0];

  const handleCheckIn = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              checkedIn: true,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : t,
      ),
    );
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.attendee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Module Title & Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Dev 1 Workstream
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Problem Statement Scene:
            </span>
            <span className="text-xs font-semibold text-slate-700">
              "Selling tickets for the spring gala"
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Events & Online Ticketing Platform
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Differential tier pricing (members vs non-members), live seat
            capacity, and instant door QR check-in without paper sheets.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Gala Overview & Tiers
          </button>
          <button
            onClick={() => setActiveTab("checkin")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "checkin"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Door Check-in Desk
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "analytics"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Post-Event Analytics
          </button>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => setBookingSuccess(null)}
            className="font-bold underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: GALA OVERVIEW & TIER PRICING */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Gala Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  FEATURED ANNUAL EVENT
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-2">
                  {springGala.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  The Skyline Student Association's flagship year-end gala
                  celebrating campus achievements, awards & musical
                  performances.
                </p>
              </div>
              <div className="text-right sm:border-l sm:pl-4 border-slate-100 shrink-0">
                <span className="text-[11px] text-slate-400 block">
                  Total Revenue
                </span>
                <span className="text-xl font-bold text-slate-900">
                  ₹{springGala.revenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Event Meta Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>{springGala.date}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>{springGala.time}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 col-span-2 sm:col-span-1">
                <Users className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>{springGala.location}</span>
              </div>
            </div>

            {/* Seat Capacity Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Seat Capacity Limit</span>
                <span className="text-indigo-600">
                  {springGala.soldCount} / {springGala.capacity} Seats Claimed
                  (84% Full)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                  style={{
                    width: `${(springGala.soldCount / springGala.capacity) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Only 80 tickets remaining before box office registration closes
                automatically.
              </p>
            </div>

            {/* Ticket Tier Pricing Comparison */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Differential Ticket Tiers (Member Discount Engine)
              </h4>
              <div className="space-y-2.5">
                {springGala.tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {tier.name}
                        </span>
                        {tier.available === 0 ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Sold Out
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {tier.available} left of {tier.total}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Includes catered dinner, entry pass & gala voting
                        rights.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                            Member Price
                          </span>
                          <span className="text-sm font-bold text-emerald-700">
                            ₹{tier.memberPrice}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end text-[11px] text-slate-400 mt-0.5">
                          <span>Non-Member:</span>
                          <span className="line-through">
                            ₹{tier.nonMemberPrice}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setBookingSuccess(
                            `Success! Ticket booked for ${tier.name} at member rate ₹${tier.memberPrice}. Check-in QR pass generated.`,
                          )
                        }
                        disabled={tier.available === 0}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          tier.available === 0
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                        }`}
                      >
                        Book Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Card: Digital Ticket Preview */}
          <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-700/50 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-indigo-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Skyline Digital Pass
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/50 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  VERIFIED MEMBER
                </span>
              </div>

              <div>
                <p className="text-xs text-indigo-300">Event</p>
                <h4 className="text-base font-bold text-white">
                  Spring Gala 2026
                </h4>
                <p className="text-xs text-indigo-200 mt-1">
                  Main Campus Grand Auditorium
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-indigo-700/50">
                <div>
                  <span className="text-[10px] text-indigo-300 block">
                    Attendee
                  </span>
                  <span className="font-semibold">Deepak Kumar</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-300 block">
                    Pass Type
                  </span>
                  <span className="font-semibold text-emerald-300">
                    Club Member Pass
                  </span>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="bg-white rounded-xl p-4 text-center my-3 text-slate-900 shadow-inner">
                <QrCode className="h-32 w-32 mx-auto text-slate-900" />
                <p className="text-[11px] font-mono font-bold tracking-widest text-slate-600 mt-2">
                  SSA-GALA-2026-9812
                </p>
                <p className="text-[10px] text-slate-400">
                  Scan at entrance for instantaneous door validation
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-[11px] text-indigo-300">
                Non-transferable • Skyline Student Association
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOOR CHECK-IN DESK */}
      {activeTab === "checkin" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-600" />
                Entrance Check-in Desk (Zero Paper Lists)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Door volunteers can search attendee name or scan pass QR code to
                admit guests in seconds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search name or Ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Attendee Name</th>
                  <th className="py-3 px-4">Tier Type</th>
                  <th className="py-3 px-4">Member Status</th>
                  <th className="py-3 px-4">Check-in Status</th>
                  <th className="py-3 px-4 text-right">Door Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {t.attendee}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{t.tier}</td>
                    <td className="py-3.5 px-4">
                      {t.isMember ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active Member
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          Non-Member
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {t.checkedIn ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Admitted at {t.time}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                          <Clock className="h-4 w-4" />
                          <span>Not Arrived</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {t.checkedIn ? (
                        <span className="text-slate-400 font-semibold text-[11px]">
                          Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          Scan / Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POST-EVENT ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">
              Actual Turnout
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              385 / 420 (91.6%)
            </p>
            <p className="text-[11px] text-emerald-600 mt-1">
              +14% higher attendance vs last semester
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">
              Total Ticket Revenue
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-1">₹58,500</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Avg ₹139.2 per registered attendee
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-medium text-slate-500">
              Estimated Net Profit
            </span>
            <p className="text-2xl font-bold text-indigo-600 mt-1">₹26,500</p>
            <p className="text-[11px] text-indigo-500 mt-1">
              After deducting venue & sound expenses
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
