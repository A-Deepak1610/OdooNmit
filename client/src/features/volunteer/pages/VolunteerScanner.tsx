import React, { useState } from 'react';
import {
  QrCode,
  KeyRound,
  Clock,
  Ticket,
  ShieldCheck,
  Loader2,
  Check,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { eventService } from '../../../services/event.service';

export const VolunteerScanner: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'OTP' | 'QR'>('OTP');
  const [otpInput, setOtpInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Verification result state
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'duplicate' | 'error';
    message: string;
    booking?: any;
  } | null>(null);

  // Live door history
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  // Door Stats
  const [stats, setStats] = useState({
    totalCheckedIn: 0,
    recentEntries: 0,
  });

  const handleVerify = async (code: string) => {
    if (!code.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await eventService.verifyCheckinTicket(code.trim());

      if (res.success && res.booking) {
        setVerificationResult({
          status: 'success',
          message: res.message || 'Admission approved! Welcome to the event.',
          booking: res.booking,
        });

        // Add to recent feed
        setRecentCheckins((prev) => [
          {
            ...res.booking,
            verifiedAt: new Date(),
          },
          ...prev.slice(0, 19),
        ]);

        setStats((prev) => ({
          ...prev,
          totalCheckedIn: prev.totalCheckedIn + (res.booking.quantity || 1),
          recentEntries: prev.recentEntries + 1,
        }));
      } else if (res.alreadyCheckedIn) {
        setVerificationResult({
          status: 'duplicate',
          message: res.message || 'Warning: Attendee is already checked in.',
          booking: res.booking,
        });
      } else {
        setVerificationResult({
          status: 'error',
          message: res.message || 'Invalid ticket pass or OTP code.',
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification error.';
      const isDup = err.response?.status === 409 || err.response?.data?.alreadyCheckedIn;

      setVerificationResult({
        status: isDup ? 'duplicate' : 'error',
        message: msg,
        booking: err.response?.data?.booking,
      });
    } finally {
      setIsVerifying(false);
      setOtpInput('');
      setQrInput('');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length >= 4) {
      handleVerify(otpInput);
    }
  };

  const handleQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      handleVerify(qrInput);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Door Security Station
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              Live Check-in Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Door Admission & Pass Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Verify attendee admission using the attendee's 6-digit OTP code or scan the QR code from their pass.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Admitted Today
            </div>
            <div className="text-xl font-black text-indigo-600">
              {stats.totalCheckedIn} <span className="text-xs font-normal text-slate-500">passengers</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Verification Mode
            </div>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Dual OTP / QR Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Verification Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Verification Station */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('OTP');
                  setVerificationResult(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'OTP'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                6-Digit Door OTP Check-in
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('QR');
                  setVerificationResult(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeMode === 'QR'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QR Code / Pass Scan
              </button>
            </div>

            {/* Mode 1: 6-Digit OTP */}
            {activeMode === 'OTP' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Enter Attendee's 6-Digit Check-in OTP
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Ask the attendee for the 6-digit code shown on their digital pass.
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 482910"
                      className="w-full px-4 py-3 text-2xl font-mono font-bold tracking-widest text-center bg-slate-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Quick Keypad Helper */}
                <div className="grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        if (k === 'C') setOtpInput('');
                        else if (k === '⌫') setOtpInput((prev) => prev.slice(0, -1));
                        else if (otpInput.length < 6) setOtpInput((prev) => prev + k);
                      }}
                      className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otpInput.length < 4 || isVerifying}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Admission...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Verify & Admit Attendee
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Mode 2: QR Scanner / Pass code input */}
            {activeMode === 'QR' && (
              <form onSubmit={handleQrSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Scan or Paste QR Pass Payload / Ticket Code
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Scan barcode/QR code with handheld scanner or paste pass string (e.g.{' '}
                    <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">TKT-2026-XXXXX</code>).
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="Paste QR payload or TKT-2026-XXXX"
                      className="w-full px-4 py-3 text-sm font-mono bg-slate-50 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!qrInput.trim() || isVerifying}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying Pass...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" /> Verify QR & Admit
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Verification Result Notification Card */}
            {verificationResult && (
              <div
                className={`p-5 rounded-2xl border text-sm transition-all animate-fadeIn ${
                  verificationResult.status === 'success'
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : verificationResult.status === 'duplicate'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {verificationResult.status === 'success' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  )}
                  {verificationResult.status === 'duplicate' && (
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}
                  {verificationResult.status === 'error' && (
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="font-extrabold text-base">
                      {verificationResult.status === 'success'
                        ? '✅ Admission Approved!'
                        : verificationResult.status === 'duplicate'
                        ? '⚠️ Already Admitted (Duplicate Entry)'
                        : '❌ Invalid Pass / Code'}
                    </div>
                    <p className="text-xs opacity-90">{verificationResult.message}</p>

                    {verificationResult.booking && (
                      <div className="mt-3 pt-3 border-t border-black/10 text-xs space-y-1 font-medium">
                        <div>
                          Attendee: <strong>{verificationResult.booking.user?.fullName || 'Student'}</strong> (
                          {verificationResult.booking.user?.email || 'NMIT'})
                        </div>
                        <div>
                          Event: <strong>{verificationResult.booking.event?.title}</strong>
                        </div>
                        <div>
                          Pass: <strong>#{verificationResult.booking.bookingNumber}</strong> • Seats:{' '}
                          <strong>{verificationResult.booking.quantity}</strong>
                        </div>
                        {verificationResult.booking.checkedInAt && (
                          <div className="text-amber-800 font-bold">
                            Admitted At: {new Date(verificationResult.booking.checkedInAt).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Door Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Live Check-in Activity</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {recentCheckins.length} verified
              </span>
            </div>

            {recentCheckins.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Ticket className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs">No attendees checked in yet today.</p>
                <p className="text-[11px] text-slate-400">
                  Enter an OTP or scan a pass on the left to admit attendees.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {recentCheckins.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">
                        {entry.user?.fullName || 'Attendee'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {entry.event?.title || 'Campus Event'}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-mono">
                        #{entry.bookingNumber} • {entry.quantity} Pass{entry.quantity > 1 ? 'es' : ''}
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Admitted
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.verifiedAt || Date.now()).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
