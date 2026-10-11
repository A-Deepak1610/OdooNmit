import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { prisma } from '../../config/prisma.js';
import {
  redis,
  REDIS_KEYS,
  RESERVE_SEATS_LUA,
  RELEASE_SEATS_LUA,
  CONFIRM_SEATS_LUA,
  RESERVATION_TTL_SECONDS,
} from '../../config/redis.js';
import { RoleType } from '@prisma/client';
import { emailService } from '../../common/services/email.service.js';


export interface ReserveTicketResult {
  bookingWindowToken: string;
  bookingId: string;
  bookingNumber: string;
  eventId: string;
  eventTitle: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  isMemberPriceApplied: boolean;
  expiresAt: string;
  remainingSeconds: number;
  remainingSeatsInPool: number;
  message: string;
}

export interface ConfirmBookingResult {
  booking: any;
  payment: any;
  qrPayload: string;
  otpCode: string;
  message: string;
}

export class TicketReservationService {
  private reconcilerTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startReconciler();
  }

  /**
   * Start periodic background reconciler to release expired DB reservations
   * and sync Redis pool.
   */
  private startReconciler() {
    if (this.reconcilerTimer) return;
    this.reconcilerTimer = setInterval(() => {
      this.cleanupExpiredReservations().catch((err) => {
        console.warn('⚠️ Reservation reconciler warning:', err.message);
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Sync event seat pool in Redis from DB if missing or stale
   */
  async syncEventSeatsInRedis(eventId: string): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { remainingSeats: true },
    });

    if (!event) {
      throw new Error(`Event '${eventId}' not found.`);
    }

    // Count any currently active, unexpired RESERVED bookings in DB
    const activeReserved = await prisma.booking.aggregate({
      where: {
        eventId,
        status: 'RESERVED',
        reservationExpiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    });

    const reservedCount = activeReserved._sum.quantity || 0;
    const availableSeats = Math.max(0, event.remainingSeats - reservedCount);

    await redis.set(REDIS_KEYS.EVENT_SEATS(eventId), availableSeats);
    return availableSeats;
  }

  /**
   * Reserve Ticket(s) with Redis Atomic Lua Lock (5-minute booking window)
   * Prevents race conditions and double bookings under heavy concurrent load.
   */
  async reserveTicket(
    userId: string,
    eventId: string,
    requestedQuantity: number = 1
  ): Promise<ReserveTicketResult> {
    const qty = Math.max(1, Math.min(10, Number(requestedQuantity) || 1));

    // 1. Fetch Event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organization: true },
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.status === 'CANCELLED' || event.status === 'COMPLETED') {
      throw new Error(`Cannot reserve tickets. Event is ${event.status.toLowerCase()}.`);
    }

    // 2. Check Member vs Standard pricing
    const membershipRole = await prisma.userRole.findFirst({
      where: {
        userId,
        organizationId: event.organizationId,
        role: {
          in: [
            RoleType.MEMBER,
            RoleType.PRESIDENT,
            RoleType.TREASURER,
            RoleType.EVENT_ORGANIZER,
            RoleType.VOLUNTEER,
          ],
        },
      },
    });

    const isMember = !!membershipRole;
    const unitPrice = isMember ? event.memberPrice : event.nonMemberPrice;
    const totalAmount = unitPrice * qty;

    // 3. Generate Booking Window Token & Identifiers
    const bookingWindowToken = `BWT-${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
    const bookingNumber = `TKT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000);

    const reservationPayload = {
      token: bookingWindowToken,
      bookingNumber,
      userId,
      eventId,
      quantity: qty,
      unitPrice,
      totalAmount,
      otpCode,
      isMember,
      expiresAt: expiresAt.toISOString(),
      reservedAt: new Date().toISOString(),
    };

    // 4. Atomic Redis Lua Execution
    const seatKey = REDIS_KEYS.EVENT_SEATS(eventId);
    const reservationKey = REDIS_KEYS.RESERVATION(bookingWindowToken);
    const userResKey = REDIS_KEYS.USER_RESERVATIONS(userId);

    const result = (await redis.eval(
      RESERVE_SEATS_LUA,
      3,
      seatKey,
      reservationKey,
      userResKey,
      qty,
      bookingWindowToken,
      JSON.stringify(reservationPayload),
      RESERVATION_TTL_SECONDS,
      event.remainingSeats
    )) as [number, number];

    const [status, remainingSeats] = result;

    if (status === 0) {
      if (remainingSeats <= 0) {
        throw new Error('Tickets are SOLD OUT for this event. No seats available.');
      } else {
        throw new Error(
          `Only ${remainingSeats} seat(s) currently available. Could not reserve ${qty} ticket(s).`
        );
      }
    }

    // 5. Create RESERVED Booking record in MySQL DB
    const bookingId = uuidv7();
    const booking = await prisma.booking.create({
      data: {
        id: bookingId,
        bookingNumber,
        userId,
        eventId,
        quantity: qty,
        unitPrice,
        totalAmount,
        currency: 'INR',
        status: 'RESERVED',
        reservationExpiresAt: expiresAt,
        otpCode,
        bookingToken: bookingWindowToken,
      },
      include: {
        event: { select: { id: true, title: true, venue: true, startAt: true } },
      },
    });

    return {
      bookingWindowToken,
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      eventId: event.id,
      eventTitle: event.title,
      quantity: qty,
      unitPrice,
      totalAmount,
      isMemberPriceApplied: isMember,
      expiresAt: expiresAt.toISOString(),
      remainingSeconds: RESERVATION_TTL_SECONDS,
      remainingSeatsInPool: remainingSeats,
      message: `Held ${qty} seat(s) for 5 minutes. Complete checkout before window expires.`,
    };
  }

  /**
   * Confirm Booking using valid Booking Window Token
   * Verifies 5-minute TTL has not lapsed, captures payment, sets CONFIRMED status.
   */
  async confirmBooking(
    userId: string,
    eventId: string,
    data: {
      bookingWindowToken: string;
      paymentMethod?: string;
      razorpayPaymentId?: string;
      razorpayOrderId?: string;
    }
  ): Promise<ConfirmBookingResult> {
    const { bookingWindowToken, paymentMethod, razorpayPaymentId, razorpayOrderId } = data;

    if (!bookingWindowToken) {
      throw new Error('A valid bookingWindowToken is required to confirm ticket booking.');
    }

    // 1. Atomically consume token from Redis
    const reservationKey = REDIS_KEYS.RESERVATION(bookingWindowToken);
    const userResKey = REDIS_KEYS.USER_RESERVATIONS(userId);

    const result = (await redis.eval(
      CONFIRM_SEATS_LUA,
      2,
      reservationKey,
      userResKey,
      bookingWindowToken
    )) as [number, string | null];

    const [status, reservationJson] = result;

    if (status === 0 || !reservationJson) {
      // Check if DB has the booking to see if it expired
      const expiredBooking = await prisma.booking.findFirst({
        where: { bookingToken: bookingWindowToken },
      });

      if (expiredBooking && expiredBooking.status === 'RESERVED') {
        await prisma.booking.update({
          where: { id: expiredBooking.id },
          data: { status: 'EXPIRED' },
        });
      }

      throw new Error(
        'Your 5-minute booking reservation window has EXPIRED. Seats have been released. Please reserve again.'
      );
    }

    const resData = JSON.parse(reservationJson);

    // Verify token belongs to requesting user
    if (resData.userId !== userId) {
      throw new Error('Unauthorized: This reservation belongs to another user.');
    }

    if (resData.eventId !== eventId) {
      throw new Error('Mismatch: Reservation token is for a different event.');
    }

    // 2. Find DB Booking
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [{ bookingToken: bookingWindowToken }, { bookingNumber: resData.bookingNumber }],
      },
      include: {
        event: { include: { organization: true } },
        user: true,
      },
    });

    if (!booking) {
      throw new Error('Booking record not found for reservation token.');
    }

    if (booking.status === 'CONFIRMED') {
      throw new Error('This booking has already been confirmed.');
    }

    // 3. Mark Booking as CONFIRMED in MySQL
    const confirmedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        reservationExpiresAt: null,
      },
      include: {
        event: { include: { organization: true } },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 4. Create Payment Record
    const payId =
      razorpayPaymentId || `pay_res_${Math.random().toString(36).substring(2, 11)}`;
    const orderId =
      razorpayOrderId || `order_res_${Math.random().toString(36).substring(2, 11)}`;

    const payment = await prisma.payment.create({
      data: {
        id: uuidv7(),
        userId,
        bookingId: confirmedBooking.id,
        status: 'CAPTURED',
        amount: confirmedBooking.totalAmount,
        currency: 'INR',
        razorpayPaymentId: payId,
        razorpayOrderId: orderId,
        capturedAt: new Date(),
      },
    });

    // 5. Decrement persistent seats in DB Event record
    await prisma.event.update({
      where: { id: eventId },
      data: {
        remainingSeats: Math.max(0, confirmedBooking.event.remainingSeats - confirmedBooking.quantity),
      },
    });

    // 6. Create Notification
    await prisma.notification.create({
      data: {
        id: uuidv7(),
        userId,
        title: `🎟️ Ticket Confirmed: ${confirmedBooking.event.title}`,
        message: `Your booking #${confirmedBooking.bookingNumber} is confirmed! OTP: ${confirmedBooking.otpCode}. Venue: ${confirmedBooking.event.venue}.`,
        type: 'TICKET_CONFIRMED',
        link: '/member/tickets',
      },
    });

    const qrPayload = `CAMPUSMITRA:${confirmedBooking.bookingNumber}:${confirmedBooking.otpCode}`;

    // 7. Dispatch Ticket Email Confirmation via Nodemailer
    emailService
      .sendTicketConfirmationEmail({
        recipientEmail: confirmedBooking.user?.email,
        recipientName: confirmedBooking.user?.fullName || confirmedBooking.user?.username || 'Student',
        bookingNumber: confirmedBooking.bookingNumber,
        bookingId: confirmedBooking.id,
        otpCode: confirmedBooking.otpCode || '',
        eventTitle: confirmedBooking.event.title,
        venue: confirmedBooking.event.venue,
        startAt: confirmedBooking.event.startAt,
        quantity: confirmedBooking.quantity,
        totalAmountPaise: confirmedBooking.totalAmount,
        qrPayload,
      })
      .catch((err) => {
        console.warn('⚠️ Background email notification warning:', err.message);
      });

    return {
      booking: confirmedBooking,
      payment,
      qrPayload,
      otpCode: confirmedBooking.otpCode || '',
      message: 'Booking confirmed successfully! Digital pass and check-in OTP generated.',
    };

  }

  /**
   * Release/Cancel Reservation (e.g. user dismisses modal or cancels order)
   * Restores seats atomically back to Redis pool and marks DB booking CANCELLED.
   */
  async releaseReservation(
    userId: string,
    eventId: string,
    bookingWindowToken: string
  ): Promise<{ success: boolean; remainingSeats: number; message: string }> {
    const seatKey = REDIS_KEYS.EVENT_SEATS(eventId);
    const reservationKey = REDIS_KEYS.RESERVATION(bookingWindowToken);
    const userResKey = REDIS_KEYS.USER_RESERVATIONS(userId);

    const result = (await redis.eval(
      RELEASE_SEATS_LUA,
      3,
      seatKey,
      reservationKey,
      userResKey,
      bookingWindowToken
    )) as [number, number, number];

    const [status, newRemaining] = result;

    // Update DB booking status to CANCELLED
    await prisma.booking.updateMany({
      where: {
        bookingToken: bookingWindowToken,
        status: 'RESERVED',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return {
      success: status === 1,
      remainingSeats: newRemaining,
      message: 'Reservation cancelled. Seats released back to the event pool.',
    };
  }

  /**
   * Check Reservation Status / Remaining TTL
   */
  async getReservationStatus(bookingWindowToken: string): Promise<{
    valid: boolean;
    remainingSeconds: number;
    reservation: any | null;
  }> {
    const reservationKey = REDIS_KEYS.RESERVATION(bookingWindowToken);
    const [ttl, dataStr] = await Promise.all([
      redis.ttl(reservationKey),
      redis.get(reservationKey),
    ]);

    if (ttl <= 0 || !dataStr) {
      return { valid: false, remainingSeconds: 0, reservation: null };
    }

    return {
      valid: true,
      remainingSeconds: ttl,
      reservation: JSON.parse(dataStr),
    };
  }

  /**
   * Clean up expired reservations from MySQL and restore to Redis
   */
  async cleanupExpiredReservations(): Promise<number> {
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'RESERVED',
        reservationExpiresAt: {
          lt: new Date(),
        },
      },
    });

    if (expiredBookings.length === 0) return 0;

    for (const b of expiredBookings) {
      // Update DB status to EXPIRED
      await prisma.booking.update({
        where: { id: b.id },
        data: { status: 'EXPIRED' },
      });

      // If token still exists in Redis, clean it
      if (b.bookingToken) {
        await redis.del(REDIS_KEYS.RESERVATION(b.bookingToken));
        await redis.srem(REDIS_KEYS.USER_RESERVATIONS(b.userId), b.bookingToken);
      }

      // Check if seats key exists in Redis, restore seats
      const seatKey = REDIS_KEYS.EVENT_SEATS(b.eventId);
      const exists = await redis.exists(seatKey);
      if (exists) {
        await redis.incrby(seatKey, b.quantity);
      }
    }

    console.log(`🧹 Cleaned up ${expiredBookings.length} expired reservations and restored seats.`);
    return expiredBookings.length;
  }
}

export const ticketReservationService = new TicketReservationService();
