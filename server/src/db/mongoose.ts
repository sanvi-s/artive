import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from '../config';

let isConnected = false;

export async function connectWithRetry(maxAttempts = 3): Promise<typeof mongoose> {
  if (isConnected) return mongoose;
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await mongoose.connect(config.mongoUri, {
        // @ts-ignore - allow unknown options without type noise
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      });
      isConnected = true;
      logger.info(`MongoDB connected on attempt ${attempt}`);
      return mongoose;
    } catch (err) {
      const delay = attempt * 2000;
      logger.error(`MongoDB connection failed (attempt ${attempt}/${maxAttempts}): ${(err as Error).message}`);
      if (attempt >= maxAttempts) throw err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  return mongoose;
}

export async function disconnect(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}



