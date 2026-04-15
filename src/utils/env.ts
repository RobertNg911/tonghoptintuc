interface Env {
  FACEBOOK_PAGE_ID: string;
  FB_TOKEN: string;
  FACEBOOK_ACCESS_TOKEN?: string;
  GEMINI_API_KEY: string;
  LEONARDO_API_KEYS?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  LOG_LEVEL?: string;
  NODE_ENV?: string;
  RUN_LOGS?: {
    put(key: string, value: string): Promise<void>;
    get(key: string, type: 'json'): Promise<any>;
    list(prefix?: { prefix: string; limit?: number }): Promise<{ keys: Array<{ name: string }>; list_complete: boolean }>;
  };
}

function getEnv(c: { env: Env }): Env {
  const required = ['FACEBOOK_PAGE_ID', 'FB_TOKEN'];
  const missing: string[] = [];

  for (const key of required) {
    const val = c.env[key] || c.env[key.replace('FB_TOKEN', 'FACEBOOK_ACCESS_TOKEN')];
    if (!val || val.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return c.env as Env;
}

function getGeminiKeys(): string[] {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(k => k);
  }
  return [];
}

export { getEnv, getGeminiKeys, type Env };