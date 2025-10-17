"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const crypto_1 = require("crypto");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const production_1 = require("./config/production");
const logger_1 = require("./utils/logger");
const misc_1 = __importDefault(require("./routes/misc"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const seeds_1 = __importDefault(require("./routes/seeds"));
const forks_1 = __importDefault(require("./routes/forks"));
const lineage_1 = __importDefault(require("./routes/lineage"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const search_1 = __importDefault(require("./routes/search"));
const app = (0, express_1.default)();
// Use production config in production environment
const currentConfig = config_1.config.env === 'production' ? production_1.productionConfig : config_1.config;
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
app.use((0, morgan_1.default)('tiny'));
// Attach a request id and log arrivals
app.use((req, _res, next) => {
    req.id = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
    next();
});
app.use((req, _res, next) => {
    const rid = req.id;
    logger_1.logger.info(`${req.method} ${req.originalUrl} [rid=${rid}]`);
    next();
});
app.use((0, cors_1.default)(currentConfig.cors));
const limiter = (0, express_rate_limit_1.default)(currentConfig.rateLimit);
// Apply limiter only to write routes later; for now, apply globally low limits
app.use(limiter);
// Routes
app.use('/api', misc_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/seeds', seeds_1.default);
app.use('/api/seeds/:id/forks', forks_1.default);
app.use('/api/forks', forks_1.default);
app.use('/api/lineage', lineage_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/search', search_1.default);
// On startup, print route table
function listRoutes(stack, prefix = '') {
    const out = [];
    for (const layer of stack) {
        if (layer.route && layer.route.path) {
            const methods = Object.keys(layer.route.methods).filter(Boolean).join(',').toUpperCase();
            out.push(`${methods} ${prefix}${layer.route.path}`);
        }
        else if (layer.name === 'router' && layer.handle?.stack) {
            const path = layer.regexp?.fast_star ? '*' : (layer.regexp?.fast_slash ? '/' : layer?.regexp?.toString());
            out.push(...listRoutes(layer.handle.stack, prefix));
        }
    }
    return out;
}
setImmediate(() => {
    try {
        const routerStack = app?._router?.stack;
        if (!routerStack)
            return;
        const routes = listRoutes(routerStack, '');
        logger_1.logger.info(`Mounted routes (count=${routes.length}):\n` + routes.sort().join('\n'));
    }
    catch (err) {
        logger_1.logger.warn(`Failed to list routes: ${err?.message || 'unknown error'}`);
    }
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: { message: 'Not Found' } });
});
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    logger_1.logger.error(err?.stack || err?.message || 'Unknown error');
    const status = err.status || 500;
    res.status(status).json({ error: { message: err.message || 'Internal Server Error' } });
});
exports.default = app;
