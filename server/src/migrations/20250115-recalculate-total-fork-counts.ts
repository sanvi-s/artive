import mongoose from 'mongoose';
import { Fork } from '../models/Fork';
import { Seed } from '../models/Seed';

// Helper function to calculate total fork count for a seed (including all descendants)
async function calculateTotalForkCount(seedId: string): Promise<number> {
  const visited = new Set<string>();
  let totalCount = 0;
  
  async function countForksRecursively(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    // Count direct forks
    const directForks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(id) }).lean();
    totalCount += directForks.length;
    
    // Recursively count forks of each direct fork
    for (const fork of directForks) {
      await countForksRecursively(String(fork._id));
    }
  }
  
  await countForksRecursively(seedId);
  return totalCount;
}

async function runMigration() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');

  console.log('🔄 Recalculating total fork counts (including all descendants)...');
  
  // Reset all fork counts to 0
  await Seed.updateMany({}, { $set: { forkCount: 0 } });
  await Fork.updateMany({}, { $set: { forkCount: 0 } });
  console.log('✅ Reset all fork counts to 0');
  
  // Recalculate total fork counts for all seeds
  const seeds = await Seed.find({}).lean();
  let updatedSeeds = 0;
  
  for (const seed of seeds) {
    const totalForkCount = await calculateTotalForkCount(String(seed._id));
    if (totalForkCount > 0) {
      await Seed.findByIdAndUpdate(seed._id, { forkCount: totalForkCount });
      updatedSeeds++;
      console.log(`✅ Seed "${seed.title}" (${seed._id}): ${totalForkCount} total forks`);
    }
  }
  
  console.log(`✅ Updated total fork counts for ${updatedSeeds} seeds`);
  console.log('🎉 Total fork count migration completed successfully!');

  await mongoose.disconnect();
}

runMigration().catch(console.error);
