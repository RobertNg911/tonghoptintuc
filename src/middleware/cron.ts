import { Hono } from 'hono';
import { runPipeline } from '../services/scheduler';
import { log } from '../services/logger';

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const cronRoute = new Hono();

cronRoute.post('/cron', async (c) => {
  const startTime = Date.now();
  const env = c.env as Env;
  
  const delayMs = Math.floor(Math.random() * 15 * 60 * 1000);
  await new Promise(resolve => setTimeout(resolve, delayMs));
  
  const result = await runPipeline({ env });
  const duration = Date.now() - startTime;
  
  log('info', 'Cron job completed', { success: result.success, durationMs: duration });
  
  return c.json({
    success: result.success,
    message: result.message,
    durationMs: duration,
    timestamp: new Date().toISOString()
  });
});

export { cronRoute };