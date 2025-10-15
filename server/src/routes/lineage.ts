import { Router } from 'express';
import { getLineage, exportLineage } from '../controllers/lineageController';

const router = Router();

router.get('/:id', getLineage);
router.get('/:id/export', exportLineage);

export default router;



