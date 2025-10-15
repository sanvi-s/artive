import { config } from './config';
import { logger } from './utils/logger';
import app from './app';
import { connectWithRetry, disconnect } from './db/mongoose';

async function start() {
  try {
    await connectWithRetry(3);
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${(err as Error).message}`);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      try {
        await disconnect();
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();



