"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const Seed_1 = require("../models/Seed");
const validators_1 = require("../utils/validators");
async function search(req, res) {
    const raw = (0, validators_1.sanitizeSearch)(req.query.q);
    const type = req.query.type;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const filter = { deletedAt: null };
    if (raw && raw.trim().length > 0) {
        const q = raw.trim();
        // Case-insensitive regex across title, snippet, and tags
        const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
            { title: rx },
            { contentSnippet: rx },
            { tags: rx },
        ];
    }
    if (type && type !== 'all')
        filter.type = type;
    const items = await Seed_1.Seed.find(filter)
        .populate('author', 'username displayName avatarUrl')
        .select('title contentSnippet contentFull type thumbnailUrl tags forkCount likes createdAt author')
        .sort('-createdAt')
        .limit(limit)
        .lean();
    res.json({ items });
}
