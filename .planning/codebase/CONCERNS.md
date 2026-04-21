# CONCERNS.md - TongHopTinTuc Issues & Tech Debt

## Known Issues

1. **Facebook Token Expired** - Need to refresh FB access token
2. **HuggingFace API 404** - Inference API not working, using pollinations fallback
3. **No Scheduling** - Currently runs manually, no cron

## Tech Debt

- [ ] No test suite
- [ ] No TypeScript despite tsconfig.json
- [ ] Hardcoded RSS sources in fetch-news.js
- [ ] No error recovery/retry logic
- [ ] No logging system

## Future Considerations

- Add Cloudflare Workers for hosting
- Add cron job for automation
- Refresh FB token mechanism
- Monitor image generation success rate

---

*Generated: 2026-04-18*