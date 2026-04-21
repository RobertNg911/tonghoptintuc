# TESTING.md - TongHopTinTuc Testing

## Current State
- No formal test suite
- Manual testing via:
  ```bash
  node fetch-news.js    # Test RSS fetch
  node generate.js    # Test AI rewrite
  node gen-image.js  # Test image generation
  node post.js       # Test FB post
  ```

## Test Files
- `test-sources.js` - Test RSS sources
- `test-more.js` - Additional tests

## Future
- Should add vitest or jest for unit tests
- Test services in `src/services/` independently

---

*Generated: 2026-04-18*