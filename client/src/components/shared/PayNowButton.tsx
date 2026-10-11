import React, { useState } from 'react';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { paymentService } from '../../services/payment.service';

export interface PayNowButtonProps {
  organizationId?: string;
  clubId?: string;
  bookingId?: string;
  eventId?: string;
  purpose?: string;
  amount?: number; // In INR for display
  payerName?: string;
  payerEmail?: string;
  payerContact?: string;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verificationResult?: any;
  }) => void;
  onError?: (err: any) => void;
  onDismiss?: () => void;
}

/**
 * Reusable "Pay Now" Button that triggers backend Razorpay order creation
 * and directly launches the official Razorpay Checkout popup.
 */
export const PayNowButton: React.FC<PayNowButtonProps> = ({
  organizationId,
  clubId,
  bookingId,
  eventId,
  purpose = 'Club Membership Dues',
  amount,
  payerName,
  payerEmail,
  payerContact,
  label,
  className,
  style,
  onSuccess,
  onError,
  onDismiss,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayNow = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await paymentService.openCheckout({
        organizationId,
        clubId,
        bookingId,
        eventId,
        purpose,
        payerName,
        payerEmail,
        payerContact,
        onSuccess: (res) => {
          setIsLoading(false);
          onSuccess?.(res);
        },
        onError: (err) => {
          setIsLoading(false);
          const msg = err?.description || err?.message || 'Payment gateway failed.';
          setErrorMessage(msg);
          onError?.(err);
        },
        onDismiss: () => {
          setIsLoading(false);
          onDismiss?.();
        },
      });
    } catch (err: any) {
      setIsLoading(false);
      const serverMsg =
        err?.response?.data?.message || err?.message || 'Failed to initialize payment with server.';
      setErrorMessage(serverMsg);
      onError?.(err);
    }
  };

  const defaultStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: 700,
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.75 : 1,
    boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.25)',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <button
        type="button"
        id="pay-now-button"
        onClick={handlePayNow}
        disabled={isLoading}
        className={className}
        style={defaultStyle}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} />
            <span>Opening Razorpay...</span>
          </>
        ) : (
          <>
            <Lock style={{ width: '14px', height: '14px' }} />
            <span>
              {label ||
                (amount !== undefined
                  ? `Pay Now • ₹${amount.toLocaleString('en-IN')}`
                  : 'Pay Now')}
            </span>
          </>
        )}
      </button>

      {errorMessage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#dc2626',
            marginTop: '2px',
          }}
        >
          <AlertCircle style={{ width: '12px', height: '12px', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
