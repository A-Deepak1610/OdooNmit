import React, { useState } from 'react';
import {
  AlertTriangle,
  QrCode,
  UserPlus,
  CheckCircle2,
  Award,
  Search,
} from 'lucide-react';
import { mockMembers } from '../../../data/mockClubData';

export const MembershipModule: React.FC = () => {
  const [members, setMembers] = useState(mockMembers);
  const [search, setSearch] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    rollNo: '',
    dept: 'Computer Science',
  });
  const [registeredNotice, setRegisteredNotice] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegisterNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    const newId = `SSA-2026-${String(members.length + 101).padStart(4, '0')}`;
    const addedMember = {
      id: `mem-${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      membershipId: newId,
      tier: 'STANDARD' as const,
      duesPaid: true,
      duesExpiresAt: 'May 31, 2027',
      renewalAlert: false,
      discountEligible: true,
    };

    setMembers([addedMember, ...members]);
    setShowRegisterForm(false);
    setRegisteredNotice(
      `Welcome ${newStudent.name}! Member profile created with ID ${newId}. Dues of ₹250 recorded as Paid.`
    );
    setNewStudent({ name: '', email: '', rollNo: '', dept: 'Computer Science' });
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Dev 2 Workstream
            </span>
            <span className="text-xs text-slate-400 font-medium">Problem Statement Scene:</span>
            <span className="text-xs font-semibold text-slate-700">"A new student joins & dues tracking"</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Membership Lifecycle & Dues Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant table sign-up, annual dues payment tracking (₹250/yr), renewal lapse reminders, and digital verification passes.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <UserPlus className="h-4 w-4" />
          <span>Table Sign-up (New Member)</span>
        </button>
      </div>

      {registeredNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{registeredNotice}</span>
          </div>
          <button
            onClick={() => setRegisteredNotice(null)}
            className="font-bold underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Renewal Expiry Warning Alert (Problem Statement Scene) */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-700" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">
              Upcoming Annual Dues Renewal Window (Spring 2026)
            </h4>
            <p className="text-amber-700 text-[11px] mt-0.5">
              18 student memberships are lapsing within 30 days. Automated renewal notifications dispatched to prevent loss of gala discounts.
            </p>
          </div>
        </div>
        <button className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs shrink-0 transition-colors">
          Send Batch Reminders
        </button>
      </div>

      {/* Inline Campus Table Sign-up Form */}
      {showRegisterForm && (
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Campus Table Registration (Sign-up Desk)
              </h3>
              <p className="text-xs text-slate-500">
                Register a newly joined student right at the orientation table and collect their ₹250 dues.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRegisterNewMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Student Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">College Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@bitsathy.ac.in"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Department</label>
              <select
                value={newStudent.dept}
                onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Tech">Information Tech</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Mechanical Eng">Mechanical Eng</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-xs"
              >
                Enroll & Mark ₹250 Paid
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main 2-Column: Digital ID Card Showcase & Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1-Col: Skyline Digital ID Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-700/50 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Skyline Member ID
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-800/60 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                ACTIVE • DUES PAID
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg font-bold text-white">
                DK
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Deepak Kumar</h4>
                <p className="text-xs text-emerald-200 font-mono">SSA-2026-0042</p>
                <p className="text-[11px] text-emerald-300/80">dept: Computer Science</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-200">Dues Valid Until:</span>
                <span className="font-bold text-white">May 31, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Annual Dues Fee:</span>
                <span className="font-bold text-emerald-300">₹250 (Paid)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Discounts Active:</span>
                <span className="font-bold text-emerald-300">Gala 60% • Merch 20%</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 text-center my-2 text-slate-900">
              <QrCode className="h-28 w-28 mx-auto text-slate-900" />
              <p className="text-[10px] text-slate-500 mt-1">
                Scan for instantaneous membership & discount validation
              </p>
            </div>
          </div>

          <div className="text-center pt-2 text-[11px] text-emerald-300">
            Skyline Student Association • Academic Term 2025-26
          </div>
        </div>

        {/* Right 2-Col: Member Directory & Verification Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Member Verification & Dues Ledger (248 Members)
              </h3>
              <p className="text-xs text-slate-500">
                Check member authenticity at events or verify fee status before issuing discounts.
              </p>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Membership ID</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Dues Status</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Discount Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{m.membershipId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{m.name}</p>
                      <p className="text-[11px] text-slate-400">{m.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {m.duesPaid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Paid (₹250)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Overdue / Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{m.duesExpiresAt}</span>
                        {m.renewalAlert && (
                          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                            Expiring
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {m.discountEligible ? (
                        <span className="text-[10px] text-emerald-600 font-semibold">Eligible (60% Off)</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Regular Rates</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                        View Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
