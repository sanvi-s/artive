import mongoose from 'mongoose';
import { Fork } from '../models/Fork';

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
    
    console.log('🔄 Adding image fields to existing forks...');
    
    // Add imageUrl and thumbnailUrl fields to existing forks (they will be undefined/null by default)
    const updateResult = await Fork.updateMany(
      { 
        $or: [
          { imageUrl: { $exists: false } },
          { thumbnailUrl: { $exists: false } }
        ]
      },
      { 
        $set: { 
          imageUrl: null,
          thumbnailUrl: null
        } 
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} forks with image fields`);
    console.log('🎉 Image fields migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
