import { test, describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { redis, REDIS_KEYS, checkRedisHealth } from '../../config/redis.js';
import { ticketReservationService } from './ticket-reservation.service.js';
import { prisma } from '../../config/prisma.js';
import { v7 as uuidv7 } from 'uuid';

describe('🎟️ Redis Concurrency & Ticket Reservation Test Suite', () => {
  let testEventId: string;
  let testUserId: string;

  before(async () => {
    // 1. Verify Redis is running and responding
    const health = await checkRedisHealth();
    assert.equal(health.status, 'ok', 'Redis should be healthy and responding to PING');

    // 2. Fetch or create a valid user for testing
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: uuidv7(),
          username: `test_concurrency_${Date.now()}`,
          email: `test_concurrency_${Date.now()}@nmit.ac.in`,
          fullName: 'Concurrency Test User',
        },
      });
    }
    testUserId = user.id;

    // 3. Fetch or create a test organization & event
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          id: uuidv7(),
          name: 'Tech Club',
          slug: `tech-club-${Date.now()}`,
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        id: uuidv7(),
        title: `Flash Concurrency Hackathon ${Date.now()}`,
        slug: `concurrency-test-${Date.now()}`,
        description: 'Testing high-concurrency ticket booking with Redis lock',
        venue: 'Main Auditorium',
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 172800000),
        totalSeats: 5,
        remainingSeats: 5, // Only 5 seats available!
        memberPrice: 10000,
        nonMemberPrice: 20000,
        status: 'PUBLISHED',
        organizationId: org.id,
      },
    });
    testEventId = event.id;

    // Initialize Redis pool for this event with 5 seats
    await redis.set(REDIS_KEYS.EVENT_SEATS(testEventId), 5);
  });

  after(async () => {
    // Clean up test event and keys
    if (testEventId) {
      await redis.del(REDIS_KEYS.EVENT_SEATS(testEventId));
      await prisma.payment.deleteMany({ where: { booking: { eventId: testEventId } } }).catch(() => {});
      await prisma.booking.deleteMany({ where: { eventId: testEventId } }).catch(() => {});
      await prisma.event.delete({ where: { id: testEventId } }).catch(() => {});
    }
    await redis.quit();
    await prisma.$disconnect();
    setTimeout(() => process.exit(0), 100);
  });


  it('1. Verifies Redis health and Docker container connectivity', async () => {
    const ping = await redis.ping();
    assert.equal(ping, 'PONG');
  });

  it('2. Reserves a ticket atomically and generates a 5-minute booking window token', async () => {
    const res = await ticketReservationService.reserveTicket(testUserId, testEventId, 1);

    assert.ok(res.bookingWindowToken, 'Should generate bookingWindowToken');
    assert.match(res.bookingWindowToken, /^BWT-/, 'Token should have BWT- prefix');
    assert.equal(res.quantity, 1);
    assert.equal(res.remainingSeconds, 300, 'Window should be exactly 300 seconds (5 min)');
    assert.equal(res.remainingSeatsInPool, 4, 'Remaining seats in pool should be 4');

    // Verify token exists in Redis with TTL
    const ttl = await redis.ttl(REDIS_KEYS.RESERVATION(res.bookingWindowToken));
    assert.ok(ttl > 290 && ttl <= 300, `TTL should be close to 300s, got ${ttl}`);

    // Verify status endpoint
    const status = await ticketReservationService.getReservationStatus(res.bookingWindowToken);
    assert.equal(status.valid, true);
    assert.equal(status.reservation.token, res.bookingWindowToken);
  });

  it('3. Prevents race conditions and double bookings under 20 concurrent requests for remaining 4 seats', async () => {
    // 4 seats remaining. We will fire 20 simultaneous reservation requests at the EXACT same millisecond!
    const concurrentRequests = 20;
    const promises: Promise<{ success: boolean; data?: any; error?: string }>[] = [];

    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(
        ticketReservationService
          .reserveTicket(testUserId, testEventId, 1)
          .then((data) => ({ success: true, data }))
          .catch((err) => ({ success: false, error: err.message }))
      );
    }

    const results = await Promise.all(promises);

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    console.log(`\n📊 Concurrency Battle Results:`);
    console.log(`   Total Simultaneous Requests: ${concurrentRequests}`);
    console.log(`   Successful Reservations:     ${successes.length} (Expected: 4)`);
    console.log(`   Rejected / Sold Out:        ${failures.length} (Expected: 16)`);

    // EXACTLY 4 must succeed, no more, no less
    assert.equal(
      successes.length,
      4,
      `Expected exactly 4 successful reservations, but got ${successes.length}. Race condition detected if > 4!`
    );

    // Remaining 16 must have failed due to sold out / insufficient seats
    assert.equal(failures.length, 16);
    failures.forEach((f) => {
      assert.match(f.error || '', /SOLD OUT|available/i);
    });

    // Check Redis seat pool: must be strictly 0
    const finalSeatsInRedis = Number(await redis.get(REDIS_KEYS.EVENT_SEATS(testEventId)));
    assert.equal(finalSeatsInRedis, 0, 'Redis available seats must be exactly 0 (no negative drift)');
  });

  it('4. Releasing a reservation restores seat back to Redis pool immediately', async () => {
    // Find one active reservation for this event
    const activeBooking = await prisma.booking.findFirst({
      where: { eventId: testEventId, status: 'RESERVED' },
    });
    assert.ok(activeBooking && activeBooking.bookingToken);

    // Release it
    const releaseRes = await ticketReservationService.releaseReservation(
      testUserId,
      testEventId,
      activeBooking.bookingToken
    );
    assert.equal(releaseRes.success, true);
    assert.equal(releaseRes.remainingSeats, 1, 'Restored seat count should be 1');

    // Redis seats should now be 1
    const seatsNow = Number(await redis.get(REDIS_KEYS.EVENT_SEATS(testEventId)));
    assert.equal(seatsNow, 1);

    // Another user can now grab this restored seat!
    const newRes = await ticketReservationService.reserveTicket(testUserId, testEventId, 1);
    assert.ok(newRes.bookingWindowToken);
    assert.equal(newRes.remainingSeatsInPool, 0);
  });

  it('5. Confirms booking within 5-minute window and marks status CONFIRMED', async () => {
    // Grab the newest reservation
    const newestBooking = await prisma.booking.findFirst({
      where: { eventId: testEventId, status: 'RESERVED' },
    });
    assert.ok(newestBooking && newestBooking.bookingToken);

    const confirmed = await ticketReservationService.confirmBooking(testUserId, testEventId, {
      bookingWindowToken: newestBooking.bookingToken,
      paymentMethod: 'campus_pay',
    });

    assert.equal(confirmed.booking.status, 'CONFIRMED');
    assert.ok(confirmed.qrPayload.startsWith('CAMPUSMITRA:'));
    assert.ok(confirmed.otpCode);
    assert.equal(confirmed.payment.status, 'CAPTURED');

    // Token should now be consumed in Redis
    const status = await ticketReservationService.getReservationStatus(newestBooking.bookingToken);
    assert.equal(status.valid, false, 'Token should be consumed and invalid after confirmation');
  });
});
