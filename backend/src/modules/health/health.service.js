import { checkDatabaseConnection } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';

/**
 * Health check business service.
 */
export const healthService = {
  /**
   * Process liveness check.
   * Does not perform external network or database calls.
   */
  getLiveness() {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: env.APP_NAME,
      environment: env.NODE_ENV,
    };
  },

  /**
   * Process readiness check.
   * Verifies database connectivity using bounded timeout raw query.
   */
  async getReadiness() {
    try {
      const dbResult = await checkDatabaseConnection(5000);
      return {
        status: 'ready',
        database: {
          status: 'connected',
          latencyMs: dbResult.latencyMs,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      throw new AppError('Service unavailable: Database connection check failed', 503, {
        database: 'disconnected',
      });
    }
  },

  /**
   * Concise overall system health summary.
   */
  async getHealthSummary() {
    let dbStatus = 'disconnected';
    let dbLatencyMs = null;
    let isReady = false;

    try {
      const dbResult = await checkDatabaseConnection(5000);
      dbStatus = 'connected';
      dbLatencyMs = dbResult.latencyMs;
      isReady = true;
    } catch {
      // In summary, report degraded status if DB is disconnected
      dbStatus = 'disconnected';
    }

    return {
      status: isReady ? 'healthy' : 'degraded',
      service: env.APP_NAME,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        process: 'ok',
        database: {
          status: dbStatus,
          ...(dbLatencyMs !== null ? { latencyMs: dbLatencyMs } : {}),
        },
      },
    };
  },
};
