# STRUCTURE.md - TongHopTinTuc File Structure

```
Tonghoptintuc/
├── .dev.vars              # Environment variables
├── package.json           # Dependencies (axios, xml2js, https)
├── tsconfig.json         # TypeScript config (unused)
│
├── fetch-news.js         # Step 1: Fetch RSS feeds
├── generate.js         # Step 2: AI rewrite content
├── gen-image.js        # Step 3: Generate image
├── post.js            # Step 4: Post to Facebook
│
├── news.json          # Raw news items
├── content.txt        # Generated post
├── image-prompt.txt  # Image generation prompt
├── image.png         # Generated image
│
├── src/
│   ├── services/
│   │   ├── gemini.js    # Text rewriting (Groq Llama)
│   │   ├── image.js    # Image generation (pollinations)
│   │   ├── alert.js    # Telegram alerts
│   │   └── ...
│   ├── feeds/
│   │   ├── scorer.js   # Hot news scoring
│   │   └── ranker.js  # Rank top N
│   └── types/
│       └── post.js     # Type definitions
│
└── .planning/          # GSD planning artifacts
    ├── PROJECT.md     # Project vision
    ├── ROADMAP.md    # Phase breakdown
    └── phases/       # Phase plans
```

---

*Generated: 2026-04-18*