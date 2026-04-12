# Phase 2 - CONTEXT.md

## Phase Overview

**Phase 2: Feed Collection** — Thu thập tin từ 20 nguồn RSS (10 thời sự + 10 công nghệ)

## Decisions Made

### RSS Sources

#### Thời sự thế giới (10 nguồn)

| # | Nguồn | RSS URL | Status |
|---|-------|---------|--------|
| 1 | BBC World | `https://feeds.bbci.co.uk/news/world/rss.xml` | confirmed |
| 2 | Reuters World | `https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best` | confirmed |
| 3 | AP News | `https://feeds.apnews.com/apnews/topnews` | confirmed |
| 4 | CNN | `http://edition.cnn.com/rss` | confirmed |
| 5 | NPR | `https://feeds.npr.org/1001/rss.xml` | confirmed |
| 6 | The Guardian | `https://www.theguardian.com/world/rss` | confirmed |
| 7 | USA Today | `https://rssfeeds.usatoday.com/UsatodaycomWorld-TopStories` | confirmed |
| 8 | NBC News | `https://worldnews.nbcnews.com/rss.xml` | confirmed |
| 9 | ABC News | `http://feeds.abcnews.com/International/` | confirmed |
| 10 | Al Jazeera | `https://www.aljazeera.com/xml/rss/all.xml` | confirmed |

#### Công nghệ (10 nguồn)

| # | Nguồn | RSS URL | Status |
|---|-------|---------|--------|
| 1 | The Verge | `https://www.theverge.com/rss/index.xml` | confirmed |
| 2 | TechCrunch | `https://techcrunch.com/feed/` | confirmed |
| 3 | Ars Technica | `https://feeds.arstechnica.com/arstechnica/index` | confirmed |
| 4 | WIRED | `https://www.wired.com/feed/rss` | confirmed |
| 5 | Engadget | `https://www.engadget.com/rss.xml` | confirmed |
| 6 | MIT Technology Review | `https://www.technologyreview.com/feed/` | confirmed |
| 7 | Hacker News | `https://hnrss.org/newest` | confirmed |
| 8 | OpenAI Blog | `https://openai.com/news/rss.xml` | confirmed |
| 9 | Google AI Blog | `https://blog.google/technology/ai/rss/` | confirmed |
| 10 | VentureBeat | `https://venturebeat.com/feed/` | confirmed |

### Feed Parser

- **Library**: `@extractus/feed-extractor` (research recommendation)
- **Reason**: Actively maintained 2025, fewer dependencies (4 vs feedparser's 9)
- **Alternative**: `rss-parser` nếu @extractus có vấn đề

### Filtering Logic

- **Recency**: Chỉ lấy tin trong 2 giờ gần nhất
- **Deduplication**: Loại bỏ tin trùng lặp (so sánh title + link)
- **Language**: Ưu tiên tiếng Anh (AI sẽ viết lại tiếng Việt sau)

### Normalize Format

```typescript
interface NewsItem {
  id: string;           // unique hash from title + link
  title: string;        // original title
  link: string;         // source URL
  summary: string;      // excerpt/description
  pubDate: Date;        // published date
  source: string;       // source name
  sourceCategory: 'world' | 'tech';
}
```

### Error Handling

- **Feed lỗi**: Skip nguồn đó, log lỗi, tiếp tục nguồn khác
- **Fallback**: Nếu tất cả feed lỗi → thử lại sau 5 phút
- **Timeout**: 10 giây/feed, 60 giây tổng cộng

### Environment Variables

```env
# RSS Sources (comma-separated URLs)
RSS_FEEDS_WORLD=https://feeds.bbci.co.uk/news/world/rss.xml,https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best,...
RSS_FEEDS_TECH=https://www.theverge.com/rss/index.xml,https://techcrunch.com/feed/,...

# Filters
RECENCY_HOURS=2
FETCH_TIMEOUT_MS=10000
```

## Code Context

- **Framework**: Hono (từ Phase 1)
- **Location**: `src/feeds/` directory
- **Tests**: `tests/feeds.test.ts`

## Prior Decisions Applied

- Cloudflare Workers + Hono (from PROJECT.md)
- @extractus/feed-extractor (from research STACK.md)
- No database needed (from constraints)

## Out of Scope for Phase 2

- AI rewriting (Phase 5)
- Image generation (Phase 5)
- Facebook posting (Phase 3)

---

*Context created: 2026-04-12*