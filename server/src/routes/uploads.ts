import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { uploadToCloudinary, deleteFromCloudinary } from '../controllers/uploadController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const writeLimiter = rateLimit({ windowMs: 60_000, max: 15 });

router.post('/', writeLimiter, upload.single('file'), uploadToCloudinary);
router.delete('/:public_id', writeLimiter, deleteFromCloudinary);

export default router;



