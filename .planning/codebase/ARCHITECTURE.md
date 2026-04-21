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
    news.json         content.txt         image.png           FB API
```

## State Files
- `news.json` - Raw RSS items
- `content.txt` - AI rewritten post
- `image-prompt.txt` - Image generation prompt
- `image.png` - Generated image

## Services
- `src/services/gemini.js` - Text rewrite
- `src/services/image.js` - Image generation
- `src/services/alert.js` - Telegram alerts
- `src/feeds/scorer.js` - Hot news scoring
- `src/feeds/ranker.js` - Rank and select

---

*Generated: 2026-04-18*