# Phase 04: Scheduling - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Cập nhật cron schedule và luồng xử lý tin tức. Mỗi lần chạy chỉ xử lý 1 tin hot nhất (Top 1) thay vì Top 5 như trước. Thay đổi từ cron hourly (60 phút) sang cron 15 phút.

</domain>

<decisions>
## Implementation Decisions

### Cron Schedule
- **World cron:** `*/15 * * * *` (`:00`, `:15`, `:30`, `:45`)
- **Tech cron:** `7,22,37,52 * * * *` (`:07`, `:22`, `:37`, `:52`)
- Offset 7 phút giữa 2 loại tin

### Duplicate Prevention
- **Track posted links:** Lưu file JSON với list đã đăng
- **Storage:** `posted-links.json` (file-based)
- **Retention:** 24 hours (tự động clean)
- **When duplicate found:** Skip & get next news (không chờ)

### News Selection Logic
- **Criteria:** By hotScore (điểm cao nhất)
- **Minimum threshold:** 20 điểm
- **Below threshold:** Skip tin đó, lấy tin tiếp theo
- **Category handling:** Same category only (world → world, tech → tech)
- **No cross-category fallback**

### Failure Handling
- **API fail:** Alert & fail fast (retry 1 lần trước)
- **Retry:** 1 lần retry, fail nếu vẫn lỗi
- **Alert:** Always alert on failure (step + message)
- **Alert content:** Basic info (step name, error message, retry suggestion)
- **Pipeline fail:** Auto-skip sang news tiếp theo
- **All skipped:** Alert always (dù còn tin hay không)

### OpenCode's Discretion
- File storage path và naming convention
- JSON structure cho posted-links.json
- Exact threshold giữ nguyên 20 hay điều chỉnh
- Log format cho Telegram alert

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/feeds/scorer.js`: Đã có scoring logic, có thể reuse cho hotScore
- `src/feeds/ranker.js`: Đã có ranking logic, chỉ cần lấy top 1
- `post.js`: Đã có Facebook posting logic
- `generate.js`: Đã có Groq content generation

### Integration Points
- `fetch-news.js`: Cần sửa để output top 1 thay vì top 5
- `cron.yml`: Cần update cron schedule
- Cần thêm service check duplicate trước khi generate

### Patterns
- Node.js scripts với environment variables
- Telegram notification pattern đã có trong post.js
- File-based state management

</code_context>

<deferred>
## Deferred Ideas

- Cross-category fallback khi một category hết tin
- Manual approval cho tin dưới threshold
- Dashboard để xem/manage posted links history

</deferred>

---

*Phase: 04-scheduling*
*Context gathered: 2026-04-24*