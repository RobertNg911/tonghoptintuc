import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';
import { feedsRoute } from './routes/feeds';
import { cronRoute } from './middleware/cron';
import * as facebook from './services/facebook';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.route('/health', healthRoute);
app.route('/feeds', feedsRoute);
app.route('/cron', cronRoute);

// Facebook routes
app.post('/facebook/post', async (c) => {
  const { caption, imageUrl } = await c.req.json().catch(() => ({}));
  
  if (!caption) {
    return c.json({ success: false, error: 'caption is required' }, 400);
  }

  const result = await facebook.postToPage(c, caption, imageUrl);
  return c.json(result);
});

app.get('/facebook/info', async (c) => {
  try {
    const info = await facebook.getPageInfo(c);
    return c.json(info);
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to get page info' 
    }, 500);
  }
});

app.get('/facebook/validate', async (c) => {
  try {
    const valid = await facebook.validateToken(c);
    return c.json({ valid });
  } catch (error) {
    return c.json({ valid: false, error: 'Token validation failed' }, 500);
  }
});

app.post('/facebook/test', async (c) => {
  const testCaption = '🧪 Test post from TongHopTinTuc - ' + new Date().toISOString();
  const result = await facebook.postToPage(c, testCaption);
  return c.json(result);
});

// Default route
app.get('/', (c) => c.json({ 
  name: 'TongHopTinTuc',
  version: '1.0.0',
  status: 'running'
}));

export default app;