import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createFork, listForks, deleteFork } from '../controllers/forkController';
import { authMiddleware } from '../controllers/authController';

const router = Router({ mergeParams: true });
const writeLimiter = rateLimit({ windowMs: 60_000, max: 30 });

router.get('/', listForks);
router.post('/', authMiddleware, writeLimiter, createFork);
router.delete('/:id', authMiddleware, deleteFork);

export default router;



