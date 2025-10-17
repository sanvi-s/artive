"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppliedMigrationIds = getAppliedMigrationIds;
exports.markMigrationApplied = markMigrationApplied;
const Migration_1 = require("../models/Migration");
async function getAppliedMigrationIds() {
    const applied = await Migration_1.Migration.find({}, { id: 1 }).lean();
    return new Set(applied.map((m) => m.id));
}
async function markMigrationApplied(id, name) {
    return await Migration_1.Migration.create({ id, name, runAt: new Date() });
}
