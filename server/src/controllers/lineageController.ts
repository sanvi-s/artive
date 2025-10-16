import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';

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



