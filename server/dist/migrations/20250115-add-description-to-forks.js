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
        console.log('🔄 Adding description field to existing forks...');
        // Add description field to existing forks (it will be null/undefined by default)
        const updateResult = await Fork_1.Fork.updateMany({ description: { $exists: false } }, { $set: { description: null } });
        console.log(`✅ Updated ${updateResult.modifiedCount} forks with description field`);
        console.log('🎉 Description field migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Migration failed:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
}
runMigration();
