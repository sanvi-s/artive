"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = require("./db/mongoose");
async function start() {
    try {
        await (0, mongoose_1.connectWithRetry)(3);
    }
    catch (err) {
        logger_1.logger.error(`Failed to connect to MongoDB: ${err.message}`);
        process.exit(1);
    }
    const server = app_1.default.listen(config_1.config.port, () => {
        logger_1.logger.info(`Server listening on port ${config_1.config.port}`);
    });
    const shutdown = async (signal) => {
        logger_1.logger.info(`Received ${signal}, shutting down gracefully...`);
        server.close(async () => {
            try {
                await (0, mongoose_1.disconnect)();
            }
            finally {
                process.exit(0);
            }
        });
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
start();
