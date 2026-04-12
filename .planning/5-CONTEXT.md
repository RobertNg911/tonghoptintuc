# Phase 5 - CONTEXT.md

## Phase Overview

**Phase 5: AI Processing** — Viết bài tiếng Việt + tạo ảnh với multi-account rotation

## Decisions Made

### 1. AI Text - Gemini 2.5 Flash

**Provider**: Google Gemini 2.5 Flash
**Free Tier**: 500 requests/day
**Cost**: Free (no credit card required)

**Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`

**Prompt Structure**:
```json
{
  "contents": [{
    "parts": [{
      "text": "Bạn là một biên tập viên tin tức chuyên nghiệp. Hãy viết lại tin tức sau thành bài đăng Facebook tiếng Việt hấp dẫn:\n\nTin gốc:\n- Tiêu đề: {title}\n- Nội dung: {summary}\n- Nguồn: {source}\n\nYêu cầu:\n1. Viết hook hấp dẫn 1-2 câu đầu\n2. Nội dung chính 150-200 chữ, giữ nguyên thông tin chính xác\n3. Thêm 2-3 hashtags phù hợp\n4. Format phù hợp đọc trên mobile\n\nViết ngay bài đăng, không giải thích thêm."
    }]
  }]
}
```

### 2. AI Image - Leonardo.ai Multi-Account Rotation

**Provider**: Leonardo.ai
**Free Tier**: ~100-150 credits/day per account
**Strategy**: Multiple accounts with round-robin rotation

**Setup**:
```env
# Multiple API keys (comma-separated)
LEONARDO_API_KEYS=key1_account1,key2_account2,key3_account3
```

**Rotation Logic**:
```typescript
let currentKeyIndex = 0;

async function generateImage(prompt: string): Promise<string | null> {
  for (let i = 0; i < LEONARDO_API_KEYS.length; i++) {
    const key = LEONARDO_API_KEYS[currentKeyIndex];
    try {
      const result = await callLeonardoAPI(key, prompt);
      return result.image_url;
    } catch (error) {
      if (error.message.includes('quota') || error.message.includes('credits')) {
        currentKeyIndex = (currentKeyIndex + 1) % LEONARDO_API_KEYS.length;
        continue;
      }
      throw error;
    }
  }
  return null;
}
```

**Image Prompt** (English for better results):
```
News illustration, {topic}, professional, flat design, vibrant colors, social media post, 1024x1024
```

### 3. Fallback Strategy

| Scenario | Action |
|----------|--------|
| AI text fails | Log error, skip this cycle |
| AI image fails (all keys quota) | Post text-only |
| Both fail | Log error, alert via Telegram |

### 4. Environment Variables

```env
GEMINI_API_KEY=your_gemini_key
LEONARDO_API_KEYS=key1,key2,key3
MAX_POST_LENGTH=500
IMAGE_SIZE=1024x1024
```

### 5. Implementation

**Location**: `src/services/ai.ts`

**Functions**:
- `rewriteContent(title, summary, source): Promise<string>`
- `generateImage(prompt): Promise<string | null>`
- `postWithFallback(caption): Promise<PostResult>`

## Out of Scope

- Video generation (v2)
- Multi-platform posting (v2)

---

*Context created: 2026-04-12*