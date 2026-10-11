// @ts-ignore
import Razorpay from 'razorpay';
import { ENV } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { PaymentStatus, RoleType, ApplicationStatus, EventBookingStatus } from '@prisma/client';
import { uuidv7 } from '../../common/utils/id.util.js';
import {
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from '../../common/utils/payment.util.js';
import { emailService } from '../../common/services/email.service.js';


export interface CreateOrderInput {
  userId: string;
  organizationId?: string;
  clubId?: string;
  bookingId?: string;
  eventId?: string;
  purpose?: string;
}

export interface VerifyPaymentInput {
  userId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}

export class PaymentService {
  private getRazorpayInstance(): Razorpay {
    const key_id = ENV.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const key_secret = ENV.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      throw new Error(
        'Razorpay credentials are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment.'
      );
    }

    return new Razorpay({
      key_id,
      key_secret,
    });
  }

  /**
   * Create a new Razorpay payment order for club membership registration or event booking.
   * Derives payment amount strictly from Prisma database records, never trusting client input.
   */
  async createOrder(input: CreateOrderInput) {
    const { userId, purpose } = input;
    const orgId = input.organizationId || input.clubId;
    const bookingId = input.bookingId;

    // 1. Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error: any = new Error('Authenticated user does not exist in the database.');
      error.statusCode = 404;
      throw error;
    }

    if (!orgId && !bookingId) {
      const error: any = new Error(
        'Payment target missing. Provide organizationId (for club membership) or bookingId (for event ticket).'
      );
      error.statusCode = 400;
      throw error;
    }

    let amountPaise = 0;
    let organizationRecord: any = null;
    let bookingRecord: any = null;
    let paymentPurpose = purpose;

    // 2. Determine payment target & fetch canonical amount from DB
    if (orgId) {
      // Club Membership Registration flow
      organizationRecord = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organizationRecord) {
        const error: any = new Error(`Organization with ID '${orgId}' was not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (!organizationRecord.isActive) {
        const error: any = new Error('Organization is currently inactive and cannot accept payments.');
        error.statusCode = 400;
        throw error;
      }

      amountPaise = organizationRecord.membershipFee;
      paymentPurpose = paymentPurpose || 'CLUB_MEMBERSHIP_REGISTRATION';

      if (!amountPaise || amountPaise <= 0) {
        const error: any = new Error('Organization does not have a valid membership fee configured.');
        error.statusCode = 400;
        throw error;
      }

      // 3. Duplicate check A: Check if student already has active membership with paid dues
      const existingActiveMembership = await prisma.userRole.findFirst({
        where: {
          userId,
          organizationId: organizationRecord.id,
          duesPaid: true,
          OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
        },
      });

      if (existingActiveMembership) {
        const error: any = new Error(
          'Membership dues are already paid and currently active for this organization.'
        );
        error.statusCode = 409;
        throw error;
      }

      // 4. Duplicate check B: Check for recent active pending order (last 15 minutes) for idempotency
      const existingPendingPayment = await prisma.payment.findFirst({
        where: {
          userId,
          organizationId: organizationRecord.id,
          status: PaymentStatus.PENDING,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPendingPayment && existingPendingPayment.razorpayOrderId) {
        console.info(
          `[PaymentService] Idempotency hit: Returning existing pending order ${existingPendingPayment.razorpayOrderId} for user ${userId}`
        );
        return {
          orderId: existingPendingPayment.razorpayOrderId,
          id: existingPendingPayment.razorpayOrderId,
          amount: existingPendingPayment.amount,
          currency: existingPendingPayment.currency,
          keyId: ENV.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
          paymentRecordId: existingPendingPayment.id,
          organizationId: organizationRecord.id,
          purpose: paymentPurpose,
          isExisting: true,
        };
      }
    } else if (bookingId) {
      // Event Ticket Booking flow
      bookingRecord = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { event: true },
      });

      if (!bookingRecord) {
        const error: any = new Error(`Booking with ID '${bookingId}' was not found.`);
        error.statusCode = 404;
        throw error;
      }

      if (bookingRecord.userId !== userId) {
        const error: any = new Error('You do not have permission to pay for this booking.');
        error.statusCode = 403;
        throw error;
      }

      if (bookingRecord.status === EventBookingStatus.CONFIRMED) {
        const error: any = new Error('This booking is already confirmed and paid.');
        error.statusCode = 409;
        throw error;
      }

      amountPaise = bookingRecord.totalAmount;
      paymentPurpose = paymentPurpose || `EVENT_TICKET_${bookingRecord.eventId}`;

      if (!amountPaise || amountPaise <= 0) {
        const error: any = new Error('Invalid ticket booking amount.');
        error.statusCode = 400;
        throw error;
      }

      // Check for recent active pending order on this booking
      const existingPendingBookingPayment = await prisma.payment.findFirst({
        where: {
          userId,
          bookingId: bookingRecord.id,
          status: PaymentStatus.PENDING,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000),
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPendingBookingPayment && existingPendingBookingPayment.razorpayOrderId) {
        return {
          orderId: existingPendingBookingPayment.razorpayOrderId,
          id: existingPendingBookingPayment.razorpayOrderId,
          amount: existingPendingBookingPayment.amount,
          currency: existingPendingBookingPayment.currency,
          keyId: ENV.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
          paymentRecordId: existingPendingBookingPayment.id,
          bookingId: bookingRecord.id,
          purpose: paymentPurpose,
          isExisting: true,
        };
      }
    }

    // 5. Create Razorpay Order via SDK
    const razorpay = this.getRazorpayInstance();
    const receipt = `rcpt_${userId.substring(0, 8)}_${Date.now()}`.slice(0, 40);

    console.info(
      `[PaymentService] Creating Razorpay order: User=${userId}, Target=${
        organizationRecord?.name || bookingRecord?.id
      }, Amount=${amountPaise} paise, Currency=INR`
    );

    let razorpayOrder: any;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amountPaise),
        currency: 'INR',
        receipt,
        notes: {
          userId,
          organizationId: organizationRecord?.id || '',
          bookingId: bookingRecord?.id || '',
          purpose: paymentPurpose || 'CLUB_MEMBERSHIP_REGISTRATION',
          userEmail: user.email,
          userName: user.fullName,
        },
      });
    } catch (sdkError: any) {
      console.error(
        '[PaymentService] Razorpay SDK orders.create failed:',
        sdkError?.error?.description || sdkError?.message || sdkError
      );
      const error: any = new Error(
        `Failed to initialize order with Razorpay: ${
          sdkError?.error?.description || sdkError?.message || 'Gateway communication failure'
        }`
      );
      error.statusCode = 502;
      throw error;
    }

    // 6. Persist Pending Payment record in Prisma
    const payment = await prisma.payment.create({
      data: {
        id: uuidv7(),
        userId,
        organizationId: organizationRecord?.id || null,
        bookingId: bookingRecord?.id || null,
        amount: Number(razorpayOrder.amount),
        currency: (razorpayOrder.currency as string) || 'INR',
        status: PaymentStatus.PENDING,
        razorpayOrderId: razorpayOrder.id,
      },
    });

    console.info(
      `[PaymentService] Pending payment record persisted: ID=${payment.id}, RazorpayOrderID=${razorpayOrder.id}`
    );

    return {
      orderId: razorpayOrder.id,
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: ENV.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
      paymentRecordId: payment.id,
      organizationId: organizationRecord?.id,
      bookingId: bookingRecord?.id,
      purpose: paymentPurpose,
      isExisting: false,
    };
  }

  /**
   * Verify cryptographic payment signature from client checkout completion and establish payment capture.
   */
  async verifyPayment(input: VerifyPaymentInput) {
    const { userId, orderId, paymentId, signature } = input;
    const secret = ENV.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error('Razorpay key secret is not configured on the server.');
    }

    const isValid = verifyRazorpayPaymentSignature({
      orderId,
      paymentId,
      signature,
      secret,
    });

    if (!isValid) {
      console.warn(
        `[PaymentService] Cryptographic signature check failed for orderId=${orderId}, paymentId=${paymentId}`
      );
      const error: any = new Error('Invalid or forged Razorpay payment signature.');
      error.statusCode = 400;
      throw error;
    }

    let payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId },
    });

    if (!payment) {
      const error: any = new Error(`Payment record with Razorpay Order ID '${orderId}' was not found.`);
      error.statusCode = 404;
      throw error;
    }

    if (payment.userId !== userId) {
      const error: any = new Error('Unauthorized access to this payment record.');
      error.statusCode = 403;
      throw error;
    }

    // Update payment to CAPTURED
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CAPTURED,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        capturedAt: new Date(),
      },
    });

    // Establish membership activation or booking confirmation
    if (payment.organizationId) {
      await this.activateMembership(userId, payment.organizationId, paymentId, payment.amount);
    }

    if (payment.bookingId) {
      await this.confirmBooking(payment.bookingId);
    }

    return {
      success: true,
      message: 'Payment verified and captured successfully.',
      payment: {
        id: payment.id,
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        capturedAt: payment.capturedAt,
      },
    };
  }

  /**
   * Handle server-to-server webhook notifications from Razorpay.
   * Cryptographically verifies signature using raw payload buffer and webhook secret.
   */
  async handleWebhook(rawBody: string | Buffer, signature: string, eventPayload: any) {
    const webhookSecret =
      ENV.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      ENV.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyRazorpayWebhookSignature({
        payload: rawBody,
        signature,
        secret: webhookSecret,
      });

      if (!isValid) {
        console.warn('[PaymentService] Razorpay webhook signature verification failed.');
        const error: any = new Error('Invalid webhook signature');
        error.statusCode = 400;
        throw error;
      }
    }

    const event = eventPayload?.event;
    console.info(`[PaymentService] Processing Razorpay webhook event: '${event}'`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = eventPayload?.payload?.payment?.entity;
      const orderEntity = eventPayload?.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId: orderId },
        });

        if (payment && payment.status !== PaymentStatus.CAPTURED) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.CAPTURED,
              razorpayPaymentId: paymentId || payment.razorpayPaymentId,
              capturedAt: new Date(),
            },
          });

          const targetOrgId = payment.organizationId || paymentEntity?.notes?.organizationId;
          if (targetOrgId) {
            await this.activateMembership(payment.userId, targetOrgId, paymentId, payment.amount);
          }

          if (payment.bookingId) {
            await this.confirmBooking(payment.bookingId);
          }

          console.info(`[PaymentService] Webhook successfully captured payment for order ${orderId}`);
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = eventPayload?.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await prisma.payment.updateMany({
          where: { razorpayOrderId: orderId },
          data: {
            status: PaymentStatus.FAILED,
            failedAt: new Date(),
            failureCode: paymentEntity?.error_code || 'GATEWAY_ERROR',
            failureDescription: paymentEntity?.error_description || 'Payment failed',
          },
        });
        console.info(`[PaymentService] Webhook recorded payment failure for order ${orderId}`);
      }
    }

    return { status: 'ok', received: true };
  }

  /**
   * Helper: Activate organization membership and dues after verified payment capture.
   */
  private async activateMembership(
    userId: string,
    organizationId: string,
    paymentId?: string,
    amount?: number
  ) {
    const club = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!club) return;

    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId,
      },
    });

    const now = new Date();
    const currentExpiry =
      existingRole?.validUntil && new Date(existingRole.validUntil) > now
        ? new Date(existingRole.validUntil)
        : now;
    const newValidUntil = new Date(currentExpiry.getTime() + 365 * 24 * 60 * 60 * 1000);

    if (existingRole) {
      await prisma.userRole.update({
        where: { id: existingRole.id },
        data: {
          role: existingRole.role === RoleType.STUDENT ? RoleType.MEMBER : existingRole.role,
          duesPaid: true,
          validUntil: newValidUntil,
        },
      });
    } else {
      await prisma.userRole.create({
        data: {
          id: uuidv7(),
          userId,
          organizationId,
          role: RoleType.MEMBER,
          duesPaid: true,
          validUntil: newValidUntil,
        },
      });
    }

    // Auto-approve pending membership application if one exists
    await prisma.membershipApplication.updateMany({
      where: {
        userId,
        organizationId,
        status: ApplicationStatus.PENDING,
      },
      data: {
        status: ApplicationStatus.APPROVED,
        reviewedAt: now,
      },
    });

    // Update dues record if one exists
    await prisma.duesRecord.updateMany({
      where: {
        organizationId,
        studentId: userId,
        paymentStatus: { in: ['PENDING', 'OVERDUE'] },
      },
      data: {
        paymentStatus: 'PAID',
        amountPaid: amount || club.membershipFee,
        outstandingBalance: 0,
        lastPaymentDate: now.toISOString(),
        transactionRef: paymentId || undefined,
      },
    });

    // Send student celebratory notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId,
        title: `🎉 Membership Dues Verified: ${club.name}`,
        message: `Your membership dues of ₹${Math.round(
          (amount || club.membershipFee) / 100
        )} for ${club.name} have been confirmed via Razorpay. Your membership is active through ${newValidUntil.toLocaleDateString()}.`,
        type: 'MEMBERSHIP_APPROVED',
        link: '/member/membership',
      },
    });
  }

  /**
   * Helper: Confirm event booking after verified payment capture.
   */
  private async confirmBooking(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { event: true, user: true },
    });
    if (!booking) return;

    if (booking.status !== EventBookingStatus.CONFIRMED) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: EventBookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      if (booking.event) {
        await prisma.event.update({
          where: { id: booking.eventId },
          data: {
            remainingSeats: Math.max(0, booking.event.remainingSeats - booking.quantity),
          },
        });
      }

      await prisma.notification.create({
        data: {
          id: uuidv7(),
          userId: booking.userId,
          title: `🎟️ Ticket Confirmed: ${booking.event.title}`,
          message: `Your payment has been verified via Razorpay! ${booking.quantity} ticket(s) have been confirmed.`,
          type: 'EVENT_BOOKING_CONFIRMED',
          link: '/student/events',
        },
      });

      const qrPayload = `CAMPUSMITRA:${booking.bookingNumber}:${booking.otpCode || '123456'}`;

      // Dispatch Email Confirmation via Nodemailer
      emailService
        .sendTicketConfirmationEmail({
          recipientEmail: booking.user?.email,
          recipientName: booking.user?.fullName || booking.user?.username || 'Student',
          bookingNumber: booking.bookingNumber,
          bookingId: booking.id,
          otpCode: booking.otpCode || '',
          eventTitle: booking.event.title,
          venue: booking.event.venue,
          startAt: booking.event.startAt,
          quantity: booking.quantity,
          totalAmountPaise: booking.totalAmount,
          qrPayload,
        })
        .catch((err) => {
          console.warn('⚠️ Background email notification warning:', err.message);
        });
    }
  }

}

export const paymentService = new PaymentService();
