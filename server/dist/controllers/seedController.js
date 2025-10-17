"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSeeds = listSeeds;
exports.getSeed = getSeed;
exports.getSeedOrFork = getSeedOrFork;
exports.createSeed = createSeed;
exports.updateSeed = updateSeed;
exports.softDeleteSeed = softDeleteSeed;
const mongoose_1 = __importDefault(require("mongoose"));
const Seed_1 = require("../models/Seed");
const Fork_1 = require("../models/Fork");
const validators_1 = require("../utils/validators");
async function listSeeds(req, res) {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search || undefined;
    const author = req.query.author; // optional author filter (user id)
    const q = { deletedAt: null };
    if (type)
        q.type = type;
    if (search)
        q.$text = { $search: search.replace(/[\$]/g, '') };
    if (author) {
        if (mongoose_1.default.isValidObjectId(author)) {
            q.author = new mongoose_1.default.Types.ObjectId(author);
        }
        else {
            return res.status(400).json({ error: { message: 'Invalid author id' } });
        }
    }
    const [items, total] = await Promise.all([
        Seed_1.Seed.find(q, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
            .populate('author', 'username displayName avatarUrl')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Seed_1.Seed.countDocuments(q),
    ]);
    try {
        console.debug('[seeds] list', { page, limit, type, author, search, count: items.length });
    }
    catch { }
    res.json({ page, limit, total, items });
}
async function getSeed(req, res) {
    const { id } = req.params;
    const full = String(req.query.full || 'false') === 'true';
    const projection = full
        ? {}
        : { contentFull: 0 };
    const seed = await Seed_1.Seed.findById(id, projection)
        .populate('author', 'username displayName avatarUrl')
        .lean();
    if (!seed || seed?.deletedAt)
        return res.status(404).json({ error: { message: 'Not found' } });
    const forks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(id) })
        .populate('author', 'username displayName avatarUrl')
        .sort('-createdAt')
        .limit(10)
        .lean();
    try {
        console.debug('[seeds] get', { id, full, hasThumbnail: Boolean(seed.thumbnailUrl) });
    }
    catch { }
    res.json({ seed, forks });
}
// Unified endpoint to get either a seed or fork with their children
async function getSeedOrFork(req, res) {
    const { id } = req.params;
    const full = String(req.query.full || 'false') === 'true';
    if (!mongoose_1.default.isValidObjectId(id)) {
        return res.status(400).json({ error: { message: 'Invalid id' } });
    }
    try {
        // First try to find as a seed
        const projection = full ? {} : { contentFull: 0 };
        const seed = await Seed_1.Seed.findById(id, projection)
            .populate('author', 'username displayName avatarUrl')
            .lean();
        if (seed && !seed.deletedAt) {
            // Found as seed, get its forks
            const forks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(id) })
                .populate('author', 'username displayName avatarUrl')
                .sort('-createdAt')
                .limit(10)
                .lean();
            return res.json({ seed, forks, type: 'seed' });
        }
        // Not found as seed, try as fork
        const fork = await Fork_1.Fork.findById(id)
            .populate('author', 'username displayName avatarUrl')
            .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull createdAt')
            .lean();
        if (fork) {
            // Found as fork, get its forks
            const forks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(id) })
                .populate('author', 'username displayName avatarUrl')
                .sort('-createdAt')
                .limit(10)
                .lean();
            return res.json({ fork, forks, type: 'fork' });
        }
        // Not found as either
        return res.status(404).json({ error: { message: 'Not found' } });
    }
    catch (error) {
        console.error('Error fetching seed or fork:', error);
        return res.status(500).json({ error: { message: 'Internal server error' } });
    }
}
async function createSeed(req, res) {
    if (!req.userId)
        return res.status(401).json({ error: { message: 'Unauthorized' } });
    const title = (0, validators_1.clampString)(req.body?.title, 120);
    const contentSnippet = (0, validators_1.clampString)(req.body?.contentSnippet, 400);
    const contentFull = (0, validators_1.clampString)(req.body?.contentFull, 20000);
    const type = req.body?.type || 'other';
    const thumbnailUrl = typeof req.body?.thumbnailUrl === 'string' ? req.body.thumbnailUrl : undefined;
    if (!title)
        return res.status(400).json({ error: { message: 'Invalid title' } });
    try {
        console.debug('[seeds] create', {
            userId: req.userId,
            title,
            type,
            hasThumbnail: Boolean(thumbnailUrl),
            contentSnippet_len: (contentSnippet || '').length,
            contentSnippet_preview: (contentSnippet || '').slice(0, 80)
        });
    }
    catch { }
    const seed = await Seed_1.Seed.create({ title, contentSnippet, contentFull, type, author: req.userId, thumbnailUrl });
    try {
        console.debug('[seeds] created', {
            id: seed._id,
            contentSnippet_len: (seed.contentSnippet || '').length,
            contentSnippet_preview: (seed.contentSnippet || '').slice(0, 80)
        });
    }
    catch { }
    res.status(201).json({ id: seed._id });
}
async function updateSeed(req, res) {
    const { id } = req.params;
    const updates = {};
    if (req.body?.title)
        updates.title = (0, validators_1.clampString)(req.body.title, 120);
    if (req.body?.contentSnippet)
        updates.contentSnippet = (0, validators_1.clampString)(req.body.contentSnippet, 400);
    if (req.body?.contentFull)
        updates.contentFull = (0, validators_1.clampString)(req.body.contentFull, 20000);
    if (req.body?.type)
        updates.type = req.body.type;
    const updated = await Seed_1.Seed.findByIdAndUpdate(id, { $set: updates }, { new: true, projection: { contentFull: 0 } }).lean();
    if (!updated)
        return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ id: updated._id, ...updated });
}
async function softDeleteSeed(req, res) {
    const { id } = req.params;
    await Seed_1.Seed.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });
    res.status(204).send();
}
