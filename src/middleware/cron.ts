import { Hono } from 'hono';
import { runPipeline } from '../services/scheduler';
import { log } from '../services/logger';

const cronRoute = new Hono();

cronRoute.post('/', async (c) => {
  return c.json({ message: 'Use POST to run cron' });
});

cronRoute.all('/', async (c) => {
  const startTime = Date.now();
  const minute = new Date().getMinutes();
  
  const category = minute >= 30 ? 'tech' : 'world';
  
  log('info', `Cron job started`, { minute, category });
  
  const result = await runPipeline(c, category);
  const duration = Date.now() - startTime;
  
  log('info', 'Cron job completed', { success: result.success, durationMs: duration, category });
  
  return c.json({
    success: result.success,
    message: result.message,
    category,
    durationMs: duration,
    timestamp: new Date().toISOString()
  });
});

const stepEvents: Map<string, string[]> = new Map();

export function emitStep(runId: string, step: string, status: 'start' | 'done' | 'error', message?: string): void {
  const steps = stepEvents.get(runId) || [];
  steps.push(JSON.stringify({ step, status, message, time: Date.now() }));
  stepEvents.set(runId, steps);
  
  if (steps.length > 100) {
    stepEvents.delete(runId);
  }
}

cronRoute.get('/progress/:runId', async (c) => {
  const runId = c.req.param('runId');
  const steps = stepEvents.get(runId) || [];
  return c.json({ steps, total: steps.length });
});

export { cronRoute };