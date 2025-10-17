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
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
    console.log('🔄 Recalculating total fork counts (including all descendants)...');
    // Reset all fork counts to 0
    await Seed_1.Seed.updateMany({}, { $set: { forkCount: 0 } });
    await Fork_1.Fork.updateMany({}, { $set: { forkCount: 0 } });
    console.log('✅ Reset all fork counts to 0');
    // Recalculate total fork counts for all seeds
    const seeds = await Seed_1.Seed.find({}).lean();
    let updatedSeeds = 0;
    for (const seed of seeds) {
        const totalForkCount = await calculateTotalForkCount(String(seed._id));
        if (totalForkCount > 0) {
            await Seed_1.Seed.findByIdAndUpdate(seed._id, { forkCount: totalForkCount });
            updatedSeeds++;
            console.log(`✅ Seed "${seed.title}" (${seed._id}): ${totalForkCount} total forks`);
        }
    }
    console.log(`✅ Updated total fork counts for ${updatedSeeds} seeds`);
    console.log('🎉 Total fork count migration completed successfully!');
    await mongoose_1.default.disconnect();
}
runMigration().catch(console.error);
