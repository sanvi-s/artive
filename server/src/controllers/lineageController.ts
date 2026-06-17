import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';
import { Seed } from '../models/Seed';
import { Lineage } from '../models/Lineage';

interface EnrichedNode {
  id: string;
  type: 'seed' | 'fork';
  title: string;
  author: any;
  content: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  forkCount: number;
  createdAt: string;
  parentId?: string;
}

export async function getLineage(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const depth = Math.min(5, Math.max(1, Number(req.query.depth || 3)));
  try {
    const result = await getLineageInternal(id, depth);
    res.json(result);
  } catch (error) {
    console.error('Error fetching lineage:', error);
    res.status(500).json({ error: 'Failed to fetch lineage' });
  }
}

export async function exportLineage(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const result = await getLineageInternal(id, 5);
  res.json(result);
}

async function getLineageInternal(id: string, depth: number) {
  try {
    const rootSeedId = await findRootSeed(id);
    if (!rootSeedId) return getLineageFromNode(id, depth);

    // Fast path: Lineage cache gives us all descendant IDs in one query.
    // Then two parallel queries (Seed + Fork) enrich everything — zero per-node fetches.
    const cachedLineage = await Lineage.findOne(
      { seedId: new mongoose.Types.ObjectId(rootSeedId) },
      { children: 1 }
    ).lean();

    if (cachedLineage && cachedLineage.children.length > 0) {
      const [rootSeed, forks] = await Promise.all([
        Seed.findById(rootSeedId, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
          .populate('author', 'username displayName avatarUrl')
          .lean(),
        Fork.find(
          { _id: { $in: cachedLineage.children } },
          { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 }
        )
          .populate('author', 'username displayName avatarUrl')
          .lean(),
      ]);

      if (!rootSeed) return getLineageFromNode(id, depth);

      const nodes: EnrichedNode[] = [buildSeedNode(rootSeed)];
      const edges: Array<{ parent: string; child: string }> = [];

      for (const fork of forks) {
        const parentId = String((fork as any).parentSeed);
        nodes.push(buildForkNode(fork, parentId));
        edges.push({ parent: parentId, child: String(fork._id) });
      }

      return { nodes, edges };
    }

    // Slow path: BFS to discover all fork IDs, then enrich in two parallel queries
    const visited = new Set<string>([rootSeedId]);
    const forkIds: string[] = [];
    const edges: Array<{ parent: string; child: string }> = [];
    let frontier: string[] = [rootSeedId];

    for (let d = 0; d < depth; d++) {
      const rawForks = await Fork.find(
        { parentSeed: { $in: frontier.map(f => new mongoose.Types.ObjectId(f)) } },
        { _id: 1, parentSeed: 1 }
      ).limit(200).lean();

      const next: string[] = [];
      for (const f of rawForks) {
        const child = String(f._id);
        const parent = String((f as any).parentSeed);
        edges.push({ parent, child });
        if (!visited.has(child)) {
          visited.add(child);
          forkIds.push(child);
          next.push(child);
        }
      }
      frontier = next;
      if (frontier.length === 0) break;
    }

    const [rootSeed, forks] = await Promise.all([
      Seed.findById(rootSeedId, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
        .populate('author', 'username displayName avatarUrl')
        .lean(),
      Fork.find(
        { _id: { $in: forkIds } },
        { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 }
      )
        .populate('author', 'username displayName avatarUrl')
        .lean(),
    ]);

    if (!rootSeed) return getLineageFromNode(id, depth);

    const nodes: EnrichedNode[] = [buildSeedNode(rootSeed)];
    for (const fork of forks) {
      nodes.push(buildForkNode(fork, String((fork as any).parentSeed)));
    }

    return { nodes, edges };
  } catch (error) {
    console.error(`❌ Error in getLineageInternal for ${id}:`, error);
    return getLineageFromNode(id, depth);
  }
}

// Fallback: when we can't find a root seed, BFS from the given node
async function getLineageFromNode(id: string, depth: number) {
  const visited = new Set<string>([id]);
  const forkIds: string[] = [];
  const edges: Array<{ parent: string; child: string }> = [];
  let frontier: string[] = [id];

  for (let d = 0; d < depth; d++) {
    const rawForks = await Fork.find(
      { parentSeed: { $in: frontier.map(f => new mongoose.Types.ObjectId(f)) } },
      { _id: 1, parentSeed: 1 }
    ).limit(200).lean();

    const next: string[] = [];
    for (const f of rawForks) {
      const child = String(f._id);
      const parent = String((f as any).parentSeed);
      edges.push({ parent, child });
      if (!visited.has(child)) {
        visited.add(child);
        forkIds.push(child);
        next.push(child);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  const [seedResult, allForks] = await Promise.all([
    Seed.findById(id, { title: 1, contentSnippet: 1, contentFull: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
      .populate('author', 'username displayName avatarUrl')
      .lean(),
    Fork.find(
      { _id: { $in: [id, ...forkIds] } },
      { _id: 1, parentSeed: 1, summary: 1, contentDelta: 1, description: 1, author: 1, forkCount: 1, thumbnailUrl: 1, imageUrl: 1, createdAt: 1 }
    )
      .populate('author', 'username displayName avatarUrl')
      .lean(),
  ]);

  const nodes: EnrichedNode[] = [];
  if (seedResult) nodes.push(buildSeedNode(seedResult));

  for (const fork of allForks) {
    if (String(fork._id) === id && seedResult) continue;
    nodes.push(buildForkNode(fork, String((fork as any).parentSeed)));
  }

  return { nodes, edges };
}

function buildSeedNode(seed: any): EnrichedNode {
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

function buildForkNode(fork: any, parentId: string): EnrichedNode {
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

async function findRootSeed(id: string): Promise<string | null> {
  try {
    const visited = new Set<string>();
    let currentId = id;
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const seed = await Seed.findById(currentId).lean();
      if (seed) return currentId;
      const fork = await Fork.findById(currentId).lean();
      if (fork) {
        currentId = String((fork as any).parentSeed);
      } else {
        break;
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Error finding root seed for ${id}:`, error);
    return null;
  }
}
