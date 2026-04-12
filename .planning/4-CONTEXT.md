# Phase 4 - CONTEXT.md

## Phase Overview

**Phase 4: Scheduling + Monitoring** — Cron trigger, logging, Telegram alerting

## Decisions Made

### 1. Scheduling

**Primary**: Cloudflare Cron Trigger
- Pattern: `0 * * * *` (every hour at :00)
- Free tier: 5 cron triggers
- Add random delay (0-15 min) to avoid spam detection

**Backup**: cron-job.org
- Free service for HTTP POST to your worker
- Fallback if Cloudflare cron fails

**Configuration (wrangler.toml)**:
```toml
triggers = {
  crons = ["0 * * * *"]
}
```

### 2. Logging

**Level**: info, warn, error

**Destination**: Console → Cloudflare Logs (dashboard)

**Log Format**:
```json
{
  "timestamp": "2026-04-12T20:00:00Z",
  "level": "info",
  "message": "Feed fetch completed",
  "data": { "items": 25, "sources": 10 }
}
```

**Retention**: Cloudflare Logs (via dashboard)

### 3. Alerting - Telegram

**How it works**: Send message via Telegram Bot API on errors

**Setup**:
1. Create bot via @BotFather
2. Get bot token
3. Get chat_id (your personal or group)
4. Add to env vars

**Environment Variables**:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Alert Trigger**:
- 3 consecutive failures → Alert
- Any critical error (token invalid, API down)

**Message Format**:
```
🚨 TongHopTinTuc Alert

Error: Failed to fetch feeds
Time: 2026-04-12 20:00 UTC
Count: 3 consecutive failures

Action needed!
```

### 4. Error Handling

| Scenario | Action |
|----------|--------|
| 1 failure | Log, continue |
| 2 failures | Log warning |
| 3 failures | Alert via Telegram, stop pipeline |
| Recovery | Reset counter on success |

### 5. Implementation

**Location**: `src/services/scheduler.ts`, `src/services/alert.ts`

**Functions**:
- `runPipeline()`: Main entry (called by cron)
- `sendTelegramAlert(message: string): Promise<void>`
- `log(level, message, data)`

## Code Context

- **Framework**: Hono (from Phase 1)
- **Cron**: Cloudflare Cron Triggers + wrangler.toml
- **Alert**: Telegram Bot API

## Prior Decisions Applied

- No database (from constraints)
- Randomize timing (from Phase 3)
- 3-failure threshold (from REQUIREMENTS.md)

## Out of Scope for Phase 4

- AI processing (Phase 5)
- Facebook token renewal (Phase 3)

---

*Context created: 2026-04-12*
*Context updated: 2026-04-12 with user's approval*