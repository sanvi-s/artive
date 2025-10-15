import type { Request, Response } from 'express';
import { Seed } from '../models/Seed';
import { sanitizeSearch } from '../utils/validators';

export async function search(req: Request, res: Response) {
  const q = sanitizeSearch(req.query.q);
  const type = req.query.type as string | undefined;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const filter: any = { deletedAt: null };
  if (q) filter.$text = { $search: q };
  if (type) filter.type = type;
  const items = await Seed.find(filter, { title: 1, contentSnippet: 1, type: 1, thumbnailUrl: 1 })
    .sort('-createdAt')
    .limit(limit)
    .lean();
  res.json({ items });
}



