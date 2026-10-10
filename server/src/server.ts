import { app } from './app.js';
import { ENV } from './config/env.js';
import { prisma } from './config/prisma.js';

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to TiDB MySQL Database successfully.');

    const server = app.listen(ENV.PORT, () => {
      console.log(`🚀 [${ENV.APP_NAME}] running on http://localhost:${ENV.PORT}`);
      console.log(`📡 API Endpoints available at http://localhost:${ENV.PORT}/api/v1`);
      console.log(`🔒 Environment: ${ENV.NODE_ENV}`);
    });

    const shutdown = async () => {
      console.log('⏳ Gracefully shutting down...');
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
