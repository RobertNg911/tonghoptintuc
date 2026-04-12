# Requirements

## v1 Requirements

### RSS Feed Collection
- [ ] **FEED-01**: Thu thập tin từ ít nhất 5 nguồn RSS khác nhau (thời sự thế giới + công nghệ)
- [ ] **FEED-02**: Parse RSS feed với định dạng chuẩn
- [ ] **FEED-03**: Lọc tin hot dựa trên thời gian đăng (trong 2 giờ gần nhất)
- [ ] **FEED-04**: Normalize dữ liệu từ các nguồn khác nhau về format thống nhất

### AI Content Rewriting
- [ ] **AI-01**: Viết lại nội dung tin tức thành bài ngắn 150-200 chữ tiếng Việt
- [ ] **AI-02**: Giữ nguyên thông tin chính, thêm câu hook hấp dẫn
- [ ] **AI-03**: Thêm hashtag phù hợp với nội dung

### AI Image Generation
- [ ] **IMG-01**: Tạo hình ảnh minh họa cho bài viết (nếu free tier khả dụng)
- [ ] **IMG-02**: Fallback sang không có ảnh nếu API lỗi hoặc hết quota

### Facebook Posting
- [ ] **FB-01**: Đăng bài lên Fanpage với nội dung + hình ảnh (nếu có)
- [ ] **FB-02**: Sử dụng Page Access Token (không phải user token)
- [ ] **FB-03**: Xử lý token hết hạn và tự động gia hạn
- [ ] **FB-04**: Randomize thời gian đăng để tránh spam detection

### Scheduling
- [ ] **SCHED-01**: Chạy tự động mỗi giờ một lần (cron trigger)
- [ ] **SCHED-02**: Backup scheduling qua cron-job.org nếu Cloudflare cron lỗi

### Monitoring
- [ ] **LOG-01**: Ghi log mỗi lần chạy (thành công/thất bại)
- [ ] **LOG-02**: Gửi alert khi có lỗi liên tiếp 3 lần

## v2 Requirements (Deferred)

- AI tạo video từ nội dung tin tức
- Đăng lên multiple platforms (Instagram, TikTok)
- Dashboard quản lý bài đã đăng
- Manual approval trước khi đăng

## Out of Scope

- [Xây dựng website] — Chỉ đăng lên Facebook, không cần giao diện
- [Database] — Không lưu trữ tin tức, đăng xong là xong
- [User interaction] — Không nhận comment, không tương tác
- [Multi-platform] — Chỉ Facebook, không Instagram/TikTok

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FEED-01 | 2 | pending |
| FEED-02 | 2 | pending |
| FEED-03 | 2 | pending |
| FEED-04 | 2 | pending |
| AI-01 | 5 | pending |
| AI-02 | 5 | pending |
| AI-03 | 5 | pending |
| IMG-01 | 6 | pending |
| IMG-02 | 6 | pending |
| FB-01 | 3 | pending |
| FB-02 | 3 | pending |
| FB-03 | 3 | pending |
| FB-04 | 3 | pending |
| SCHED-01 | 4 | pending |
| SCHED-02 | 4 | pending |
| LOG-01 | 7 | pending |
| LOG-02 | 7 | pending |