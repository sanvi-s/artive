import fs from 'fs';
import path from 'path';
import { connectWithRetry, disconnect } from '../db/mongoose';
import { logger } from '../utils/logger';
import { getAppliedMigrationIds, markMigrationApplied } from '../services/migrationService';

async function main() {
  await connectWithRetry(3);

  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
    .sort();

  const applied = await getAppliedMigrationIds();

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(migrationPath);
    const mig = mod.default || mod;
    if (!mig?.id || typeof mig.up !== 'function') {
      logger.warn(`Skipping invalid migration file: ${file}`);
      continue;
    }
    if (applied.has(mig.id)) {
      logger.info(`Skipping already applied migration: ${mig.id}`);
      continue;
    }
    logger.info(`Running migration: ${mig.id} - ${mig.name}`);
    await mig.up();
    await markMigrationApplied(mig.id, mig.name || file);
    logger.info(`Applied migration: ${mig.id}`);
  }

  await disconnect();
}

main().catch((err) => {
  logger.error(err?.stack || err?.message);
  process.exit(1);
});



