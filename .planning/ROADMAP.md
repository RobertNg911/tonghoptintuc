# TongHopTinTuc Roadmap

## Phases

- [ ] **Phase 1: Setup** - Worker + Hono foundation, health endpoint
- [ ] **Phase 2: Feed Collection** - RSS fetching, parsing, filtering, normalization
- [ ] **Phase 3: Facebook Integration** - Page token, posting, token renewal, spam prevention
- [ ] **Phase 4: Scheduling + Monitoring** - Hourly cron, backup scheduler, run logging, error alerting
- [ ] **Phase 5: AI Processing** - Content rewriting, image generation with fallback

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Feed Collection)
    ↓
Phase 3 (Facebook Integration)
    ↓
Phase 4 (Scheduling + Monitoring)
    ↓
Phase 5 (AI Processing)
```

---

## Phase Details

### Phase 1: Setup

**Goal**: Cloudflare Workers project with Hono, health endpoint for validation

**Depends on**: Nothing (first phase)

**Requirements**: (None explicitly — setup implicitly required)

**Success Criteria** (what must be TRUE):
1. Worker deploys to Cloudflare without errors
2. `GET /health` returns 200 OK with status
3. Environment variables load correctly for API keys
4. Project structure ready for incremental development

**Plans**: 1 plan(s)

- [ ] 01-setup-PLAN.md — Initialize Cloudflare Workers + Hono with health endpoint

---

### Phase 2: Feed Collection

**Goal**: Fetch, parse, and normalize RSS feeds from multiple sources

**Depends on**: Phase 1 (Setup)

**Requirements**: FEED-01, FEED-02, FEED-03, FEED-04

**Success Criteria** (what must be TRUE):
1. System fetches from at least 5 RSS sources configures in env
2. RSS feeds parse correctly (title, summary, link, date extracted)
3. Filter by recency — only articles within 2 hours processed
4. Data normalized to unified format regardless of source

**Plans**: TBD

---

### Phase 3: Facebook Integration

**Goal**: Post content to Facebook Fanpage with token management

**Depends on**: Phase 2 (Feed Collection)

**Requirements**: FB-01, FB-02, FB-03, FB-04

**Success Criteria** (what must be TRUE):
1. Posts appear on Facebook Fanpage with text content
2. Page Access Token works (not user token) — verified via Graph API
3. Token renewal mechanism in place (renew before 60-day expiry)
4. Posting time randomized within ±15 minute window to avoid spam detection

**Plans**: TBD

---

### Phase 4: Scheduling + Monitoring

**Goal**: Automated hourly execution with logging and alerting

**Depends on**: Phase 3 (Facebook Integration)

**Requirements**: SCHED-01, SCHED-02, LOG-01, LOG-02

**Success Criteria** (what must be TRUE):
1. Pipeline triggers hourly via Cloudflare Cron Trigger
2. Backup scheduler configured via cron-job.org as fallback
3. Every run logged with success/failure status
4. Alert triggers after 3 consecutive failures

**Plans**: TBD

---

### Phase 5: AI Processing

**Goal**: Transform raw RSS content into engaging social posts

**Depends on**: Phase 4 (Scheduling + Monitoring)

**Requirements**: AI-01, AI-02, AI-03, IMG-01, IMG-02

**Success Criteria** (what must be TRUE):
1. Content rewritten as 150-200 word Vietnamese social post
2. Main facts preserved, hook added for engagement
3. Hashtags added based on content topic
4. Image generated if AI available, falls back to text-only if fails

**Plans**: TBD

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|-------------|--------|-----------|
| 1. Setup | 0/1 | Not started | - |
| 2. Feed Collection | 0/1 | Not started | - |
| 3. Facebook Integration | 0/1 | Not started | - |
| 4. Scheduling + Monitoring | 0/1 | Not started | - |
| 5. AI Processing | 0/1 | Not started | - |

---

## Coverage

| Requirement | Phase |
|-------------|-------|
| FEED-01 | Phase 2 |
| FEED-02 | Phase 2 |
| FEED-03 | Phase 2 |
| FEED-04 | Phase 2 |
| AI-01 | Phase 5 |
| AI-02 | Phase 5 |
| AI-03 | Phase 5 |
| IMG-01 | Phase 5 |
| IMG-02 | Phase 5 |
| FB-01 | Phase 3 |
| FB-02 | Phase 3 |
| FB-03 | Phase 3 |
| FB-04 | Phase 3 |
| SCHED-01 | Phase 4 |
| SCHED-02 | Phase 4 |
| LOG-01 | Phase 4 |
| LOG-02 | Phase 4 |

**Mapped:** 17/17 requirements ✓

---

*Roadmap created: 2026-04-12*