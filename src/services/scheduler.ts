import { log, saveRunLog, initLogger } from './logger';
import { alertError } from './alert';
import { runFullPipeline } from './pipeline';

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  LEONARDO_API_KEYS?: string;
  FACEBOOK_PAGE_ID: string;
  FACEBOOK_ACCESS_TOKEN: string;
  GEMINI_API_KEY: string;
  RUN_LOGS?: {
    put(key: string, value: string): Promise<void>;
    get(key: string, type: 'json'): Promise<any>;
    list(prefix?: { prefix: string; limit?: number }): Promise<{ keys: Array<{ name: string }>; list_complete: boolean }>;
  };
}

interface StepResult {
  step: string;
  status: 'done' | 'error';
  message?: string;
}

interface StepFailure {
  step: string;
  error: string;
}

const failureHistory: StepFailure[] = [];
const MAX_FAILURES = 3;

function addFailure(step: string, error: string): void {
  failureHistory.push({
    step,
    error: error.substring(0, 200)
  });
  
  if (failureHistory.length > 10) {
    failureHistory.shift();
  }
}

function getRecentFailures(): StepFailure[] {
  return failureHistory.slice(-MAX_FAILURES);
}

async function sendDetailedAlert(env: Env): Promise<void> {
  const failures = getRecentFailures();
  
  let message = `🚨 *TongHopTinTuc Alert*\n\n`;
  message += `⚠️ *${failures.length} lần thất bại liên tiếp*\n\n`;
  message += `📋 *Chi tiết:*\n`;
  
  for (let i = 0; i < failures.length; i++) {
    const f = failures[i];
    message += `\n${i + 1}. [${f.step}]\n   ${f.error}`;
  }
  
  message += `\n\n⏰ *Lần cuối:* ${new Date().toISOString()}`;
  message += `\n*Cần kiểm tra!*`;
  
  await alertError(message, env);
}

export async function runPipeline(c: { env: Env }, category?: 'world' | 'tech'): Promise<{ 
  success: boolean; 
  message: string;
  steps?: StepResult[];
  stepFailures?: StepFailure[];
}> {
  const runId = Date.now();
  const steps: StepResult[] = [];
  const targetCategory = category || 'world';
  
  initLogger((c.env as any).RUN_LOGS);
  log('info', `Pipeline run ${runId} started`, { category: targetCategory });
  
  try {
    const result = await runFullPipeline(c, (step: string, status: 'done' | 'error', message?: string) => {
      steps.push({ step, status, message });
      log('info', `Step ${step}: ${status}`, { message });
    }, targetCategory);
    
    if (result.success) {
      failureHistory.length = 0;
      steps.push({ step: 'done', status: 'done' });
      log('info', `Pipeline completed successfully`);
    } else {
      for (const s of result.stepFailures || []) {
        addFailure(s.step, s.error);
      }
      
      if (failureHistory.length >= MAX_FAILURES) {
        await sendDetailedAlert(c.env);
      }
      
      log('error', `Pipeline failed`, { errors: result.stepFailures });
    }
    
    try {
      await saveRunLog({
        runId: String(runId),
        timestamp: new Date(runId).toISOString(),
        success: result.success,
        message: result.message,
        steps,
        stepFailures: result.stepFailures,
        durationMs: Date.now() - runId
      });
    } catch (e) {
      log('warn', 'Failed to save run log');
    }
    
    return { 
      success: result.success, 
      message: result.message,
      steps,
      stepFailures: result.stepFailures
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    addFailure('fatal', errorMessage);
    steps.push({ step: 'fatal', status: 'error', message: errorMessage });
    
    if (failureHistory.length >= MAX_FAILURES) {
      await sendDetailedAlert(c.env);
    }
    
    log('error', `Pipeline fatal error`, { error: errorMessage });
    
    try {
      const duration = Date.now() - runId;
      await saveRunLog({
        runId: String(runId),
        timestamp: new Date(runId).toISOString(),
        success: false,
        message: errorMessage,
        steps,
        durationMs: duration
      });
    } catch (e) {
      log('warn', 'Failed to save error log');
    }
    
    return { success: false, message: errorMessage, steps };
  }
}