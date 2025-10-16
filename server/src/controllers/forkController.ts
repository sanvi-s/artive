import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';
import { Seed } from '../models/Seed';

export async function createFork(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
  const { id } = req.params as { id: string };
  const { contentDelta, summary } = req.body || {};
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Fork.create([{ parentSeed: id, author: req.userId, contentDelta, summary }], { session });
      
      // Check if the parent is a seed or a fork
      const seed = await Seed.findById(id).session(session);
      if (seed) {
        // Parent is a seed, increment its forkCount
        await Seed.findByIdAndUpdate(id, { $inc: { forkCount: 1 } }, { session });
      }
      // If parent is a fork, we don't need to increment anything since forks don't have forkCount
    });
    res.status(201).json({ ok: true });
  } finally {
    await session.endSession();
  }
}

export async function getFork(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: { message: 'Invalid fork id' } });
  }

  const fork = await Fork.findById(id)
    .populate('author', 'username displayName avatarUrl')
    .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull createdAt')
    .lean();

  if (!fork) {
    return res.status(404).json({ error: { message: 'Fork not found' } });
  }

  res.json({ fork });
}

export async function listForks(req: Request, res: Response) {
  const { id } = req.params as { id?: string };
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (typeof id === 'string' && id.length > 0) {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: { message: 'Invalid seed id' } });
    }
    filter.parentSeed = id;
  }

  const [items, total] = await Promise.all([
    Fork.find(filter)
      .populate('author', 'username displayName avatarUrl')
      .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Fork.countDocuments(filter),
  ]);

  res.json({ page, limit, total, items });
}

// List forks that were inspired by a user's seeds (i.e., forks on seeds authored by userId)
export async function listForksInspiredByUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { message: 'Invalid user id' } });
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;

  const seeds = await Seed.find({ author: id }, { _id: 1 }).lean();
  const seedIds = seeds.map(s => s._id);
  if (seedIds.length === 0) return res.json({ page, limit, total: 0, items: [] });

  // Recursively find all forks in the lineage (including forks of forks)
  const getAllInspiredForks = async (parentIds: string[], depth = 0): Promise<string[]> => {
    if (depth > 5) return []; // Prevent infinite recursion
    
    const forks = await Fork.find({ parentSeed: { $in: parentIds } }, { _id: 1 }).lean();
    const forkIds = forks.map(f => String(f._id));
    
    if (forkIds.length === 0) return [];
    
    // Recursively find forks of these forks
    const nestedForkIds = await getAllInspiredForks(forkIds, depth + 1);
    
    return [...forkIds, ...nestedForkIds];
  };

  const allInspiredForkIds = await getAllInspiredForks(seedIds);
  
  // Get all forks that were inspired by the user's seeds (including nested forks)
  const allParentIds = [...seedIds, ...allInspiredForkIds];

  const [items, total] = await Promise.all([
    Fork.find({ parentSeed: { $in: allParentIds } })
      .populate('author', 'username displayName avatarUrl')
      .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Fork.countDocuments({ parentSeed: { $in: allParentIds } }),
  ]);

  res.json({ page, limit, total, items });
}

// List forks created by a user
export async function listForksByUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { message: 'Invalid user id' } });
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Fork.find({ author: id })
      .populate('author', 'username displayName avatarUrl')
      .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Fork.countDocuments({ author: id }),
  ]);

  res.json({ page, limit, total, items });
}

export async function deleteFork(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
  
  const { id } = req.params as { id: string };
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: { message: 'Invalid fork id' } });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Find the fork and verify ownership
      const fork = await Fork.findById(id).session(session);
      if (!fork) {
        throw new Error('Fork not found');
      }
      
      // Check if user is the author of the fork
      if (fork.author.toString() !== req.userId) {
        throw new Error('Unauthorized to delete this fork');
      }

      // Delete the fork
      await Fork.findByIdAndDelete(id).session(session);
      
      // Decrement the fork count on the parent seed
      await Seed.findByIdAndUpdate(
        fork.parentSeed, 
        { $inc: { forkCount: -1 } }, 
        { session }
      );
    });
    
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting fork:', error);
    res.status(400).json({ error: { message: error.message || 'Failed to delete fork' } });
  } finally {
    await session.endSession();
  }
}



