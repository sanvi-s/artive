import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me } from '../controllers/authController';
import { authMiddleware } from '../controllers/authController';

const router = Router();
const writeLimiter = rateLimit({ windowMs: 60_000, max: 10 });

router.post('/register', writeLimiter, register);
router.post('/login', writeLimiter, login);
router.get('/me', authMiddleware, me);

export default router;



