# TongHopTinTuc Roadmap

## ⚠️ Project Changed - Now Uses GitHub Actions

> **Date**: 2026-04-22
> Original plan was Cloudflare Workers + Hono. Now uses GitHub Actions + Node.js scripts.

---

## Current System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Actions                          │
│  cron.yml: 0 * * * * (world), 30 * * * * (tech)       │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐
│ fetch-news.js │  │ generate.js  │  │ gen-image.js │
│   RSS feeds   │  │  Groq AI    │  │ Pollinations │
└───────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
                    ┌──────────────┐
                    │   post.js    │
                    │   Facebook   │
                    └──────────────┘
```

---

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| 01-setup | ✅ Complete | GitHub Actions workflow |
| 02-feed-collection | ✅ Complete | fetch-news.js |
| 03-facebook | ✅ Complete | post.js |
| 04-scheduling | ✅ Complete | cron.yml |
| 05-ai-processing | ✅ Complete | Groq + Pollinations |

---

## Current Files

### Core Scripts
| File | Purpose |
|------|---------|
| `fetch-news.js` | Fetch RSS feeds |
| `generate.js` | Generate content with Groq |
| `gen-image.js` | Generate image with Pollinations |
| `post.js` | Post to Facebook |

### GitHub Actions
| File | Purpose |
|------|---------|
| `.github/workflows/cron.yml` | Hourly pipeline |
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
| `TELEGRAM_BOT_TOKEN` | Optional | Telegram notifications |
| `TELEGRAM_CHAT_ID` | Optional | Telegram chat ID |

---

## Features

- ✅ Auto fetch RSS feeds (world + tech)
- ✅ AI content generation (Groq Llama 3.3)
- ✅ AI image generation (Pollinations.ai)
- ✅ Post to Facebook with image
- ✅ Hourly cron (GitHub Actions)
- ✅ Telegram alerts on failure
- ✅ Dashboard UI
- ✅ Manual trigger from dashboard

---

## Unused Files (To Clean)

- `src/services/huggingface.js` - Not used
- `src/services/gemini.js` - Not used
- `src/services/zimage.js` - Not used
- `src/services/alert.js` - Not used
- `src/feeds/scorer.js` - Not used
- `src/feeds/ranker.js` - Not used

---

*Updated: 2026-04-22*
