import { Router } from 'express';
import { getUser, updateUser, authMiddleware } from '../controllers/userController';
import { listForksInspiredByUser, listForksByUser } from '../controllers/forkController';

const router = Router();

router.get('/:id', getUser);
router.put('/:id', authMiddleware, updateUser);
router.get('/:id/inspired-forks', listForksInspiredByUser);
router.get('/:id/forks', listForksByUser);

export default router;



