import type { Request, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware } from './authController';

export async function getUser(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const user = await User.findById(id, { username: 1, displayName: 1, avatarUrl: 1, bannerUrl: 1, bio: 1 }).lean();
  if (!user) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ id: (user as any)._id, ...user });
}

export async function updateUser(req: Request & { userId?: string }, res: Response) {
  const { id } = req.params as { id: string };
  if (req.userId !== id) return res.status(403).json({ error: { message: 'Forbidden' } });
  const { displayName, avatarUrl, bannerUrl, bio } = req.body || {};
  const updated = await User.findByIdAndUpdate(
    id,
    { $set: { displayName, avatarUrl, bannerUrl, bio } },
    { new: true, projection: { username: 1, displayName: 1, avatarUrl: 1, bannerUrl: 1, bio: 1 } }
  ).lean();
  return res.json({ id: (updated as any)?._id, ...updated });
}

export { authMiddleware };



