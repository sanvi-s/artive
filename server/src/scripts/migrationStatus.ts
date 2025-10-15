import fs from 'fs';
import path from 'path';
import { connectWithRetry, disconnect } from '../db/mongoose';
import { logger } from '../utils/logger';
import { getAppliedMigrationIds } from '../services/migrationService';

async function main() {
  await connectWithRetry(3);
  const migrationsDir = path.resolve(__dirname, '../migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
    .sort();
  const applied = await getAppliedMigrationIds();

  const appliedList: string[] = [];
  const pendingList: string[] = [];
  for (const file of files) {
    const mod = require(path.join(migrationsDir, file));
    const mig = mod.default || mod;
    if (!mig?.id) continue;
    if (applied.has(mig.id)) appliedList.push(mig.id);
    else pendingList.push(mig.id);
  }

  logger.info(`Applied: ${appliedList.length}\n${appliedList.join('\n')}`);
  logger.info(`Pending: ${pendingList.length}\n${pendingList.join('\n')}`);
  await disconnect();
}

main().catch((err) => {
  logger.error(err?.stack || err?.message);
  process.exit(1);
});



