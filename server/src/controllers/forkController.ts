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
      await Seed.findByIdAndUpdate(id, { $inc: { forkCount: 1 } }, { session });
    });
    res.status(201).json({ ok: true });
  } finally {
    await session.endSession();
  }
}

export async function listForks(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Fork.find({ parentSeed: id })
      .populate('author', 'username displayName avatarUrl')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Fork.countDocuments({ parentSeed: id }),
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

  const [items, total] = await Promise.all([
    Fork.find({ parentSeed: { $in: seedIds } })
      .populate('author', 'username displayName avatarUrl')
      .populate('parentSeed', 'title type thumbnailUrl contentSnippet contentFull')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Fork.countDocuments({ parentSeed: { $in: seedIds } }),
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



