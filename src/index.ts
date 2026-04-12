import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.route('/health', healthRoute);

// Default route
app.get('/', (c) => c.json({ 
  name: 'TongHopTinTuc',
  version: '1.0.0',
  status: 'running'
}));

export default app;