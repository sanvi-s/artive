"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.similar = similar;
const Seed_1 = require("../models/Seed");
const validators_1 = require("../utils/validators");
const mlsearch_1 = require("../services/mlsearch");
async function search(req, res) {
    const raw = (0, validators_1.sanitizeSearch)(req.query.q);
    const type = req.query.type;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));
    const fallbackSearch = async () => {
        const filter = { deletedAt: null };
        if (raw && raw.trim().length > 0) {
            const rx = new RegExp(raw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [{ title: rx }, { contentSnippet: rx }, { tags: rx }];
        }
        if (type && type !== 'all')
            filter.type = type;
        return Seed_1.Seed.find(filter)
            .populate('author', 'username displayName avatarUrl')
            .select('title contentSnippet contentFull type thumbnailUrl tags forkCount likes createdAt author')
            .sort('-createdAt')
            .limit(limit)
            .lean();
    };
    if (!raw || raw.trim().length === 0) {
        const items = await fallbackSearch();
        return res.json({ items });
    }
    try {
        const items = await (0, mlsearch_1.semanticSearch)(raw.trim());
        return res.json({ items });
    }
    catch (err) {
        console.warn('ML search unavailable, falling back to text search:', err);
        const items = await fallbackSearch();
        return res.json({ items });
    }
}
async function similar(req, res) {
    const { id, type } = req.body;
    if (!id || !type)
        return res.status(400).json({ error: { message: 'id and type are required' } });
    try {
        const items = await (0, mlsearch_1.getSimilar)(id, type);
        return res.json({ items });
    }
    catch (err) {
        console.warn('ML similar unavailable:', err);
        return res.json({ items: [] });
    }
}
