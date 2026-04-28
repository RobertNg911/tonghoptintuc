# TongHopTinTuc - Project State

## ⚠️ Updated: 2026-04-28

> **Milestone**: v1.1 - Thêm nguồn tin (Reddit, Bloomberg, Reuters, AP, WSJ)
> **Previous**: v1.0 - Core system complete (RSS, AI, Facebook, Scheduler)

---

## Current Status

| Field | Value |
|-------|-------|
| **Milestone** | v1.1 (In Progress) |
| **Phase** | 10-scoring-ranking |
| **Status** | ✅ Phases 09+10 Complete |
| **Progress Bar** | ████████████████ 100% |

---

## Milestone v1.1 Roadmap

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 08 | Reddit Integration | REDDIT-01 to 04 | ✅ Complete |
| 09 | RSS Sources (Bloomberg + Google Proxy) | RSS-02a/b/c, RSS-03a/b/c | ✅ Complete |
| 10 | Scoring/Ranking Updates | CORE-01a/b/c | ✅ Complete |

---
## Decisions Made

### Phase 09 Decisions:
- Use rss-parser for new RSS sources (cleaner API than xml2js)
- Use Google RSS proxy for sites without native RSS (Reuters, AP News, WSJ)
- Organize new sources under `financial` category in SOURCES object

### Phase 10 Decisions:
- Implement 4-tier source reliability system (Tier1: +15, Tier2: +10, Tier3: +5, Tier4: 0)
- Replace hardcoded BBC/Reuters check with dynamic SOURCE_RELIABILITY lookup
- Keep Reddit-specific scoring (upvotes, comments) alongside source reliability

---

## Current System (v1.0 - Complete)

| Component | File | Status |
|-----------|------|--------|
| RSS Feeds | `fetch-news.js` | 🟢 Active (10 world + 9 tech sources) |
| Content AI | `generate.js` | 🟢 Active (Groq Llama 3.3) |
| Image AI | `gen-image.js` | 🟢 Active (Pollinations.ai) |
| Facebook | `post.js` | 🟢 Active |
| Scheduler | `.github/workflows/cron.yml` | 🟢 Active (15-min cron) |
| Dashboard | `docs/index.html` | 🟢 Active |

---

## Features Implemented (v1.0)

- ✅ Auto fetch RSS feeds (world + tech categories)
- ✅ AI content rewriting (Groq Llama 3.3)
- ✅ AI image generation (Pollinations.ai)
- ✅ Post to Facebook with image + caption (single post per run)
- ✅ 15-minute cron via GitHub Actions (world: */15, tech: 7,22,37,52)
- ✅ Duplicate prevention via posted-links.json (24h retention)
- ✅ Top 1 selection with hotScore >= 20
- ✅ Retry logic (1 retry before fail)
- ✅ Telegram notifications (failure only)
- ✅ Dashboard with workflow trigger
- ✅ Manual trigger from dashboard

---

## Features Implemented (v1.1 - In Progress)

### Phase 08: Reddit Integration (✅ Complete)
- ✅ Fetch Reddit hot posts via JSON API (REDDIT-01)
- ✅ Parse Reddit post structure (title, url, score, comments) (REDDIT-02)
- ✅ Add User-Agent header (Reddit API requirement) (REDDIT-03)
- ✅ Handle rate limiting (60 req/min) (REDDIT-04)
- ✅ Integrate Reddit into fetch-news.js pipeline
- ✅ Update scorer.js to handle Reddit posts (upvotes, comments)

### Phase 09: New RSS Sources (✅ Complete)
- ✅ Bloomberg RSS via rss-parser (RSS-02a/b/c)
- ✅ Google RSS proxy for Reuters (RSS-03a)
- ✅ Google RSS proxy for AP News (RSS-03b)
- ✅ Google RSS proxy for WSJ (RSS-03c)

### Phase 10: Scoring/Ranking Updates (✅ Complete)
- ✅ Incorporate Reddit upvotes into scoring (CORE-01a)
- ✅ Add source reliability weights (CORE-01b)
- ✅ Update ranking algorithm for mixed sources (CORE-01c)

---

## Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `GROQ_API_KEY` | ✅ Set | Required |
| `FB_PAGE_ID` | ✅ Set | Required |
| `FB_TOKEN` | ✅ Set | Required |
| `TELEGRAM_BOT_TOKEN` | ⚠️ Check | Optional |
| `TELEGRAM_CHAT_ID` | ⚠️ Check | Optional |
| `REDDIT_USER_AGENT` | ✅ Set | Required for Phase 08 (Complete) |

---

## Files Structure

```
├── fetch-news.js      # RSS + Reddit fetcher (updated in Phase 08)
├── generate.js       # AI content (with retry)
├── gen-image.js      # AI image (with retry)
├── post.js           # Facebook (with markPosted + alerts)
├── src/
│   ├── feeds/
│   │   ├── ranker.js # Top 1 selection (will update in Phase 10)
│   │   └── scorer.js # News scoring (updated in Phase 08 for Reddit)
│   └── services/
│       ├── duplicate.js # Duplicate prevention (24h)
│       ├── image.js    # Pollinations AI
│       └── reddit.js   # Reddit API fetch service (NEW in Phase 08)
├── posted-links.json  # Duplicate tracking (auto-generated)
├── package.json       # (will add rss-parser in Phase 09)
├── .env.example       # Environment variables (updated in Phase 08)
├── docs/
│   ├── index.html    # Dashboard
│   └── history.json
└── .github/workflows/
    ├── cron.yml      # 15-min pipeline
    └── deploy.yml    # Pages deploy
```

---

## Todo

- [x] **Phase 08:** Reddit integration (✅ Complete)
- [x] **Phase 09:** RSS sources (✅ Complete)
- [x] **Phase 10:** Scoring updates (✅ Complete)
- [ ] Clean up unused services (src/services/*.js)
- [ ] Clean up unused feeds (src/feeds/*.js)
- [ ] Test image with new GitHub token

---
## Session Info

- **Last session:** 2026-04-28
- **Stopped At:** Completed Phase 09 (RSS Sources) and Phase 10 (Scoring/Ranking)
- **Next phase:** Phase 07 (Facebook Engagement - pending)
- **Milestone v1.1 status:** 3/3 phases complete (100%)

---

*State updated: 2026-04-28*

---

## Roadmap Evolution

- **2026-04-28:** Milestone v1.1 added: Reddit + RSS sources + Scoring updates
- **2026-04-24:** Phase 06 added: Improve content prompt for viral posts
- **2026-04-24:** Phase 04 changes: 15-min cron, Top 1, duplicate prevention