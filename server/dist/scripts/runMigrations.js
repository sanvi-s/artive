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
    for (const file of files) {
        const migrationPath = path_1.default.join(migrationsDir, file);
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require(migrationPath);
        const mig = mod.default || mod;
        if (!mig?.id || typeof mig.up !== 'function') {
            logger_1.logger.warn(`Skipping invalid migration file: ${file}`);
            continue;
        }
        if (applied.has(mig.id)) {
            logger_1.logger.info(`Skipping already applied migration: ${mig.id}`);
            continue;
        }
        logger_1.logger.info(`Running migration: ${mig.id} - ${mig.name}`);
        await mig.up();
        await (0, migrationService_1.markMigrationApplied)(mig.id, mig.name || file);
        logger_1.logger.info(`Applied migration: ${mig.id}`);
    }
    await (0, mongoose_1.disconnect)();
}
main().catch((err) => {
    logger_1.logger.error(err?.stack || err?.message);
    process.exit(1);
});
