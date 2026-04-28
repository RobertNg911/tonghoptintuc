# ARCHITECTURE.md - TongHopTinTuc Architecture

## Pipeline
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ fetch-news   │───▶│ generate    │───▶│ gen-image   │───▶│ post.js     │
│ (13 sources)│    │ (AI rewrite)│    │ (AI image)  │    │ (FB post)   │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │                   │
    news.json         content-1.txt         image-1.png           FB API
```

## News Sources (13 total)
- **RSS (7):** BBC, CNN, Al Jazeera, NYTimes, Guardian, France24, Washington Post
- **Reddit (3):** r/worldnews, r/technology, r/news
- **New RSS (4):** Bloomberg Markets, Bloomberg Tech, Reuters, WSJ

## Services
- `src/services/reddit.js` - Reddit API (JSON, rate limiting)
- `src/services/image.js` - Pollinations AI
- `src/services/duplicate.js` - Duplicate tracking
- `src/feeds/scorer.js` - Score với source reliability (4 tiers)
- `src/feeds/ranker.js` - Rank Top 1

## Source Reliability Scoring (4 Tiers)
| Tier | Sources | Points |
|------|---------|-------|
| Tier 1 | Reuters, AP, Bloomberg | +15 |
| Tier 2 | BBC, NYTimes, Guardian, WSJ | +10 |
| Tier 3 | CNN, Al Jazeera, Reddit | +5 |

---

*Generated: 2026-04-28*