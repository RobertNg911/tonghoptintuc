# Domain Pitfalls

**Project:** TongHopTinTuc - News Aggregator auto-posting to Facebook
**Domain:** Automated news aggregation with AI content generation and social media posting
**Researched:** 2026-04-12

## Critical Pitfalls

Mistakes that cause rewrites, account restrictions, or complete system failure.

### Pitfall 1: Wrong Token Type for Publishing

**What goes wrong:** Using user access token instead of page access token when publishing to Facebook Page. API returns `(#200)` or `(#100)` errors.

**Why it happens:** Meta requires a specifically-generated Page Access Token for publishing content to Pages. A user token with admin permissions still cannot publish without the page token.

**Consequences:**
- Post fails silently or returns OAuthException errors
- Must rewrite entire authentication flow
- If using user token for videos/media, specifically fails with `(#100) No permission to publish the video`

**Prevention:**
1. Implement two-step token flow: user token → exchange for page token via `/me/accounts`
2. Store both tokens separately; use page token for all publishing calls
3. Document token source in code comments

**Detection:** Check API response for `(#200)` or `(#100)` error codes mentioning permissions.

**Phase:** Implementation - Facebook Integration

---

### Pitfall 2: Token Expiration Without Renewal

**What goes wrong:** Access token stops working after 60 days, posts stop publishing.

**Why it happens:** Even "long-lived" tokens expire when: user changes password, user de-authorizes app, user loses admin access to Page, or token naturally expires.

**Consequences:**
- System stops posting without warning
- No posts appear on Facebook Page
- Requires manual re-authentication to restore

**Prevention:**
1. Implement token renewal every 55 days (before 60-day expiry)
2. Store token creation timestamp, check on each run
3. Add monitoring/alerting for authentication failures
4. Store tokens in environment variables, never hardcode

**Warning signs:** First API call returns authentication error after extended period.

**Phase:** Implementation - Facebook Integration + Monitoring

---

### Pitfall 3: Facebook Scheduled Posts API Bugs

**What goes wrong:** Scheduling posts via Graph API fails with `OAuthException Code 1: "An unknown error has occurred"`.

**Why it happens:** Known Facebook API bug (documented Oct 2025) that causes scheduled posts to fail intermittently. Also affects `/media` endpoint for images.

**Consequences:**
- Scheduled posts never publish
- No error returned until post time passes
- System appears to work but produces no output

**Prevention:**
1. Publish immediately instead of scheduling (simplest reliable approach)
2. If scheduling required: implement post-publish verification
3. Monitor Facebook Developer Community for API status
4. Have fallback to manual posting if API fails

**Warning signs:** `scheduled_publish_time` parameter causes error, works without it.

**Phase:** Implementation - Facebook Integration

---

### Pitfall 4: AI Content Hallucinations

**What goes wrong:** AI generates fake statistics, fabricated citations, invented facts, or incorrect details—then posts to Facebook.

**Why it happens:** AI models fill knowledge gaps with plausible-sounding fabrications. Research shows 30-40% of AI-generated content contains factual errors. Models don't verify facts—they generate confident-looking false claims.

**Consequences:**
- Publishes incorrect information to Facebook audience
- Damages credibility and trust
- Could spread misinformation (especially dangerous for news content)
- Potential reputational harm

**Prevention:**
1. **Never publish AI content without verification** — human-in-the-loop required
2. Fact-check every statistic, date, name, and claim
3. Use primary sources, not AI summaries of sources
4. Flag content with specific numbers/dates for extra scrutiny
5. For news: verify against original source before posting

**Warning signs:** AI content contains statistics, percentages, quotes, or specific events.

**Phase:** Implementation - AI Content Generation

---

### Pitfall 5: Facebook Anti-Spam Detection

**What goes wrong:** Account gets restricted or posts get reduced reach for looking like spam.

**Why it happens:** Facebook detects automated patterns:
- Fixed interval posting (same time every hour)
- Identical text across multiple posts
- Link-heavy posts with no variation
- Posting too rapidly

**Consequences:**
- "We limit how often you can post" warning
- Reduced post reach/visibility
- Temporary or permanent posting restrictions
- Account suspension in severe cases

**Prevention:**
1. Add randomization to posting time (±10-15 minutes)
2. Create 3-5 caption variations, rotate between them
3. Mix link posts with value-only posts (tips, images without links)
4. Start slow—warm up with 1 post/day before increasing
5. Avoid posting outside Page's typical audience engagement hours

**Warning signs:** `(#80001) Page account limit` or reduced reach metrics.

**Phase:** Implementation - Facebook Integration

---

## Moderate Pitfalls

Problems that degrade performance or cause intermittent failures.

### Pitfall 6: Ignoring Facebook API Rate Limits

**What goes wrong:** Too many API calls trigger rate limiting, requests fail.

**Why it happens:** Facebook has rolling limits:
- App-level: 200 × (number of app users) per hour
- Pages API: 4,800 × (number of engaged users) per 24 hours

**Consequences:**
- API calls return error code 4, 17, 32, or 613
- Posts fail to publish
- Requires exponential backoff implementation

**Prevention:**
1. Implement exponential backoff on rate limit errors (1s, 2s, 4s, 8s...)
2. Cache news sources—don't fetch on every run
3. Only post once per hour (well under limit)
4. Monitor X-App-Usage headers in responses

**Phase:** Implementation - Facebook Integration

---

### Pitfall 7: Media URL 403 Errors (robots.txt)

**What goes wrong:** Facebook API returns `403: Unable to fetch media from URL, got status code: 403 Restricted by robots.txt` when uploading images.

**Why it happens:** Facebook now validates media URLs against robots.txt rules. Even valid URLs can trigger this if previously cached incorrectly. Issue escalated April 2026.

**Consequences:**
- Posts with images fail
- Error: `FileUrlProcessingError`
- Link preview generation fails

**Prevention:**
1. Upload images as binary data instead of URLs when possible
2. Use Facebook's container upload flow for media
3. Ensure hosted images allow all crawlers (no robots.txt blocking)
4. Have fallback to text-only posts if image upload fails

**Phase:** Implementation - Media Handling

---

### Pitfall 8: Publishing Generic AI Content

**What goes wrong:** AI content reads like every other AI article—safe, middle-of-the-road, no unique value.

**Why it happens:** AI optimizes for "pleasing everyone" output, avoiding bold opinions or unique insights. Produces templated, surface-level content.

**Consequences:**
- Posts get low engagement
- No differentiation from competitors
- Audience loses interest
- Reduced Facebook reach over time

**Prevention:**
1. Add unique value: specific angle, local context, personal take
2. Vary content structure between posts (don't use same template)
3. Include specific details, quotes, or insights beyond the headline
4. Edit AI output for brand voice before publishing

**Phase:** Implementation - AI Content Generation

---

### Pitfall 9: API Version Neglect

**What goes wrong:** Code uses old API version that gets deprecated, suddenly stops working.

**Why it happens:** Meta releases new Graph API versions ~2x/year. Each version supported for ~2 years. Unversioned calls default to oldest available version.

**Consequences:**
- Posts fail with "Unsupported get request" or endpoint moved errors
- Requires version update in code
- Old endpoints disappear without warning

**Prevention:**
1. Always specify API version (e.g., v25.0) in calls
2. Monitor Facebook API changelog quarterly
3. Test integration after Facebook releases
4. Version v22.0 deprecated Feb 2026; v25.0 is current

**Phase:** Implementation - Facebook Integration

---

### Pitfall 10: No Error Logging/Monitoring

**What goes wrong:** Posts fail silently, system appears to run but produces no output.

**Why it happens:** No visibility into API errors, AI failures, or network issues. Script runs, returns no error, but no post appears on Facebook.

**Consequences:**
- System runs but provides no value
- Days/weeks pass before发现问题
- No ability to debug issues

**Prevention:**
1. Log every run: start, API call, success, failure
2. Log HTTP status codes and error messages
3. Alert on consecutive failures (3+ failed attempts)
4. Store last successful post timestamp

**Warning signs:** Cron runs but Facebook shows no new posts.

**Phase:** Implementation - Monitoring + Operations

---

## Minor Pitfalls

Easier to fix, but still cause issues.

### Pitfall 11: Missing API Permissions

**What goes wrong:** `(#200) Missing permission` error when posting.

**Why it happens:** Required permissions not granted: pages_manage_posts, pages_read_engagement. App not in Live mode.

**Prevention:**
1. Request all required permissions in auth flow
2. Use Graph API Explorer to test permissions
3. Submit for App Review if publishing to Pages user doesn't own

**Phase:** Implementation - Facebook Integration

---

### Pitfall 12: Content Doesn't Format for Facebook

**What goes wrong:** Post text displays poorly on Facebook (bad line breaks, emoji issues, truncated).

**Why it happens:** Not testing post rendering on Facebook. Different from terminal output.

**Prevention:**
1. Preview posts before publishing (log to console first)
2. Test with Facebook Post Preview tool
3. Use short paragraphs, emoji in moderation

**Phase:** Implementation - Facebook Integration

---

### Pitfall 13: Weathering News Source Changes

**What goes wrong:** RSS feeds change format or disappear, news gathering fails silently.

**Why it happens:** News sites update websites, change RSS structure, or remove feeds.

**Prevention:**
1. Log number of articles fetched per run
2. Alert if fetch count drops to 0
3. Have backup news sources
4. Check feed validity periodically

**Phase:** Implementation - News Aggregation

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|------------|---------------|------------|
| Facebook Integration | Token handling, rate limits, anti-spam detection | Use page token, add randomization, implement logging |
| AI Content Generation | Hallucinations, generic output | Human verification step, add unique value |
| Scheduling/Automation | API bugs, failure detection | Verify posts published, have fallback |
| Operations | Silent failures | Comprehensive logging and alerting |

---

## Quick Reference: Facebook Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| 1 | Unknown error | Retry later, check API status |
| 100 | Parameter error | Check API call format |
| 190 | Token invalid | Re-authenticate |
| 200 | Permission denied | Verify permissions |
| 4 | Rate limit | Backoff and retry |
| 17 | User rate limit | Backoff and retry |
| 32 | Pages rate limit | Backoff and retry |
| 80001 | Page account limit | Reduce posting frequency |

---

## Sources

- Meta Developer Community: OAuthException Code 1 scheduling bugs (Oct 2025)
- Tigerzplace: Facebook auto-posting safety guide (2026)
- Postproxy: Facebook Graph API developer guide (2026)
- AI content research: Wyrote, Demand Accelerators (2025-2026)
- SocialRails: Facebook Groups API deprecation (2024)
- Meta documentation: API rate limits, versioning