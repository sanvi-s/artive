"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateForkCounts = recalculateForkCounts;
const mongoose_1 = __importDefault(require("mongoose"));
const Fork_1 = require("../models/Fork");
const Seed_1 = require("../models/Seed");
async function recalculateForkCounts() {
    try {
        console.log('🔄 Recalculating all fork counts...');
        // First, reset all fork counts to 0
        await Seed_1.Seed.updateMany({}, { $set: { forkCount: 0 } });
        await Fork_1.Fork.updateMany({}, { $set: { forkCount: 0 } });
        console.log('✅ Reset all fork counts to 0');
        // Recalculate fork counts for seeds
        const seeds = await Seed_1.Seed.find({}).lean();
        let seedCount = 0;
        for (const seed of seeds) {
            const forkCount = await Fork_1.Fork.countDocuments({ parentSeed: seed._id });
            if (forkCount > 0) {
                await Seed_1.Seed.findByIdAndUpdate(seed._id, { forkCount });
                seedCount++;
            }
        }
        console.log(`✅ Updated fork counts for ${seedCount} seeds`);
        // Recalculate fork counts for forks
        const forks = await Fork_1.Fork.find({}).lean();
        let forkCount = 0;
        for (const fork of forks) {
            const childForkCount = await Fork_1.Fork.countDocuments({ parentSeed: fork._id });
            if (childForkCount > 0) {
                await Fork_1.Fork.findByIdAndUpdate(fork._id, { forkCount: childForkCount });
                forkCount++;
            }
        }
        console.log(`✅ Updated fork counts for ${forkCount} forks`);
        console.log('🎉 Fork count recalculation completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during fork count recalculation:', error);
        throw error;
    }
}
// Run migration if this file is executed directly
if (require.main === module) {
    mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive')
        .then(() => recalculateForkCounts())
        .then(() => process.exit(0))
        .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}
