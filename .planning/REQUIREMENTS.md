# REQUIREMENTS.md - TongHopTinTuc v1.1

## Milestone v1.1: Thêm nguồn tin

**Goal:** Mở rộng nguồn tin tức từ Reddit, Bloomberg, và các hãng tin quốc tế (Reuters, AP, WSJ)

---

### v1.1 Requirements

### [REDDIT-01] Reddit API Integration
- [ ] **REDDIT-01**: Fetch tin từ Reddit API (r/worldnews, r/technology, r/news)
- [ ] **REDDIT-02**: Parse Reddit post structure (title, url, score, comments)
- [ ] **REDDIT-03**: Add User-Agent header cho Reddit requests
- [ ] **REDDIT-04**: Handle rate limiting (60 req/min)

### [RSS-02] Bloomberg RSS Integration
- [ ] **RSS-02a**: Fetch Bloomberg Markets RSS (`feeds.bloomberg.com/markets/news.rss`)
- [ ] **RSS-02b**: Fetch Bloomberg Technology RSS (`feeds.bloomberg.com/technology/news.rss`)
- [ ] **RSS-02c**: Parse RSS với rss-parser

### [RSS-03] Google RSS Proxy Integration
- [ ] **RSS-03a**: Fetch Reuters qua Google News RSS (`news.google.com/rss/search?q=site:reuters.com`)
- [ ] **RSS-03b**: Fetch AP News RSS (`apnews.com/hub/apf-topnews?output=rss`)
- [ ] **RSS-03c**: Fetch WSJ qua Google News RSS (`news.google.com/rss/search?q=site:wsj.com`)

### [CORE-01] Scoring Updates
- [ ] **CORE-01a**: Update scorer cho Reddit data structure (score, comments)
- [ ] **CORE-01b**: Thêm source priority cho Reddit/Bloomberg/Reuters/AP/WSJ
- [ ] **CORE-01c**: Cross-source hotScore calculation

---

### Future Requirements (Deferred)

- [ ] **FUZZY-01**: Fuzzy deduplication (title similarity 0.7 threshold)
- [ ] **X-01**: X/Twitter integration (requires $200+/month budget)
- [ ] **REDIS-01**: Redis cache cho rate limiting

---

### Out of Scope

| Requirement | Reason |
|-------------|--------|
| X/Twitter API | $200+/month - vượt ngân sách $0 |
| Reddit full OAuth | Dev-only API đủ cho read-only |
| Fuzzy deduplication | Giữ nguyên URL exact match |
| NewsAPI.org | Dev-only, 24h delay |

---

### Traceability

| REQ-ID | Phase | Status |
|-------|-------|--------|
| REDDIT-01 | 08 | ⬜ |
| REDDIT-02 | 08 | ⬜ |
| REDDIT-03 | 08 | ⬜ |
| REDDIT-04 | 08 | ⬜ |
| RSS-02a | 08 | ⬜ |
| RSS-02b | 08 | ⬜ |
| RSS-02c | 08 | ⬜ |
| RSS-03a | 08 | ⬜ |
| RSS-03b | 08 | ⬜ |
| RSS-03c | 08 | ⬜ |
| CORE-01a | 08 | ⬜ |
| CORE-01b | 08 | ⬜ |
| CORE-01c | 08 | ⬜ |

---

*Generated: 2026-04-28*
*Milestone: v1.1*