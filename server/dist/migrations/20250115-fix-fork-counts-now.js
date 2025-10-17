"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Fork_1 = require("../models/Fork");
const Seed_1 = require("../models/Seed");
// Helper function to calculate total fork count for a seed (including all descendants)
async function calculateTotalForkCount(seedId) {
    const visited = new Set();
    let totalCount = 0;
    async function countForksRecursively(id) {
        if (visited.has(id))
            return;
        visited.add(id);
        // Count direct forks
        const directForks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(id) }).lean();
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
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
        console.log('🔍 Connected to database');
        const seeds = await Seed_1.Seed.find({}).lean();
        const forks = await Fork_1.Fork.find({}).lean();
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
        await Seed_1.Seed.updateMany({}, { $set: { forkCount: 0 } });
        await Fork_1.Fork.updateMany({}, { $set: { forkCount: 0 } });
        console.log('✅ Reset all fork counts to 0');
        // Calculate total fork counts for seeds (including all descendants)
        let updatedSeeds = 0;
        for (const seed of seeds) {
            const totalCount = await calculateTotalForkCount(String(seed._id));
            if (totalCount > 0) {
                await Seed_1.Seed.findByIdAndUpdate(seed._id, { forkCount: totalCount });
                console.log(`✅ ${seed.title}: ${totalCount} total forks`);
                updatedSeeds++;
            }
        }
        // Calculate direct fork counts for forks
        let updatedForks = 0;
        for (const fork of forks) {
            const directCount = await Fork_1.Fork.countDocuments({ parentSeed: fork._id });
            if (directCount > 0) {
                await Fork_1.Fork.findByIdAndUpdate(fork._id, { forkCount: directCount });
                console.log(`✅ Fork ${fork._id}: ${directCount} direct forks`);
                updatedForks++;
            }
        }
        console.log(`\n🎉 Fork count recalculation completed!`);
        console.log(`- Updated ${updatedSeeds} seeds`);
        console.log(`- Updated ${updatedForks} forks`);
    }
    catch (error) {
        console.error('❌ Error:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
runMigration();
