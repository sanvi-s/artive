import { Migration, IMigration } from '../models/Migration';

export interface MigrationDef {
  id: string;
  name: string;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

export async function getAppliedMigrationIds(): Promise<Set<string>> {
  const applied = await Migration.find({}, { id: 1 }).lean();
  return new Set(applied.map((m) => m.id));
}

export async function markMigrationApplied(id: string, name: string): Promise<IMigration> {
  return await Migration.create({ id, name, runAt: new Date() });
}



