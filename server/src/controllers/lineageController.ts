import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';

export async function getLineage(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const depth = Math.min(5, Math.max(1, Number(req.query.depth || 3)));
  
  // For now, just return the original seed since we don't have fork-to-seed relationships yet
  // This will show at least the original seed in the tree
  const nodes = [id];
  const edges: Array<{ parent: string; child: string }> = [];
  
  res.json({ nodes, edges });
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
    for (const seedId of frontier) {
      const forks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(seedId) }, { _id: 1 }).limit(200).lean();
      for (const f of forks) {
        const child = String(f._id);
        edges.push({ parent: seedId, child });
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



