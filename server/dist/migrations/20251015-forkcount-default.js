"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const id = '20251015-add-forkcount-default';
const name = 'Ensure forkCount defaults to 0 on seeds';
exports.default = {
    id,
    name,
    up: async () => {
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No active DB connection');
        const coll = db.collection('seeds');
        await coll.updateMany({ forkCount: { $exists: false } }, { $set: { forkCount: 0 } });
    },
};
