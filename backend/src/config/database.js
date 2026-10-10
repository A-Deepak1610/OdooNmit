import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

// Central singleton PrismaClient instance
let prismaInstance = null;

/**
 * Returns the singleton Prisma client instance.
 * Reuses connection pool across the application.
 */
export const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: env.isDevelopment ? ['warn', 'error'] : ['error'],
      errorFormat: 'minimal',
    });
  }
  return prismaInstance;
};

export const prisma = getPrismaClient();

/**
 * Executes a lightweight raw ping query (SELECT 1) against the database
 * with a strictly bounded timeout to avoid hanging requests or retry storms.
 *
 * @param {number} timeoutMs - Timeout in milliseconds (default: 3000ms)
 * @returns {Promise<{ ok: boolean, latencyMs: number }>}
 */
export const checkDatabaseConnection = async (timeoutMs = 5000) => {
  const startTime = Date.now();
  const client = getPrismaClient();

  const queryPromise = client.$queryRawUnsafe('SELECT 1');
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Database check timed out after ${timeoutMs}ms`)), timeoutMs)
  );

  try {
    await Promise.race([queryPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;
    return { ok: true, latencyMs };
  } catch (error) {
    logger.error('Database connection check failed', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Gracefully disconnects Prisma client during shutdown.
 */
export const disconnectDatabase = async () => {
  if (prismaInstance) {
    try {
      await prismaInstance.$disconnect();
      logger.info('Prisma client disconnected successfully.');
    } catch (err) {
      logger.error('Error disconnecting Prisma client', { error: err.message });
    }
  }
};
