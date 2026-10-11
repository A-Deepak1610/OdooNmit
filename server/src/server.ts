import { app } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';
import { redis } from './config/redis.js';
import { initSqlBotServer, stopSqlBotServer } from './config/sql-bot.js';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to TiDB MySQL Database successfully.');

    // Connect to Redis for ticket reservation concurrency
    try {
      await redis.connect();
      console.log(`✅ Connected to Redis cache & concurrency engine at ${ENV.REDIS_URL}`);
    } catch (rErr: any) {
      console.warn('⚠️ Redis initial connection notice:', rErr.message);
    }

    // Initialize Python SQL Chatbot server on port 8001
    await initSqlBotServer();

    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀 [${ENV.APP_NAME}] running on http://localhost:${ENV.PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${ENV.PORT}/api/v1`);
      console.log(`🔒 Environment: ${ENV.NODE_ENV}`);
    });

    const shutdown = async () => {
      console.log('⏳ Gracefully shutting down...');
      stopSqlBotServer();
      try {
        await redis.quit();
      } catch (_) {}
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🛑 Server and Database connections closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

bootstrap();
