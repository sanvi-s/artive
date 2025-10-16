import type { Request, Response, NextFunction } from 'express';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, type IUser } from '../models/User';
import { config } from '../config';
import { logger } from '../utils/logger';

function signToken(userId: string): string {
  return jwt.sign(
    { sub: userId },
    config.jwt.secret as Secret,
    { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] }
  );
}

export async function register(req: Request, res: Response) {
  const { email, username, displayName, password } = req.body || {};
  if (!email || !username || !displayName || !password) {
    logger.warn(`register: missing fields email=${!!email} username=${!!username} displayName=${!!displayName}`);
    return res.status(400).json({ error: { message: 'Missing fields' } });
  }
  const emailLower = String(email).toLowerCase();
  const existingByEmail = await User.findOne({ email: emailLower }).lean();
  if (existingByEmail) {
    logger.info(`register: email taken ${emailLower}`);
    return res.status(409).json({ error: { message: 'Email taken' } });
  }
  const existingByUsername = await User.findOne({ username }).lean();
  if (existingByUsername) {
    logger.info(`register: username taken ${username}`);
    return res.status(409).json({ error: { message: 'Username taken' } });
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await User.create({ email: emailLower, username, displayName, passwordHash });
  const token = signToken(String(user._id));
  logger.info(`register: success userId=${user._id}`);
  return res.json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName } });
}

export async function login(req: Request, res: Response) {
  const { identifier, username, password } = req.body || {};
  const id = identifier || username; // backward compatible
  if (!id || !password) {
    logger.warn(`login: missing fields identifier=${!!id}`);
    return res.status(400).json({ error: { message: 'Missing fields' } });
  }
  const query = id.includes('@') ? { email: String(id).toLowerCase() } : { username: id };
  const user = await User.findOne(query);
  if (!user || !user.passwordHash) {
    logger.info(`login: invalid credentials for ${JSON.stringify(query)}`);
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    logger.info(`login: password mismatch for userId=${user._id}`);
    return res.status(401).json({ error: { message: 'Invalid credentials' } });
  }
  const token = signToken(String(user._id));
  logger.info(`login: success userId=${user._id}`);
  return res.json({ token, user: { id: user._id, email: user.email, username: user.username, displayName: user.displayName } });
}

export async function me(req: Request & { userId?: string }, res: Response) {
  if (!req.userId) return res.status(401).json({ error: { message: 'Unauthorized' } });
  const user = await User.findById(req.userId).lean<IUser>();
  if (!user) return res.status(404).json({ error: { message: 'Not found' } });
  return res.json({ id: user._id, email: user.email, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl, bannerUrl: user.bannerUrl });
}

export function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: { message: 'Missing Authorization header' } });
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, config.jwt.secret as Secret) as any;
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: { message: 'Invalid token' } });
  }
}



