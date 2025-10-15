import { Router } from 'express';
import { config } from '../config';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, env: config.env });
});

router.get('/version', (_req, res) => {
  res.json({ version: config.version });
});

router.get('/config', (_req, res) => {
  res.json({
    apiBase: config.apiBaseUrl,
    cloudinaryCloudName: config.cloudinary.cloudName,
  });
});

export default router;



