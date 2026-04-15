type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

interface RunLog {
  runId: string;
  timestamp: string;
  success: boolean;
  message: string;
  steps: Array<{
    step: string;
    status: 'done' | 'error';
    message?: string;
  }>;
  stepFailures?: Array<{
    step: string;
    error: string;
  }>;
  durationMs?: number;
}

interface KVNamespace {
  put(key: string, value: string): Promise<void>;
  get(key: string, type: 'json'): Promise<RunLog | null>;
  list(prefix?: { prefix: string; limit?: number }): Promise<{ keys: Array<{ name: string }>; list_complete: boolean }>;
}

let kv: KVNamespace | null = null;

export function initLogger(kvNamespace: KVNamespace | null): void {
  kv = kvNamespace;
}

export function log(
  level: LogLevel, 
  message: string, 
  data?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data })
  };
  
  console.log(JSON.stringify(entry));
}

export async function saveRunLog(runLog: RunLog): Promise<void> {
  if (!kv) {
    log('warn', 'KV not available, skipping log save');
    return;
  }
  
  try {
    const key = `run:${runLog.runId}`;
    await kv.put(key, JSON.stringify(runLog));
    log('info', `Saved run log: ${key}`);
  } catch (error) {
    log('error', 'Failed to save run log', { error: String(error) });
  }
}

export async function getRunHistory(limit = 20): Promise<RunLog[]> {
  if (!kv) {
    return [];
  }
  
  try {
    const result = await kv.list({ prefix: 'run:', limit });
    const runs: RunLog[] = [];
    
    for (const key of result.keys) {
      const runId = key.name.replace('run:', '');
      const log = await kv.get(key.name, 'json');
      if (log) {
        runs.push(log);
      }
    }
    
    runs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return runs.slice(0, limit);
  } catch (error) {
    log('error', 'Failed to get run history', { error: String(error) });
    return [];
  }
}

export { LogLevel, LogEntry, RunLog };