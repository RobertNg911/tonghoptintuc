# Research Summary: TongHopTinTuc

**Project:** News Aggregator with Auto-Post to Facebook  
**Synthesized:** 2026-04-12  
**Domain:** Automated content pipeline (RSS → AI → Facebook)

---

## Executive Summary

TongHopTinTuc is a serverless news aggregation system that fetches RSS feeds, rewrites content using AI, and posts to a Facebook Fanpage hourly — all within a zero-budget constraint using free tiers.

**Recommended Approach:** Use Cloudflare Workers with Hono as the runtime, Google Gemini 2.5 Flash for AI text rewriting (500 req/day free), and Leonardo AI or ZSky AI for image generation. Post directly to Facebook using Graph API v25.0 with Page Access Token. Schedule via Cloudflare Cron Triggers (free, built-in).

**Key Risks:**
- Facebook anti-spam detection from automated posting patterns (mitigate: randomize timing, vary content)
- Token expiration and wrong token type (mitigate: use Page Access Token, renew every 55 days)
- AI hallucinations producing misinformation (mitigate: human verification step before publishing)

---

## Key Findings

### From STACK.md

| Technology | Recommendation | Rationale |
|------------|----------------|-----------|
| **Runtime** | Cloudflare Workers + Hono | Free tier (100K req/day), edge-native, lightweight (~14KB) |
| **RSS Parser** | @extractus/feed-extractor | 4 dependencies, actively maintained, async API |
| **AI Text** | Google Gemini 2.5 Flash | 500 req/day genuinely free, good for summarization |
| **AI Image** | Leonardo AI / ZSky AI | Best free tier quality, REST API compatible |
| **Facebook** | Graph API v25.0 (direct fetch) | Official, stable, no SDK dependency needed |
| **Scheduler** | Cloudflare Cron Triggers | Free, 5 triggers included, native to Workers |

**Critical Notes:**
- Avoid Puppeteer/Playwright (too heavy), Fastify/Express (not edge-optimized), Cheerio (unneeded for XML)
- Free tiers for AI services change often — budget for paid usage when volume increases
- Gemini free tier limits may change — verify on signup

### From FEATURES.md

**Table Stakes (Must-Have):**
1. RSS Feed Fetching — core collection mechanism
2. Facebook Graph API Posting — required deliverable
3. Hourly Scheduler — specified requirement (1 post/hour)
4. Basic Content Formatting — readable post format

**Differentiators (Value-Add):**
- AI Content Rewriting — transforms raw news into engaging Vietnamese summaries (~$0.001/post)
- AI Image Generation — visual posts perform 2-3x better than text-only (~$0.04/image with DALL-E)
- Multi-Source Deduplication — prevents posting same story from different sources
- Priority Source Scoring — Hacker News, BBC, Reuters rank higher than random blogs

**Anti-Features (Explicitly Excluded):**
- Website/UI for browsing — out of scope per PROJECT.md
- Database storage — not needed, process and discard
- Multi-platform posting — Facebook-only for MVP

**MVP Priority Order:**
1. RSS Feed Fetching
2. Facebook Graph API Posting
3. Basic Content Formatting
4. Hourly Scheduler
5. AI Content Rewriting (key differentiator)
6. AI Image Generation (optional, costly)

**Monthly Cost Estimate:** ~$1-3/month (AI tokens only)

### From ARCHITECTURE.md

**Pattern:** Single monolithic Worker — complexity doesn't warrant splitting

**Data Flow:**
1. Cron Trigger fires hourly
2. Fetch RSS feeds from multiple sources
3. Normalize content (parse title, summary, link, date)
4. Deduplicate & score (priority source +3, recency +2)
5. AI rewrite content to Vietnamese social post
6. AI generate image (optional, costly)
7. POST to Facebook Graph API

**Component Boundaries:**
| Component | Responsibility |
|-----------|----------------|
| Scheduler | Trigger pipeline hourly |
| Fetcher | Fetch and parse RSS feeds |
| Selector | Choose best content |
| Rewriter | AI rewrite content |
| Generator | AI generate image |
| Publisher | Post to Facebook |
| Config | Manage sources (env vars) |

**Build Phases:**
- Phase 1: Foundation (Week 1) — Worker + Hono setup
- Phase 2: Feed Fetching (Week 1-2) — RSS parsing
- Phase 3: Facebook Posting (Week 2) — Graph API integration
- Phase 4: Scheduling (Week 2-3) — Cron triggers
- Phase 5: AI Rewriting (Week 3) — Gemini integration
- Phase 6: AI Image Generation (Week 4) — Optional
- Phase 7: Production Hardening (Week 4+) — Deduplication, error handling

**Anti-Patterns to Avoid:**
- Multiple Workers for simple pipeline
- Database for MVP (out of scope)
- Real-time WebSocket (not needed)
- Complex ML-based filtering (overengineering)

### From PITFALLS.md

**Critical (5):**
1. **Wrong Token Type** — Use Page Access Token, not user token. Error: (#200), (#100)
2. **Token Expiration** — Tokens expire after 60 days. Renew every 55 days.
3. **Facebook Scheduled Posts API Bugs** — Scheduling fails intermittently. Publish immediately.
4. **AI Content Hallucinations** — 30-40% of AI content contains factual errors. Human verification required.
5. **Facebook Anti-Spam Detection** — Fixed interval posting triggers restrictions. Randomize timing ±10-15 min.

**Moderate (5):**
6. **API Rate Limits** — Implement exponential backoff (1s, 2s, 4s, 8s...)
7. **Media URL 403 Errors** — Upload as binary, have fallback to text-only
8. **Generic AI Content** — Add unique angle, local context, vary structure
9. **API Version Neglect** — Specify v25.0, monitor changelog quarterly
10. **No Error Logging** — Log every run, alert on 3+ consecutive failures

**Minor (3):**
11. Missing permissions — Request pages_manage_posts, pages_read_engagement
12. Content format issues — Test post rendering on Facebook
13. RSS feed changes — Log fetch count, alert if drops to 0

---

## Implications for Roadmap

### Suggested Phase Structure

| Phase | Focus | Deliverables | Pitfalls to Avoid |
|-------|-------|--------------|-------------------|
| **Phase 1** | Foundation | Worker + Hono setup, health endpoint | None (no external dependencies) |
| **Phase 2** | Feed Fetching | RSS parsing, source config | Pitfall 13 (feed changes) |
| **Phase 3** | Facebook Integration | Page token, posting endpoint | Pitfall 1 (wrong token), Pitfall 11 (permissions), Pitfall 12 (formatting) |
| **Phase 4** | Scheduling | Cron trigger setup | Pitfall 3 (API bugs), Pitfall 5 (anti-spam) |
| **Phase 5** | AI Text | Gemini integration, prompt engineering | Pitfall 4 (hallucinations), Pitfall 8 (generic content) |
| **Phase 6** | AI Image | Leonardo/ZSky integration (optional) | Pitfall 7 (media URL 403), cost management |
| **Phase 7** | Hardening | Deduplication, logging, alerting | Pitfall 10 (silent failures), Pitfall 9 (version neglect) |

### Rationale for Phase Order

1. **Foundation first** — No external dependencies, validates Cloudflare setup
2. **Feeds before posting** — Need content before posting anywhere
3. **Facebook early** — Token setup requires manual Facebook Developer steps (can be slow)
4. **Scheduling after posting** — Once posting works, automate it
5. **AI text before image** — Text is core value, images are optional enhancement
6. **Image after text** — Requires additional API keys, more costly
7. **Hardening last** — Deduplication and monitoring are production concerns

### Research Flags

| Phase | Needs Research | Standard Patterns |
|-------|----------------|-------------------|
| Phase 1 | No | Standard Workers setup (well-documented) |
| Phase 2 | No | RSS parsing with feed-extractor (common pattern) |
| Phase 3 | **Yes** | Facebook token flow can be tricky — validate token generation |
| Phase 4 | No | Cloudflare Cron docs are clear |
| Phase 5 | **Yes** | Gemini prompt engineering for Vietnamese — may need iteration |
| Phase 6 | **Yes** | Image API free tier behavior — may need fallback |
| Phase 7 | No | Standard logging patterns |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (Workers + Hono) | HIGH | Official docs verified, current |
| RSS Parsing | HIGH | @extractus actively maintained |
| AI Text (Gemini) | MEDIUM | Free tier limits may change — verify on signup |
| AI Image | MEDIUM | Free tiers are limited trials — expect to pay |
| Facebook API | HIGH | Official docs, v25.0 current |
| Cron Triggers | HIGH | Built into Workers, stable |
| Architecture | HIGH | Standard serverless pattern |
| Pitfalls | HIGH | Comprehensive, from multiple sources |

**Overall Confidence:** HIGH

**Gaps Identified:**
1. Gemini 2.5 Flash free tier verification needed on signup (may have changed since research)
2. Vietnamese prompt engineering for AI rewriting — may need testing/iteration
3. Image generation quality with free tier Leonardo/ZSky — may need fallback

---

## Sources

Aggregated from:

- **STACK.md:** Cloudflare Workers docs, Google AI Studio, npm (@extractus/feed-extractor, hono), Facebook Graph API v25.0 docs, Leonardo AI pricing
- **FEATURES.md:** Feedsmith docs, Facebook Pages API, PilotPoster Auto AI features, market research
- **ARCHITECTURE.md:** Cloudflare Workers Cron Triggers, Facebook Graph API docs, serverless architecture patterns
- **PITFALLS.md:** Meta Developer Community, Facebook auto-posting guides, AI content research (2025-2026)

---

*Summary committed to: `.planning/research/SUMMARY.md`*