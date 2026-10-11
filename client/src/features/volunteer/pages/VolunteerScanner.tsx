import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  CameraOff,
  Upload,
  Sparkles,
  RefreshCw,
  Zap,
  UserCheck,
  FileImage,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { eventService } from '../../../services/event.service';

export const VolunteerScanner: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'OTP' | 'QR'>('OTP');
  const [qrSubTab, setQrSubTab] = useState<'CAMERA' | 'FILE' | 'GENERATOR' | 'MANUAL'>('CAMERA');
  const [otpInput, setOtpInput] = useState('');
  const [qrInput, setQrInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

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

  // Recent Registered Passes for QR generation & quick testing
  const [recentPasses, setRecentPasses] = useState<any[]>([]);
  const [isLoadingPasses, setIsLoadingPasses] = useState(false);
  const [customQrInput, setCustomQrInput] = useState('');
  const [generatedCustomQr, setGeneratedCustomQr] = useState<{ payload: string; dataUrl: string } | null>(null);
  const [isGeneratingCustomQr, setIsGeneratingCustomQr] = useState(false);
  const [selectedPassModal, setSelectedPassModal] = useState<any | null>(null);

  // Audio feedback on successful scan
  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio autoplay restriction fallback
    }
  };

  // Load recent passes on mount or tab change
  const loadRecentPasses = async () => {
    setIsLoadingPasses(true);
    try {
      const passes = await eventService.getRecentPasses(12);
      if (passes && Array.isArray(passes)) {
        setRecentPasses(passes);
      }
    } catch {
      // Ignore fallback
    } finally {
      setIsLoadingPasses(false);
    }
  };

  useEffect(() => {
    loadRecentPasses();
  }, []);

  // Stop camera when leaving QR mode or switching sub-tabs
  useEffect(() => {
    if (activeMode !== 'QR' || qrSubTab !== 'CAMERA') {
      stopCameraScanner();
    }
  }, [activeMode, qrSubTab]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    setCameraError(null);
    try {
      const elementId = 'volunteer-camera-viewport';
      const container = document.getElementById(elementId);
      if (!container) {
        throw new Error('Camera scanner container not ready.');
      }

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(elementId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          playBeep();
          stopCameraScanner();
          handleVerify(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err?.message ||
          'Camera access blocked or unavailable. Ensure camera permissions are granted in your browser.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore
      }
      setIsCameraActive(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const tempId = 'qr-file-decoder-temp';
      const html5QrCode = new Html5Qrcode(tempId);
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      playBeep();
      handleVerify(decodedText);
    } catch (err: any) {
      setVerificationResult({
        status: 'error',
        message: 'No readable QR code found in this image file. Please ensure the QR code is clearly visible.',
      });
      setIsVerifying(false);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

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

        // Refresh recent pass cards to reflect checked in status
        loadRecentPasses();
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

  const handleGenerateCustomQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQrInput.trim()) return;
    setIsGeneratingCustomQr(true);
    try {
      const result = await eventService.generateTicketQrCode(customQrInput.trim(), 280);
      setGeneratedCustomQr(result);
    } catch (err: any) {
      alert(`QR Generation Error: ${err.message}`);
    } finally {
      setIsGeneratingCustomQr(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Hidden container for image decoding */}
      <div id="qr-file-decoder-temp" style={{ display: 'none' }} />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Door Security Station
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Powered by Node.js QR & OTP
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Door Admission & Pass Verification
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Admit attendees via live Camera QR Scanner, Pass image upload, Node.js QR code passes, or 6-digit door OTP.
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
            {/* Primary Mode Switcher (OTP vs QR) */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('OTP');
                  setVerificationResult(null);
                  stopCameraScanner();
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeMode === 'QR'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Live QR Attendance Scanner
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
                      className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={otpInput.length < 4 || isVerifying}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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

            {/* Mode 2: QR Scanner Station */}
            {activeMode === 'QR' && (
              <div className="space-y-4">
                {/* QR Method Sub-Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setQrSubTab('CAMERA');
                      setVerificationResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      qrSubTab === 'CAMERA'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Camera Scanner
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQrSubTab('FILE');
                      setVerificationResult(null);
                      stopCameraScanner();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      qrSubTab === 'FILE'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload QR Image
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQrSubTab('GENERATOR');
                      setVerificationResult(null);
                      stopCameraScanner();
                      loadRecentPasses();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      qrSubTab === 'GENERATOR'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Node.js QR Passes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQrSubTab('MANUAL');
                      setVerificationResult(null);
                      stopCameraScanner();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      qrSubTab === 'MANUAL'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" /> Manual / Barcode
                  </button>
                </div>

                {/* Sub-tab 1: Live Camera Scanner */}
                {qrSubTab === 'CAMERA' && (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white flex flex-col items-center justify-center min-h-[300px]">
                      {/* Html5Qrcode viewfinder element */}
                      <div
                        id="volunteer-camera-viewport"
                        className={`w-full overflow-hidden ${isCameraActive ? 'block' : 'hidden'}`}
                        style={{ minHeight: '300px' }}
                      />

                      {!isCameraActive && (
                        <div className="p-8 text-center space-y-3">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
                            <Camera className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-white">Live Camera QR Scanner</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                              Hold the attendee's ticket QR code up to your camera to admit them in real time.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={startCameraScanner}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                          >
                            <Camera className="w-4 h-4" /> Start Camera Scanner
                          </button>
                        </div>
                      )}

                      {isCameraActive && (
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            type="button"
                            onClick={stopCameraScanner}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                          >
                            <CameraOff className="w-3.5 h-3.5" /> Stop Camera
                          </button>
                        </div>
                      )}
                    </div>

                    {cameraError && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-tab 2: Scan from Image/File */}
                {qrSubTab === 'FILE' && (
                  <div className="space-y-4">
                    <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-indigo-50/30 hover:bg-indigo-50/60 transition-all cursor-pointer group">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileImage className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">
                          Click to upload QR pass screenshot or ticket photo
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Accepts PNG, JPG, WEBP. Decoded immediately via scanner engine.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Sub-tab 3: Node.js QR Passes & Attendee Desk */}
                {qrSubTab === 'GENERATOR' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          Generate Custom Attendance QR (via Node.js 'qrcode' library)
                        </span>
                      </div>
                      <form onSubmit={handleGenerateCustomQr} className="flex gap-2">
                        <input
                          type="text"
                          value={customQrInput}
                          onChange={(e) => setCustomQrInput(e.target.value)}
                          placeholder="Enter booking # or CAMPUSMITRA:TKT-...:OTP"
                          className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={!customQrInput.trim() || isGeneratingCustomQr}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                        >
                          {isGeneratingCustomQr ? 'Generating...' : 'Generate QR'}
                        </button>
                      </form>

                      {generatedCustomQr && (
                        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg">
                          <img
                            src={generatedCustomQr.dataUrl}
                            alt="Node.js QR Code"
                            className="w-28 h-28 border border-slate-200 rounded-lg shadow-xs"
                          />
                          <div className="flex-1 space-y-1.5 text-xs text-center sm:text-left">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Generated by Node.js qrcode
                            </span>
                            <p className="font-mono text-slate-700 break-all">{generatedCustomQr.payload}</p>
                            <button
                              type="button"
                              onClick={() => handleVerify(generatedCustomQr.payload)}
                              disabled={isVerifying}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                              <Zap className="w-3.5 h-3.5" /> Quick Admit Scanned QR
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent Passes List with Generated QR Codes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Registered Attendee Passes ({recentPasses.length})
                        </span>
                        <button
                          type="button"
                          onClick={loadRecentPasses}
                          disabled={isLoadingPasses}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingPasses ? 'animate-spin' : ''}`} />
                          Refresh Passes
                        </button>
                      </div>

                      {recentPasses.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3 text-center">No active passes found.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
                          {recentPasses.map((pass) => (
                            <div
                              key={pass.id}
                              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-indigo-300 transition-all text-xs"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {pass.user?.fullName || 'Attendee'}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  #{pass.bookingNumber} • OTP: <strong className="text-indigo-600">{pass.otpCode || '123456'}</strong>
                                </div>
                                <div>
                                  {pass.checkedInAt ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Admitted
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                      Pending Admission
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setSelectedPassModal(pass)}
                                  className="p-1.5 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                                  title="View QR Code Pass"
                                >
                                  <QrCode className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleVerify(pass.qrPayload || `CAMPUSMITRA:${pass.bookingNumber}:${pass.otpCode}`)
                                  }
                                  disabled={isVerifying}
                                  className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-xs cursor-pointer transition-colors"
                                >
                                  Admit
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-tab 4: Manual QR Payload Input */}
                {qrSubTab === 'MANUAL' && (
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
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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
              </div>
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
                  Scan a QR code pass or enter an OTP code on the left to admit attendees.
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

      {/* Selected Pass Modal with Node.js Generated QR Code */}
      {selectedPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                Node.js Pass QR Code
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPassModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              {selectedPassModal.qrCodeDataUrl ? (
                <img
                  src={selectedPassModal.qrCodeDataUrl}
                  alt="Pass QR Code"
                  className="w-48 h-48 border border-slate-200 rounded-xl shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-xl font-mono text-xs">
                  Generating QR...
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {selectedPassModal.user?.fullName || 'Attendee Pass'}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  #{selectedPassModal.bookingNumber} • OTP:{' '}
                  <span className="font-bold text-indigo-600">{selectedPassModal.otpCode || '123456'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Generated via Node.js 'qrcode' library for live door attendance.
                </p>
              </div>

              <div className="w-full pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const code =
                      selectedPassModal.qrPayload ||
                      `CAMPUSMITRA:${selectedPassModal.bookingNumber}:${selectedPassModal.otpCode}`;
                    setSelectedPassModal(null);
                    handleVerify(code);
                  }}
                  disabled={isVerifying}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 inline mr-1" /> Quick Admit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
