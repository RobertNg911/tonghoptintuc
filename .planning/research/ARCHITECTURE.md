# Architecture Patterns — Adding New News Sources

**Domain:** News aggregation from Reddit, X/Twitter, Reuters, AP, Bloomberg, WSJ  
**Researched:** 2026-04-28  
**Confidence:** MEDIUM-HIGH (mix of official docs and community findings)

---

## Current Architecture Analysis

### Existing Data Flow

```
GitHub Actions Cron (every 15 min)
    ↓
fetch-news.js (RSS → parse → score → rank → deduplicate)
    ↓
generate.js (AI rewrite with Groq Llama 3.3)
    ↓
gen-image.js (AI image with Pollinations.ai)
    ↓
post.js (Facebook Graph API + markPosted)
    ↓
posted-links.json (24h dedup tracking)
```

### Key Integration Points

| Component | File | What Changes |
|-----------|------|--------------|
| **Source Config** | `fetch-news.js` → `SOURCES` object | Add new source URLs/API configs |
| **Fetch Logic** | `fetch-news.js` → `fetchFeed()` | Extend to handle APIs (Reddit, X) not just RSS |
| **Scoring** | `src/feeds/scorer.js` | Add new source names for score bonuses |
| **Ranking** | `src/feeds/ranker.js` | No changes needed (generic) |
| **Deduplication** | `src/services/duplicate.js` | No changes needed (URL-based) |

---

## New Source Integration Patterns

### 1. Reddit (API-based)

**Integration Approach:** New fetcher function, not RSS

```javascript
// Add to fetch-news.js
const Snoowrap = require('snoowrap');

const REDDIT_SOURCES = {
  reddit: [
    { name: 'Reddit WorldNews', subreddit: 'worldnews', type: 'subreddit' },
    { name: 'Reddit Technology', subreddit: 'technology', type: 'subreddit' },
    { name: 'Reddit News', subreddit: 'news', type: 'subreddit' }
  ]
};

// New fetcher for Reddit API
async function fetchReddit(subreddit, sort = 'hot', limit = 10) {
  const r = new Snoowrap({
    userAgent: 'TongHopTinTuc/1.0',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
  });
  
  const posts = await r.getSubreddit(subreddit).getHot({ limit });
  return posts.map(post => ({
    title: post.title,
    link: post.url,
    pubDate: new Date(post.created_utc * 1000).toISOString(),
    source: `Reddit ${subreddit}`,
    category: 'reddit',
    score: post.score,
    numComments: post.num_comments
  }));
}
```

**Required Environment Variables:**
- `REDDIT_CLIENT_ID` — From https://www.reddit.com/prefs/apps
- `REDDIT_CLIENT_SECRET` — From app creation
- `REDDIT_USERNAME` — Reddit account username
- `REDDIT_PASSWORD` — Reddit account password

**Package:** `npm install snoowrap` (promise-based, built-in rate limiting)

**Confidence:** HIGH — snoowrap is well-documented, actively maintained, handles Reddit API changes.

---

### 2. X/Twitter (API-based, Pay-Per-Use)

**⚠️ CRITICAL:** Free tier effectively discontinued (Feb 2026). Now pay-per-use.

**Options:**

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| Official X API (Pay-Per-Use) | $0.005/read | Official, reliable | Costs money (violates $0 budget) |
| GetXAPI.com | $0.10 free credit | Free to start, no credit card | Third-party, less reliable |
| Scraping | $0 | Free | Against ToS, unreliable |

**Recommendation:** Skip X/Twitter for now — pay-per-use violates $0/month budget constraint. If needed later, use GetXAPI as stopgap.

**If implementing X API:**
```javascript
// Would require new fetcher similar to Reddit pattern
// Needs: X_API_KEY from developer portal (paid)
```

**Confidence:** HIGH — Multiple sources confirm free tier removal (X Developer Community, Feb 2026).

---

### 3. Reuters (RSS with Auth / Workarounds)

**Official Access:** Requires authentication (password-protected RSS) or paid subscription.

**Workarounds (FREE but less reliable):**

**Option A: Google News RSS Proxy**
```javascript
// Add to SOURCES object
{ name: 'Reuters (Google News)', 
  url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US' }
```

**Option B: RapidAPI Reuters API**
- Requires: RapidAPI key (free tier available)
- URL: `https:// Reuters-api-rapidapi.com/`
- Needs: `REUTERS_RAPIDAPI_KEY`

**Option C: Reuters Wire API (v7/v8)**
```
https://wireapi.reuters.com/v7/feed/url/www.reuters.com/theWire
```
⚠️ Community reports this returns 502 errors or gets IP-blocked.

**Recommendation:** Use Google News RSS proxy (Option A) — free, no auth, reasonable quality.

**Confidence:** MEDIUM — Official docs say auth required, but community finds workarounds.

---

### 4. Associated Press (AP) — RSS

**✅ FREE — RSS available without authentication**

**RSS Feed URLs:**
```javascript
// Add to SOURCES object
ap: [
  { name: 'AP Top News', url: 'https://apnews.com/hub/apf-topnews?output=rss' },
  { name: 'AP US News', url: 'https://apnews.com/hub/apf-topnews?output=rss&p=18' },
  { name: 'AP World', url: 'https://apnews.com/hub/apf-topnews?output=rss&p=16' }
]
```

**Note:** AP uses custom RSS/Atom format. Existing `xml2js` parser should handle it, but test first.

**Confidence:** MEDIUM — Some community reports of format issues, but URLs return valid XML in testing.

---

### 5. Bloomberg — RSS

**✅ FREE — Official RSS feeds available without authentication**

**RSS Feed URLs (verified working):**
```javascript
// Add to SOURCES object
bloomberg: [
  { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss' },
  { name: 'Bloomberg Technology', url: 'https://feeds.bloomberg.com/technology/news.rss' },
  { name: 'Bloomberg Politics', url: 'https://feeds.bloomberg.com/politics/news.rss' },
  { name: 'Bloomberg Business', url: 'https://feeds.bloomberg.com/business/news.rss' },
  { name: 'Bloomberg Economics', url: 'https://feeds.bloomberg.com/economics/news.rss' },
  { name: 'Bloomberg Wealth', url: 'https://feeds.bloomberg.com/wealth/news.rss' }
]
```

**Confidence:** HIGH — Multiple sources confirm feeds work, URLs verified in community posts.

---

### 6. Wall Street Journal (WSJ) — RSS with Auth

**Official Access:** Dow Jones Investor Select RSS API requires API key.

**URL Format:** `https://feeds.content.dowjones.io/api/investorselect/wsj`  
**Auth:** Header `x-api-key: <API_KEY>`  
**Rate Limit:** 1 request/minute

**Workarounds (FREE):**

**Option A: Google News RSS Proxy**
```javascript
{ name: 'WSJ (Google News)', 
  url: 'https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com&ceid=US:en&hl=en-US&gl=US' }
```

**Option B: Old DJ RSS (may work without auth)**
```
https://feeds.a.dj.com/rss/RSSWorldNews.xml
https://feeds.a.dj.com/rss/RSSBusiness.xml
```
⚠️ Community reports mixed results — some feeds offline since Feb 2026.

**Recommendation:** Use Google News RSS proxy (Option A) — most reliable free approach.

**Confidence:** MEDIUM — Official requires auth, but Google News proxy works.

---

## Recommended Architecture Changes

### Modified SOURCES Object

```javascript
const SOURCES = {
  world: [
    // Existing sources...
    { name: 'Reuters (GNews)', url: 'https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US', type: 'rss' },
    { name: 'AP Top News', url: 'https://apnews.com/hub/apf-topnews?output=rss', type: 'rss' },
    { name: 'WSJ (GNews)', url: 'https://news.google.com/rss/search?q=when:24h+allinurl:wsj.com&ceid=US:en&hl=en-US&gl=US', type: 'rss' }
  ],
  tech: [
    // Existing sources...
    { name: 'Bloomberg Technology', url: 'https://feeds.bloomberg.com/technology/news.rss', type: 'rss' }
  ],
  business: [  // NEW CATEGORY
    { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss', type: 'rss' },
    { name: 'Bloomberg Business', url: 'https://feeds.bloomberg.com/business/news.rss', type: 'rss' },
    { name: 'Bloomberg Economics', url: 'https://feeds.bloomberg.com/economics/news.rss', type: 'rss' }
  ],
  reddit: [  // NEW CATEGORY (API-based)
    { name: 'Reddit WorldNews', subreddit: 'worldnews', type: 'reddit' },
    { name: 'Reddit Technology', subreddit: 'technology', type: 'reddit' }
  ]
  // Note: X/Twitter skipped (pay-per-use violates $0 budget)
};
```

### Updated Scorer (src/feeds/scorer.js)

Add new source names to the bonus scoring:

```javascript
// Line 42, update to:
if (['BBC', 'Reuters', 'AP', 'Bloomberg', 'Reuters (GNews)', 'AP Top News'].includes(item.source)) {
  score += 10;
}
```

Also add Reddit-specific scoring (upvotes = popularity):

```javascript
// Add after line 41:
if (item.score && item.score > 1000) score += 15;  // Reddit high-score posts
if (item.numComments && item.numComments > 500) score += 10;  // Active discussions
```

---

## Component Boundary Changes

| Component | Change Type | Description |
|-----------|-------------|-------------|
| `fetch-news.js` | **MODIFY** | Add new source categories, Reddit fetcher function |
| `src/feeds/scorer.js` | **MODIFY** | Add new source names, Reddit scoring logic |
| `src/feeds/ranker.js` | **NO CHANGE** | Works generically |
| `src/services/duplicate.js` | **NO CHANGE** | URL-based, works for all sources |
| `generate.js` | **NO CHANGE** | Receives standardized news.json |
| `gen-image.js` | **NO CHANGE** | Works with any topic |
| `post.js` | **NO CHANGE** | Posts whatever it receives |

---

## Data Flow Changes

### RSS Sources (Reuters, AP, Bloomberg, WSJ)
```
Same as existing: RSS URL → fetchFeed() → xml2js parse → standardize → score → rank
```

### Reddit (API Source)
```
New flow: Reddit API → fetchReddit() → transform to standard format → score (with Reddit metrics) → rank
```

### Skipped: X/Twitter
```
Not implemented (pay-per-use violates $0 budget)
If added later: Similar to Reddit pattern with X API fetcher
```

---

## Environment Variables Needed

| Variable | Source | Required | Notes |
|----------|--------|----------|-------|
| `REDDIT_CLIENT_ID` | Reddit Apps | For Reddit | Create app at reddit.com/prefs/apps |
| `REDDIT_CLIENT_SECRET` | Reddit Apps | For Reddit | Shown when creating app |
| `REDDIT_USERNAME` | Reddit account | For Reddit | Your Reddit username |
| `REDDIT_PASSWORD` | Reddit account | For Reddit | Your Reddit password |
| `REUTERS_RAPIDAPI_KEY` | RapidAPI | Optional | Only if using RapidAPI method |

---

## Build Order for New Sources

**Phase 1: Easy RSS sources (no auth, free)**
1. Bloomberg — RSS feeds verified working ✅
2. AP — RSS feeds available ✅
3. Add to existing `world` and `tech` categories

**Phase 2: RSS sources with workarounds**
4. Reuters — Use Google News RSS proxy
5. WSJ — Use Google News RSS proxy

**Phase 3: API-based source (requires credentials)**
6. Reddit — Install snoowrap, add env vars, test

**Phase 4: Skip (budget constraints)**
7. X/Twitter — Pay-per-use violates $0/month constraint

---

## Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Google News RSS proxy gets blocked | Medium | Have RapidAPI as backup for Reuters/WSJ |
| Reddit API rate limiting | Medium | snoowrap handles this, cache results |
| AP RSS format changes | Low | Test parsing, have fallback |
| Bloomberg RSS feeds change URL | Low | Feeds are official, stable |
| Environment variables missing | High | Add checks in fetch-news.js |

---

## Sources

- **Reddit API:** snoowrap npm docs, Reddit API Documentation (2026)
- **X/Twitter API:** X Developer Community posts (Jan-Feb 2026), GetXAPI.com
- **Reuters:** Thomson Reuters Developer Portal, Reuters Liaison docs, RSS-Bridge GitHub issues
- **AP News:** AP News RSS URLs tested, RSS.app generator, RSSHub docs
- **Bloomberg:** feeds.bloomberg.com verified by multiple sources (FeedSpot, IFTTT, IvyReader)
- **WSJ:** Dow Jones Investor Select API docs, feeds.content.dowjones.io, community reports

---

## Confidence Assessment

| Source | Confidence | Reason |
|--------|------------|--------|
| Bloomberg RSS | HIGH | Official feeds, multiple confirmations |
| Reddit API | HIGH | snoowrap well-documented, standard approach |
| AP RSS | MEDIUM | URL format confirmed, but custom format |
| Reuters (workaround) | MEDIUM | Community reports working, not official |
| WSJ (workaround) | MEDIUM | Google News proxy works, official requires auth |
| X/Twitter | HIGH | Confirmed pay-per-use (skip) |

---

*Research complete: 2026-04-28*  
*Confidence: MEDIUM-HIGH — Most sources verified with multiple community reports; official docs limited for paid sources.*
