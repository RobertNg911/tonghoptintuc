---
phase: 04-scheduling
plan: "02"
subsystem: scheduling
tags: [cron, duplicate-prevention, top-1, 15-min]
dependency-graph:
  requires: []
  provides:
    - id: SCHED-01
      description: "15-minute cron schedule for world and tech"
    - id: DUP-01
      description: "Duplicate prevention via posted-links.json"
  affects:
    - .github/workflows/cron.yml
    - src/feeds/ranker.js
    - fetch-news.js
    - post.js
    - generate.js
    - gen-image.js
    - src/services/duplicate.js
tech-stack:
  added:
    - "src/services/duplicate.js"
  patterns:
    - "URL normalization for duplicate detection"
    - "Retry with 2s delay (1 retry)"
    - "Telegram alert with step + message context"
key-files:
  created:
    - path: src/services/duplicate.js
      description: "Duplicate prevention service with 24h retention"
  modified:
    - path: .github/workflows/cron.yml
      description: "15-min schedule, single post pipeline"
    - path: src/feeds/ranker.js
      description: "DEFAULT_TOP=1, exported getTopNews function"
    - path: fetch-news.js
      description: "Uses getTopNews + checkDuplicate"
    - path: post.js
      description: "markPosted + sendAlert on failures"
    - path: generate.js
      description: "MAX_RETRIES=1 with generateWithRetry"
    - path: gen-image.js
      description: "MAX_RETRIES=1 with generateWithRetry"
decisions:
  - "Changed from hourly Top 5 to 15-minute Top 1"
  - "World cron: */15 * * * * (0,15,30,45)"
  - "Tech cron: 7,22,37,52 * * * * (offset 7 min)"
  - "Duplicate prevention via posted-links.json with 24h retention"
metrics:
  duration: "5-10 minutes"
  completed: "2026-04-24"
---

# Phase 04 Plan 02 Summary: 15-Minute Top 1 with Duplicate Prevention

**One-liner:** Updated cron to 15-min intervals with Top 1 selection, added duplicate prevention via posted-links.json, and retry logic.

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Update GitHub Actions cron schedule | `937eec7` | `.github/workflows/cron.yml` |
| 2 | Create duplicate prevention service | `2dfc5f6` | `src/services/duplicate.js` |
| 3 | Update ranker to select Top 1 with threshold | `39a3dc9` | `src/feeds/ranker.js`, `fetch-news.js` |
| 4 | Update post.js to mark as posted and alert | `8600387` | `post.js` |
| 5 | Add retry logic to generate.js and gen-image.js | `aa6a636` | `generate.js`, `gen-image.js` |

## Commits

```
aa6a636 feat(04-02): add retry logic to generate.js and gen-image.js
8600387 feat(04-02): update post.js with mark posted and alerts
39a3dc9 feat(04-02): update ranker to select Top 1 with threshold
2dfc5f6 feat(04-02): add duplicate prevention service
937eec7 feat(04-02): update GitHub Actions cron to 15-min Top 1
```

## Changes Made

### 1. GitHub Actions Cron (.github/workflows/cron.yml)
- **World cron:** `*/15 * * * *` (runs at :00, :15, :30, :45)
- **Tech cron:** `7,22,37,52 * * * *` (runs at :07, :22, :37, :52)
- **Removed** 5-post loop, **simplified** to single post
- **Set** `CONTENT_COUNT=1`, `IMAGE_COUNT=1`

### 2. Duplicate Prevention Service (src/services/duplicate.js)
- **checkDuplicate(link)** - checks if link already posted
- **markPosted(link, title)** - marks link as posted
- **loadPostedLinks()** - loads posted-links.json
- **24h retention** with auto-cleanup
- Normalizes URLs (removes trailing slash, lowercase)

### 3. Ranker Update (src/feeds/ranker.js)
- **DEFAULT_TOP = 1** (was 5)
- **MIN_SCORE = 20** (unchanged)
- **getTopNews(scoredItems, options)** - new exported function

### 4. Fetch News Update (fetch-news.js)
- Uses `getTopNews` with `top=1, minScore=20`
- Checks for duplicates before saving `news.json`
- Exits with error if no news meets threshold or duplicate detected

### 5. Post Update (post.js)
- Imports and uses `markPosted` after successful Facebook post
- Added `sendAlert(step, message)` function for Telegram alerts
- Provides step context and retry suggestion in alerts

### 6. Retry Logic
- **MAX_RETRIES = 1** in both generate.js and gen-image.js
- **generateWithRetry()** with 2-second delay between attempts
- Improved error messages showing retry count

## Verification

- [x] cron.yml has `*/15 * * * *` for world
- [x] cron.yml has `7,22,37,52 * * * *` for tech
- [x] cron.yml only runs 1 post (removed 5-post loop)
- [x] src/services/duplicate.js exports checkDuplicate/markPosted
- [x] src/feeds/ranker.js returns top 1 with hotScore >= 20
- [x] fetch-news.js checks duplicates before processing
- [x] post.js marks link as posted after success
- [x] generate.js has retry logic (1 retry)
- [x] gen-image.js has retry logic (1 retry)

## Deviations from Plan

**None** - Plan executed exactly as written.

## Artifacts

| Artifact | Path | Provides |
|----------|------|----------|
| Duplicate Service | `src/services/duplicate.js` | checkDuplicate, markPosted, loadPostedLinks |
| Posted Links Store | `posted-links.json` | Tracks posted news links (24h retention) |
| Alert Service | `post.js` (sendAlert function) | Telegram alerting on failures |

---

*Generated: 2026-04-24*