import { log } from './logger';

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const API_URL = 'https://api.telegram.org/bot';

async function sendTelegramAlert(message: string, env: Env): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    log('warn', 'Telegram not configured - skipping alert');
    return false;
  }

  const url = `${API_URL}${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const payload = {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.text();
      log('error', 'Telegram alert failed', { error, status: response.status });
      return false;
    }

    log('info', 'Telegram alert sent successfully', { message: message.substring(0, 50) });
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log('error', 'Telegram alert error', { error: errorMessage });
    return false;
  }
}

async function checkAndAlert(failureCount: number, lastError: string, env: Env): Promise<void> {
  const message = `🚨 *TongHopTinTuc Alert*\n\n` +
    `*Error:* ${lastError}\n` +
    `*Time:* ${new Date().toISOString()}\n` +
    `*Count:* ${failureCount} consecutive failures\n\n` +
    `*Action needed!*`;

  await sendTelegramAlert(message, env);
}

export { sendTelegramAlert, checkAndAlert };