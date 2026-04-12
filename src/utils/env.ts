interface Env {
  FACEBOOK_PAGE_ID: string;
  FACEBOOK_ACCESS_TOKEN: string;
  GEMINI_API_KEY: string;
  LOG_LEVEL?: string;
  NODE_ENV?: string;
}

function getEnv(c: { env: Env }): Env {
  const required = ['FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN', 'GEMINI_API_KEY'];
  const missing: string[] = [];

  for (const key of required) {
    if (!c.env[key] || c.env[key].trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return c.env as Env;
}

export { getEnv, type Env };