# STRUCTURE.md - TongHopTinTuc File Structure

```
Tonghoptintuc/
├── .dev.vars              # Environment variables (dev only)
├── .github/workflows/
│   └── cron.yml          # GitHub Actions pipeline
├── package.json           # Dependencies (axios, xml2js, form-data)
├── tsconfig.json         # TypeScript config (unused)
│
├── fetch-news.js         # Step 1: Fetch RSS feeds
├── generate.js         # Step 2: AI rewrite content (Groq)
├── gen-image.js        # Step 3: Generate image (Pollinations)
├── post.js             # Step 4: Post to Facebook (with retry)
│
├── news.json           # Raw news items (ranked)
├── content-1.txt     # Generated post
├── image-1.png       # Generated image (1200x675)
├── posted-links.json   # Duplicate tracking (24h)
│
├── src/
│   ├── services/
│   │   ├── image.js     # Image generation (Pollinations)
│   │   ├── duplicate.js # Duplicate tracking
│   ├── feeds/
│   │   ├── scorer.js   # Hot news scoring
│   │   └── ranker.js  # Rank top 1
│
└── .planning/          # GSD planning artifacts
    ├── PROJECT.md     # Project vision
    ├── ROADMAP.md    # Phase breakdown
    └── codebase/     # Codebase docs
```

---

*Generated: 2026-04-28*