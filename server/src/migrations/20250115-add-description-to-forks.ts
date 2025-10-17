import mongoose from 'mongoose';
import { Fork } from '../models/Fork';

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
    
    console.log('🔄 Adding description field to existing forks...');
    
    // Add description field to existing forks (it will be null/undefined by default)
    const updateResult = await Fork.updateMany(
      { description: { $exists: false } },
      { $set: { description: null } }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} forks with description field`);
    console.log('🎉 Description field migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
