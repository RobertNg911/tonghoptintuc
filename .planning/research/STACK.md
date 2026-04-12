# Technology Stack

**Project:** TongHopTinTuc — News Aggregator with Auto-Post to Facebook
**Researched:** 2026-04-12
**Focus:** Free, lightweight, Cloudflare Workers compatible

---

## Recommended Stack

### Core Runtime

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Cloudflare Workers** | Latest | Serverless runtime (free tier: 100K req/day) | Free, fast, edge-based — ideal for hourly cron jobs |
| **Hono** | ^4.x | Web framework | Lightweight (~14KB), Works with Cloudflare Workers out of the box, built-in middleware for KV, D1, etc. |

**Why Hono over Fastify?**
- Fastify targets Node.js; Hono is designed for edge/serverless from day one
- Hono works natively with Cloudflare environment (KV, Durable Objects)
- Smaller bundle size (~14KB vs 200KB+)

### RSS/Feed Parsing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **@extractus/feed-extractor** | ^7.x | Parse RSS/Atom/JSON feeds | Actively maintained (2025), simple API, 4 dependencies |
| **Alternative: feedparser** | ^2.3.x | Classic parser | 26.7K weekly downloads, but 9 dependencies |

**Why @extractus/feed-extractor?**
- Fewer dependencies = smaller bundle for Workers
- Actively maintained in 2024-2025
- Simple `extract()` API for async parsing

**Avoid:** `feedparser-rs` (Rust-based) — may need extra config for Workers

### HTTP Client

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Built-in fetch** | Native (Workers) | HTTP requests | Built into Workers Runtime — no npm package needed |

No external HTTP library needed. Cloudflare Workers includes `fetch` globally.

### AI Text Generation

| Technology | Option | Free Tier | Cost After Free |
|------------|--------|---------|------------|--------------|
| **Google Gemini 2.5 Flash** | via Google AI Studio | 500 req/day (generous) | ~$0.02/1M tokens (input) |
| **OpenRouter** | gpt-4o-mini via OpenRouter | ~50 credits on signup | ~$0.15/1M tokens |
| **OpenAI GPT-4o mini** | Direct API | None (paid from start) | $0.15/1M tokens input |

**Recommendation:** **Google Gemini 2.5 Flash** via Google AI Studio

**Why:**
- Genuine free tier (500 requests/day as of April 2026) — verify on Google AI Studio docs
- Good enough for short news summarization
- No credit card required
- Simple REST API with JSON response

**Alternative:** Use OpenRouter as aggregator for model switching

### AI Image Generation

| Technology | Free Tier | Best For |
|------------|----------|---------|
| **ZSky AI** | 25 credits on signup | Quick prototyping |
| **Leonardo AI** | ~150 tokens/day (10-30 images) | Quality with style control |
| **Microsoft Designer** | 15 fast + unlimited slow | Occasional use |

**Recommendation:** **Leonardo API** or **ZSky AI**

**Why:**
- Leonardo: Good free tier for testing, better output quality than other free options
- ZSky AI: Simple API, 25 free credits on signup
- Both have REST APIs compatible with Workers

**Truth about "free" image APIs in 2026:**
- OpenAI DALL-E: Paid only ($0.04-0.08/image)
- Stable Diffusion via Replicate: Pay-per-use (~$0.003-0.02/image)
- Most "free tiers" are limited trials, not production-ready

**Strategy:** Start with free tier to test, budget for paid usage when volume increases

### Facebook Posting

| Technology | Method | Why |
|------------|--------|-----|
| **Facebook Graph API** | Direct REST calls | Official, stable, no library needed |
| `fetch()` to `https://graph.facebook.com/v25.0/{page_id}/feed` | POST with message + access_token |

**Why direct fetch over SDK:**
- No npm dependency needed for simple posting
- Lightweight Workers bundle
- Graph API v25.0 is current (February 2026)

**Required Permissions:**
- `pages_manage_posts`
- `pages_read_engagement`
- Use **Page Access Token** (not user token)

### Scheduling

| Technology | Free Tier | Why |
|------------|----------|-----|
| **Cloudflare Cron Triggers** | 5 triggers, included free | Native to Workers |
| **cron-job.org** | Free for external HTTP calls | Alternative if Workers can't run directly |

**Recommended:** **Cloudflare Cron Triggers**

**Configuration:**
```
# wrangler.toml
[triggers]
crons = ["0 * * * *"]  # Every hour at minute 0
```

**Why:**
- Built into Workers, no external service needed
- Free tier: 5 triggers (we only need 1)
- 100K requests/day on free tier

---

## Installation

```bash
# Create Worker project
npm create cloudflare@latest tonghop-tintuc --type=hono --ts

# Install dependencies
npm install @extractus/feed-extractor

# No additional packages needed:
# - Hono: built into template
# - fetch: built into Workers Runtime
# - crypto.randomUUID: built into Workers
```

---

## Recommended wrangler.toml

```toml
name = "tonghop-tintuc"
main = "src/index.ts"
compatibility_date = "2026-04-12"
compatibility_flags = ["nodejs_compat"]

[triggers]
crons = ["0 * * * *"]  # Run every hour
```

---

## What NOT to Use and Why

| Library/Service | Avoid Because |
|---------------|-------------|
| **Puppeteer/Playwright** | Too heavy for Workers (10MB+), use fetch + feed parser instead |
| **Cheerio** | DOM parser not needed for feed XML; feed parser handles it |
| **Fastify** | Designed for Node.js; Hono is edge-native |
| **Express** | Same as Fastify — not edge-optimized |
| **Facebook SDK (@noyoncodeware/fb)** | Unmaintained since 2024, 6 dependencies; direct fetch is simpler |
| **cron-job.org** (external) | Cloudflare Cron is free and native |
| **Database (PostgreSQL, MongoDB)** | Not needed per requirements — just post and forget |

---

## Free Tier Summary

| Service | Free Limit | Notes |
|---------|------------|-------|
| Cloudflare Workers | 100K req/day, 10ms CPU | Cron triggers included |
| Google AI Studio (Gemini 2.5 Flash) | 500 req/day | No credit card |
| Leonardo AI | ~150 tokens/day | ~10-30 images |
| Facebook Graph API | Unlimited posts | WithPage Access Token |
| Cloudflare Cron Triggers | 5 triggers | Built into Workers |
| ZSky AI | 25 credits | On signup |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│         Cloudflare Worker (Cron: 0 * * * *)             │
│  ┌─────────────────────────────────────────────┐   │
│  │ 1. Fetch RSS feeds (multiple sources)       │   │
│  │ 2. Parse with @extractus/feed-extractor  │   │
│  │ 3. Select new/fresh item               │   │
│  │ 4. Call AI (Gemini 2.5 Flash)       │   │
│  │    → Summarize to short post             │   │
│  │ 5. Call AI (generate image prompt)     │   │
│  │ 6. Call Image API (Leonardo/ZSky)     │   │
│  │    → Generate image                │   │
│  │ 7. POST to Facebook Graph API    │   │
│  │    → {page_id}/feed           │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Source Verification

- **Cloudflare Workers Cron Triggers**: [Official Docs - Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) (2026-03-20)
- **Cloudflare Node.js Compatibility**: [Node.js APIs in Workers](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) (2026-02-02)
- **Gemini 2.5 Flash Free Tier**: [Google AI Studio](https://aistudio.google.com/app/apikey) — 500 req/day (verify on signup)
- **Facebook Graph API v25.0**: [ Page Post docs](https://developers.facebook.com/docs/graph-api/reference/page-post/) — Current version
- **@extractus/feed-extractor**: [npm registry](https://www.npmjs.com/package/@extractus/feed-extractor) — v7.1.7 (Sep 2025)
- **Hono**: [npm](https://www.npmjs.com/package/hono) — v4.x (2025)
- **Leonardo AI Free Tier**: [leonardo.ai/pricing](https://leonardo.ai/pricing) — ~150 tokens/day

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Cloudflare Workers | HIGH | Official docs verified, current |
| Hono | HIGH | Standard for edge, npm verified |
| RSS Parsing | HIGH | @extractus actively maintained |
| AI Text (Gemini) | MEDIUM | Free tier limits may change, verify on signup |
| AI Image | MEDIUM | Free tiers are limited trials; expect to pay |
| Facebook API | HIGH | Official docs, v25.0 current |
| Cron Triggers | HIGH | Built into Workers, stable |

**Flags:**
- AI image generation free tiers change often — budget for paid usage
- Gemini free tier verified April 2026 but may change — check on signup