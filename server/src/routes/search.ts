import { Router } from 'express';
import { search, similar } from '../controllers/searchController';

const router = Router();
router.get('/', search);
router.post('/similar', similar);
export default router;



