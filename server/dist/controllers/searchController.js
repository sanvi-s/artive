"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
const Seed_1 = require("../models/Seed");
const validators_1 = require("../utils/validators");
async function search(req, res) {
    const q = (0, validators_1.sanitizeSearch)(req.query.q);
    const type = req.query.type;
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const filter = { deletedAt: null };
    if (q)
        filter.$text = { $search: q };
    if (type)
        filter.type = type;
    const items = await Seed_1.Seed.find(filter, { title: 1, contentSnippet: 1, type: 1, thumbnailUrl: 1 })
        .sort('-createdAt')
        .limit(limit)
        .lean();
    res.json({ items });
}
