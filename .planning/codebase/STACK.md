# STACK.md - TongHopTinTuc Tech Stack

## Runtime
- **Node.js** - Plain JavaScript (no framework)

## Dependencies
- `axios` - HTTP requests
- `xml2js` - RSS XML parsing
- `form-data` - Multipart form data for FB upload

## Environment Variables
| Variable | Required | Description |
|----------|---------|------------|
| `GROQ_API_KEY` | Yes | Groq API key for text/image generation |
| `FB_PAGE_ID` | Yes | Facebook Page ID |
| `FB_TOKEN` | Yes | Facebook Page Access Token |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot for error alerts |
| `TELEGRAM_CHAT_ID` | No | Telegram chat ID |
| `CONTENT_COUNT` | No | Number of posts (default: 1) |
| `IMAGE_COUNT` | No | Number of images (default: 1) |

## External Services
| Service | Purpose | API |
|---------|---------|-----|
| **Groq** | Text generation (Llama 3.3) | `api.groq.com` |
| **pollinations.ai** | Image generation | `image.pollinations.ai` |
| **Facebook Graph API** | Post to page | `graph.facebook.com` |
| **Telegram Bot** | Error alerts | `api.telegram.org` |

## Files
- `fetch-news.js` - RSS fetch (10 sources)
- `generate.js` - AI rewrite (Groq)
- `gen-image.js` - Image gen (Pollinations)
- `post.js` - FB post with retry

## Data Flow
```
RSS (10 sources) → JSON → Groq → content-1.txt → pollinations → image-1.png → FB
```

---

*Generated: 2026-04-28*