# Feature Landscape

**Project:** TongHopTinTuc - News Aggregator with Auto-Post to Facebook
**Domain:** Automated content pipeline (RSS → AI processing → Facebook posting)
**Researched:** 2026-04-12

## Table Stakes

Features users expect. Missing = product fails entirely.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **RSS Feed Fetching** | Core to collecting news. Without this, nothing to post. | Low | Use Feedsmith or feedparser. Supports RSS, Atom, JSON Feed. |
| **Facebook Graph API Posting** | The only official way to post to Fanpage programmatically. | Medium | Requires Facebook Developer account, Page permissions, access token. |
| **Hourly Scheduler** | Specified requirement — 1 post/hour. | Low | cron-job.org can trigger Cloudflare Workers on schedule. |
| **Basic Content Formatting** | Posts need readable format (title + summary). | Low | Simple template: "📰 [Title]\n\n[Summary]\n\n🔗 [Link]" |

## Differentiators

Features that create competitive advantage. Not expected by minimal viable product, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **AI Content Rewriting** | Transforms raw news into engaging Vietnamese summaries. Users don't read boring links — they read interesting hooks. | Medium | GPT-4o mini is cost-effective (~$0.001/post). Key differentiator. |
| **AI Image Generation** | Visual posts perform 2-3x better than text-only. Increases engagement dramatically. | High | DALL-E 3 is expensive (~$0.04/image). Free alternatives exist but quality varies. |
| **Multi-Source Deduplication** | Prevents posting same story from different sources. Maintains content variety. | Medium | Title similarity matching. Reduces repeat content in feed. |
| **Priority Source Scoring** | Hacker News, BBC, Reuters should rank higher than random blogs. Quality over quantity. | Medium | Weighted scoring: Priority Source +3, Recency +2. |
| **Breaking News Detection** | Detects when multiple sources cover same story. Enables timely posting. | High | Requires clustering algorithm, extra AI calls. |
| **Content Variety (9 Post Types)** | Real people post tips, questions, stories — not just links. More engaging feed. | Medium | PilotPoster Auto AI uses this approach. |

## Anti-Features

Features to explicitly NOT build. Deliberate exclusions based on project constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Website/UI for browsing** | Out of scope per PROJECT.md — "Chỉ đăng lên Facebook, không cần website" | Focus all resources on the posting pipeline |
| **User commenting/interaction** | Out of scope — "Chỉ đăng tin, không nhận comment" | Leave Facebook's native comments active |
| **Database storage** | Out of scope — "Không cần database, chỉ cần đăng xong là xong" | Process and discard; no persistence needed |
| **Real-time posting** | Not needed — hourly schedule is sufficient | Batch processing once per hour |
| **Multi-platform posting** | Project is Facebook-only | Keep focused; add Instagram/LinkedIn later if needed |
| **User-generated content** | Not in scope — fully automated pipeline | No CMS or admin panel needed |
| **Analytics dashboard** | 0đ budget — no paid analytics | Use Facebook Insights (free) for engagement data |

## Feature Dependencies

```
RSS Feed Fetching
    ↓
Content Normalization (parse title, summary, link, date)
    ↓
Deduplication & Scoring ← Priority Source Config
    ↓
AI Content Rewriting ← OpenAI API Key
    ↓
AI Image Generation ← DALL-E API Key (or free alternative)
    ↓
Facebook Graph API Post ← Page Access Token
    ↓
Hourly Scheduler ← cron-job.org → Cloudflare Workers trigger
```

**Critical path:** RSS Fetching → AI Rewriting → Facebook Posting is the minimum viable chain.

## MVP Recommendation

**Prioritize in order:**

1. **RSS Feed Fetching** — Table stakes. Get something to work with.
2. **Facebook Graph API Posting** — Core deliverable. Must post to Fanpage.
3. **Basic Content Formatting** — Without this, post is unreadable.
4. **Hourly Scheduler** — Required frequency.
5. **AI Content Rewriting** — Key differentiator. Makes posts engaging in Vietnamese.
6. **AI Image Generation** — High impact but optional (costly).

**Defer:**
- Breaking news detection: Complex, expensive, not needed for MVP
- Multi-source deduplication: Can manually manage sources initially
- Content variety (9 post types): Later iteration

## Cost Considerations

| Feature | Estimated Cost | Free Alternative |
|---------|----------------|------------------|
| RSS Fetching | Free (local processing) | — |
| AI Rewriting (GPT-4o mini) | ~$0.001/post | — |
| AI Image (DALL-E 3) | ~$0.04/image | Bing Image Creator (free), Leonardo.ai (free tier) |
| Facebook API | Free (official) | — |
| Hosting (Cloudflare Workers) | Free tier | — |
| Scheduler (cron-job.org) | Free | — |

**Monthly MVP cost:** ~$1-3/month (AI tokens only)

## Sources

- [Feedsmith - Modern RSS Parser](https://feedsmith.dev/) - HIGH: Official documentation
- [Facebook Graph API - Pages API](https://developers.facebook.com/docs/pages/) - HIGH: Official docs
- [PilotPoster Auto AI Features](https://www.pilotposter.com/blog/pilotposter-auto-ai-features/) - MEDIUM: Industry best practices
- [Best AI News Aggregators 2026](https://www.readless.app/blog/best-ai-news-aggregators-2026) - MEDIUM: Market research
- [News Aggregator System Design](https://crackingwalnuts.com/post/news-aggregator-system-design) - MEDIUM: Architecture patterns
- [Facebook Automation Best Practices](https://botpenguin.com/blogs/facebook-automation) - MEDIUM: Compliance guidelines
