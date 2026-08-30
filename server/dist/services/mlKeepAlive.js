"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMlKeepAlive = startMlKeepAlive;
const index_1 = require("../config/index");
const logger_1 = require("../utils/logger");
const PING_INTERVAL_MS = 10 * 60 * 1000;
function startMlKeepAlive() {
    if (!index_1.config.mlServerUrl)
        return;
    const ping = async () => {
        try {
            const res = await fetch(`${index_1.config.mlServerUrl}/health`, {
                signal: AbortSignal.timeout(30000),
            });
            if (!res.ok) {
                logger_1.logger.warn(`ML keep-alive ping failed: ${res.status}`);
            }
        }
        catch (err) {
            logger_1.logger.warn(`ML keep-alive ping error: ${err.message}`);
        }
    };
    void ping();
    setInterval(ping, PING_INTERVAL_MS).unref();
    logger_1.logger.info('ML service keep-alive started (every 10 minutes)');
}
