import { Router } from 'express';
import { getUser, updateUser, authMiddleware } from '../controllers/userController';
import { listForksInspiredByUser } from '../controllers/forkController';

const router = Router();

router.get('/:id', getUser);
router.put('/:id', authMiddleware, updateUser);
router.get('/:id/inspired-forks', listForksInspiredByUser);

export default router;



