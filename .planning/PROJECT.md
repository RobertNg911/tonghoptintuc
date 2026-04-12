# TongHopTinTuc - Điểm Tin Tự Động

## What This Is

Website tổng hợp tin tức thời sự thế giới và công nghệ đang hot, tự động viết lại bài ngắn và tạo hình ảnh bằng AI, đăng lên Facebook Fanpage mỗi giờ một lần.

## Core Value

Tự động tổng hợp tin hot từ nhiều nguồn, viết lại bằng AI và đăng lên Facebook mỗi giờ — không cần can thiệp thủ công.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Hệ thống thu thập tin từ nhiều nguồn RSS/API
- [ ] AI viết lại bài ngắn từ tin gốc
- [ ] AI tạo hình ảnh minh họa cho bài viết
- [ ] Tự động đăng lên Facebook Fanpage
- [ ] Chạy theo lịch mỗi giờ một lần
- [ ] Deploy miễn phí (Cloudflare Workers)

### Out of Scope

- [Xây dựng UI/website để xem tin] — Chỉ đăng lên Facebook, không cần website
- [Tương tác với người dùng] — Chỉ đăng tin, không nhận comment
- [Lưu trữ tin tức] — Không cần database, chỉ cần đăng xong là xong

## Context

- Đã có sẵn Facebook Fanpage
- Ngân sách: 0đ/tháng (tìm giải pháp free)
- Mục tiêu: hệ thống chạy nhẹ, nhanh, ít tài nguyên

## Constraints

- **Budget**: 0đ/tháng — dùng free tier hoặc giải pháp miễn phí
- **Performance**: Nhẹ, nhanh — ưu tiên serverless
- **Tech**: Không cần database, không cần website — chỉ cần backend xử lý và đăng bài
- **Frequency**: 1 bài/giờ — có thể dùng cron miễn phí

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cloudflare Workers | Free tier tốt, chạy nhanh, nhẹ | — Pending |
| Node.js + Fastify | Backend nhẹ, dễ viết script | — Pending |
| Cheerio + axios | Crawl đơn giản, hiệu quả | — Pending |
| OpenAI API (GPT-4o mini) | Chi phí thấp cho viết bài | — Pending |
| DALL-E 3 hoặc free alternative | Tạo hình ảnh minh họa | — Pending |
| Facebook Graph API | Đăng bài chính thức, ổn định | — Pending |
| cron-job.org | Scheduler miễn phí cho Cloudflare | — Pending |

---

*Last updated: 2026-04-12 after initialization*