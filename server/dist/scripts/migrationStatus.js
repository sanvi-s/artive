"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = require("../db/mongoose");
const logger_1 = require("../utils/logger");
const migrationService_1 = require("../services/migrationService");
async function main() {
    await (0, mongoose_1.connectWithRetry)(3);
    const migrationsDir = path_1.default.resolve(__dirname, '../migrations');
    const files = fs_1.default
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
        .sort();
    const applied = await (0, migrationService_1.getAppliedMigrationIds)();
    const appliedList = [];
    const pendingList = [];
    for (const file of files) {
        const mod = require(path_1.default.join(migrationsDir, file));
        const mig = mod.default || mod;
        if (!mig?.id)
            continue;
        if (applied.has(mig.id))
            appliedList.push(mig.id);
        else
            pendingList.push(mig.id);
    }
    logger_1.logger.info(`Applied: ${appliedList.length}\n${appliedList.join('\n')}`);
    logger_1.logger.info(`Pending: ${pendingList.length}\n${pendingList.join('\n')}`);
    await (0, mongoose_1.disconnect)();
}
main().catch((err) => {
    logger_1.logger.error(err?.stack || err?.message);
    process.exit(1);
});
