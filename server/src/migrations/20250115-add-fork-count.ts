import mongoose from 'mongoose';
import { Fork } from '../models/Fork';

export async function addForkCountToForks() {
  try {
    console.log('🔄 Adding forkCount field to existing forks...');
    
    // Add forkCount field to all existing forks (defaults to 0)
    const result = await Fork.updateMany(
      { forkCount: { $exists: false } },
      { $set: { forkCount: 0 } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} forks with forkCount field`);
    
    // Now calculate and update the actual fork counts
    console.log('🔄 Calculating actual fork counts...');
    
    const forks = await Fork.find({}).lean();
    let updatedCount = 0;
    
    for (const fork of forks) {
      // Count how many forks have this fork as their parent
      const childForkCount = await Fork.countDocuments({ 
        parentSeed: fork._id 
      });
      
      if (childForkCount !== fork.forkCount) {
        await Fork.findByIdAndUpdate(fork._id, { 
          forkCount: childForkCount 
        });
        updatedCount++;
      }
    }
    
    console.log(`✅ Updated fork counts for ${updatedCount} forks`);
    console.log('🎉 Fork count migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during fork count migration:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive')
    .then(() => addForkCountToForks())
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
