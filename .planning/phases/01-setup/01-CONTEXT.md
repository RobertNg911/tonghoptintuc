# Phase 1 - CONTEXT.md

## Phase Overview

**Phase 1: Setup** — Cloudflare Workers + Hono foundation, health endpoint

## Decisions Made

### 1. Project Structure

```
src/
  index.ts          # main entry, Hono app
  routes/
    health.ts       # /health endpoint
  utils/
    logger.ts       # logging utility
    env.ts          # env validation
  types/
    index.ts        # TypeScript types
wrangler.toml
package.json
tsconfig.json
```

**Rationale**: Simple, modular, easy to extend for future phases

### 2. Environment Variables

```env
# Required
FACEBOOK_PAGE_ID=
FACEBOOK_ACCESS_TOKEN=
GEMINI_API_KEY=

# Optional
LOG_LEVEL=info
NODE_ENV=production
```

**Validation**: Check required vars at startup, throw error if missing

### 3. Health Endpoint

**Route**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-04-12T20:00:00Z",
  "version": "1.0.0",
  "uptime": "1h 23m"
}
```

**CORS**: Enabled for all origins (future webhook compatibility)

### 4. Wrangler Config

```toml
name = "tonghoptintuc"
main = "src/index.ts"
compatibility_date = "2026-04-12"
workers_dev = true
```

### 5. Tech Stack (from research)

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Runtime | Cloudflare Workers | Free tier, edge-native |
| Framework | Hono | ~14KB vs Fastify 200KB+ |
| Language | TypeScript | Type safety |
| Package Manager | npm | Standard |

### 6. Dependencies

```json
{
  "hono": "^4.0.0",
  "@hono/node-server": "^1.0.0",
  "wrangler": "^3.0.0"
}
```

## Code Context

- **Entry**: `src/index.ts` with Hono app
- **Port**: 8787 (Cloudflare Workers default)
- **Dev**: `npx wrangler dev`

## Implementation Notes

1. Create Hono app with middleware: logger, cors
2. Health endpoint at `/health`
3. Validate env vars at startup
4. Use Cloudflare Durable Objects for uptime tracking (optional)

## Out of Scope for Phase 1

- RSS feed fetching (Phase 2)
- Facebook posting (Phase 3)
- AI processing (Phase 5)

---

*Context created: 2026-04-12*
*Context updated: 2026-04-12 with user's approval*