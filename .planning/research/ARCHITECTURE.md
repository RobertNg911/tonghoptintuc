# Architecture Patterns

**Project:** TongHopTinTuc - News Aggregator with Auto-Post to Facebook
**Domain:** Automated content pipeline (RSS → AI → Facebook)
**Researched:** 2026-04-12

## Recommended Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      TONGHOP TINTUC PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐          │
│  │   Scheduler  │────▶│   Worker   │────▶│  Facebook   │          │
│  │  (cron.org)  │     │  (Cloudflare)│     │  Graph API │          │
│  └──────────────┘     └──────────────┘     └──────────────┘          │
│                              │                                        │
│                              ▼                                        │
│                       ┌──────────────┐                              │
│                       │     AI      │                              │
│                       │  (OpenAI)   │                              │
│                       └──────────────┘                              │
│                              │                                        │
│                              ▼                                        │
│                       ┌──────────────┐                              │
│                       │    RSS      │                              │
│                       │   Feeds     │                              │
│                       └──────────────┘                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Architecture (Single Worker)

For this project's constraints (0đ budget, no database), a **single monolithic Worker** is the recommended approach. Complexity doesn't warrant splitting into multiple Workers.

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR WORKER                          │
│                    (src/index.ts)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  export default {                                                │
│    async fetch(request, env) {                                  │
│      // Route: /health, /run, /test                               │
│    },                                                           │
│                                                                 │
│    async scheduled(controller, env) {                           │
│      // Cron trigger handler                                     │
│    }                                                            │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HANDLER LAYERS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Scheduler  │  │   Router    │  │  Response   │             │
│  │   Handler   │  │   (Hono)    │  │   Builder   │             │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PIPELINE ORCHESTRATOR                   │   │
│  │                                                         │   │
│  │   fetchFeeds()                                            │   │
│  │       │                                                   │   │
│  │       ▼                                                   │   │
│  │   normalize()  ──▶ parse title, summary, link, image    │   │
│  │       │                                                   │   │
│  │       ▼                                                   │   │
│  │   deduplicate() ──▶ check title similarity             │   │
│  │       │                                                   │   │
│  │       ▼                                                   │   │
│  │   rewrite()  ────▶ AI content transformation           │   │
│  │       │                                                   │   │
│  │       ▼                                                   │   │
│  │   generateImage() ─▶ AI image (optional)             │   │
│  │       │                                                   │   │
│  │       ▼                                                   │   │
│  │   post()  ───────▶ Facebook Graph API                 │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└───────��─────────────────────────────────────────────────────────┘
```

### Data Flow

```
Hour 0: Cron Trigger Fires
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 1: Feed Fetching                                              │
│                                                                  │
│ fetchFeeds(sources: Feed[])                                        │
│     │                                                             │
│     ▼                                                             │
│ { sources: ['hnrss', 'bbc', 'reuters', ...] }                    │
│     │                                                             │
│     ▼                                                             │
│ HTTP GET to each RSS URL                                           │
│     │                                                             │
│     ▼                                                             │
│ Response: XML/Atom/JSON ──▶ Parse with fast-xml-parser             │
│     │                                                             │
│     ▼                                                             │
│ [Article { title, summary, link, image, date, source }]            │
└──────────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 2: Content Selection                                         │
│                                                                  │
│ selectBestArticle(articles: Article[])                            │
│     │                                                             │
│     ▼                                                             │
│ Score each article:                                              │
│   - Priority source bonus (+3)                                    │
│   - Recency bonus (+2)                                             │
│   - Remove duplicates (title similarity > 80%)                  │
│     │                                                             │
│     ▼                                                             │
│ Best Article: { title, summary, link, image, source }               │
└──────────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3: AI Transformation                                          │
│                                                                  │
│ rewriteWithAI(article: Article)                                   │
│     │                                                             │
│     ▼                                                             │
│ Prompt: "Rewrite as engaging Vietnamese social post..."             │
│     │                                                             │
│     ▼                                                             │
│ POST https://api.openai.com/v1/chat/completions                    │
│     │                                                             │
│     │  {                                                          │
│     │    model: "gpt-4o-mini",                                      │
│     │    messages: [                                               │
│     │      { role: "system", content: "Bạn là chuyên gia..." },     │
│     │      { role: "user", content: article.summary }               │
│     │    ]                                                        │
│     │  }                                                          │
│     │                                                             │
│     ▼                                                             │
│ Response: { rewritten: "📰 [Title]\n\n[Summary]..." }           │
└──────────────────────────────────────────────────────────────────┘
     │
     ▼ Optional (costly)
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4: Image Generation                                          │
│                                                                  │
│ generateImage(prompt: string)                                    │
│     │                                                             │
│     ▼                                                             │
│ POST https://api.openai.com/v1/images/generations               │
│     │                                                             │
│     │  {                                                          │
│     │    model: "dall-e-3",                                       │
│     │    prompt: prompt,                                          │
│     │    size: "1024x1024"                                        │
│     │  }                                                          │
│     │                                                             │
│     ▼                                                             │
│ Response: { data: [ { url: "https://..." } ] }                    │
│     │                                                             │
│     ▼                                                             │
│ Download image ──▶ Upload to temporary hosting                   │
│ (or skip this step for cost savings)                               │
└──────────────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5: Facebook Posting                                           │
│                                                                  │
│ postToFacebook(content: PostContent)                              │
│     │                                                             │
│     ▼                                                             │
│ POST https://graph.facebook.com/v25.0/{PAGE_ID}/feed               │
│     │                                                             │
│     │  {                                                          │
│     │    message: "📰 Tin nóng...\n\n🔗 link",                   │
│     │    link: article.link,                                       │
│     │    access_token: env.FACEBOOK_PAGE_TOKEN                       │
│     │  }                                                          │
│     │                                                             │
│     ▼                                                             │
│ Response: { id: "post_id", success: true }                         │
│     │                                                             │
│     ▼                                                             │
│ Log post_id for debugging                                         │
└──────────────────────────────────────────────────────────────────┘
     │
     ▼
DONE - Wait for next cron (1 hour later)
```

## Component Boundaries

| Component | Responsibility | Input | Output | Communicates With |
|-----------|---------------|-------|-------|------------------|
| **Scheduler** | Trigger pipeline hourly | Cron expression | HTTP request to Worker | Worker (/run endpoint) |
| **Fetcher** | Fetch and parse RSS feeds | Feed URLs | Article[] | External RSS sources |
| **Selector** | Choose best content | Article[] | Single Article | Deduplication logic |
| **Rewriter** | AI rewrite content | Article | Rewritten Post | OpenAI API |
| **Generator** | AI generate image | Prompt | Image URL | OpenAI API (DALL-E) |
| **Publisher** | Post to Facebook | Post Content | Post ID | Facebook Graph API |
| **Config** | Manage sources | env vars | Feed config | All components |

### Environment Variables (Bindings)

```typescript
interface Env {
  // Feed Sources (JSON array)
  FEED_SOURCES: string;
  
  // Facebook
  FACEBOOK_PAGE_ID: string;
  FACEBOOK_PAGE_TOKEN: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  
  // Optional AI Image
  DALLE_API_KEY?: string;
  
  // KV for deduplication (optional - free tier)
  DEDUP_KV?: KVNamespace;
}
```

## Build Order & Dependencies

### Phase-Based Build Order

```
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Foundation (Week 1)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  1.1 Setup Cloudflare Worker + Wrangler                        │
│      → npm create cloudflare@latest tonghoptintuc               │
│                                                              │
│  1.2 Add Hono for routing                                      │
│      → npm i hono                                             │
│                                                              │
│  1.3 Test health endpoint                                     │
│      → GET /health returns { status: "ok" }                   │
│                                                              │
│ DEPENDENCIES: None                                            │
│ BLOCKERS: None                                                │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Feed Fetching (Week 1-2)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  2.1 Add fast-xml-parser                                       │
│      → npm i fast-xml-parser                                    │
│                                                              │
│  2.2 Implement fetchFeeds()                                     │
│      → HTTP GET to RSS URLs                                    │
│      → Parse XML/Atom to Article[]                            │
│                                                              │
│  2.3 Add feed sources to wrangler.toml                        │
│      FEED_SOURCES = '["hnrss","bbc","reuters"]'                │
│                                                              │
│  2.4 Test /test endpoint                                        │
│      → Returns latest articles from configured feeds          │
│                                                              │
│ DEPENDENCIES: Phase 1 complete                                  │
│ BLOCKERS: Need feed URLs to test                               │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Facebook Posting (Week 2)                              │
├───────────────────────────────────────────────────���─���───────────────┤
│                                                              │
│  3.1 Get Facebook Page Access Token                             │
│      → Facebook Developer → Graph API Explorer                  │
│      → pages_manage_posts permission                           │
│                                                              │
│  3.2 Implement postToFacebook()                               │
│      → POST /{PAGE_ID}/feed                                    │
│      → Handle errors (rate limits, auth)                       │
│                                                              │
│  3.3 Add secrets to Worker                                     │
│      → wrangler secret put FACEBOOK_PAGE_ID                    │
│      → wrangler secret put FACEBOOK_PAGE_TOKEN                 │
│                                                              │
│  3.4 Test manual posting                                       │
│      → POST /run with article                                  │
│      → Check Facebook Page for new post                        │
│                                                              │
│ DEPENDENCIES: Phase 2 complete                                  │
│ BLOCKERS: Facebook Developer account, Page permissions        │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Scheduling (Week 2-3)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  4.1 Option A: Cloudflare Cron Trigger (free)                   │
│      → Add to wrangler.toml                                    │
│      triggers: { crons: ["0 * * * *"] }  // Every hour         │
│      → Add scheduled() handler                                 │
│                                                              │
│  4.2 Option B: cron-job.org (free tier)                        │
│      → Sign up at cron-job.org                                 │
│      → Create job: GET https://worker.../run                  │
│      → Set schedule: Every 1 hour                             │
│                                                              │
│  DEPENDENCIES: Phase 3 complete                                │
│ BLOCKERS: None (both options free)                             │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 5: AI Rewriting (Week 3)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  5.1 Get OpenAI API Key                                         │
│      → platform.openai.com/api-keys                          │
│      → fund account ($5 minimum)                              │
│                                                              │
│  5.2 Implement rewriteWithAI()                                 │
│      → Use openai SDK                                         │
│      → Prompt engineering for Vietnamese social posts         │
│                                                              │
│  5.3 Add secret                                                │
│      → wrangler secret put OPENAI_API_KEY                     │
│                                                              │
│  5.4 Test AI rewriting                                          │
│      → POST /test/ai with article                             │
│      → Check rewritten output                                 │
│                                                              │
│ DEPENDENCIES: Phase 4 complete                                 │
│ BLOCKERS: OpenAI account + credit                             │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼ Optional
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 6: AI Image Generation (Week 4)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  6.1 Implement generateImage()                                 │
│      → DALL-E 3 API (~$0.04/image)                            │
│      → OR free alternative (Bing Image Creator)              │
│                                                              │
│  6.2 Update post flow                                          │
│      → If image available: POST /photos                       │
│      → Else: POST /feed (text only)                            │
│                                                              │
│  6.3 Test image posting                                         │
│      → Verify image appears on Facebook                       │
│                                                              │
│  DEPENDENCIES: Phase 5 complete                                  │
│ BLOCKERS: Additional cost per image                            │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ PHASE 7: Production Hardening (Week 4+)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  7.1 Add deduplication                                          │
│      → Store recent titles in KV (or memory)                  │
│      → Skip articles with >80% similarity                      │
│                                                              │
│  7.2 Add error handling                                        │
│      → Retry with exponential backoff                         │
│      → Error logging                                           │
│                                                              │
│  7.3 Add monitoring                                            │
│      → Health checks                                           │
│      → Error rate tracking                                     │
│                                                              │
│ DEPENDENCIES: All phases complete                                │
│ BLOCKERS: None                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Cloudflare Workers Specific Patterns

### Framework: Hono

```typescript
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.get('/health', (c) => c.json({ status: 'ok' }));
app.post('/run', async (c) => {
  await runPipeline(c.env);
  return c.json({ success: true });
});
app.get('/test', async (c) => {
  const articles = await fetchFeeds(c.env);
  return c.json({ articles });
});

export default app;
```

### Cron Trigger Configuration

```toml
# wrangler.toml
name = "tonghoptintuc"
main = "src/index.ts"
compatibility_date = "2026-04-01"

[triggers]
crons = ["0 * * * *"]  # Every hour at minute 0
```

### Scheduled Handler

```typescript
export default {
  async fetch(request, env) {
    return app.fetch(request, env);
  },
  async scheduled(controller, env, ctx) {
    // Called every hour
    console.log('Cron triggered at', new Date().toISOString());
    await runPipeline(env);
  },
};
```

## Error Handling Patterns

### Retry Logic

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Rate Limit Handling

```typescript
function isRateLimited(error: any): boolean {
  return error?.response?.data?.error?.code === 4 ||
         error?.response?.data?.error?.code === 17;
}
```

## Scalability Considerations

| Concern | At MVP (1 post/hour) | At 10K posts/day | At 1M posts/day |
|---------|---------------------|-------------------|------------------|
| **Worker invocations** | 1/hour | 417/hour | 41,667/hour |
| **API calls** | ~3/post | 4,200/day | 420,000/day |
| **Cost** | ~$1-3/month | ~$30/month | ~$500/month |
| **Bottleneck** | None | OpenAI rate limits | Facebook rate limits |

## Anti-Patterns to Avoid

### Anti-Pattern 1: Multiple Workers for Simple Pipeline
**What:** Splitting into Crawler Worker, Rewriter Worker, Publisher Worker
**Why:** Adds complexity, service bindings overhead, no benefit for MVP
**Instead:** Single Worker with handler functions

### Anti-Pattern 2: Database for MVP
**What:** Adding D1 database to track posts
**Why:** Out of scope per PROJECT.md constraints
**Instead:** In-memory or KV deduplication (or skip entirely)

### Anti-Pattern 3: Real-time WebSocket
**What:** WebSocket connections for live updates
**Why:** Not needed - hourly batch posting
**Instead:** Cron-triggered batch processing

### Anti-Pattern 4: Complex Content Filtering
**What:** ML-based content classification, sentiment analysis
**Why:** Overengineering for single-use case
**Instead:** Simple rule-based scoring

## Sources

- [Cloudflare Workers Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/) - HIGH: Official docs
- [Cloudflare Workers Queues](https://developers.cloudflare.com/queues/) - HIGH: Official docs
- [Ruri Reader Architecture](https://gist.github.com/azu/de0d0450f34a2db5d55b81680b6a9e2f) - MEDIUM: Reference implementation
- [Facebook Graph API - Pages](https://developers.facebook.com/docs/pages/) - HIGH: Official docs
- [Facebook Page Scheduling](https://developers.facebook.com/docs/graph-api/reference/page/scheduled_posts/) - HIGH: Official docs
- [OpenAI SDK Streaming](https://developers.cloudflare.com/workers/examples/openai-sdk-streaming) - HIGH: Official example
- [Serverless Facebook Automation](http://dudistan.com/automate/) - MEDIUM: Reference architecture