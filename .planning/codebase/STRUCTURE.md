# STRUCTURE.md - TongHopTinTuc File Structure

```
Tonghoptintuc/
├── .dev.vars              # Environment variables (dev only)
├── .env.example          # Environment template
├── .github/workflows/
│   └── cron.yml          # GitHub Actions pipeline (15-min)
├── package.json           # Dependencies
│
├── fetch-news.js         # Step 1: Fetch 13 sources
├── generate.js         # Step 2: AI rewrite (Groq)
├── gen-image.js        # Step 3: Generate image
├── post.js             # Step 4: Post to Facebook
│
├── news.json           # Raw news (ranked)
├── content-1.txt     # Generated post
├── image-1.png       # Generated image (1200x675)
├── posted-links.json   # Duplicate tracking
│
├── src/
│   ├── services/
│   │   ├── reddit.js     # Reddit API (User-Agent, rate limit)
│   │   ├── image.js     # Pollinations AI
│   │   └── duplicate.js # Duplicate tracking
│   └── feeds/
│       ├── scorer.js   # Score + source reliability
│       └── ranker.js  # Rank Top 1
│
└── .planning/          # GSD planning
    ├── PROJECT.md
    ├── ROADMAP.md
    ├── REQUIREMENTS.md
    └── codebase/     # Documentation
```

---

*Generated: 2026-04-28*