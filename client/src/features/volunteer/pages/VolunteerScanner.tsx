import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  Loader2,
  FlipHorizontal,
  ChevronDown,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { eventService, CampusEventItem } from '../../../services/event.service';

export const VolunteerScanner: React.FC = () => {
  // ── 1. Events & Active Event Selection ───────────────────────────────────
  const [events, setEvents] = useState<CampusEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // ── 2. Tab Selection ('qr' | 'otp') ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'qr' | 'otp'>('qr');

  // ── 3. QR Camera State ───────────────────────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const cameraViewportId = 'volunteer-live-qr-viewport';

  // ── 4. OTP Form State ────────────────────────────────────────────────────
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpValidationError, setOtpValidationError] = useState<string | null>(null);
  const [isSubmittingOtp, setIsSubmittingOtp] = useState<boolean>(false);

  // ── 5. Verification Result Feedback State ────────────────────────────────
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'duplicate' | 'wrong_event' | 'error';
    message: string;
    booking?: any;
    timestamp?: string;
  } | null>(null);

  // ── Audio Feedback Generator ─────────────────────────────────────────────
  const playSound = useCallback((type: 'success' | 'duplicate' | 'error') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'success') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'duplicate') {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // fallback
    }

    if ('vibrate' in navigator) {
      try {
        if (type === 'success') navigator.vibrate([80, 40, 80]);
        else if (type === 'duplicate') navigator.vibrate([200, 100, 200]);
        else navigator.vibrate([300]);
      } catch {
        // ignore
      }
    }
  }, []);

  // ── Load Real Database Events ────────────────────────────────────────────
  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
      const ongoing = data.find((e) => e.displayStatus === 'ONGOING');
      if (ongoing) {
        setSelectedEventId(ongoing.id);
      } else if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ── Core Ticket Verification Handler ──────────────────────────────────────
  const processCheckinCode = async (rawCode: string) => {
    const cleanCode = (rawCode || '').trim();
    if (!cleanCode || isProcessingScan) return;

    setIsProcessingScan(true);
    try {
      const result = await eventService.verifyCheckinTicket(
        cleanCode,
        selectedEventId !== 'ALL' ? selectedEventId : undefined
      );

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (result.success) {
        playSound('success');
        setVerificationResult({
          status: 'success',
          message: result.message || 'Admission approved! Attendance recorded.',
          booking: result.booking,
          timestamp: nowStr,
        });
      } else if (result.alreadyCheckedIn) {
        playSound('duplicate');
        setVerificationResult({
          status: 'duplicate',
          message: result.message || 'Warning: Attendee is already checked in.',
          booking: result.booking,
          timestamp: nowStr,
        });
      } else if (result.wrongEvent) {
        playSound('duplicate');
        setVerificationResult({
          status: 'wrong_event',
          message: result.message || 'Ticket is registered for a different event gate.',
          booking: result.booking,
          timestamp: nowStr,
        });
      } else {
        playSound('error');
        setVerificationResult({
          status: 'error',
          message: result.message || 'Invalid ticket pass or OTP. No registration found.',
          timestamp: nowStr,
        });
      }
    } catch (err: any) {
      playSound('error');
      setVerificationResult({
        status: 'error',
        message: err.message || 'Verification failed. Please check network connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsProcessingScan(false);
      setOtpValue('');
      setOtpValidationError(null);
    }
  };

  // ── Camera Scanner Controls ──────────────────────────────────────────────
  const startCamera = async () => {
    setCameraError(null);
    try {
      const container = document.getElementById(cameraViewportId);
      if (!container) return;

      if (html5QrCodeRef.current) {
        await stopCamera();
      }

      const scanner = new Html5Qrcode(cameraViewportId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode },
        {
          fps: 15,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.777778,
        },
        (decodedText) => {
          if (!isProcessingScan) {
            processCheckinCode(decodedText);
          }
        },
        () => {
          // ignore scan frame without QR
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      setIsCameraActive(false);
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.clear();
        }
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
      setCameraError(
        err?.message ||
          'Unable to access camera. Please allow camera permissions in your browser or enter the 6-digit OTP.'
      );
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    await stopCamera();
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Tab switching lifecycle: start camera when on 'qr', stop camera immediately when on 'otp'
  useEffect(() => {
    if (activeTab === 'qr') {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }
  }, [activeTab]);

  // Clean up camera streams on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ── Upload QR Image Fallback ──────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingScan(true);
      const scanner = new Html5Qrcode('volunteer-file-temp-viewport');
      const decoded = await scanner.scanFile(file, true);
      await scanner.clear();
      if (decoded) {
        processCheckinCode(decoded);
      }
    } catch {
      playSound('error');
      setVerificationResult({
        status: 'error',
        message: 'No valid QR code detected in the uploaded image. Please enter the 6-digit OTP.',
      });
      setIsProcessingScan(false);
    }
    e.target.value = '';
  };

  // ── OTP Handlers (Numeric-Only Validation) ─────────────────────────────────
  const handleOtpChange = (val: string) => {
    // Strictly numeric validation: strip non-digits and cap at 6 digits
    const numericOnly = val.replace(/\D/g, '').slice(0, 6);
    setOtpValue(numericOnly);
    setOtpValidationError(null);

    // Auto-submit if exactly 6 digits entered
    if (numericOnly.length === 6 && !isProcessingScan && !isSubmittingOtp) {
      setIsSubmittingOtp(true);
      processCheckinCode(numericOnly).finally(() => {
        setIsSubmittingOtp(false);
      });
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOtp || isProcessingScan) return;

    if (!otpValue || otpValue.length !== 6) {
      setOtpValidationError('Please enter all 6 digits of the attendee OTP.');
      return;
    }

    setOtpValidationError(null);
    setIsSubmittingOtp(true);
    processCheckinCode(otpValue).finally(() => {
      setIsSubmittingOtp(false);
    });
  };

  const handlePasteOtp = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleOtpChange(text);
      }
    } catch {
      // clipboard permission denied
    }
  };

  return (
    <div className="w-full lg:w-3/4 max-w-4xl mx-auto py-6 sm:py-8 px-4 font-sans text-slate-900 space-y-6">
      {/* Hidden file viewport for uploaded images */}
      <div id="volunteer-file-temp-viewport" style={{ display: 'none' }} />

      {/* ── 1. Clean Minimal Header ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Door Check-In
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan attendee pass QR code or enter their 6-digit OTP for entry verification
          </p>
        </div>

        {/* Compact Event Selector */}
        <div className="relative w-full sm:w-72 shrink-0">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            disabled={isLoadingEvents}
            className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer truncate"
          >
            <option value="ALL">⚡ Any Active Event (Auto-Detect)</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── 2. Mode Selector: Scan QR Code vs Enter 6-Digit OTP ────────────── */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Scan QR Code</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('otp');
            stopCamera();
          }}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'otp'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Enter 6-Digit OTP</span>
        </button>
      </div>

      {/* ── 3. Completely Separate Layouts Based on activeTab ───────────────── */}
      <div className="w-full">
        {/* ================================================================= */}
        {/* LAYOUT 1: QR SCANNER SELECTED (activeTab === 'qr')                */}
        {/* ================================================================= */}
        {activeTab === 'qr' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in duration-200">
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600 shadow-xs">
                <Camera className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Scan Attendee Pass QR Code</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Align the attendee's ticket QR code in the viewfinder or upload a pass image.
              </p>
            </div>

            {/* Viewfinder Viewport Covering Fully */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              {/* html5-qrcode video viewport container - isolated in absolute box */}
              <div
                className={`absolute inset-0 w-full h-full overflow-hidden ${
                  isCameraActive ? 'z-10 block' : 'z-0 opacity-0 pointer-events-none'
                }`}
              >
                <div
                  id={cameraViewportId}
                  className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>

              {/* Scanning Reticle Frame */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-20">
                  <div className="w-52 h-52 sm:w-64 sm:h-64 relative border-2 border-indigo-400/60 rounded-2xl shadow-lg">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_10px_#818cf8] animate-pulse" />
                  </div>
                </div>
              )}

              {/* Processing Overlay */}
              {isProcessingScan && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-30 text-white">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                  <p className="text-xs font-bold tracking-wider uppercase text-indigo-200">
                    Verifying Pass in Database...
                  </p>
                </div>
              )}

              {/* Standby State */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 z-20 p-6 sm:p-8 text-center space-y-4 bg-slate-50 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Camera Viewfinder</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Click below to activate camera and scan attendee QR entry passes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Start Camera</span>
                  </button>
                </div>
              )}

              {/* Camera Error / Permission Fallback State - Covers entire viewport */}
              {cameraError && (
                <div className="absolute inset-0 z-20 p-6 sm:p-8 text-center space-y-4 bg-slate-50 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
                    <CameraOff className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-base font-bold text-slate-900">Camera Unavailable</h3>
                    <p className="text-xs text-slate-600">
                      Camera permission is disabled or not supported on this device. You can verify attendees instantly using OTP.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full max-w-md justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('otp');
                        stopCamera();
                      }}
                      className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Switch to OTP Verification</span>
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* QR Camera Action Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 flex items-center gap-1.5 font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Retry Camera</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <FlipHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Switch Camera</span>
                </button>
              </div>

              <label className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 font-bold transition-colors cursor-pointer shadow-sm">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload QR Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* LAYOUT 2: ENTER 6-DIGIT OTP SELECTED (activeTab === 'otp')        */}
        {/* Completely hides all camera elements, controls, errors & streams */}
        {/* ================================================================= */}
        {activeTab === 'otp' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-200">
            {/* Clean OTP Interface Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Verify Attendee OTP</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter the 6-digit OTP displayed on the attendee's event pass.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpValue}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    className={`w-full text-center py-4 px-4 rounded-xl bg-slate-50 border-2 font-mono font-black text-3xl tracking-widest text-indigo-950 placeholder-slate-300 focus:outline-none focus:bg-white transition-all shadow-inner ${
                      otpValidationError
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-indigo-200 focus:border-indigo-600'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={handlePasteOtp}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Paste 6-digit OTP from clipboard"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Paste</span>
                  </button>
                </div>

                {/* Validation Error Message */}
                {otpValidationError && (
                  <p className="text-xs text-rose-600 font-medium text-center animate-in fade-in">
                    {otpValidationError}
                  </p>
                )}
              </div>

              {/* Verify & Check In Button with Loading State */}
              <button
                type="submit"
                disabled={isSubmittingOtp || isProcessingScan || otpValue.length !== 6}
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingOtp || isProcessingScan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP in Database...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Verify & Check In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400">
                  {otpValue.length}/6 digits entered • Numeric input only
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ── 4. Immediate Check-in Result Display (Both Methods) ───────────── */}
        {verificationResult && (
          <div
            className={`mt-6 rounded-2xl p-4 sm:p-5 border shadow-xs transition-all animate-in fade-in slide-in-from-top-3 space-y-3 ${
              verificationResult.status === 'success'
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : verificationResult.status === 'duplicate'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : verificationResult.status === 'wrong_event'
                ? 'bg-blue-50/90 border-blue-300 text-blue-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {verificationResult.status === 'success' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                ) : verificationResult.status === 'duplicate' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <XCircle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-black tracking-wider uppercase opacity-80">
                    {verificationResult.status === 'success'
                      ? 'ADMISSION APPROVED • DATABASE STORED'
                      : verificationResult.status === 'duplicate'
                      ? 'ALREADY CHECKED IN • DUPLICATE'
                      : verificationResult.status === 'wrong_event'
                      ? 'WRONG EVENT GATE'
                      : 'VERIFICATION REJECTED'}
                  </div>
                  <div className="text-sm sm:text-base font-bold leading-tight mt-0.5">
                    {verificationResult.message}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVerificationResult(null)}
                className="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Dismiss result"
              >
                ✕
              </button>
            </div>

            {/* Attendee Details Card on Successful or Duplicate Verification */}
            {verificationResult.booking && (
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5 text-xs text-slate-800">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <span className="font-mono font-bold text-indigo-700">
                    #{verificationResult.booking.bookingNumber}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Check-in: {verificationResult.timestamp}
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm">
                  {verificationResult.booking.user?.fullName || verificationResult.booking.user?.username || 'Attendee'}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {verificationResult.booking.event?.title}
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Seats: <strong>{verificationResult.booking.quantity} Pass(es)</strong>
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Database Recorded
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerScanner;
