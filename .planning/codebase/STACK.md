# STACK.md - TongHopTinTuc Tech Stack

## Runtime
- **Node.js** - Plain JavaScript (no framework)

## Dependencies
- `axios` - HTTP requests
- `xml2js` - RSS XML parsing
- `https` - Built-in module

## External Services
| Service | Purpose | API |
|---------|---------|-----|
| **Groq** | Text generation (Llama 3.3) | `api.groq.com` |
| **pollinations.ai** | Image generation | `image.pollinations.ai` |
| **Facebook Graph API** | Post to page | `graph.facebook.com` |
| **Telegram Bot** | Error alerts | `api.telegram.org` |
| **HuggingFace** | Image fallback | `api-inference.huggingface.co` |

## Files
- `fetch-news.js` - RSS fetch
- `generate.js` - AI rewrite
- `gen-image.js` - Image gen
- `post.js` - FB post

## Data Flow
```
RSS (10 sources) → JSON → Groq → content.txt → pollinations → image.png → FB
```

---

*Generated: 2026-04-18*