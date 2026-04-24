# Phase 06: Content Prompt Optimization - Context

**Gathered:** 2026-04-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Cải thiện prompt cho `generate.js` để tạo content viral, hấp dẫn và độc đáo hơn cho Facebook posts.

</domain>

<decisions>
## Implementation Decisions

### Writing Style & Tone
- **Tone:** Hybrid - Gen Z Vietnamese social media style + Deep satire/expose
- **Humor level:** Heavy (drama queen, sarkasmus max, câu view cực đoan)
- **Audience:** Mainstream - ai đọc cũng hiểu
- **Value:** Insightful jokes - vừa cười vừa suy nghĩ

### Content Structure
- **Format:** Flexible - tùy loại tin chọn format phù hợp nhất
- **Hook:** Bold claim - claim bất ngờ, ngược đời, logic ngược
- **Body:** Narrative - story kể từ đầu, dramatic storytelling
- **Ending:** Share-bait - câu chốt để người đọc tag bạn bè, chia sẻ

### Format & Length
- **Emojis:** Natural - dùng nếu phù hợp, không spam
- **Paragraph:** Long-form - như viết báo, clean structure
- **Line style:** Short lines - nhiều dòng ngắn, có spacing, mobile-friendly
- **Word count:** 300-500 words
- **Hashtags:** Moderate (3-5) - tùy content

### AI Parameters
- **Model:** Groq (Llama 3.3) - giữ nguyên
- **Temperature:** 0.8-0.9 (creative)
- **Top P:** Dùng top_p để kiểm soát sampling
- **Max tokens:** ~800 (cho 300-500 words output)
- **Prompt structure:** **System Prompt** - tách role ra khỏi content cụ thể

### Prompt Architecture
- **System Prompt:** Define AI role là "Content Creator bẩn"
- **User Prompt:** Chỉ cung cấp tin cụ thể (title, source)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `generate.js`: Đã có retry logic, API call structure
- `GROQ_API_KEY`: Được reuse
- `generateWithRetry()`: Có thể reuse cho retries

### Integration Points
- `generate.js`: Cần thêm system prompt và điều chỉnh parameters
- Output vẫn là `.txt` file

### Pattern
- Node.js script với environment variables
- Groq API call structure đã có

</code_context>

<deferred>
## Deferred Ideas

- Thử nhiều model để so sánh quality
- Add few-shot examples vào prompt
- A/B testing different prompts

</deferred>

---

*Phase: 06-content-prompt*
*Context gathered: 2026-04-24*