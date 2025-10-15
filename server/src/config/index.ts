import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiBaseUrl: requireEnv('API_BASE_URL', 'http://localhost:5000'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || process.env.API_BASE_URL || 'http://localhost:8080',
  mongoUri: requireEnv('MONGO_URI'),
  jwt: {
    secret: requireEnv('JWT_SECRET', 'change_me'),
    expiresIn: requireEnv('JWT_EXPIRES_IN', '7d'),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '30', 10),
  },
  cloudinary: {
    cloudName: requireEnv('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: requireEnv('CLOUDINARY_API_KEY', ''),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET', ''),
  },
  version: process.env.npm_package_version || '0.0.0',
} as const;



