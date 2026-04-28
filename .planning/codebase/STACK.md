# STACK.md - TongHopTinTuc Tech Stack

## Runtime
- **Node.js** - Plain JavaScript (no framework)

## Dependencies
- `axios` - HTTP requests
- `xml2js` - RSS XML parsing
- `rss-parser` - RSS feed parsing (v3.x)
- `form-data` - Multipart form data for FB upload

## News Sources (13 sources)

### RSS Feeds (8)
| Source | Category | URL |
|--------|---------|-----|
| BBC World | world | bbc.com/rss |
| CNN World | world | cnn.com/rss |
| Al Jazeera | world | aljazeera.com |
| NYTimes | world | nytimes.com |
| Guardian | world | theguardian.com |
| France24 | world | france24.com |
| Washington Post | world | washingtonpost.com |

### Reddit (3)
| Source | Category | URL |
|--------|---------|-----|
| r/worldnews | world | reddit.com/r/worldnews/hot.json |
| r/technology | tech | reddit.com/r/technology/hot.json |
| r/news | world | reddit.com/r/news/hot.json |

### New RSS (4)
| Source | Category | URL |
|--------|---------|-----|
| Bloomberg Markets | world | feeds.bloomberg.com/markets/news.rss |
| Bloomberg Tech | tech | feeds.bloomberg.com/technology/news.rss |
| Reuters | world | Google RSS proxy |
| WSJ | world | Google RSS proxy |

## Environment Variables
| Variable | Required | Description |
|----------|---------|------------|
| `GROQ_API_KEY` | Yes | Groq API key for text/image generation |
| `FB_PAGE_ID` | Yes | Facebook Page ID |
| `FB_TOKEN` | Yes | Facebook Page Access Token |
| `REDDIT_USER_AGENT` | Yes | Reddit API User-Agent |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot for error alerts |
| `TELEGRAM_CHAT_ID` | No | Telegram chat ID |

## External Services
| Service | Purpose | API |
|---------|---------|-----|
| **Groq** | Text generation (Llama 3.3) | `api.groq.com` |
| **pollinations.ai** | Image generation | `image.pollinations.ai` |
| **Facebook Graph API** | Post to page | `graph.facebook.com` |
| **Reddit JSON API** | News from Reddit | `reddit.com/r/{sub}/hot.json` |

## Files
- `fetch-news.js` - Fetch from 13 sources
- `generate.js` - AI rewrite (Groq)
- `gen-image.js` - Image gen (Pollinations)
- `post.js` - FB post with retry
- `src/services/reddit.js` - Reddit API service

## Data Flow
```
RSS (8) + Reddit (3) + Bloomberg/Reuters/AP/WSJ (4) → score → rank → content → image → FB
```

---

*Generated: 2026-04-28*