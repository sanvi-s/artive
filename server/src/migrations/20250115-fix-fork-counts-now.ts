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
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
    console.log('🔍 Connected to database');
    
    const seeds = await Seed.find({}).lean();
    const forks = await Fork.find({}).lean();
    
    console.log('📊 Database stats:');
    console.log('- Seeds:', seeds.length);
    console.log('- Forks:', forks.length);
    
    if (seeds.length > 0) {
      console.log('\n🌱 Seeds found:');
      for (const seed of seeds) {
        console.log(`- ${seed.title} (${seed._id}): forkCount=${seed.forkCount}`);
      }
    }
    
    if (forks.length > 0) {
      console.log('\n🔀 Forks found:');
      for (const fork of forks) {
        console.log(`- ${fork.summary || 'No summary'} (${fork._id}): forkCount=${fork.forkCount}, parentSeed=${fork.parentSeed}`);
      }
    }
    
    // Now recalculate fork counts
    console.log('\n🔄 Recalculating fork counts...');
    
    // Reset all fork counts
    await Seed.updateMany({}, { $set: { forkCount: 0 } });
    await Fork.updateMany({}, { $set: { forkCount: 0 } });
    console.log('✅ Reset all fork counts to 0');
    
    // Calculate total fork counts for seeds (including all descendants)
    let updatedSeeds = 0;
    for (const seed of seeds) {
      const totalCount = await calculateTotalForkCount(String(seed._id));
      if (totalCount > 0) {
        await Seed.findByIdAndUpdate(seed._id, { forkCount: totalCount });
        console.log(`✅ ${seed.title}: ${totalCount} total forks`);
        updatedSeeds++;
      }
    }
    
    // Calculate direct fork counts for forks
    let updatedForks = 0;
    for (const fork of forks) {
      const directCount = await Fork.countDocuments({ parentSeed: fork._id });
      if (directCount > 0) {
        await Fork.findByIdAndUpdate(fork._id, { forkCount: directCount });
        console.log(`✅ Fork ${fork._id}: ${directCount} direct forks`);
        updatedForks++;
      }
    }
    
    console.log(`\n🎉 Fork count recalculation completed!`);
    console.log(`- Updated ${updatedSeeds} seeds`);
    console.log(`- Updated ${updatedForks} forks`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
