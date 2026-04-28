# Technology Stack - New News Sources

**Project:** TongHopTinTuc v1.1
**Researched:** 2026-04-28
**Confidence:** HIGH

## Executive Summary

For adding Reddit, X/Twitter, Reuters, AP, Bloomberg, and WSJ as news sources:

| Source | Method | Free? | Notes |
|--------|--------|-------|-------|
| **Reddit** | JSON endpoint | YES (dev only) | Public API for reads |
| **X/Twitter** | API v2 | ❌ NO | Pay-per-use only, minimum $100/mo |
| **Reuters** | Google News RSS | YES | Proxy feed, no official RSS |
| **AP** | NewsAPI.org or Google RSS | YES (100req/d) | Limited free tier |
| **Bloomberg** | Direct RSS feed | YES | feeds.bloomberg.com |
| **WSJ** | Google News RSS | YES | Proxy feed |

**Critical blocker:** X/Twitter API is NOT free. Will need alternative approach (third-party aggregator or scraping).

---

## Source-by-Source Stack

### 1. Reddit

**API:** Reddit JSON API (public endpoints)
**Base URL:** `https://www.reddit.com/r/{subreddit}/{sort}.json`

| Subreddit | Endpoint | Purpose |
|-----------|----------|---------|
| r/worldnews | `/hot.json` | World news |
| r/technology | `/hot.json` | Tech news |
| r/news | `/hot.json` | General news |

**Authentication:** None required for read-only (GET requests)

**Rate Limits:** ~60 requests/minute (unauthenticated), higher with OAuth

**Code Example:**

```javascript
// fetch-reddit.js
const axios = require('axios');

async function fetchReddit(subreddit = 'worldnews', limit = 10) {
  const response = await axios.get(
    `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
    {
      headers: {
        'User-Agent': 'TongHopTinTuc/1.0 (news aggregator)'
      }
    }
  );
  
  return response.data.data.children.map(post => ({
    id: post.data.id,
    title: post.data.title,
    url: post.data.url,
    permalink: `https://reddit.com${post.data.permalink}`,
    score: post.data.score,
    numComments: post.data.num_comments,
    created: post.data.created_utc,
    isSelf: post.data.is_self,
    selfText: post.data.selftext
  }));
}
```

**npm install:**
```bash
npm install axios
```

**Sources:**
- Reddit API Documentation: https://www.reddit.com/dev/
- Reddit Data API Wiki: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki

---

### 2. X/Twitter

**Status:** NOT FREE - Critical blocker

**API:** X API v2 (Pay-per-use)
**Pricing:** Credit-based, no free tier
- Starts ~$100/month minimum for meaningful usage
- Owned Reads: $0.001/resource
- Tweets Read: $0.005/result

**Not recommended** for 0đ/month budget.

**Alternatives to investigate:**
1. Nitter (Twitter frontend with RSS) - May be blocked
2. Third-party aggregators (TweetDeck deprecated)
3. Manual curation
4. Check if any free tier still exists (rare)

**Recommendation:** Skip X/Twitter for now, focus on other free sources.

---

### 3. Reuters

**Method:** Google News RSS Proxy (official RSS discontinued)

**RSS URLs:**

| Feed | URL |
|------|-----|
| World News | `https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US` |
| Business | `https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&topic=b` |
| Markets | `https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&topic=bc` |

**Code Example:**

```javascript
// fetch-reuters-rss.js
const Parser = require('rss-parser');
const parser = new Parser();

async function fetchReuters(feed = 'world') {
  const feeds = {
    world: '...reuters-world-rss-url...',
    business: '...reuters-business-rss-url...'
  };
  
  const parsed = await parser.parseURL(feeds[feed]);
  return parsed.items.map(item => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate,
    content: item.content
  }));
}
```

**npm install:**
```bash
npm install rss-parser
```

**Notes:** Reuters official RSS was discontinued ~2023. Use Google News proxy for live access.

---

### 4. AP (Associated Press)

**Method:** AP News RSS Feeds

**RSS URLs:**

| Feed | URL |
|------|-----|
| Top News | `https://apnews.com/hub/apf-topnews?output=rss&p=16` |
| Politics | `https://apnews.com/politics?output=rss` |
| Business | `https://apnews.com/hub/business?output=rss` |

**Alternative:** NewsAPI.org (100 req/day free tier, dev only)

**Code Example:**

```javascript
// fetch-ap-rss.js
const Parser = require('rss-parser');
const parser = new Parser();

async function fetchAP(category = 'topnews') {
  const feeds = {
    topnews: 'https://apnews.com/hub/apf-topnews?output=rss&p=16',
    politics: 'https://apnews.com/politics?output=rss',
    business: 'https://apnews.com/hub/business?output=rss'
  };
  
  const parsed = await parser.parseURL(feeds[category]);
  return parsed.items.map(item => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate
  }));
}
```

---

### 5. Bloomberg

**Method:** Direct RSS Feeds (OFFICIAL)

**RSS URLs:**

| Feed | URL |
|------|-----|
| Markets | `https://feeds.bloomberg.com/markets/news.rss` |
| Technology | `https://feeds.bloomberg.com/technology/news.rss` |
| Politics | `https://feeds.bloomberg.com/politics/news.rss` |
| Wealth | `https://feeds.bloomberg.com/wealth/news.rss` |
| Business | `https://feeds.bloomberg.com/bview/news.rss` |
| Economics | `https://feeds.bloomberg.com/economics/news.rss` |

**Authentication:** None (public)

**Rate Limits:** None documented for RSS

**Code Example:**

```javascript
// fetch-bloomberg-rss.js
const Parser = require('rss-parser');
const parser = new Parser();

async function fetchBloomberg(category = 'markets') {
  const feedUrl = `https://feeds.bloomberg.com/${category}/news.rss`;
  const parsed = await parser.parseURL(feedUrl);
  
  return parsed.items.map(item => ({
    title: item.title,
    link: item.link,
    pubDate: item.pubDate
  }));
}
```

---

### 6. WSJ (Wall Street Journal)

**Method:** Google News RSS Proxy

**RSS URLs:**

| Feed | URL |
|------|-----|
| World | `https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com&ceid=US:en` |
| Business | `https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com/articles/SB` |
| Markets | `https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com/articles/markets` |

**Official API:** Dow Jones Investor Select API (PAID, contact sales)

**Note:** Most WSJ content is paywalled. Google News RSS returns headlines but may link to paywalled articles.

---

## Recommended Stack Additions

### Packages to Install

```bash
npm install rss-parser axios
```

| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| `rss-parser` | ^3.x | Parse RSS feeds | Cross-source RSS, same interface |
| `axios` | ^1.x | HTTP client | Already in use |

### No New API Keys Needed

- Reddit: No auth for GET requests (development)
- Reuters/AP/WSJ: Use RSS feeds
- Bloomberg: Official RSS (free)
- X/Twitter: SKIP (not free)

### Environment Variables (none new)

All RSS feeds are public. No API keys required.

---

## Implementation Pattern

```javascript
// src/feeds/reddit.js
const axios = require('axios');

const SUBREDDITS = {
  worldnews: 'worldnews',
  technology: 'technology',
  news: 'news'
};

async function fetchReddit(subreddit = 'worldnews') {
  const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`;
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'TongHopTinTuc/1.0' }
  });
  
  return data.data.children
    .filter(p => !p.data.is_self || p.data.selftext?.length > 100)
    .map(p => ({
      source: 'reddit',
      subreddit: `r/${subreddit}`,
      title: p.data.title,
      url: p.data.url,
      permalink: `https://reddit.com${p.data.permalink}`,
      score: p.data.score,
      comments: p.data.num_comments,
      published: new Date(p.data.created_utc * 1000).toISOString()
    }));
}
```

```javascript
// src/feeds/rss-bundled.js
const Parser = require('rss-parser');

const FEEDS = {
  reuters: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en',
  ap: 'https://apnews.com/hub/apf-topnews?output=rss&p=16',
  bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
  wsj: 'https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com&ceid=US:en'
};

async function fetchRSS(source) {
  const parser = new Parser();
  const feed = await parser.parseURL(FEEDS[source]);
  return feed.items.map(item => ({
    source,
    title: item.title,
    url: item.link,
    published: item.pubDate
  }));
}
```

---

## Rate Limits Summary

| Source | Rate Limit | Free? | Notes |
|--------|-----------|-------|-------|
| Reddit | ~60/min | Yes (dev) | Public API, no auth needed |
| X/Twitter | Pay-per-use | ❌ | No free tier exists |
| Reuters (via Google) | ? | Yes | Google News RSS proxy |
| AP RSS | ? | Yes | Public RSS |
| Bloomberg RSS | None | Yes | Official feeds |
| WSJ (Google) | ? | Yes | Google News RSS proxy |

---

## What NOT to Use

1. **X/Twitter API** - Not free, pay-per-use only, $100+/month minimum
2. **NewsAPI.org** - Free tier has 24h article delay, only works on localhost (dev only), not for production
3. **Dow Jones API** - Paid, enterprise only
4. **Refinitiv/Bloomberg Terminal** - Expensive enterprise tier

---

## Next Steps

1. Install `rss-parser`
2. Create `src/feeds/reddit.js`
3. Create `src/feeds/rss-newssources.js` for Reuters/AP/WSJ via Google RSS
4. Add Bloomberg RSS to existing RSS fetcher
5. Update scorer to handle Reddit post structure (score, comments instead of pubDate)
6. Test all feeds independently

---

## Sources

- Reddit API: https://www.reddit.com/dev/
- Reddit Data API Wiki: https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki
- X Developer: https://developer.x.com/
- Google News RSS: https://news.google.com/rss
- Bloomberg RSS: https://feeds.bloomberg.com/
- AP News: https://apnews.com/
- NewsAPI Pricing: https://newsapi.org/pricing