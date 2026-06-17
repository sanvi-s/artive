import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';
import { Seed } from '../models/Seed';
import { Lineage } from '../models/Lineage';

export async function getLineage(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const depth = Math.min(5, Math.max(1, Number(req.query.depth || 3)));
  
  try {
    console.log(`🌳 Fetching lineage for ID: ${id}, depth: ${depth}`);
    const result = await getLineageInternal(id, depth);
    console.log(`🌳 Lineage result:`, result);
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
    if (!rootSeedId) {
      console.log(`🌳 No root seed found for ${id}, using fallback BFS`);
      return getLineageFromNode(id, depth);
    }

    // Fast path: Lineage table stores all descendant IDs for the root seed.
    // One lookup + one batch Fork query replaces depth*frontier DB queries.
    const cachedLineage = await Lineage.findOne(
      { seedId: new mongoose.Types.ObjectId(rootSeedId) },
      { children: 1 }
    ).lean();

    if (cachedLineage && cachedLineage.children.length > 0) {
      console.log(`🌳 Fast path: Lineage cache hit — ${cachedLineage.children.length} descendants`);

      // Single batch query: fetch parentSeed for every known descendant
      const forks = await Fork.find(
        { _id: { $in: cachedLineage.children } },
        { _id: 1, parentSeed: 1 }
      ).lean();

      const nodes: string[] = [rootSeedId];
      const edges: Array<{ parent: string; child: string }> = [];
      const seen = new Set<string>([rootSeedId]);

      for (const fork of forks) {
        const child = String(fork._id);
        const parent = String((fork as any).parentSeed);
        if (!seen.has(child)) {
          seen.add(child);
          nodes.push(child);
        }
        edges.push({ parent, child });
      }

      console.log(`🌳 Fast path complete: ${nodes.length} nodes, ${edges.length} edges`);
      return { nodes, edges };
    }

    // Slow path: BFS through Fork collection level by level
    console.log(`🌳 Slow path: BFS from root seed ${rootSeedId}`);
    const visited = new Set<string>([rootSeedId]);
    const nodes: string[] = [rootSeedId];
    const edges: Array<{ parent: string; child: string }> = [];
    let frontier: string[] = [rootSeedId];

    for (let d = 0; d < depth; d++) {
      const next: string[] = [];
      for (const parentId of frontier) {
        const forks = await Fork.find(
          { parentSeed: new mongoose.Types.ObjectId(parentId) },
          { _id: 1 }
        ).limit(200).lean();

        for (const f of forks) {
          const child = String(f._id);
          edges.push({ parent: parentId, child });
          if (!visited.has(child)) {   // cycle guard
            visited.add(child);
            nodes.push(child);
            next.push(child);
          }
        }
      }
      frontier = next;
      if (frontier.length === 0) break; // nothing left to expand
    }

    console.log(`🌳 Slow path complete: ${nodes.length} nodes, ${edges.length} edges`);
    return { nodes, edges };
  } catch (error) {
    console.error(`❌ Error in getLineageInternal for ${id}:`, error);
    return getLineageFromNode(id, depth);
  }
}

// Original logic for when we can't find a root seed
async function getLineageFromNode(id: string, depth: number) {
  const visited = new Set<string>([id]);
  const nodes: string[] = [id];
  const edges: Array<{ parent: string; child: string }> = [];
  let frontier: string[] = [id];
  
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const parentId of frontier) {
      // Look for forks where parentSeed equals the current ID (works for both seeds and forks)
      const forks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(parentId) }, { _id: 1 }).limit(200).lean();
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
async function findRootSeed(id: string): Promise<string | null> {
  try {
    console.log(`🔍 Finding root seed for ID: ${id}`);
    const visited = new Set<string>();
    let currentId = id;
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      console.log(`🔍 Checking node: ${currentId}`);
      
      // Check if current ID is a seed
      const seed = await Seed.findById(currentId).lean();
      if (seed) {
        console.log(`✅ Found root seed: ${currentId}`);
        return currentId; // Found the root seed
      }
      
      // Check if current ID is a fork, get its parent
      const fork = await Fork.findById(currentId).lean();
      if (fork) {
        console.log(`🔀 Found fork, parent: ${(fork as any).parentSeed}`);
        currentId = String((fork as any).parentSeed);
      } else {
        console.log(`❌ Node not found: ${currentId}`);
        break; // Not found, break the loop
      }
    }
    
    console.log(`❌ No root seed found for ${id}`);
    return null;
  } catch (error) {
    console.error(`❌ Error finding root seed for ${id}:`, error);
    return null;
  }
}



