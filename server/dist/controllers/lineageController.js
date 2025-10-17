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
async function getLineage(req, res) {
    const { id } = req.params;
    const depth = Math.min(5, Math.max(1, Number(req.query.depth || 3)));
    try {
        console.log(`🌳 Fetching lineage for ID: ${id}, depth: ${depth}`);
        const result = await getLineageInternal(id, depth);
        console.log(`🌳 Lineage result:`, result);
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
        // First, find the root seed by traversing up the lineage
        const rootSeedId = await findRootSeed(id);
        if (!rootSeedId) {
            // If we can't find a root seed, fall back to the original behavior
            console.log(`🌳 No root seed found for ${id}, using original logic`);
            return getLineageFromNode(id, depth);
        }
        console.log(`🌳 Building complete lineage tree from root seed: ${rootSeedId}`);
        // Build the complete lineage tree from the root seed
        const visited = new Set([rootSeedId]);
        const nodes = [rootSeedId];
        const edges = [];
        let frontier = [rootSeedId];
        for (let d = 0; d < depth; d++) {
            const next = [];
            for (const parentId of frontier) {
                // Look for forks where parentSeed equals the current ID (works for both seeds and forks)
                const forks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(parentId) }, { _id: 1 }).limit(200).lean();
                for (const f of forks) {
                    const child = String(f._id);
                    edges.push({ parent: parentId, child });
                    if (!visited.has(child)) {
                        visited.add(child);
                        nodes.push(child);
                        next.push(child);
                    }
                }
            }
            frontier = next;
        }
        console.log(`🌳 Built complete lineage tree with ${nodes.length} nodes and ${edges.length} edges`);
        return { nodes, edges };
    }
    catch (error) {
        console.error(`❌ Error in getLineageInternal for ${id}:`, error);
        // Fall back to original logic on error
        return getLineageFromNode(id, depth);
    }
}
// Original logic for when we can't find a root seed
async function getLineageFromNode(id, depth) {
    const visited = new Set([id]);
    const nodes = [id];
    const edges = [];
    let frontier = [id];
    for (let d = 0; d < depth; d++) {
        const next = [];
        for (const parentId of frontier) {
            // Look for forks where parentSeed equals the current ID (works for both seeds and forks)
            const forks = await Fork_1.Fork.find({ parentSeed: new mongoose_1.default.Types.ObjectId(parentId) }, { _id: 1 }).limit(200).lean();
            for (const f of forks) {
                const child = String(f._id);
                edges.push({ parent: parentId, child });
                if (!visited.has(child)) {
                    visited.add(child);
                    nodes.push(child);
                    next.push(child);
                }
            }
        }
        frontier = next;
    }
    return { nodes, edges };
}
// Helper function to find the root seed by traversing up the lineage
async function findRootSeed(id) {
    try {
        console.log(`🔍 Finding root seed for ID: ${id}`);
        const visited = new Set();
        let currentId = id;
        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            console.log(`🔍 Checking node: ${currentId}`);
            // Check if current ID is a seed
            const seed = await Seed_1.Seed.findById(currentId).lean();
            if (seed) {
                console.log(`✅ Found root seed: ${currentId}`);
                return currentId; // Found the root seed
            }
            // Check if current ID is a fork, get its parent
            const fork = await Fork_1.Fork.findById(currentId).lean();
            if (fork) {
                console.log(`🔀 Found fork, parent: ${fork.parentSeed}`);
                currentId = String(fork.parentSeed);
            }
            else {
                console.log(`❌ Node not found: ${currentId}`);
                break; // Not found, break the loop
            }
        }
        console.log(`❌ No root seed found for ${id}`);
        return null;
    }
    catch (error) {
        console.error(`❌ Error finding root seed for ${id}:`, error);
        return null;
    }
}
