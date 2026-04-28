# ARCHITECTURE.md - TongHopTinTuc Architecture

## Overview
Simple sequential pipeline, no framework, no database.

## Pipeline
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ fetch-news   │───▶│ generate    │───▶│ gen-image   │───▶│ post.js     │
│ (RSS fetch)  │    │ (AI rewrite)│    │ (AI image)  │    │ (FB post)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
    news.json         content-1.txt         image-1.png           FB API
```

## State Files
- `news.json` - Raw RSS items (ranked by hot score)
- `content-1.txt` - AI rewritten post (index = schedule)
- `image-1.png` - Generated image (1200x675)
- `posted-links.json` - Duplicate prevention (24h retention)

## Services
- `src/services/image.js` - Image generation (Pollinations)
- `src/services/duplicate.js` - Duplicate tracking
- `src/feeds/scorer.js` - Hot news scoring
- `src/feeds/ranker.js` - Rank and select top 1

## Retry Logic
- Image upload: 2 retries with 2s delay
- Pipeline fails if no image generated

---

*Generated: 2026-04-28*