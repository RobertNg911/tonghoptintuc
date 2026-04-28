# Feature Landscape: New News Sources

**Domain:** News aggregation from Reddit, X/Twitter, Reuters, AP, Bloomberg, WSJ
**Researched:** 2026-04-28
**Confidence:** MEDIUM-HIGH (ecosystem patterns well-documented, but access varies)

---

## Executive Summary

Adding these 6 news sources to TongHopTinTuc is technically feasible but **with significant caveats**:

| Source | Access Method | Cost | Complexity |
|--------|--------------|------|------------|
| Reddit | Public JSON endpoints | Free | Low |
| X/Twitter | Third-party scraping | $10-50/mo | Medium |
| Reuters | Google News RSS | Free | Low |
| AP | Not accessible | N/A | High |
| Bloomberg | Official RSS | Free | Low |
| WSJ | Google News RSS | Free | Low |

**Recommendation:** Prioritize Reddit → Bloomberg → Reuters/WSJ. Avoid AP (requires enterprise subscription). X/Twitter requires budget allocation or alternative approach.

---

## Source-by-Source Analysis

### 1. Reddit

**How it works:** Public JSON endpoints (same as old.reddit.com)

**Data format:** JSON
```json
{
  "data": {
    "children": [
      {
        "data": {
          "title": "Post title",
          "url": "https://reddit.com/...",
          "score": 1500,
          "num_comments": 200,
          "created_utc": 1714320000,
          "subreddit": "technology"
        }
      }
    ]
  }
}
```

**Update frequency:** Real-time (new posts appear within seconds)

**Filtering capabilities:**
- By subreddit: `r/worldnews`, `r/technology`, `r/news`
- By sort: `hot`, `new`, `top`, `rising`
- By time: `hour`, `day`, `week`, `month`, `year`, `all`
- By keyword: `?q=searchterm`

**Trending detection:** Built into `hot` sort (algorithm combines score, velocity, comments)

| Subreddit | Best Sort | Update Frequency | Content Type |
|------------|-----------|-------------------|--------------|
| r/worldnews | hot | Real-time | World news |
| r/technology | hot | Real-time | Tech news |
| r/news | hot | Real-time | General news |

**Complexity:** LOW
**Cost:** FREE (public endpoints, ~60 requests/min rate limit, max 100 posts/request)

**Key endpoints:**
- `https://www.reddit.com/r/{subreddit}/{sort}.json?limit=25`
- `https://www.reddit.com/r/{subreddit}/search.json?q={keyword}&sort=hot&limit=25`

---

### 2. X/Twitter

**How it works:** 
- Official API: Requires paid subscription
- Third-party scraping: Apify, SociaVault, Bright Data

**Data format:** JSON

**Official API pricing (2026):**
| Tier | Price | Rate Limits |
|------|-------|-------------|
| Free (write-only) | $0 | Cannot read |
| Basic | $200/mo | 10,000 tweets/month |
| Pro | $5,000/mo | 1M tweets/month |
| Enterprise | ~$42,000/mo | Full access |

**Third-party alternatives:**
| Service | Cost | Notes |
|---------|------|-------|
| Apify | $0.25-0.40/1K tweets | Pay-per-use |
| SociaVault | $10-50/mo typical | API key auth |
| Xanguard | $49/mo | Real-time modules |
| ScrapeBadger | Free tier available | Limited |

**Update frequency:** 
- Scraping: Near real-time (on-demand)
- Official API: Real-time with streaming (Premium+)

**Filtering capabilities:**
- By user/timeline: Get tweets from specific accounts
- By keyword/search: Query-based
- By hashtag/trend: Limited on free tiers

**Trending detection:** Not available on free/basic tiers

**Complexity:** MEDIUM-HIGH
**Recommendation:** Skip X/Twitter for now unless budget allows $10+/month for scraping

---

### 3. Reuters

**How it works:** RSS feeds (authenticated for full content)

**Data format:** RSS 2.0

**Access methods:**
| Method | Cost | Content Quality |
|--------|------|-----------------|
| Reuters Connect (full) | Paid subscription | Full text, images |
| Google News RSS | Free | Headlines + summary |
| Official RSS (limited) | Unknown | Limited categories |

**Free RSS via Google News:**
```
https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US
```

**Official Bloomberg RSS URLs:**
| Category | URL |
|----------|-----|
| Markets | https://feeds.bloomberg.com/markets/news.rss |
| Technology | https://feeds.bloomberg.com/technology/news.rss |
| Politics | https://feeds.bloomberg.com/politics/news.rss |
| Business | https://feeds.bloomberg.com/business/news.rss |
| Economics | https://feeds.bloomberg.com/economics/news.rss |

**Update frequency:** Every 15-30 minutes (RSS polling)

**Filtering capabilities:**
- By category (separate feeds)
- By keyword (Google News RSS)
- By time window (`when:24h`, `when:7d`)

**Complexity:** LOW
**Cost:** FREE (via Google News or public Bloomberg RSS)

---

### 4. AP (Associated Press)

**How it works:** AP Media API - enterprise content delivery platform

**Data format:** JSON (AP Media API), NITF (text stories)

**Access:**
- Requires AP subscription/enterprise license
- Not available for free or small-scale use
- 2025: New "AP Newsroom" platform with AI-powered search

**Update frequency:** Real-time via feed polling

**Filtering capabilities:**
- By product ID
- By keyword (saved searches)
- By topic (followed topics)
- Content types: Text, images, video, audio

**Complexity:** HIGH (enterprise only)
**Cost:** Enterprise pricing (not disclosed)
**Recommendation:** SKIP - Not accessible for free/budget project

---

### 5. Bloomberg

**How it works:** Public RSS feeds + paid enterprise APIs

**Data format:** RSS 2.0

**Free RSS feeds available:**
| Category | URL |
|----------|-----|
| Markets | https://feeds.bloomberg.com/markets/news.rss |
| Technology | https://feeds.bloomberg.com/technology/news.rss |
| Politics | https://feeds.bloomberg.com/politics/news.rss |
| Wealth | https://feeds.bloomberg.com/wealth/news.rss |
| Business | https://feeds.bloomberg.com/business/news.rss |
| Economics | https://feeds.bloomberg.com/economics/news.rss |
| Industries | https://feeds.bloomberg.com/industries/news.rss |

**Update frequency:** Every 15-30 minutes

**Filtering capabilities:**
- By category (separate feed URLs)
- No keyword filtering in RSS

**Complexity:** LOW
**Cost:** FREE (RSS feeds)

**Tested (Jan 2026):** 135 articles from RSS - works well

---

### 6. WSJ (Wall Street Journal)

**How it works:** Dow Jones enterprise APIs

**Data format:** XML (RSS), JSON (APIs)

**Access methods:**
| Method | Cost | Notes |
|--------|------|-------|
| Dow Jones Investor Select API | Paid subscription | Full access |
| Google News RSS | Free | Headlines only |
| Public WSJ RSS | Limited/none | Rarely available |

**Free RSS via Google News:**
```
https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com&ceid=US:en&hl=en-US&gl=US
```

**Update frequency:** Every 15-30 minutes

**Complexity:** LOW (via Google News)
**Cost:** FREE

---

## Feature Comparison Matrix

| Feature | Reddit | X/Twitter | Reuters | AP | Bloomberg | WSJ |
|---------|--------|-----------|---------|-----|-----------|-----|
| **Free access** | Yes | No | Yes* | No | Yes | Yes* |
| **Real-time** | Yes | Yes | ~30min | Yes | ~30min | ~30min |
| **JSON format** | Native | Yes | Via GN | Yes | No (RSS) | Via GN |
| **RSS available** | No | No | Yes | No | Yes | Yes* |
| **Search/filter** | Yes | Limited | Limited | Yes | No | No |
| **Hot/trending** | Yes (hot) | No (paid) | No | No | No | No |
| **No auth required** | Yes | No | Yes* | No | Yes | Yes* |

*Via Google News RSS proxy

---

## Recommendations for TongHopTinTuc

### Priority Order

1. **Reddit** (EASY - free, no auth, rich metadata)
   - Add `fetch-reddit.js` module
   - Target: r/worldnews, r/technology, r/news
   - Sort: hot, limit 25

2. **Bloomberg** (EASY - free RSS)
   - Reuse existing RSS parser
   - Target: Markets, Technology, Politics feeds

3. **Reuters + WSJ** (EASY - Google News RSS)
   - Reuse existing RSS parser
   - Add Google News RSS proxy URLs

4. **X/Twitter** (COMPLEX - requires budget)
   - Only if budget allows $10-50/mo for scraping
   - Alternative: Skip entirely

5. **AP** (NOT FEASIBLE)
   - Enterprise only
   - Exclude from roadmap

### Integration with Existing System

The existing `fetch-news.js` can be extended:

```javascript
// New modules
const sources = {
  reddit: fetchReddit(),    // JSON API, no auth
  bloomberg: fetchRSS(...), // Existing parser
  reuters: fetchRSS(...),   // Google News RSS
  wsj: fetchRSS(...),       // Google News RSS
  twitter: fetchTwitter(),  // If budget allows
};
```

### Cross-Source Deduplication

Required since same stories appear across multiple sources:
- Use URL domain + title similarity
- Already have `duplicate.js` - may need enhancement
- Consider URL normalization (strip tracking params)

### Scoring/Ranking Updates

Current: `hotScore = (score * 1) + (comments * 2)`

New sources need mapping:
| Source | Score Field | Engagement |
|--------|------------|------------|
| Reddit | `score` | `num_comments` |
| X/Twitter | `retweet_count` + `like_count` | `reply_count` |
| RSS (all) | Not available | Use title length, source authority |
| Bloomberg | N/A (RSS) | Use as proxy for authority |
| Reuters | N/A (RSS) | Use as proxy for authority |
| WSJ | N/A (RSS) | Use as proxy for authority |

**Recommendation:** Add source authority weighting
- High authority: Reuters, AP, Bloomberg, WSJ (if accessible)
- Medium: Reddit (hot)
- Lower: X/Twitter (if added)

---

## MVP Recommendation

**Add in Phase 1:**
1. Reddit (r/worldnews, r/technology) - Free, no auth, good engagement data
2. Bloomberg RSS - Free, reliable, business focus

**Add in Phase 2:**
3. Reuters via Google News RSS - World news coverage
4. WSJ via Google News RSS - Business focus

**Skip:**
- AP - Enterprise only
- X/Twitter - Unless budget allows

**Defer:**
- X/Twitter - Complex, requires budget

---

## Data Format Dependencies

| Current Parser | New Sources | Status |
|---------------|-------------|--------|
| RSS parser | Bloomberg, Reuters*, WSJ* | Ready |
| JSON parser | Reddit | Ready (new module) |
| HTML parser | X/Twitter scraper | New (if added) |

*Via Google News RSS proxy

---

## Sources

- Reddit API Docs: https://www.reddit.com/dev/api
- Pushshift: https://github.com/pushshift/api
- X API Rate Limits: https://developer.x.com/en/docs/x-api/rate-limits
- Reuters RSS: https://liaison.reuters.com/page/rss-feeds-tech-notes
- AP Media API: https://api.ap.org/media/v/docs/
- Bloomberg RSS: https://feeds.bloomberg.com/markets/news.rss
- Dow Jones Developer: https://developer.dowjones.com/documents
- Google News RSS patterns (community documented)