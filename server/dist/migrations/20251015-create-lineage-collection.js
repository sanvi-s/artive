"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const id = '20251015-create-lineage-collection';
const name = 'Ensure lineages collection exists and basic indexes';
exports.default = {
    id,
    name,
    up: async () => {
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No active DB connection');
        const existing = await db.listCollections({ name: 'lineages' }).toArray();
        if (existing.length === 0) {
            await db.createCollection('lineages');
        }
        const coll = db.collection('lineages');
        const indexes = await coll.indexes();
        const haveSeedId = indexes.some((i) => i.key && i.key.seedId === 1);
        if (!haveSeedId) {
            await coll.createIndex({ seedId: 1 }, { unique: true, name: 'seedId_1' });
        }
    },
};
