import mongoose from 'mongoose';

const id = '20251015-create-lineage-collection';
const name = 'Ensure lineages collection exists and basic indexes';

export default {
  id,
  name,
  up: async () => {
    const db = mongoose.connection.db;
    if (!db) throw new Error('No active DB connection');
    const existing = await db.listCollections({ name: 'lineages' }).toArray();
    if (existing.length === 0) {
      await db.createCollection('lineages');
    }
    const coll = db.collection('lineages');
    const indexes = await coll.indexes();
    const haveSeedId = indexes.some((i) => i.key && (i.key as any).seedId === 1);
    if (!haveSeedId) {
      await coll.createIndex({ seedId: 1 }, { unique: true, name: 'seedId_1' });
    }
  },
};



