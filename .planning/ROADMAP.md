# TongHopTinTuc Roadmap

## ⚠️ Updated 2026-04-24

> **Changes from Phase 04:**
> - 15-minute cron (world: `*/15`, tech: `7,22,37,52`)
> - Top 1 news only (hotScore >= 20)
> - Duplicate prevention via `posted-links.json`
> - Retry logic (1 retry before fail)

---

## Current System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions                          │
│  world: */15 * * * * (0,15,30,45)                      │
│  tech: 7,22,37,52 * * * *                              │
└─────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ fetch-news.js │  │ generate.js  │  │ gen-image.js │
│  RSS feeds   │  │  1 content  │  │  1 image    │
│ scorer.js    │  │  Groq AI    │  │ Pollinations │
│ ranker.js    │  └──────────────┘  └──────────────┘
│ duplicate.js│
└───────────────┘
                            │
                            ▼
                     ┌──────────────────────┐
                     │      post.js          │
                     │   1 post per run    │
                     │   Facebook post     │
                     └──────────────────────┘
```

---

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 01-setup | ✅ Complete | GitHub Actions workflow |
| 02-feed-collection | ✅ Complete | fetch-news.js |
| 03-facebook | ✅ Complete | post.js |
| 04-scheduling | ✅ Complete | 15-min cron, Top 1, duplicate prevention |
| 05-ai-processing | ✅ Complete | Groq + Pollinations |
| 06-content-prompt | ✅ Complete | Improved prompt: System + User, temp 0.85, 300-500 words |

---

## Phase 06: Content Prompt Optimization

**Goal:** Chỉnh sửa prompt cho generate.js để tạo content viral, hấp dẫn và độc đáo hơn.

**Depends on:** 05-ai-processing

**Plans:** Not planned yet

---

## Current Files

### Core Scripts
| File | Purpose |
|------|---------|
| `fetch-news.js` | Fetch RSS → score → rank Top 1 → duplicate check |
| `generate.js` | Generate 1 content with Groq (retry 1x) |
| `gen-image.js` | Generate 1 image with Pollinations (retry 1x) |
| `post.js` | Post to Facebook, mark as posted |
| `src/services/duplicate.js` | Track posted links (24h) |

### GitHub Actions
| File | Purpose |
|------|---------|
| `.github/workflows/cron.yml` | 15-minute pipeline |
| `.github/workflows/deploy.yml` | Deploy dashboard |

### Dashboard
| File | Purpose |
|------|---------|
| `docs/index.html` | Dashboard UI |
| `docs/history.json` | History data |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ | AI for content + image prompt |
| `FB_PAGE_ID` | ✅ | Facebook Page ID |
| `FB_TOKEN` | ✅ | Facebook Access Token |
| `TELEGRAM_BOT_TOKEN` | ✅ | Failure notifications |
| `TELEGRAM_CHAT_ID` | ✅ | Telegram chat ID |

---

## Features

- ✅ Auto fetch RSS feeds (world + tech)
- ✅ Score + rank **Top 1** hot news (hotScore >= 20)
- ✅ Generate **1 content** with AI (Groq Llama 3.3)
- ✅ Generate **1 image** (Pollinations.ai)
- ✅ Post **1 article** to Facebook per run
- ✅ **15-minute cron** (GitHub Actions)
- ✅ **Duplicate prevention** (`posted-links.json`, 24h retention)
- ✅ **Retry logic** (1 retry before fail)
- ✅ Telegram alerts on failure
- ✅ Dashboard UI
- ✅ Manual trigger from dashboard

---

## Unused Files (To Clean)

- `src/services/huggingface.js` - Not used
- `src/services/gemini.js` - Not used
- `src/services/zimage.js` - Not used
- `src/services/alert.js` - Not used

---

## Cron Schedule

| Category | Schedule | Examples |
|----------|----------|----------|
| World | `*/15 * * * *` | :00, :15, :30, :45 |
| Tech | `7,22,37,52 * * * *` | :07, :22, :37, :52 |

*Offset 7 minutes between world and tech*

### Phase 1: Improve content prompt for more engaging viral posts

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 0
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 1 to break down)

---

*Updated: 2026-04-24*
*Phase 04 verified: passed (6/6 must-haves)*