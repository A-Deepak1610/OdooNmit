import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { disconnectDatabase, checkDatabaseConnection } from './config/database.js';

const server = app.listen(env.PORT, async () => {
  logger.info(`Server started successfully on port ${env.PORT}`, {
    port: env.PORT,
    environment: env.NODE_ENV,
    service: env.APP_NAME,
  });

  // Verify and log database connection immediately on startup
  try {
    const dbStatus = await checkDatabaseConnection(5000);
    logger.info(`Database connected successfully (TiDB latency: ${dbStatus.latencyMs}ms)`);
  } catch (err) {
    logger.warn(`Initial database connection probe warning: ${err.message}`);
  }
});

/**
 * Handles graceful shutdown by terminating in-flight requests and database connections.
 */
const handleGracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDatabase();
    logger.info('Shutdown complete. Process exiting.');
    process.exit(0);
  });

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    logger.error('Forceful shutdown timeout exceeded (10s). Exiting immediately.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', {
    error: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
