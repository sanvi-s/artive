"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineage = getLineage;
exports.exportLineage = exportLineage;
const mongoose_1 = __importDefault(require("mongoose"));
const Fork_1 = require("../models/Fork");
const Seed_1 = require("../models/Seed");
const Lineage_1 = require("../models/Lineage");
async function getLineage(req, res) {
    const { id } = req.params;
    const depth = Math.min(5, Math.max(1, Number(req.query.depth || 3)));
    try {
        const result = await getLineageInternal(id, depth);
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching lineage:', error);
        res.status(500).json({ error: 'Failed to fetch lineage' });
    }
}
async function exportLineage(req, res) {
    const { id } = req.params;
    const result = await getLineageInternal(id, 5);
    res.json(result);
}
async function getLineageInternal(id, depth) {
    try {
        const rootSeedId = await findRootSeed(id);
        if (!rootSeedId)
            return getLineageFromNode(id, depth);
        // Fast path: Lineage cache gives us all descendant IDs in one query.
        // Then two parallel queries (Seed + Fork) enrich everything — zero per-node fetches.
        const cachedLineage = await Lineage_1.Lineage.findOne({ seedId: new mongoose_1.default.Types.ObjectId(rootSeedId) }, { children: 1 }).lean();
        if (cachedLineage && cachedLineage.children.length > 0) {
            const [rootSeed, forks] = await Promise.all([
                Seed_1.Seed.findById(rootSeedId, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
                    .populate('author', 'username displayName avatarUrl')
                    .lean(),
                Fork_1.Fork.find({ _id: { $in: cachedLineage.children } }, { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 })
                    .populate('author', 'username displayName avatarUrl')
                    .lean(),
            ]);
            if (!rootSeed)
                return getLineageFromNode(id, depth);
            const nodes = [buildSeedNode(rootSeed)];
            const edges = [];
            for (const fork of forks) {
                const parentId = String(fork.parentSeed);
                nodes.push(buildForkNode(fork, parentId));
                edges.push({ parent: parentId, child: String(fork._id) });
            }
            return { nodes, edges };
        }
        // Slow path: BFS to discover all fork IDs, then enrich in two parallel queries
        const visited = new Set([rootSeedId]);
        const forkIds = [];
        const edges = [];
        let frontier = [rootSeedId];
        for (let d = 0; d < depth; d++) {
            const rawForks = await Fork_1.Fork.find({ parentSeed: { $in: frontier.map(f => new mongoose_1.default.Types.ObjectId(f)) } }, { _id: 1, parentSeed: 1 }).limit(200).lean();
            const next = [];
            for (const f of rawForks) {
                const child = String(f._id);
                const parent = String(f.parentSeed);
                edges.push({ parent, child });
                if (!visited.has(child)) {
                    visited.add(child);
                    forkIds.push(child);
                    next.push(child);
                }
            }
            frontier = next;
            if (frontier.length === 0)
                break;
        }
        const [rootSeed, forks] = await Promise.all([
            Seed_1.Seed.findById(rootSeedId, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
                .populate('author', 'username displayName avatarUrl')
                .lean(),
            Fork_1.Fork.find({ _id: { $in: forkIds } }, { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 })
                .populate('author', 'username displayName avatarUrl')
                .lean(),
        ]);
        if (!rootSeed)
            return getLineageFromNode(id, depth);
        const nodes = [buildSeedNode(rootSeed)];
        for (const fork of forks) {
            nodes.push(buildForkNode(fork, String(fork.parentSeed)));
        }
        return { nodes, edges };
    }
    catch (error) {
        console.error(`❌ Error in getLineageInternal for ${id}:`, error);
        return getLineageFromNode(id, depth);
    }
}
// Fallback: when we can't find a root seed, BFS from the given node
async function getLineageFromNode(id, depth) {
    const visited = new Set([id]);
    const forkIds = [];
    const edges = [];
    let frontier = [id];
    for (let d = 0; d < depth; d++) {
        const rawForks = await Fork_1.Fork.find({ parentSeed: { $in: frontier.map(f => new mongoose_1.default.Types.ObjectId(f)) } }, { _id: 1, parentSeed: 1 }).limit(200).lean();
        const next = [];
        for (const f of rawForks) {
            const child = String(f._id);
            const parent = String(f.parentSeed);
            edges.push({ parent, child });
            if (!visited.has(child)) {
                visited.add(child);
                forkIds.push(child);
                next.push(child);
            }
        }
        frontier = next;
        if (frontier.length === 0)
            break;
    }
    const [seedResult, allForks] = await Promise.all([
        Seed_1.Seed.findById(id, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
            .populate('author', 'username displayName avatarUrl')
            .lean(),
        Fork_1.Fork.find({ _id: { $in: [id, ...forkIds] } }, { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 })
            .populate('author', 'username displayName avatarUrl')
            .lean(),
    ]);
    const nodes = [];
    if (seedResult)
        nodes.push(buildSeedNode(seedResult));
    for (const fork of allForks) {
        if (String(fork._id) === id && seedResult)
            continue;
        nodes.push(buildForkNode(fork, String(fork.parentSeed)));
    }
    return { nodes, edges };
}
function buildSeedNode(seed) {
    return {
        id: String(seed._id),
        type: 'seed',
        title: seed.title || 'Untitled',
        author: seed.author,
        content: seed.contentFull || seed.contentSnippet || '',
        thumbnailUrl: seed.thumbnailUrl,
        forkCount: seed.forkCount || 0,
        createdAt: seed.createdAt instanceof Date ? seed.createdAt.toISOString() : String(seed.createdAt),
    };
}
function buildForkNode(fork, parentId) {
    return {
        id: String(fork._id),
        type: 'fork',
        title: fork.summary || 'Fork',
        author: fork.author,
        content: fork.contentDelta || fork.summary || fork.description || '',
        thumbnailUrl: fork.thumbnailUrl,
        imageUrl: fork.imageUrl,
        forkCount: fork.forkCount || 0,
        createdAt: fork.createdAt instanceof Date ? fork.createdAt.toISOString() : String(fork.createdAt),
        parentId,
    };
}
async function findRootSeed(id) {
    try {
        const visited = new Set();
        let currentId = id;
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const seed = await Seed_1.Seed.findById(currentId).lean();
            if (seed)
                return currentId;
            const fork = await Fork_1.Fork.findById(currentId).lean();
            if (fork) {
                currentId = String(fork.parentSeed);
            }
            else {
                break;
            }
        }
        return null;
    }
    catch (error) {
        console.error(`❌ Error finding root seed for ${id}:`, error);
        return null;
    }
}
