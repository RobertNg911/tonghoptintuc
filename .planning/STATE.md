# TongHopTinTuc - Project State

## ⚠️ Updated: 2026-04-28

> **Milestone**: v1.1 - Thêm nguồn tin (Reddit, Bloomberg, Reuters, AP, WSJ)
> **Previous**: v1.0 - Core system complete (RSS, AI, Facebook, Scheduler)

---

## Current Status

| Field | Value |
|-------|-------|
| **Milestone** | v1.1 (Planning) |
| **Phase** | 08-reddit-integration |
| **Status** | 🟡 Planning |
| **Progress Bar** | ████░░░░░░░░░░ 20% |

---

## Milestone v1.1 Roadmap

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| 08 | Reddit Integration | REDDIT-01 to 04 | 📋 Pending |
| 09 | RSS Sources (Bloomberg + Google Proxy) | RSS-02a/b/c, RSS-03a/b/c | 📋 Pending |
| 10 | Scoring/Ranking Updates | CORE-01a/b/c | 📋 Pending |

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

## Features Planned (v1.1)

### Phase 08: Reddit Integration
- 📋 Fetch Reddit hot posts via JSON API (REDDIT-01)
- 📋 Parse Reddit post structure (title, url, score, comments) (REDDIT-02)
- 📋 Add User-Agent header (Reddit API requirement) (REDDIT-03)
- 📋 Handle rate limiting (60 req/min) (REDDIT-04)

### Phase 09: New RSS Sources
- 📋 Bloomberg RSS via rss-parser (RSS-02a/b/c)
- 📋 Google RSS proxy for Reuters (RSS-03a)
- 📋 Google RSS proxy for AP News (RSS-03b)
- 📋 Google RSS proxy for WSJ (RSS-03c)

### Phase 10: Scoring Updates
- 📋 Incorporate Reddit upvotes into scoring (CORE-01a)
- 📋 Add source reliability weights (CORE-01b)
- 📋 Update ranking algorithm for mixed sources (CORE-01c)

---

## Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `GROQ_API_KEY` | ✅ Set | Required |
| `FB_PAGE_ID` | ✅ Set | Required |
| `FB_TOKEN` | ✅ Set | Required |
| `TELEGRAM_BOT_TOKEN` | ⚠️ Check | Optional |
| `TELEGRAM_CHAT_ID` | ⚠️ Check | Optional |
| `REDDIT_USER_AGENT` | ❌ New | Required for Phase 08 |

---

## Files Structure

```
├── fetch-news.js      # RSS fetcher (will be updated in v1.1)
├── generate.js       # AI content (with retry)
├── gen-image.js      # AI image (with retry)
├── post.js           # Facebook (with markPosted + alerts)
├── src/
│   ├── feeds/
│   │   ├── ranker.js # Top 1 selection (will update in Phase 10)
│   │   └── scorer.js # News scoring (will update in Phase 10)
│   └── services/
│       ├── duplicate.js # Duplicate prevention (24h)
│       └── image.js    # Pollinations AI
├── posted-links.json  # Duplicate tracking (auto-generated)
├── package.json       # (will add rss-parser in Phase 09)
├── docs/
│   ├── index.html    # Dashboard
│   └── history.json
└── .github/workflows/
    ├── cron.yml      # 15-min pipeline
    └── deploy.yml    # Pages deploy
```

---

## Todo

- [ ] **Phase 08:** Plan Reddit integration (run `/gsd-plan-phase 08`)
- [ ] **Phase 09:** Plan RSS sources (run `/gsd-plan-phase 09`)
- [ ] **Phase 10:** Plan scoring updates (run `/gsd-plan-phase 10`)
- [ ] Clean up unused services (src/services/*.js)
- [ ] Clean up unused feeds (src/feeds/*.js)
- [ ] Test image with new GitHub token

---

*State updated: 2026-04-28*

---

## Roadmap Evolution

- **2026-04-28:** Milestone v1.1 added: Reddit + RSS sources + Scoring updates
- **2026-04-24:** Phase 06 added: Improve content prompt for viral posts
- **2026-04-24:** Phase 04 changes: 15-min cron, Top 1, duplicate prevention