import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Fork } from '../models/Fork';
import { Seed } from '../models/Seed';
import { Lineage } from '../models/Lineage';
import { embedText } from '../services/mlsearch';

// Helper function to find the root seed by traversing up the lineage
async function findRootSeed(id: string): Promise<string | null> {
  const visited = new Set<string>();
  let currentId = id;
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    
    // Check if current ID is a seed
    const seed = await Seed.findById(currentId).lean();
    if (seed) {
      return currentId; // Found the root seed
    }
    
    // Check if current ID is a fork, get its parent
    const fork = await Fork.findById(currentId).lean();
    if (fork) {
      currentId = String((fork as any).parentSeed);
    } else {
      break; // Not found, break the loop
    }
  }
  
  return null;
}

// Helper function to calculate total fork count for a seed (including all descendants)
async function calculateTotalForkCount(seedId: string): Promise<number> {
  const visited = new Set<string>();
  let totalCount = 0;
  
  async function countForksRecursively(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    // Count direct forks
    const directForks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(id) }).lean();
    totalCount += directForks.length;
    
    // Recursively count forks of each direct fork
    for (const fork of directForks) {
      await countForksRecursively(String(fork._id));
    }
  }
  
  await countForksRecursively(seedId);
  return totalCount;
}

export async function createFork(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
  const { id } = req.params as { id: string };
  const { contentDelta, summary, description, imageUrl, thumbnailUrl } = req.body || {};

  let newForkId: any = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const [created] = await Fork.create([{
        parentSeed: id,
        author: req.userId,
        contentDelta,
        summary,
        description,
        imageUrl,
        thumbnailUrl
      }], { session });
      newForkId = created._id;

      const seed = await Seed.findById(id).session(session);
      if (seed) {
        await Seed.findByIdAndUpdate(id, { $inc: { forkCount: 1 } }, { session });
      } else {
        await Fork.findByIdAndUpdate(id, { $inc: { forkCount: 1 } }, { session });
      }
    });

    const rootSeedId = await findRootSeed(id);
    if (rootSeedId) {
      const totalForkCount = await calculateTotalForkCount(rootSeedId);
      await Seed.findByIdAndUpdate(rootSeedId, { forkCount: totalForkCount });

      if (newForkId) {
        await Lineage.findOneAndUpdate(
          { seedId: new mongoose.Types.ObjectId(rootSeedId) },
          { $addToSet: { children: newForkId } },
          { upsert: true, new: true }
        );
        console.log(`🌳 Lineage updated for root ${rootSeedId}: added fork ${newForkId}`);
      }
    }

    // fire-and-forget embedding
    if (newForkId) {
      const parentTitle = (await Seed.findById(id).lean() as any)?.title || '';
      const words = (contentDelta || '').split(/\s+/).slice(0, 500).join(' ');
      const text = [parentTitle, summary, words].filter(Boolean).join(' ');
      embedText(text)
        .then(embedding => Fork.findByIdAndUpdate(newForkId, { embedding }))
        .catch(err => console.warn('[embed] fork embedding failed:', err));
    }

    res.status(201).json({ ok: true });
  } catch (error: any) {
    console.error('❌ Error creating fork:', error);
    res.status(500).json({ error: { message: 'Failed to create fork' } });
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

  // Get forks of this fork
  const forks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(id) })
    .populate('author', 'username displayName avatarUrl')
    .sort('-createdAt')
    .limit(10)
    .lean();

  res.json({ fork, forks });
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
      .populate('parentSeed', 'title type thumbnailUrl imageUrl contentSnippet contentFull createdAt')
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

  const allInspiredForkIds = await getAllInspiredForks(seedIds as any);
  
  // Get all forks that were inspired by the user's seeds (including nested forks)
  const allParentIds = [...seedIds, ...allInspiredForkIds];

  const [items, total] = await Promise.all([
    Fork.find({ parentSeed: { $in: allParentIds } })
      .populate('author', 'username displayName avatarUrl')
      .populate('parentSeed', 'title type thumbnailUrl imageUrl contentSnippet contentFull')
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
      .populate('parentSeed', 'title type thumbnailUrl imageUrl contentSnippet contentFull')
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

  // Get rootSeedId BEFORE deleting — findRootSeed won't work after the fork is gone
  const rootSeedId = await findRootSeed(id);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const fork = await Fork.findById(id).session(session);
      if (!fork) throw new Error('Fork not found');
      if (fork.author.toString() !== req.userId) throw new Error('Unauthorized to delete this fork');

      await Fork.findByIdAndDelete(id).session(session);

      const parentSeed = await Seed.findById(fork.parentSeed).session(session);
      if (parentSeed) {
        await Seed.findByIdAndUpdate(fork.parentSeed, { $inc: { forkCount: -1 } }, { session });
      } else {
        await Fork.findByIdAndUpdate(fork.parentSeed, { $inc: { forkCount: -1 } }, { session });
      }
    });

    if (rootSeedId) {
      const totalForkCount = await calculateTotalForkCount(rootSeedId);
      await Seed.findByIdAndUpdate(rootSeedId, { forkCount: totalForkCount });

      await Lineage.findOneAndUpdate(
        { seedId: new mongoose.Types.ObjectId(rootSeedId) },
        { $pull: { children: new mongoose.Types.ObjectId(id) } }
      );
      console.log(`🌳 Lineage updated for root ${rootSeedId}: removed fork ${id}`);
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting fork:', error);
    res.status(400).json({ error: { message: error.message || 'Failed to delete fork' } });
  } finally {
    await session.endSession();
  }
}



