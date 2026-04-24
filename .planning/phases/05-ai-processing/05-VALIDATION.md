---
phase: 05
slug: ai-processing
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-24
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for AI processing phase.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x |
| **Config file** | jest.config.js |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test -- --coverage` |
| **Estimated runtime** | ~1 second |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test -- --coverage`
- **Before deployment:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-task Verification Map

| task ID | Plan | Wave | Requirement | Test Type | Automated Command | File | Status |
|---------|------|------|-------------|-----------|-----------------|------|--------|
| 05-01 | 01 | 1 | AI-01 | unit | `npm test` | tests/scorer.test.js | ✅ green |
| 05-02 | 01 | 1 | AI-02 | unit | `npm test` | tests/ranker.test.js | ✅ green |
| 05-03 | 01 | 1 | IMG-01 | unit | `npm test` | tests/image.test.js | ✅ green |
| 05-04 | 01 | 1 | AI-03 | unit | `npm test` | tests/scorer.test.js | ✅ green |
| 05-05 | 01 | 1 | IMG-02 | unit | `npm test` | tests/image.test.js | ✅ green |

*Status: ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `jest.config.js` — Jest configuration
- [x] `tests/scorer.test.js` — Unit tests for scorer.js
- [x] `tests/ranker.test.js` — Unit tests for ranker.js
- [x] `tests/image.test.js` — Unit tests for image service

---

## Coverage Summary

| File | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| src/feeds/scorer.js | 100% | 100% | 100% | 100% |
| src/feeds/ranker.js | 100% | 100% | 100% | 100% |
| src/services/image.js | 100% | 100% | 100% | 100% |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|-----------|------------------|
| End-to-end content generation with Groq API | AI-03 | Requires API key + network | Run `node generate.js` and verify output |
| End-to-end image generation | IMG-02 | External API (Pollinations) | Run `node gen-image.js` and verify output |
| Facebook posting | FB-01 | Requires FB credentials | Run `node post.js` and verify post appears |
| RSS feed fetching | FEED-01 | External RSS sources | Run `node fetch-news.js` and verify news.json |

*External integrations require live credentials and network access.*

---

## Validation Audit 2026-04-24

| Metric | Count |
|--------|-------|
| Gaps found | 7 |
| Resolved | 7 |
| Escalated | 0 |

**Test Results:** 23 tests, 0 failures

---

## Validation Sign-Off

- [x] All tasks have automated verify
- [x] Wave 0 installed Jest framework
- [x] All unit tests passing
- [x] Manual-only items documented with instructions
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-24