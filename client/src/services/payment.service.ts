import { apiClient } from './api-client';

export interface CreateOrderPayload {
  organizationId?: string;
  clubId?: string;
  bookingId?: string;
  eventId?: string;
  purpose?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  orderId: string;
  order_id: string;
  id: string;
  amount: number; // in paise (e.g. 50000 for ₹500)
  currency: string;
  keyId: string;
  key_id: string;
  data?: {
    orderId: string;
    order_id: string;
    id: string;
    amount: number;
    currency: string;
    keyId: string;
    key_id: string;
    paymentRecordId?: string;
    organizationId?: string;
    bookingId?: string;
    purpose?: string;
    isExisting?: boolean;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  paymentRecordId: string;
  status: string;
}

export interface OpenRazorpayOptions {
  organizationId?: string;
  clubId?: string;
  bookingId?: string;
  eventId?: string;
  purpose?: string;
  title?: string;
  payerName?: string;
  payerEmail?: string;
  payerContact?: string;
  notes?: Record<string, string>;
  onSuccess?: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    verificationResult?: any;
  }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically loads the official Razorpay Checkout SDK script if not already present.
 */
export const loadRazorpayCheckoutScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof (window as any).Razorpay === 'function') {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[Razorpay] Failed to load official checkout script from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const paymentService = {
  /**
   * Calls the backend authenticated order creation API: POST /api/payment/create-order
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await apiClient.post<CreateOrderResponse>('/payment/create-order', payload);
    return res.data;
  },

  /**
   * Calls the backend verification endpoint: POST /api/payment/verify
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const res = await apiClient.post<VerifyPaymentResponse>('/payment/verify', payload);
    return res.data;
  },

  /**
   * Main React integration flow:
   * 1. Loads Razorpay SDK if needed
   * 2. Calls backend POST /api/payment/create-order
   * 3. Extracts returned order_id, amount, currency, and public Key ID
   * 4. Opens official Razorpay Checkout popup
   * 5. Automatically verifies payment signature upon completion
   */
  async openCheckout(options: OpenRazorpayOptions): Promise<void> {
    const isLoaded = await loadRazorpayCheckoutScript();
    if (!isLoaded || typeof (window as any).Razorpay !== 'function') {
      throw new Error('Razorpay Checkout SDK is not available. Please check your internet connection.');
    }

    // 1. Call backend to create Razorpay Order
    const orderRes = await paymentService.createOrder({
      organizationId: options.organizationId,
      clubId: options.clubId,
      bookingId: options.bookingId,
      eventId: options.eventId,
      purpose: options.purpose || options.title,
    });

    // 2. Extract returned order_id, amount, currency, and public Key ID
    const order_id =
      orderRes.order_id ||
      orderRes.orderId ||
      orderRes.data?.order_id ||
      orderRes.data?.orderId ||
      orderRes.id;

    const amount = orderRes.amount || orderRes.data?.amount;
    const currency = orderRes.currency || orderRes.data?.currency || 'INR';
    const key_id =
      orderRes.key_id ||
      orderRes.keyId ||
      orderRes.data?.key_id ||
      orderRes.data?.keyId ||
      import.meta.env.VITE_RAZORPAY_KEY_ID ||
      'rzp_test_Tm4KSE4i6vVkvs';

    if (!order_id) {
      throw new Error('Backend failed to return an order_id for Razorpay Checkout.');
    }

    // 3. Construct Razorpay Checkout options
    const rzpOptions: any = {
      key: key_id,
      amount: amount, // in paise
      currency: currency,
      name: 'CampusMitra',
      description: options.purpose || options.title || 'Student Organization Payment',
      image: window.location.origin + '/logo.png',
      order_id: order_id,
      prefill: {
        name: options.payerName || 'Student Member',
        email: options.payerEmail || 'student@campusmitra.edu',
        contact: options.payerContact || '9876543210',
      },
      notes: {
        purpose: options.purpose || options.title || 'Payment',
        organizationId: options.organizationId || options.clubId || '',
        bookingId: options.bookingId || '',
        ...options.notes,
      },
      theme: {
        color: '#1e3a8a',
      },
      handler: async function (response: any) {
        let verificationResult: any = null;
        try {
          if (
            response.razorpay_order_id &&
            response.razorpay_payment_id &&
            response.razorpay_signature
          ) {
            verificationResult = await paymentService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          }
        } catch (verErr) {
          console.error('[paymentService] Payment verification failed:', verErr);
        }

        options.onSuccess?.({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          verificationResult,
        });
      },
      modal: {
        ondismiss: function () {
          console.log('[paymentService] Razorpay Checkout dismissed by user');
          options.onDismiss?.();
        },
      },
    };

    // 4. Open Razorpay Checkout
    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on('payment.failed', function (resp: any) {
      console.error('[paymentService] Payment failed:', resp.error);
      options.onError?.(resp.error);
    });
    rzp.open();
  },
};
