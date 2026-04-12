import { Hono } from 'hono';
import { getRuntimeKey } from 'hono/adapter';

const healthRoute = new Hono();

// Track start time for uptime calculation
const startTime = Date.now();

healthRoute.get('/', (c) => {
  const uptimeMs = Date.now() - startTime;
  const uptime = formatUptime(uptimeMs);
  
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime,
    runtime: getRuntimeKey()
  });
});

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export { healthRoute };