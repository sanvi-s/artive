import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { listSeeds, getSeed, getSeedOrFork, createSeed, updateSeed, softDeleteSeed } from '../controllers/seedController';
import { authMiddleware } from '../controllers/authController';

const router = Router();
const writeLimiter = rateLimit({ windowMs: 60_000, max: 30 });

router.get('/', listSeeds);
router.get('/:id', getSeed);
router.get('/:id/details', getSeedOrFork);
router.post('/', authMiddleware, writeLimiter, createSeed);
router.put('/:id', authMiddleware, writeLimiter, updateSeed);
router.delete('/:id', authMiddleware, writeLimiter, softDeleteSeed);

export default router;



