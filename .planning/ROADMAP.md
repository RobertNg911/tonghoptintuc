# TongHopTinTuc Roadmap

## ⚠️ Updated 2026-04-28

> **Changes from Phase 04:**
> - 15-minute cron (world: `*/15`, tech: `7,22,37,52`)
> - Top 1 news only (hotScore >= 20)
> - Duplicate prevention via `posted-links.json`
> - Retry logic (1 retry before fail)
>
> **Milestone v1.1 Added:**
> - Phase 08: Reddit Integration (REDDIT-01 to 04)
> - Phase 09: RSS Sources - Bloomberg + Google Proxy (RSS-02, RSS-03)
> - Phase 10: Scoring/Ranking Updates (CORE-01)

---

## Requirements Mapping (v1.1)

| ID | Name | Description | Phase |
|----|------|-------------|-------|
| **Reddit Integration** | | | **08** |
| REDDIT-01 | FetchRedditAPI | Fetch tin từ Reddit API | 08 |
| REDDIT-02 | ParseRedditPost | Parse Reddit post structure | 08 |
| REDDIT-03 | UserAgentHeader | Add User-Agent header | 08 |
| REDDIT-04 | RateLimiting | Handle 60 req/min | 08 |
| **RSS Sources** | | | **09** |
| RSS-02a | BloombergRSS | Add Bloomberg RSS source | 09 |
| RSS-02b | RSSParser | Use rss-parser library | 09 |
| RSS-02c | BloombergIntegrate | Integrate into fetch-news.js | 09 |
| RSS-03a | GoogleRSSReuters | Google RSS proxy for Reuters | 09 |
| RSS-03b | GoogleRSSAP | Google RSS proxy for AP News | 09 |
| RSS-03c | GoogleRSSWSJ | Google RSS proxy for WSJ | 09 |
| **Scoring Updates** | | | **10** |
| CORE-01a | RedditScore | Incorporate Reddit upvotes | 10 |
| CORE-01b | SourceReliability | Add source reliability weights | 10 |
| CORE-01c | RankingUpdate | Update ranking for mixed sources | 10 |

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
| 07-facebook-engagement | 📋 Pending | Strategies to increase Facebook engagement |
| 08-reddit-integration | 📋 Pending | Reddit API integration (REDDIT-01 to 04) |
| 09-rss-sources | 📋 Pending | Bloomberg + Google RSS proxy (RSS-02, RSS-03) |
| 10-scoring-ranking | 📋 Pending | Update scoring for new sources (CORE-01) |

---

## Milestone v1.1: Thêm nguồn tin (Reddit, RSS mới)

---

## Phase 10: Scoring/Ranking Updates

**Goal:** Cập nhật thuật toán scoring để xử lý tốt hơn các nguồn tin mới (Reddit, Bloomberg, Reuters, AP, WSJ).

**Requirements:** CORE-01a, CORE-01b, CORE-01c

**Depends on:** 08-reddit-integration, 09-rss-sources

**Plans:** Not planned yet

**Success Criteria:**
1. Score được tính toán với các yếu tố mới (Reddit upvotes, source reliability)
2. Ranking system ưu tiên nguồn chất lượng cao (Reuters, AP, BBC, Reddit hot posts)
3. Tin từ Reddit và RSS mới được score chính xác và nhất quán
4. hotScore >= 20 vẫn hoạt động tốt với nguồn mới

---

## Phase 09: Add RSS Sources (Bloomberg + Google Proxy)

**Goal:** Thêm nguồn tin từ Bloomberg RSS và Google RSS proxy (Reuters, AP, WSJ) thông qua rss-parser.

**Requirements:** RSS-02a, RSS-02b, RSS-02c, RSS-03a, RSS-03b, RSS-03c

**Depends on:** 08-reddit-integration

**Plans:** Not planned yet

**Success Criteria:**
1. Bloomberg RSS feed được fetch thành công với rss-parser
2. Google RSS proxy hoạt động cho Reuters, AP, WSJ (3 sources)
3. Tất cả nguồn mới được tích hợp vào pipeline fetch-news.js hiện tại
4. Không có lỗi khi fetch đồng thời các nguồn cũ và mới
5. RSS parsing nhất quán giữa các nguồn (title, link, pubDate, source)

---

## Phase 08: Add Reddit Integration

**Goal:** Tích hợp Reddit API để lấy tin nóng từ Reddit (subreddits: worldnews, technology, news).

**Requirements:** REDDIT-01, REDDIT-02, REDDIT-03, REDDIT-04

**Depends on:** 07-facebook-engagement (optional - có thể song song)

**Plans:** Not planned yet

**Success Criteria:**
1. Reddit posts được fetch thành công qua Reddit JSON API (https://www.reddit.com/r/{subreddit}/hot.json)
2. Reddit post data được parse đúng cấu trúc (title, url, subreddit, score, num_comments, permalink)
3. User-Agent header được thêm vào mọi Reddit request (theo Reddit API rules)
4. Rate limiting 60 req/min được xử lý đúng (delay giữa các requests, không bị 429 error)
5. Reddit posts được chuẩn hóa format giống RSS feeds để tích hợp vào pipeline

---

## Phase 07: Facebook Engagement Optimization

**Goal:** Nghiên cứu và implement các chiến lược tăng lượt view/interaction trên Facebook.

**Depends on:** 06-content-prompt

**Plans:** Not planned yet

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

### v1.0 (Current)
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

### v1.1 (Planning - Thêm nguồn tin)
- 📋 Reddit integration (REDDIT-01 to REDDIT-04)
  - Fetch Reddit hot posts via JSON API
  - Parse Reddit post structure
  - User-Agent header (Reddit API requirement)
  - Rate limiting (60 req/min)
- 📋 New RSS sources (RSS-02, RSS-03)
  - Bloomberg RSS (rss-parser)
  - Google RSS proxy: Reuters, AP, WSJ
- 📋 Scoring updates (CORE-01)
  - Reddit upvotes factor
  - Source reliability weighting
  - Updated ranking algorithm

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

---

## Roadmap Evolution

- **2026-04-28:** Milestone v1.1 added - Phases 08, 09, 10 (Reddit, RSS, Scoring)
- **2026-04-24:** Phase 06 added: Improve content prompt for viral posts
- **2026-04-24:** Phase 04 changes: 15-min cron, Top 1, duplicate prevention

---

*Updated: 2026-04-28*
*Milestone v1.1 planned: Reddit + RSS sources + Scoring updates*