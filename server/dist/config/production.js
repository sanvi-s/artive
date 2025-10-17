"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionConfig = void 0;
const index_1 = require("./index");
// Production-specific configuration overrides
exports.productionConfig = {
    ...index_1.config,
    // Ensure we're in production mode
    env: 'production',
    // Production logging configuration
    logging: {
        level: 'info',
        format: 'json',
    },
    // Production CORS configuration
    cors: {
        origin: process.env.FRONTEND_ORIGIN || 'https://artive.vercel.app',
        credentials: true,
        optionsSuccessStatus: 200,
    },
    // Production rate limiting (more restrictive)
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    },
    // Production security headers
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
                    scriptSrc: ["'self'"],
                    connectSrc: ["'self'", "https://api.cloudinary.com"],
                },
            },
        },
    },
    // Production database configuration
    database: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    // Production JWT configuration
    jwt: {
        ...index_1.config.jwt,
        // Ensure we have a strong secret in production
        secret: process.env.JWT_SECRET || (() => {
            throw new Error('JWT_SECRET must be set in production');
        })(),
    },
};
exports.default = exports.productionConfig;
