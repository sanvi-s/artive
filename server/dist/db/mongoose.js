"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectWithRetry = connectWithRetry;
exports.disconnect = disconnect;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
let isConnected = false;
async function connectWithRetry(maxAttempts = 3) {
    if (isConnected)
        return mongoose_1.default;
    let attempt = 0;
    while (attempt < maxAttempts) {
        attempt += 1;
        try {
            await mongoose_1.default.connect(config_1.config.mongoUri, {
                // @ts-ignore - allow unknown options without type noise
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 5,
            });
            isConnected = true;
            logger_1.logger.info(`MongoDB connected on attempt ${attempt}`);
            return mongoose_1.default;
        }
        catch (err) {
            const delay = attempt * 2000;
            logger_1.logger.error(`MongoDB connection failed (attempt ${attempt}/${maxAttempts}): ${err.message}`);
            if (attempt >= maxAttempts)
                throw err;
            await new Promise((res) => setTimeout(res, delay));
        }
    }
    return mongoose_1.default;
}
async function disconnect() {
    if (!isConnected)
        return;
    await mongoose_1.default.disconnect();
    isConnected = false;
}
