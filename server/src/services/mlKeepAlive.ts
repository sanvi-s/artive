import { config } from '../config/index';
import { logger } from '../utils/logger';

const PING_INTERVAL_MS = 10 * 60 * 1000;

export function startMlKeepAlive() {
  if (!config.mlServerUrl) return;

  const ping = async () => {
    try {
      const res = await fetch(`${config.mlServerUrl}/health`, {
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        logger.warn(`ML keep-alive ping failed: ${res.status}`);
      }
    } catch (err) {
      logger.warn(`ML keep-alive ping error: ${(err as Error).message}`);
    }
  };

  void ping();
  setInterval(ping, PING_INTERVAL_MS).unref();
  logger.info('ML service keep-alive started (every 10 minutes)');
}
