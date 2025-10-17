"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Fork_1 = require("../models/Fork");
async function runMigration() {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/artive');
        console.log('🔄 Adding image fields to existing forks...');
        // Add imageUrl and thumbnailUrl fields to existing forks (they will be undefined/null by default)
        const updateResult = await Fork_1.Fork.updateMany({
            $or: [
                { imageUrl: { $exists: false } },
                { thumbnailUrl: { $exists: false } }
            ]
        }, {
            $set: {
                imageUrl: null,
                thumbnailUrl: null
            }
        });
        console.log(`✅ Updated ${updateResult.modifiedCount} forks with image fields`);
        console.log('🎉 Image fields migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
runMigration();
