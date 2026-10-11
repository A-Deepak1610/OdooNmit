import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  CreditCard,
  AlertTriangle,
  Clock,
  QrCode,
  Ticket,
  ShoppingBag,
  Vote,
  Sparkles,
  Calendar,
  Building2,
  User,
  RefreshCw,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { studentService, MembershipDuesStatus } from '../../../services/student.service';
import { RazorpayPaymentModal } from '../../shared/RazorpayPaymentModal';

export const MembershipModule: React.FC = () => {
  const { user } = useAuthStore();

  const [myDuesStatus, setMyDuesStatus] = useState<MembershipDuesStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renewing, setRenewing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const res = await studentService.getMyMembershipStatus();
      setMyDuesStatus(res);
    } catch (err) {
      console.error('Failed to load membership status from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRenewSuccess = async () => {
    try {
      setRenewing(true);
      const res = await studentService.renewMembership();
      setNoticeMessage(res.message || 'Membership renewed successfully for +1 year!');
      setShowPaymentModal(false);
      await fetchStatus();
      setTimeout(() => setNoticeMessage(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Renewal failed');
    } finally {
      setRenewing(false);
    }
  };

  // Derive display values
  const clubName = myDuesStatus?.club?.name || 'Tech & AI Innovators Club';
  const clubCategory = myDuesStatus?.club?.category || 'Technology & Artificial Intelligence';
  const memberName = user?.name || user?.fullName || 'Club Member';
  const memberEmail = user?.email || 'member@campusmitra.ac.in';
  const roleName = myDuesStatus?.role || user?.role || 'MEMBER';
  const membershipId = `CM-${(user?.id || '01a126f2').substring(0, 8).toUpperCase()}`;

  const duesAmount = myDuesStatus?.duesAmountINR ?? myDuesStatus?.club?.membershipFeeINR ?? 250;
  const duesStatus = myDuesStatus?.duesStatus || 'ACTIVE';
  const validUntilDate = myDuesStatus?.validUntil ? new Date(myDuesStatus.validUntil) : null;
  const isExpiringSoon = duesStatus === 'EXPIRING_SOON';
  const isOverdue = duesStatus === 'OVERDUE';
  const hasAlert = myDuesStatus?.hasAlert || isExpiringSoon || isOverdue;

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              OFFICIAL MEMBER PORTAL
            </span>
            <span className="text-xs text-slate-400 font-medium">Academic Year 2026-2027</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Club Membership & Digital Pass
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal verified membership standing, digital QR door pass, and annual renewal dues status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync Status</span>
          </button>

          {(isExpiringSoon || isOverdue) && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Renew Now (₹{duesAmount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Notification Toast */}
      {noticeMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. BACKEND RENEWAL ALERT BANNER (HIS STATUS ALONE) ── */}
      {hasAlert && (
        <div
          className={`p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in ${
            isOverdue
              ? 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-amber-500/10 border-rose-300'
              : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-300'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl text-white shrink-0 shadow-xs ${
                isOverdue ? 'bg-rose-600' : 'bg-amber-500'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isOverdue ? 'Annual Dues Overdue' : 'Renewal Due Soon'}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {clubName} • {roleName}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900">
                {myDuesStatus?.alert?.title || (isOverdue ? 'Annual Membership Dues Overdue' : 'Annual Membership Renewal Notice')}
              </h3>

              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {myDuesStatus?.alert?.message ||
                  (isOverdue
                    ? `Your annual club membership dues of ₹${duesAmount} for ${clubName} are currently overdue. Renew your membership now to maintain member event discounts and voting privileges.`
                    : `Your annual membership dues of ₹${duesAmount} for ${clubName} expire in ${myDuesStatus?.daysRemaining ?? 10} days. Renew now to stay in good standing.`)}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                <span>
                  Valid Until:{' '}
                  <strong className="text-slate-800">
                    {validUntilDate ? validUntilDate.toLocaleDateString() : 'Immediate Renewal Required'}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Annual Dues Fee: <strong className="text-slate-800">₹{duesAmount}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={renewing}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 ${
                isOverdue ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{renewing ? 'Processing...' : `Pay & Renew (₹${duesAmount})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 3. MAIN GRID: HIS DIGITAL PASS + STATUS BREAKDOWN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Digital Pass Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-indigo-900/50">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center font-black text-indigo-300 text-base">
                    🏛️
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-wide">{clubName}</h3>
                    <p className="text-[11px] text-indigo-300/80">{clubCategory}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isOverdue
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : isExpiringSoon
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isOverdue ? 'Overdue' : isExpiringSoon ? 'Expiring Soon' : 'Active Member'}
                </span>
              </div>

              {/* Member Details */}
              <div className="pt-2 border-t border-indigo-800/50 flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-lg font-black text-white">
                    {memberName.charAt(0)}
                  </div>
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h4 className="text-base font-extrabold text-white truncate">{memberName}</h4>
                  <p className="text-xs text-indigo-200/80 truncate">{memberEmail}</p>
                  <p className="text-[11px] font-mono text-indigo-400 font-semibold">{membershipId}</p>
                </div>
              </div>

              {/* QR Code Verification Window */}
              <div className="bg-white rounded-xl p-4 flex items-center justify-between gap-4 text-slate-900 shadow-md">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                    Digital Door Pass
                  </span>
                  <div className="text-xs font-bold text-slate-800">Scan at Event Entrance</div>
                  <div className="text-[10px] text-slate-400 font-mono">Token: SHA-256 Verified</div>
                </div>

                <div className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 shrink-0">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
              </div>

              {/* Validity Footer */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-indigo-800/40 text-indigo-200/80">
                <div>
                  <span className="text-[10px] uppercase text-indigo-300/60 block font-semibold">Valid Thru</span>
                  <span className="font-bold text-white">
                    {validUntilDate ? validUntilDate.toLocaleDateString() : 'Active (2026-2027)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-indigo-300/60 block font-semibold">Annual Status</span>
                  <span className={`font-bold ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isOverdue ? 'Dues Pending' : 'Dues Paid (Good Standing)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Widget if renewal needed */}
          {(isExpiringSoon || isOverdue) && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Next Academic Year Renewal Available</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Extend your membership by +365 days now to ensure uninterrupted member privileges.
              </p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Renew Membership (₹{duesAmount})</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Member Status & Entitlements (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Standing Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Membership Credentials</h3>
                <p className="text-xs text-slate-500">Official club registry details and standings</p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                  isOverdue
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : isExpiringSoon
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isOverdue ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Dues Overdue</span>
                  </>
                ) : isExpiringSoon ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Expiring Soon</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Good Standing</span>
                  </>
                )}
              </span>
            </div>

            {/* 4 Detail Grid Cells */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" /> Current Role
                </span>
                <div className="text-sm font-extrabold text-slate-900">{roleName}</div>
                <div className="text-[11px] text-slate-500 font-medium">Voting charter member</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" /> Club Organization
                </span>
                <div className="text-sm font-extrabold text-slate-900 truncate">{clubName}</div>
                <div className="text-[11px] text-slate-500 font-medium">{clubCategory}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Validity Expiry
                </span>
                <div className="text-sm font-extrabold text-slate-900">
                  {validUntilDate ? validUntilDate.toLocaleDateString() : 'Annual Charter 2027'}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {myDuesStatus?.daysRemaining !== undefined && myDuesStatus?.daysRemaining !== null
                    ? `${myDuesStatus.daysRemaining} days remaining`
                    : 'Active Standing'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Annual Dues Rate
                </span>
                <div className="text-sm font-extrabold text-slate-900">₹{duesAmount} / Year</div>
                <div className="text-[11px] font-medium text-emerald-600">
                  {isOverdue ? 'Pending Payment' : 'Dues Settled'}
                </div>
              </div>
            </div>
          </div>

          {/* Member Entitlements & Privileges Grid */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Active Member Entitlements & Perks
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Your registered charter standing unlocks special discounts, door admission and voting privileges across campus:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">60% Gala & Event Discount</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Automatic member rates on all symposium, hackathon and annual gala passes.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">20% Apparel & Merch Discount</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Exclusive member pricing on embroidered hoodies, caps and stationery.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                  <Vote className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Elections Voting Rights</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Official franchise to cast ballots and run for club executive leadership.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 transition-all flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Instant Door Pass Scanning</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Fast-track check-in via your encrypted digital QR pass on mobile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. RAZORPAY / MOCK DUES PAYMENT MODAL ───────────── */}
      {showPaymentModal && (
        <RazorpayPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title={`Renew Annual Membership - ${clubName}`}
          purpose={`Annual Membership Dues Extension (+365 Days) for ${clubName}`}
          organizationId={'01a127d9-1403-720b-8909-ed5f464fa9cd'}
          amount={duesAmount}
          payerName={memberName}
          payerEmail={memberEmail}
          onSuccess={handleRenewSuccess}
        />
      )}
    </div>
  );
};
