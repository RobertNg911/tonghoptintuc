# Domain Pitfalls: Adding News Sources to TongHopTinTuc

**Domain:** News aggregation system (Reddit, X/Twitter, Reuters, AP, Bloomberg, WSJ)
**Researched:** 2026-04-28
**Context:** Adding new sources to existing system that uses RSS + Groq Llama 3.3 + Pollinations.ai + Facebook Graph API, running on GitHub Actions every 15 minutes with zero budget

---

## Critical Pitfalls

Mistakes that cause rewrites, complete feature failure, or legal/compliance issues.

---

### Pitfall 1: X/Twitter API — Free Tier Eliminated, $200/month Minimum for Any Data Access

**What goes wrong:**  
Developer assumes Twitter API has a usable free tier like in 2023. In February 2026, X eliminated the free tier entirely, replacing it with a pay-per-use credit model. The "Basic" tier jumped from $100/month to **$200/month** (as of 2026). The free tier now allows ~500 posts/month read-only with **NO search functionality**. To read tweets programmatically, you need at least $200/month. To POST tweets (required if you want to cross-post), you also need $200/month minimum.

**Why it happens:**  
Documentation searches return outdated 2023-2024 articles mentioning "$100/month Basic" or "free read tier." The February 2026 pricing overhaul is not reflected in most tutorials.

**Consequences:**  
- **Budget violation:** $0/month budget instantly broken ($200/month = 2.4M VND/year)
- **Feature failure:** Cannot fetch tweets without paying
- **Alternative scraping risk:** Developers turn to unauthorized scraping, risking account bans and legal issues

**Prevention:**  
1. **Assume X API is NOT an option** for $0 budget projects
2. Use **RSS-based alternatives**:  
   - Google News RSS (free, no auth): `https://news.google.com/rss/search?q=site:twitter.com+keyword`
   - Nitter instances (self-hosted or public, but unstable)
3. If X content is required, consider **manual curation** (copy-paste trending topics) instead of API
4. Document this clearly: "X API excluded due to $200/month minimum cost"

**Detection:**  
- Check X Developer Portal pricing page (not blog posts)
- Verify current pricing: Basic = $200/month as of 2026
- If building MVP, skip X/Twitter entirely

**Sources:**  
- X Developer Platform pricing (2026): https://developer.x.com/en/docs/twitter-api/tweet-caps  
- X (Twitter) Free Tier 2026: https://agentdeals.dev/vendor/x-twitter  
- Twitter API Pricing Explained: https://getlate.dev/blog/twitter-api-pricing  

**Confidence:** HIGH (verified via multiple 2026 sources)

---

### Pitfall 2: Bloomberg & WSJ — No Free API, Hard Paywalls, Expensive Scraping

**What goes wrong:**  
Developer tries to integrate Bloomberg or WSJ thinking they have free APIs like RSS feeds. Both require **paid subscriptions**:
- Bloomberg Terminal: ~$20,000/year
- Bloomberg Enterprise API: Custom pricing (institutional only)
- WSJ: No public API, hard paywall protected by Akamai bot detection

When free APIs don't exist, developers turn to web scraping, but:
- **WSJ scraping difficulty: 5/5 (Very Hard)** — Akamai, hard paywall, login wall
- **Bloomberg scraping:** Paywall bypass needed, residential proxies required ($50-200/month)
- **Legal risk:** Scraping paywalled content violates ToS, possible legal action

**Why it happens:**  
Both are premium financial publications. Developers assume "all news sites have RSS" or "can scrape like regular sites."

**Consequences:**  
- **Complete feature failure:** Cannot access content without payment
- **Wasted development time:** Building scrapers that get blocked immediately
- **Legal exposure:** Scraping paywalled content
- **Budget violation:** Residential proxies + scraping APIs cost $50-200/month

**Prevention:**  
1. **Use RSS alternatives for these sources:**
   - **Bloomberg RSS:** `https://www.bloomberg.com/feed/podcast/etf-iq.xml` (limited, but free)
   - **WSJ RSS via Dow Jones:** Requires API key, 1 request/minute limit, headlines only (no full text)
   - **Google News RSS for Bloomberg/WSJ:** `https://news.google.com/rss/search?q=site:bloomberg.com+OR+site:wsj.com`

2. **Skip full article text, use headlines only:**
   - AI can summarize based on headline + description
   - This avoids paywall issues entirely

3. **Alternative free sources with similar content:**
   - Reuters (see Pitfall 3)
   - AP News (see Pitfall 4)
   - Google News RSS (aggregates multiple sources)

**Detection:**  
- Try accessing Bloomberg.com or WSJ.com article without login → see paywall
- Check official developer portals → no free API
- Search "Bloomberg API pricing" → only enterprise results

**Sources:**  
- Bloomberg News Scraper Guide: https://www.falconscrape.com/blog/how-to-scrape-bloomberg-news-articles  
- WSJ Scraping Difficulty: https://scraperly.com/scrape/wsj  
- Bloomberg Data API: https://stockapis.com/parsers/bloomberg/intro  
- WSJ Scraper API: https://www.scrapingbee.com/scrapers/wsj-api/  

**Confidence:** HIGH (verified via multiple sources, confirmed paywall status)

---

### Pitfall 3: Reuters & AP — "Free" APIs Have Hidden Restrictions

**What goes wrong:**  
Developer finds "Reuters API" or "AP API" and assumes it's free. Reality:
- **Reuters API:** Enterprise-only, custom pricing (no public free tier)
- **AP API:** Requires registration at https://developer.ap.org/, but:
  - Rate limit: **1 request per minute per endpoint** (extremely restrictive)
  - Returns headlines/descriptions only (no full article text without paid subscription)
  - Dow Jones Investor Select RSS API (includes WSJ, Barron's): 1 request/minute, headlines only

Common mistake: Registering for API key, then hitting rate limit immediately when fetching multiple articles.

**Why it happens:**  
API documentation doesn't emphasize rate limits or content restrictions upfront. Developers assume "API key = full access."

**Consequences:**  
- **Rate limit blocking:** 1 request/minute = max 60 articles/hour (not enough for 15-minute cron)
- **No article body:** AI cannot rewrite content it doesn't have
- **Wasted time:** Building integration that can't be used in production

**Prevention:**  
1. **Use Reuters/AP content via Google News RSS (free, no API key):**
   ```
   https://news.google.com/rss/search?q=site:reuters.com+OR+site:apnews.com&hl=en-US&gl=US&ceid=US:en
   ```

2. **If using official APIs, respect rate limits:**
   - Implement 60-second delay between requests
   - Cache responses aggressively (content doesn't change every minute)
   - Use only for headlines, not full article fetching

3. **Alternative:** NewsAPI.org aggregates Reuters/AP, but free tier is 100 req/day (localhost only, no production)

**Detection:**  
- Check API documentation for rate limits before coding
- Test API with single request, check response headers for rate limit info
- Look for "enterprise," "custom pricing," or "contact sales" language

**Sources:**  
- Associated Press API: https://openpublicapis.com/api/associated-press  
- Reuters API Pricing: https://cms.nucleusnetwork.com/urban-beat/reuters-news-api-pricing-and-options-find-the-best-deal-1764797822  
- Dow Jones Investor Select RSS: https://developer.dowjones.com/documents/site-docs-newswires_apis-dow_jones_investor_select_rss_api  

**Confidence:** MEDIUM (AP/Reuters official APIs confirmed, but Google News RSS alternative widely reported)

---

### Pitfall 4: Cross-Source Deduplication — Exact Matching Misses 90% of Duplicates

**What goes wrong:**  
Developer implements deduplication by exact URL match or exact title match. When the same story appears across Reddit, Reuters, AP, and Google News:
- Reddit: `https://reddit.com/r/news/comments/abc123/earthquake_japan/`
- Reuters: `https://reuters.com/world/asia-pacific/japan-earthquake-2026-idUSKBN123456/`
- Google News: `https://news.google.com/stories/CAAqNggKIjBDQklTSGpvSmMzUnZjbmt0TXpZd1NoRUtEd2prMU83TUVCRUVqZ0k5`
- AP: `https://apnews.com/article/japan-earthquake-tokyo-1234567890abcdef`

All these URLs are different, but they're the **same story**. Exact URL matching fails. Exact title matching also fails:
- Reddit title: "Massive earthquake hits Japan"
- Reuters headline: "7.1 magnitude quake strikes central Japan"
- AP headline: "Powerful earthquake rocks Japan, tsunami warning issued"

Title similarity is ~0% by word overlap, but they're the same event.

**Why it happens:**  
Developers assume "same story = same URL or title." News syndication means the same event gets different URLs and headlines across outlets.

**Consequences:**  
- **AI token waste:** Same story summarized 4 times = 4x cost
- **Facebook spam:** Multiple posts about the same event annoy followers
- **Scoring issues:** Same story appears multiple times in ranking, pushing other news down

**Prevention:**  
Implement **two-pass deduplication**:

**Pass 1: Exact URL matching (catches 10%)**
```javascript
function normalizeURL(url) {
  // Strip tracking params, fragments, trailing slashes
  return url.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/+$/, '').toLowerCase();
}
```

**Pass 2: Fuzzy title similarity (catches 80%)**
```javascript
function similarity(s1, s2) {
  // Use SequenceMatcher or Jaccard similarity
  // 0.7 threshold works well for news titles
  return ratio > 0.7 ? true : false;
}
```

**Pass 3 (optional): Time window constraint**
- Only compare articles published within 18-36 hours
- Prevents merging "Japan earthquake 2025" with "Japan earthquake 2026"

**Keep highest-priority source:**
- Reddit (user discussion) < Reuters/AP (professional) < Bloomberg/WSJ (premium)
- When duplicate detected, keep the version from higher-priority source

**Detection:**  
- Log duplicate detection results during testing
- Manually verify: search for a major story, check if it appears multiple times in your output
- Monitor AI token usage — high usage may indicate duplicate processing

**Sources:**  
- Why Your AI News Aggregator Misses Half the Stories: https://dev.to/alanwest/why-your-ai-news-aggregator-misses-half-the-stories-and-how-to-fix-it-4mdj  
- System Design: News Aggregator (Deduplication): https://crackingwalnuts.com/post/news-aggregator-system-design  
- Cross-Source Deduplication GitHub Issue: https://github.com/furkankoykiran/OmniWire-MCP/issues/8  

**Confidence:** HIGH (multiple sources confirm exact matching insufficient, recommends fuzzy matching)

---

### Pitfall 5: Reddit API — Unauthenticated Access Blocked, Rate Limits Misunderstood

**What goes wrong:**  
Developer tries to fetch Reddit without OAuth, using just `https://www.reddit.com/r/news.json`. In 2024-2026, Reddit **blocked unauthenticated API access**. Must use OAuth 2.0.

Common mistakes even with OAuth:
1. **Rate limit misunderstanding:**  
   - Developer thinks 60 requests/minute = can make 60 requests every minute
   - Reality: **10-minute rolling window** — 60 requests averaged over 10 minutes = ~6 requests/minute sustainable
   - Burst to 60, then blocked for 9 minutes

2. **No User-Agent header:**  
   - Reddit blocks requests without proper `User-Agent: MyApp/1.0 (by /u/username)`
   - Returns 429 or silent block

3. **Listing cap not known:**  
   - Reddit API returns max ~1,000 posts per subreddit via pagination
   - Developer tries to fetch 2,000 posts, gets same 1,000 repeatedly

4. **Token refresh not handled:**  
   - OAuth tokens expire after 24 hours (or sooner)
   - Forgetting to refresh = 401 errors

**Why it happens:**  
Old tutorials (pre-2024) show unauthenticated access. Rate limit docs are buried in API reference, not quick-start guides.

**Consequences:**  
- **Blocked requests:** 429 errors, no data fetched
- **Incomplete data:** Only 1,000 posts retrieved when expecting more
- **Intermittent failures:** Works during testing (low volume), fails in production (higher volume)

**Prevention:**  
1. **Always use OAuth 2.0:**
   - Create app at https://www.reddit.com/prefs/apps
   - Use "script" type for personal use
   - Store client ID, client secret, username, password in env vars

2. **Implement rate limit handling:**
   ```javascript
   // Check X-Ratelimit-remaining and X-Ratelimit-reset headers
   // If remaining < 5, wait until reset time
   if (remaining < 5) {
     await sleep(resetTime * 1000);
   }
   ```

3. **Use PRAW (Python) or snoowrap (Node.js):**  
   These libraries handle rate limiting automatically

4. **Set proper User-Agent:**
   ```javascript
   headers: { 'User-Agent': 'TongHopTinTuc/1.0 (by /u/yourusername)' }
   ```

5. **Accept 1,000 post limit:**  
   - Design system to work with latest 1,000 posts
   - Use time-window chunking for historical data (not needed for hourly updates)

**Detection:**  
- Check response headers for `X-Ratelimit-*` values
- Log 429 errors — indicates rate limit issues
- Test with script fetching 100 posts rapidly — should hit limit

**Sources:**  
- Reddit API Rate Limits Guide: https://painonsocial.com/blog/reddit-api-rate-limits-guide  
- Reddit API Guide 2026: https://hypereal.tech/a/reddit-api-guide  
- Reddit Developer Platform Limits: https://developers.reddit.com/docs/limits  

**Confidence:** HIGH (verified via Reddit official docs and multiple 2025-2026 tutorials)

---

## Moderate Pitfalls

Mistakes that cause significant delays, rework, or degraded user experience.

---

### Pitfall 6: Treating "No Data" as "No News" (Silent Failures)

**What goes wrong:**  
Source API returns 0 results (rate limited, down, blocked). Code treats this as "no news today" and posts nothing or posts stale content. User sees empty feed or repeated content.

**Why it happens:**  
Error handling focuses on exceptions, not empty responses. "Get articles, if none, skip" seems reasonable until all 6 sources fail simultaneously.

**Consequences:**  
- **Stale Facebook posts:** Yesterday's news reposted
- **No error alerts:** System seems fine, but no new content for hours
- **Wasted cron runs:** GitHub Actions minutes used for no result

**Prevention:**  
1. **Distinguish "no articles" from "source failure":**
   ```javascript
   if (articles.length === 0 && response.status === 200) {
     // Truly no articles (rare for major sources)
     log('Warning: Source X returned 0 articles');
   } else if (response.status !== 200) {
     // Source failure — trigger alert
     sendTelegramAlert(`Source ${source} failed: ${response.status}`);
   }
   ```

2. **Implement circuit breaker pattern:**
   - If source fails 3 times consecutively, mark as "degraded"
   - Skip source for next 3 runs, then retry
   - Prevents wasting time on consistently failing sources

3. **Fallback to cache:**
   - If all sources fail, use yesterday's top stories (with "Updated" label)
   - Better than empty post or repeated content

**Detection:**  
- Log source response counts — sudden drop to 0 should trigger investigation
- Monitor Facebook page — repeated posts indicate stale content
- Set up Telegram alerts for source failures (already in place per STATE.md)

**Sources:**  
- Why Your AI News Aggregator Misses Half the Stories: https://dev.to/alanwest/why-your-ai-news-aggregator-misses-half-the-stories-and-how-to-fix-it-4mdj  

**Confidence:** MEDIUM (best practices from system design articles, not source-specific)

---

### Pitfall 7: Free Tier APIs Prohibit Commercial Use

**What goes wrong:**  
Developer builds entire system using NewsAPI.org free tier (100 req/day). Upon deployment, discovers: **"Developer plan is for non-commercial use only. Not for production."** TongHopTinTuc posts to Facebook (commercial activity?), potentially violating ToS.

Similarly:
- GNews free tier: 100 req/day, dev-only
- Currents API: 600 req/day, unclear commercial status
- The Guardian API: **Genuinely free for commercial use** (outlier)

**Why it happens:**  
"Free" in API docs often means "free for personal/development use." Commercial use requires paid plan ($449/month for NewsAPI).

**Consequences:**  
- **ToS violation:** Account banned, API access revoked
- **Rewrites needed:** Must switch to different API or RSS-based approach
- **Budget pressure:** Forced to pay $449/month or rebuild

**Prevention:**  
1. **Read ToS before integrating:**
   - NewsAPI: "Not for production use" on free tier
   - The Guardian API: "Free for all use cases" ← use this
   - Google News RSS: No explicit ToS against aggregation (but check)

2. **Prefer RSS feeds over APIs:**
   - RSS feeds have no rate limits (usually)
   - No API keys to manage
   - No ToS restrictions on commercial use (generally)

3. **Use The Guardian API as primary source:**
   - 500 req/day free, commercial use allowed
   - Full article text included
   - High-quality journalism

**Detection:**  
- Check API pricing page for "Developer" vs "Business" tiers
- Look for "localhost only" restrictions (NewsAPI free tier)
- Search "Is [API] free for commercial use?"

**Sources:**  
- Best News APIs for Developers 2026: https://apiscout.dev/blog/best-news-apis-developers-2026  
- NewsAPI Alternatives: https://newsmesh.co/blog/newsapi-alternatives-2026  

**Confidence:** HIGH (multiple sources confirm NewsAPI free tier restrictions)

---

### Pitfall 8: Article Body Not Available in Free Tiers

**What goes wrong:**  
Developer integrates NewsAPI, GNews, or Currents API free tier. Fetches articles, sends to AI for rewriting. AI returns poor results because:
- API only provides **headline + description** (50-200 characters)
- Full article body is behind paywall or requires paid API tier
- AI cannot rewrite meaningfully without full text

**Why it happens:**  
API documentation emphasizes "80,000+ sources" but buries "free tier = headlines only" in footnotes.

**Consequences:**  
- **Poor AI output:** Rewrites based on headline only = low-quality posts
- **User complaints:** "Why is this post so short/vague?"
- **Wasted AI tokens:** Paying for AI to expand minimal content

**Prevention:**  
1. **Use APIs that provide full text:**
   - The Guardian API (free, full text)
   - RSS feeds + readability parsing (free, full text with effort)

2. **If using headline-only APIs, adjust AI prompt:**
   ```
   Given only this headline and 2-sentence description, write a 3-sentence summary.
   Don't invent details not in the source.
   ```

3. **Scrape article body from URL (with caution):**
   - Use `newspaper3k` (Python) or `readability` (Node.js)
   - Respect robots.txt
   - Handle paywalls gracefully (skip if blocked)

**Detection:**  
- Log article length before sending to AI
- If `article.body.length < 200 characters`, flag as "headline only"
- Monitor AI output quality — short/vague posts indicate insufficient input

**Sources:**  
- Best News APIs 2026 Comparison: https://dataresearchtools.com/best-news-apis-in-2026-top-solutions-ranked-and-compared/  
- NewsAPI Free Tier Limitations: https://toolpod.dev/blog/10-best-free-news-apis-for-developers-in-2026  

**Confidence:** HIGH (confirmed by multiple API comparison articles)

---

### Pitfall 9: Not Handling Different Content Formats

**What goes wrong:**  
Developer writes one parser expecting JSON. Reality:
- Reddit API: JSON
- RSS feeds: XML
- Google News RSS: XML
- The Guardian API: JSON
- AP API: XML (RSS format)
- Scraped sites: HTML

Code breaks when encountering unexpected format.

**Why it happens:**  
Each source has its own format. Developer assumes "all modern APIs use JSON."

**Consequences:**  
- **Parse errors:** `JSON.parse()` fails on XML
- **Inconsistent data:** Some sources missing fields (no `description`, no `image`, etc.)
- **Rewrites needed:** Add format-specific parsers

**Prevention:**  
1. **Create source adapter pattern:**
   ```javascript
   class RedditSource { fetch() { /* returns JSON */ } }
   class RSSSource { fetch() { /* parses XML to JSON */ } }
   class GuardianAPISource { fetch() { /* returns JSON */ } }
   ```

2. **Normalize to common format:**
   ```javascript
   {
     title: "...",
     description: "...",
     url: "...",
     publishedAt: "...",
     source: "Reddit",
     image: "..."
   }
   ```

3. **Handle missing fields gracefully:**
   - If no image, use placeholder or AI-generated image
   - If no description, use title only (adjust AI prompt)

**Detection:**  
- Log source format during integration testing
- Monitor for parse errors in GitHub Actions logs
- Test with real responses from each source

**Confidence:** MEDIUM (general integration best practice, not source-specific)

---

## Minor Pitfalls

Mistakes that cause annoyance or minor inefficiencies.

---

### Pitfall 10: Not Caching Source Responses

**What goes wrong:**  
Every 15 minutes, system re-fetches all sources. Same articles fetched repeatedly. Wastes API quota, increases latency.

**Prevention:**  
- Cache Reddit responses for 5-10 minutes (Reddit data doesn't change every minute)
- Cache RSS feed contents for 15 minutes (most feeds update hourly)
- Use simple in-memory cache or write to `posted-links.json` style cache file

---

### Pitfall 11: Not Respecting robots.txt

**What goes wrong:**  
Scraping Bloomberg/WSJ without checking robots.txt. Gets IP blocked or legal complaint.

**Prevention:**  
- For RSS feeds and official APIs: robots.txt doesn't apply (APIs have their own ToS)
- For scraping HTML: Check `https://site.com/robots.txt` first
- Prefer RSS over scraping

---

### Pitfall 12: Forgetting to Handle Special Characters in Titles

**What goes wrong:**  
Vietnamese or special characters in titles break AI prompt or Facebook post. Example: `"Trump đắc cử: 'Đây là thời khắc lịch sử'"` gets mangled.

**Prevention:**  
- Use UTF-8 encoding throughout pipeline
- Test with Vietnamese headlines (since TongHopTinTuc is Vietnamese-language)
- Sanitize input to AI: remove/replace characters that break prompt formatting

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Reddit Integration** | Rate limiting (Pitfall 5) | Use OAuth, check X-Ratelimit headers, implement backoff |
| **X/Twitter Integration** | $200/month cost (Pitfall 1) | Skip X API, use Google News RSS for X content |
| **Reuters/AP Integration** | Rate limits + no full text (Pitfalls 3, 8) | Use Google News RSS, accept headlines only |
| **Bloomberg/WSJ Integration** | Paywalls (Pitfall 2) | Use Google News RSS, skip full-text scraping |
| **Cross-Source Deduplication** | Exact match fails (Pitfall 4) | Implement fuzzy title matching (0.7 threshold) |
| **Multi-Source Scoring** | Duplicate stories skew ranking | Deduplicate BEFORE scoring/ranking |
| **Facebook Posting** | Stale content from source failures | Implement circuit breaker + Telegram alerts |

---

## Summary: Recommended Approach for $0 Budget

| Source | Strategy | Cost | Full Text? |
|--------|----------|------|------------|
| **Reddit** | OAuth API (PRAW/snoowrap) | Free | Yes (posts + comments) |
| **X/Twitter** | Google News RSS: `site:twitter.com` | Free | Headlines only |
| **Reuters** | Google News RSS: `site:reuters.com` | Free | Headlines only |
| **AP** | Google News RSS: `site:apnews.com` | Free | Headlines only |
| **Bloomberg** | Google News RSS: `site:bloomberg.com` | Free | Headlines only |
| **WSJ** | Google News RSS: `site:wsj.com` | Free | Headlines only |
| **The Guardian** | Official API (free, commercial OK) | Free | **Yes, full text** |
| **Google News** | RSS search (all sources) | Free | Headlines only |

**Key insight:** Google News RSS is the "universal adapter" for sources without free APIs. It aggregates content from all major outlets, returns RSS (XML), and has no rate limits or API keys.

---

## Sources

### High Confidence (Context7/Official/Multiple Verified)
- X Developer Platform: https://developer.x.com/en/docs/twitter-api/tweet-caps
- Reddit Developer Platform: https://developers.reddit.com/docs/limits
- Reddit API Guide: https://hypereal.tech/a/reddit-api-guide
- News Aggregator System Design: https://crackingwalnuts.com/post/news-aggregator-system-design
- Why AI News Aggregator Misses Stories: https://dev.to/alanwest/why-your-ai-news-aggregator-misses-half-the-stories-and-how-to-fix-it-4mdj

### Medium Confidence (Websearch Verified, Multiple Sources)
- X/Twitter Pricing 2026: https://agentdeals.dev/vendor/x-twitter
- WSJ Scraping Difficulty: https://scraperly.com/scrape/wsj
- Best News APIs 2026: https://apiscout.dev/blog/best-news-apis-developers-2026
- NewsAPI Alternatives: https://newsmesh.co/blog/newsapi-alternatives-2026
- Cross-Source Deduplication: https://github.com/furkankoykiran/OmniWire-MCP/issues/8

### Low Confidence (Single Source, Unverified)
- Bloomberg News Scraper: https://www.falconscrape.com/blog/how-to-scrape-bloomberg-news-articles
- AP Developer Portal: https://developer.ap.org/

---

**Research Confidence:** MEDIUM-HIGH  
- Critical pitfalls verified via multiple 2026 sources
- Google News RSS as universal adapter widely recommended but not officially documented (community knowledge)
- Some paywall/scraping details based on single sources (Scraperly, FalconScrape)

**Gaps to Address in Later Phases:**
- Test Google News RSS rate limits in production (no official docs on limits)
- Verify Vietnamese language handling in AI prompts for international sources
- Test deduplication threshold (0.7) with actual Vietnamese news titles
- Monitor if X/Twitter content via Google News RSS is sufficient quality
