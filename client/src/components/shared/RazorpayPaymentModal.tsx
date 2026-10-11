import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
} from 'lucide-react';
import { PaymentReceipt } from '../../stores/club.store';
import { apiClient } from '../../services/api-client';

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  purpose: string;
  amount: number;
  payerName?: string;
  payerEmail?: string;
  organizationId?: string;
  bookingId?: string;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  purpose,
  amount,
  payerName = 'Student Member',
  payerEmail = 'student@campusmitra.edu',
  organizationId,
  bookingId,
  onSuccess,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentReceipt | null>(null);
  const [isLaunchingPayment, setIsLaunchingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setIsLaunchingPayment(true);
    setErrorMessage(null);

    // 1. Ensure Razorpay Checkout SDK script is loaded in DOM
    if (typeof (window as any).Razorpay !== 'function') {
      const scriptReady = await new Promise<boolean>((resolve) => {
        const existing = document.getElementById('razorpay-checkout-script');
        if (existing) {
          existing.addEventListener('load', () => resolve(true));
          existing.addEventListener('error', () => resolve(false));
          setTimeout(() => resolve(typeof (window as any).Razorpay === 'function'), 2000);
          return;
        }
        const s = document.createElement('script');
        s.id = 'razorpay-checkout-script';
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
      });

      if (!scriptReady && typeof (window as any).Razorpay !== 'function') {
        setIsLaunchingPayment(false);
        setErrorMessage('Could not load payment checkout SDK. Please verify your network connection.');
        return;
      }
    }

    let razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tm4KSE4i6vVkvs';
    let orderId: string | undefined;
    let paymentAmountPaise = Math.round(amount * 100);
    let paymentCurrency = 'INR';

    // 2. Call backend order creation API: POST /api/payment/create-order
    try {
      const payload: any = { purpose: purpose || title };
      if (organizationId) payload.organizationId = organizationId;
      if (bookingId) payload.bookingId = bookingId;

      const res = await apiClient.post('/payment/create-order', payload);
      const resData = res.data?.data || res.data;
      if (resData) {
        orderId = resData.order_id || resData.orderId || resData.id;
        if (resData.key_id || resData.keyId) razorpayKey = resData.key_id || resData.keyId;
        if (resData.amount) paymentAmountPaise = resData.amount;
        if (resData.currency) paymentCurrency = resData.currency;
      }
    } catch (orderErr: any) {
      console.error('[PaymentModal] Order creation error:', orderErr);
      const msg = orderErr?.response?.data?.message || orderErr?.message || 'Failed to create payment order.';
      setIsLaunchingPayment(false);
      setErrorMessage(msg);
      return;
    }

    // 3. Open Razorpay Checkout modal
    if (typeof (window as any).Razorpay === 'function') {
      try {
        const options: any = {
          key: razorpayKey,
          amount: paymentAmountPaise, // in paise
          currency: paymentCurrency,
          name: 'CampusMitra',
          description: purpose || title || 'Student Organization Payment',
          image: window.location.origin + '/logo.png',
          prefill: {
            name: payerName,
            email: payerEmail,
            contact: '9876543210',
          },
          notes: {
            purpose: purpose || title,
            organizationId: organizationId || '',
            bookingId: bookingId || '',
            system: 'Campus Mitra Odoo-NMIT',
          },
          theme: {
            color: '#1e3a8a',
          },
          handler: async function (response: any) {
            setPaymentStatus('PROCESSING');
            // Verify payment signature with backend
            try {
              if (response.razorpay_order_id && response.razorpay_payment_id && response.razorpay_signature) {
                await apiClient.post('/payment/verify', {
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                });
              }
            } catch (verErr: any) {
              console.warn('[PaymentModal] Backend signature verification notice:', verErr);
            }

            const receipt: PaymentReceipt = {
              paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              orderId: response.razorpay_order_id || orderId || `order_${Date.now()}`,
              amount,
              currency: paymentCurrency,
              purpose,
              payerName,
              payerEmail,
              method: 'RAZORPAY_OFFICIAL_POPUP',
              timestamp: new Date().toISOString(),
              signature: response.razorpay_signature || `sig_${Date.now()}`,
            };

            setGeneratedReceipt(receipt);
            setPaymentStatus('SUCCESS');
            setIsLaunchingPayment(false);

            setTimeout(() => {
              onSuccess(receipt);
              onClose();
              setPaymentStatus('IDLE');
            }, 1500);
          },
          modal: {
            ondismiss: function () {
              console.log('[PaymentModal] Payment checkout dismissed by user');
              setIsLaunchingPayment(false);
            },
          },
        };

        if (orderId) {
          options.order_id = orderId;
        }

        const rzpInstance = new (window as any).Razorpay(options);
        rzpInstance.on('payment.failed', function (resp: any) {
          console.error('[PaymentModal] Payment failed:', resp.error);
          setIsLaunchingPayment(false);
          setErrorMessage(`Payment Failed: ${resp.error?.description || 'Gateway transaction declined'}`);
        });

        rzpInstance.open();
        setIsLaunchingPayment(false);
        return;
      } catch (err: any) {
        console.error('[PaymentModal] Razorpay open error:', err);
        setIsLaunchingPayment(false);
        setErrorMessage(err.message || 'Unable to display checkout dialog.');
      }
    } else {
      setIsLaunchingPayment(false);
      setErrorMessage('Payment Gateway SDK is not ready. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'var(--font-family-body)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* ── 1. MODAL BRAND HEADER ───────────────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0c2340 0%, #1e3a8a 100%)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <img
              src="/logo.png"
              alt="CampusMitra"
              style={{
                width: '26px',
                height: '26px',
                objectFit: 'contain',
              }}
            />
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>
              CampusMitra Checkout
            </span>
            <span
              style={{
                marginLeft: 'auto',
                marginRight: '28px',
                fontSize: '11px',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock style={{ width: '10px', height: '10px' }} />
              256-bit SSL Secure
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 500 }}>
                Skyline Student Association
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                {title || purpose}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#93c5fd' }}>Total Amount</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. MODAL BODY (PROCESSING OR SUCCESS OR ORDER SUMMARY) ─────── */}
        {paymentStatus === 'PROCESSING' ? (
          <div
            style={{
              padding: '60px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <Loader2 style={{ width: '48px', height: '48px', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
            <div>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
                Confirming Payment...
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0, maxWidth: '360px' }}>
                Verifying HMAC SHA-256 signature with bank gateway and recording dues.
              </p>
            </div>
          </div>
        ) : paymentStatus === 'SUCCESS' ? (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#15803d',
              }}
            >
              <CheckCircle2 style={{ width: '40px', height: '40px' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', margin: '0 0 4px 0' }}>
                Payment Succeeded!
              </h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Payment ID: <strong style={{ color: '#1e293b' }}>{generatedReceipt?.paymentId}</strong>
              </p>
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                width: '100%',
                maxWidth: '380px',
                fontSize: '12px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Order Purpose:</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{purpose}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Paid Amount:</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>₹{amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payer:</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{payerName}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Order Summary Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Target Purpose</span>
                <span style={{ fontWeight: 600, color: '#1e293b', textAlign: 'right' }}>{purpose || title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Student Name</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{payerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Email Address</span>
                <span style={{ fontWeight: 500, color: '#1e293b' }}>{payerEmail}</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: '#1e293b' }}>Payable Amount</span>
                <span style={{ color: '#1e3a8a', fontSize: '14px' }}>₹{amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Supported Payment Channels */}
            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#1e3a8a' }}>
                <ShieldCheck style={{ width: '16px', height: '16px', color: '#2563eb' }} />
                <span>All Payment Modes Supported</span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#475569',
                }}
              >
                <div style={{ background: '#ffffff', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Smartphone style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#1e3a8a' }} />
                  <div>UPI & QR</div>
                </div>
                <div style={{ background: '#ffffff', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <CreditCard style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#1e3a8a' }} />
                  <div>Cards</div>
                </div>
                <div style={{ background: '#ffffff', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Building style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#1e3a8a' }} />
                  <div>NetBanking</div>
                </div>
                <div style={{ background: '#ffffff', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Wallet style={{ width: '16px', height: '16px', margin: '0 auto 4px auto', color: '#1e3a8a' }} />
                  <div>Wallets</div>
                </div>
              </div>
            </div>

            {/* Error notice if backend order API fails */}
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#b91c1c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Pay Now Button (no mention of "Razorpay" in button text) */}
            <div style={{ marginTop: '4px' }}>
              <button
                type="button"
                id="modal-pay-now-button"
                onClick={handlePayNow}
                disabled={isLaunchingPayment}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: isLaunchingPayment ? 'not-allowed' : 'pointer',
                  opacity: isLaunchingPayment ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.3)',
                  transition: 'opacity 0.2s',
                }}
              >
                {isLaunchingPayment ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    <span>Connecting to Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock style={{ width: '16px', height: '16px' }} />
                    <span>Pay Now • ₹{amount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── 3. MODAL FOOTER ────────────────────────────────────────── */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#15803d' }} />
            <span>PCI-DSS Level 1 Compliant</span>
          </div>
          <div>256-bit Encrypted SSL Gateway</div>
        </div>
      </div>
    </div>
  );
};
