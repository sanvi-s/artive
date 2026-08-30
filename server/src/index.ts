import { config } from './config';
import { logger } from './utils/logger';
import app from './app';
import { connectWithRetry, disconnect } from './db/mongoose';
import { startMlKeepAlive } from './services/mlKeepAlive';

async function start() {
  try {
    logger.info('Starting server...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Port: ${config.port}`);
    
    await connectWithRetry(3);
    logger.info('Connected to MongoDB successfully');
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${(err as Error).message}`);
    process.exit(1);
  }

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Server listening on port ${config.port}`);
    logger.info(`🌍 Environment: ${config.env}`);
    logger.info(`🔗 CORS Origin: ${(config as any).cors?.origin || 'Not set'}`);
    startMlKeepAlive();
  });

  // Add error handling for the server
  server.on('error', (err: any) => {
    logger.error(`Server error: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${config.port} is already in use`);
    }
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



