import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Seed, type ISeed } from '../models/Seed';
import { Fork } from '../models/Fork';
import { clampString } from '../utils/validators';

export async function listSeeds(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
  const skip = (page - 1) * limit;
  const type = req.query.type as string | undefined;
  const sort = (req.query.sort as string) || '-createdAt';
  const search = (req.query.search as string) || undefined;
  const author = req.query.author as string | undefined; // optional author filter (user id)
  const q: any = { deletedAt: null };
  if (type) q.type = type;
  if (search) q.$text = { $search: search.replace(/[\$]/g, '') };
  if (author) {
    if (mongoose.isValidObjectId(author)) {
      q.author = new mongoose.Types.ObjectId(author);
    } else {
      return res.status(400).json({ error: { message: 'Invalid author id' } });
    }
  }

  const [items, total] = await Promise.all([
    Seed.find(q, { title: 1, contentSnippet: 1, type: 1, author: 1, forkCount: 1, thumbnailUrl: 1, createdAt: 1 })
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean(),
    Seed.countDocuments(q),
  ]);
  try { console.debug('[seeds] list', { page, limit, type, author, search, count: items.length }); } catch {}
  res.json({ page, limit, total, items });
}

export async function getSeed(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const full = String(req.query.full || 'false') === 'true';
  const projection: any = full
    ? {}
    : { contentFull: 0 };
  const seed = await Seed.findById(id, projection).lean<ISeed>();
  if (!seed || seed?.deletedAt) return res.status(404).json({ error: { message: 'Not found' } });
  const forks = await Fork.find({ parentSeed: new mongoose.Types.ObjectId(id) })
    .sort('-createdAt')
    .limit(10)
    .lean();
  try { console.debug('[seeds] get', { id, full, hasThumbnail: Boolean(seed.thumbnailUrl) }); } catch {}
  res.json({ seed, forks });
}

export async function createSeed(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
  const title = clampString(req.body?.title, 120);
  const contentSnippet = clampString(req.body?.contentSnippet, 400);
  const contentFull = clampString(req.body?.contentFull, 20000);
  const type = (req.body?.type as string) || 'other';
  const thumbnailUrl = typeof req.body?.thumbnailUrl === 'string' ? req.body.thumbnailUrl : undefined;
  if (!title) return res.status(400).json({ error: { message: 'Invalid title' } });
  try {
    console.debug('[seeds] create', {
      userId: req.userId,
      title,
      type,
      hasThumbnail: Boolean(thumbnailUrl),
      contentSnippet_len: (contentSnippet || '').length,
      contentSnippet_preview: (contentSnippet || '').slice(0, 80)
    });
  } catch {}
  const seed = await Seed.create({ title, contentSnippet, contentFull, type, author: req.userId, thumbnailUrl });
  try {
    console.debug('[seeds] created', {
      id: seed._id,
      contentSnippet_len: (seed.contentSnippet || '').length,
      contentSnippet_preview: (seed.contentSnippet || '').slice(0, 80)
    });
  } catch {}
  res.status(201).json({ id: seed._id });
}

export async function updateSeed(req: Request & { userId?: string }, res: Response) {
  const { id } = req.params as { id: string };
  const updates: any = {};
  if (req.body?.title) updates.title = clampString(req.body.title, 120);
  if (req.body?.contentSnippet) updates.contentSnippet = clampString(req.body.contentSnippet, 400);
  if (req.body?.contentFull) updates.contentFull = clampString(req.body.contentFull, 20000);
  if (req.body?.type) updates.type = req.body.type;
  const updated = await Seed.findByIdAndUpdate(id, { $set: updates }, { new: true, projection: { contentFull: 0 } }).lean<ISeed | null>();
  if (!updated) return res.status(404).json({ error: { message: 'Not found' } });
  res.json({ id: updated._id, ...updated });
}

export async function softDeleteSeed(req: Request & { userId?: string }, res: Response) {
  const { id } = req.params as { id: string };
  await Seed.findByIdAndUpdate(id, { $set: { deletedAt: new Date() } });
  res.status(204).send();
}



