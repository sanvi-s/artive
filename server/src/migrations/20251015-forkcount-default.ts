import mongoose from 'mongoose';

const id = '20251015-add-forkcount-default';
const name = 'Ensure forkCount defaults to 0 on seeds';

export default {
  id,
  name,
  up: async () => {
    const db = mongoose.connection.db;
    if (!db) throw new Error('No active DB connection');
    const coll = db.collection('seeds');
    await coll.updateMany({ forkCount: { $exists: false } }, { $set: { forkCount: 0 } });
  },
};


