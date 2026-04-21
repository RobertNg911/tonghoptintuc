# TongHopTinTuc - Project State

## ⚠️ Updated: 2026-04-22

> **Project Change**: Cloudflare Workers → GitHub Actions + Node.js scripts

---

## Current Status

| Field | Value |
|-------|-------|
| **Phase** | Production (All phases complete) |
| **Status** | 🟢 Operating |
| **Progress Bar** | ████████████████ 100% |

---

## Current System

| Component | File | Status |
|-----------|------|--------|
| RSS Feeds | `fetch-news.js` | 🟢 Active |
| Content AI | `generate.js` | 🟢 Active |
| Image AI | `gen-image.js` | 🟢 Active |
| Facebook | `post.js` | 🟢 Active |
| Scheduler | `.github/workflows/cron.yml` | 🟢 Active |
| Dashboard | `docs/index.html` | 🟢 Active |

---

## Features Implemented

- ✅ Auto fetch RSS feeds (world + tech categories)
- ✅ AI content rewriting (Groq Llama 3.3)
- ✅ AI image generation (Pollinations.ai)
- ✅ Post to Facebook with image + caption (single post)
- ✅ Hourly cron via GitHub Actions
- ✅ Telegram notifications (failure only)
- ✅ Dashboard with workflow trigger
- ✅ Manual trigger from dashboard

---

## Environment Variables

| Variable | Status | Notes |
|----------|--------|-------|
| `GROQ_API_KEY` | ✅ Set | Required |
| `FB_PAGE_ID` | ✅ Set | Required |
| `FB_TOKEN` | ✅ Set | Required |
| `TELEGRAM_BOT_TOKEN` | ⚠️ Check | Optional |
| `TELEGRAM_CHAT_ID` | ⚠️ Check | Optional |

---

## Files Structure

```
├── fetch-news.js      # RSS fetcher
├── generate.js       # AI content
├── gen-image.js      # AI image
├── post.js         # Facebook
├── package.json
├── docs/
│   ├── index.html    # Dashboard
│   └── history.json
└── .github/workflows/
    ├── cron.yml      # Pipeline
    └── deploy.yml    # Pages deploy
```

---

## Todo

- [ ] Clean up unused services (src/services/*.js)
- [ ] Clean up unused feeds (src/feeds/*.js)
- [ ] Test image with new GitHub token

---

*State updated: 2026-04-22*