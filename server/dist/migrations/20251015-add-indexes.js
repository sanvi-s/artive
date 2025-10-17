"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const id = '20251015-add-index-seed-indexes';
const name = 'Create seeds text and compound indexes';
exports.default = {
    id,
    name,
    up: async () => {
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No active DB connection');
        const coll = db.collection('seeds');
        const indexes = await coll.indexes();
        const haveText = indexes.some((i) => i.name === 'title_text_contentSnippet_text');
        const haveCompound = indexes.some((i) => i.name === 'type_1_createdAt_-1');
        if (!haveText) {
            await coll.createIndex({ title: 'text', contentSnippet: 'text' }, { name: 'title_text_contentSnippet_text' });
        }
        if (!haveCompound) {
            await coll.createIndex({ type: 1, createdAt: -1 }, { name: 'type_1_createdAt_-1' });
        }
    },
};
