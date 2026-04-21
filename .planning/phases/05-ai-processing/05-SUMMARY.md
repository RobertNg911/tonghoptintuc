# Phase 5 - AI Processing Summary

## ✅ COMPLETED

**Date**: 2026-04-22

## Files

| File | Status |
|------|--------|
| `generate.js` | ✅ ACTIVE - Generate 5 contents |
| `gen-image.js` | ✅ ACTIVE - Generate 5 images |
| `src/feeds/scorer.js` | ✅ ACTIVE - Score news by hot keywords |
| `src/feeds/ranker.js` | ✅ ACTIVE - Rank and select top 5 |
| `src/services/image.js` | ✅ ACTIVE - Pollinations.ai |

## Features

### News Ranking
- **scorer.js**: Score news by hot keywords (AI, Trump, Tesla, etc.)
- **ranker.js**: Select top 5 hot news
- Filter from all feeds → top 5 most viral

### Content Generation
- Generate 5 separate content files: `content-1.txt` to `content-5.txt`
- Each content: 200-300 words in Vietnamese Gen Z style
- Includes hook, body, hashtags

### Image Generation
- Generate 5 images: `image-1.png` to `image-5.png`
- Uses Groq to create prompt from content
- Uses Pollinations.ai for image generation

### Facebook Scheduling
- **5 posts** per run, each **10 minutes** apart
- Post 1: immediate
- Post 2: +10 min
- Post 3: +20 min
- Post 4: +30 min
- Post 5: +40 min

## Flow
```
RSS feeds → scorer → ranker (top 5) → 
  ├── generate.js (5 contents)
  ├── gen-image.js (5 images)
  └── post.js × 5 (Facebook scheduling)
```

---

*Summary updated: 2026-04-22*