import type { Request, Response } from 'express';
import { Seed } from '../models/Seed';
import { sanitizeSearch } from '../utils/validators';
import { semanticSearch, getSimilar } from '../services/mlsearch';

export async function search(req: Request, res: Response) {
  const raw = sanitizeSearch(req.query.q);
  const type = req.query.type as string | undefined;
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 20)));

  const fallbackSearch = async () => {
    const filter: Record<string, any> = { deletedAt: null };
    if (raw && raw.trim().length > 0) {
      const rx = new RegExp(raw.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { contentSnippet: rx }, { tags: rx }];
    }
    if (type && type !== 'all') filter.type = type;
    return Seed.find(filter)
      .populate('author', 'username displayName avatarUrl')
      .select('title contentSnippet contentFull type thumbnailUrl tags forkCount likes createdAt author')
      .sort('-createdAt')
      .limit(limit)
      .lean();
  };

  if (!raw || raw.trim().length === 0) {
    const items = await fallbackSearch();
    return res.json({ items });
  }

  try {
    const items = await semanticSearch(raw.trim());
    return res.json({ items });
  } catch (err) {
    console.warn('ML search unavailable, falling back to text search:', err);
    const items = await fallbackSearch();
    return res.json({ items });
  }
}

export async function similar(req: Request, res: Response) {
  const { id, type } = req.body as { id: string; type: 'seed' | 'fork' };
  if (!id || !type) return res.status(400).json({ error: { message: 'id and type are required' } });

  try {
    const items = await getSimilar(id, type);
    return res.json({ items });
  } catch (err) {
    console.warn('ML similar unavailable:', err);
    return res.json({ items: [] });
  }
}
