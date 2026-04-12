import { log } from './logger';
import { checkAndAlert } from './alert';
import { runFullPipeline } from './pipeline';

let failureCount = 0;
const MAX_RETRIES = 3;

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  LEONARDO_API_KEYS?: string;
  FACEBOOK_PAGE_ID: string;
  FACEBOOK_ACCESS_TOKEN: string;
  GEMINI_API_KEY: string;
}

async function runPipeline(c: { env: Env }): Promise<{ success: boolean; message: string }> {
  const runId = Date.now();
  
  try {
    log('info', `Pipeline run ${runId} started`, { runId });
    
    const result = await runFullPipeline(c);
    
    if (result.success) {
      failureCount = 0;
      log('info', `Pipeline run ${runId} completed successfully`, { runId, message: result.message });
    } else {
      failureCount++;
      log('error', `Pipeline run ${runId} failed`, { runId, error: result.message, failureCount });
      
      if (failureCount >= MAX_RETRIES) {
        await checkAndAlert(failureCount, result.message, c.env);
      }
    }
    
    return result;
  } catch (error) {
    failureCount++;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    log('error', `Pipeline run ${runId} failed`, { runId, error: errorMessage, failureCount });
    
    if (failureCount >= MAX_RETRIES) {
      await checkAndAlert(failureCount, errorMessage, c.env);
    }
    
    return { success: false, message: errorMessage };
  }
}

function getFailureCount(): number {
  return failureCount;
}

function resetFailureCount(): void {
  failureCount = 0;
}

export { runPipeline, getFailureCount, resetFailureCount };