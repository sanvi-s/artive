import type { Request, Response } from 'express';
import { Seed } from '../models/Seed';
import { sanitizeSearch } from '../utils/validators';

export async function search(req: Request, res: Response) {
  const raw = sanitizeSearch(req.query.q);
  const type = req.query.type as string | undefined;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  const filter: any = { deletedAt: null };

  if (raw && raw.trim().length > 0) {
    const q = raw.trim();
    // Case-insensitive regex across title, snippet, and tags
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { title: rx },
      { contentSnippet: rx },
      { tags: rx },
    ];
  }

  if (type && type !== 'all') filter.type = type;

  const items = await Seed.find(filter)
    .populate('author', 'username displayName avatarUrl')
    .select('title contentSnippet contentFull type thumbnailUrl tags forkCount likes createdAt author')
    .sort('-createdAt')
    .limit(limit)
    .lean();

  res.json({ items });
}
