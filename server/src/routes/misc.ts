import { Router } from 'express';
import { config } from '../config';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    env: config.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: config.version
  });
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



