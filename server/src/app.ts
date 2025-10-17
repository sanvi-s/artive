import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { productionConfig } from './config/production';
import { logger } from './utils/logger';
import miscRoutes from './routes/misc';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import seedRoutes from './routes/seeds';
import forkRoutes from './routes/forks';
import lineageRoutes from './routes/lineage';
import uploadRoutes from './routes/uploads';
import searchRoutes from './routes/search';

const app = express();

// Use production config in production environment
const currentConfig = config.env === 'production' ? productionConfig : config;

app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('tiny'));

// Attach a request id and log arrivals
app.use((req, _res, next) => {
  (req as any).id = req.headers['x-request-id'] || randomUUID();
  next();
});
app.use((req, _res, next) => {
  const rid = (req as any).id;
  logger.info(`${req.method} ${req.originalUrl} [rid=${rid}]`);
  next();
});

app.use(cors(currentConfig.cors));

const limiter = rateLimit(currentConfig.rateLimit);

// Apply limiter only to write routes later; for now, apply globally low limits
app.use(limiter);

// Routes
app.use('/api', miscRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seeds', seedRoutes);
app.use('/api/seeds/:id/forks', forkRoutes);
app.use('/api/forks', forkRoutes);
app.use('/api/lineage', lineageRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);

// On startup, print route table
function listRoutes(stack: any[], prefix = ''): string[] {
  const out: string[] = [];
  for (const layer of stack) {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods).filter(Boolean).join(',').toUpperCase();
      out.push(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const path = layer.regexp?.fast_star ? '*' : (layer.regexp?.fast_slash ? '/' : layer?.regexp?.toString());
      out.push(...listRoutes(layer.handle.stack, prefix));
    }
  }
  return out;
}

setImmediate(() => {
  try {
    const routerStack = (app as any)?._router?.stack;
    if (!routerStack) return;
    const routes = listRoutes(routerStack, '');
    logger.info(`Mounted routes (count=${routes.length}):\n` + routes.sort().join('\n'));
  } catch (err: any) {
    logger.warn(`Failed to list routes: ${err?.message || 'unknown error'}`);
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: { message: 'Not Found' } });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err?.stack || err?.message || 'Unknown error');
  const status = err.status || 500;
  res.status(status).json({ error: { message: err.message || 'Internal Server Error' } });
});

export default app;


