import { Redis } from 'ioredis';
import { ENV } from './env.js';

export const RESERVATION_TTL_SECONDS = 300; // 5 minutes validity window

// Initialize Redis Client
export const redis: Redis = new Redis(ENV.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('🔌 Redis client connected successfully.');
});

redis.on('ready', () => {
  console.log('⚡ Redis ready for fast concurrency operations.');
});

redis.on('error', (err: any) => {
  console.error('❌ Redis Connection Error:', err?.message || err);
});


// Cache Key Definitions
export const REDIS_KEYS = {
  EVENT_SEATS: (eventId: string) => `event:${eventId}:available_seats`,
  RESERVATION: (token: string) => `reservation:${token}`,
  USER_RESERVATIONS: (userId: string) => `user:${userId}:reservations`,
};

// =============================================================================
// ATOMIC LUA SCRIPTS FOR HIGH-CONCURRENCY RACE CONDITION PREVENTION
// =============================================================================

/**
 * Atomic Lua script to reserve seats:
 * - Checks availability in Redis (initializes from DB if missing).
 * - Decrements seats atomically if enough are available.
 * - Saves reservation token with strict 300-second (5 min) TTL.
 * - Returns [1, remainingSeats] on success or [0, currentAvailable] on failure.
 */
export const RESERVE_SEATS_LUA = `
local seatKey = KEYS[1]
local reservationKey = KEYS[2]
local userResKey = KEYS[3]

local requestedQty = tonumber(ARGV[1])
local token = ARGV[2]
local reservationJson = ARGV[3]
local ttlSeconds = tonumber(ARGV[4])
local initialSeats = tonumber(ARGV[5])

-- Initialize seats key in Redis if it does not exist yet
if redis.call('EXISTS', seatKey) == 0 then
  redis.call('SET', seatKey, initialSeats)
end

local currentAvailable = tonumber(redis.call('GET', seatKey)) or 0

if currentAvailable < requestedQty then
  return {0, currentAvailable}
end

-- Atomically decrement seats
local newRemaining = redis.call('DECRBY', seatKey, requestedQty)

-- Atomically store reservation token with 5 min (300s) TTL
redis.call('SETEX', reservationKey, ttlSeconds, reservationJson)
redis.call('SADD', userResKey, token)
redis.call('EXPIRE', userResKey, ttlSeconds)

return {1, newRemaining}
`;

/**
 * Atomic Lua script to release/cancel reservation:
 * - Checks if reservation exists.
 * - Deletes reservation and restores seats atomically.
 */
export const RELEASE_SEATS_LUA = `
local seatKey = KEYS[1]
local reservationKey = KEYS[2]
local userResKey = KEYS[3]
local token = ARGV[1]

local reservationJson = redis.call('GET', reservationKey)
if not reservationJson then
  return {0, 0}
end

redis.call('DEL', reservationKey)
redis.call('SREM', userResKey, token)

local data = cjson.decode(reservationJson)
local qty = tonumber(data.quantity) or 1
local newRemaining = redis.call('INCRBY', seatKey, qty)

return {1, newRemaining, qty}
`;

/**
 * Atomic Lua script to confirm reservation on payment:
 * - Validates reservation token exists and has not expired.
 * - Atomically consumes the token so it cannot be double-used or cancelled.
 */
export const CONFIRM_SEATS_LUA = `
local reservationKey = KEYS[1]
local userResKey = KEYS[2]
local token = ARGV[1]

local reservationJson = redis.call('GET', reservationKey)
if not reservationJson then
  return {0, nil}
end

-- Consume token atomically
redis.call('DEL', reservationKey)
redis.call('SREM', userResKey, token)

return {1, reservationJson}
`;

/**
 * Ping and check Redis health
 */
export async function checkRedisHealth(): Promise<{ status: string; latencyMs: number }> {
  const start = Date.now();
  await redis.ping();
  const latencyMs = Date.now() - start;
  return { status: 'ok', latencyMs };
}
