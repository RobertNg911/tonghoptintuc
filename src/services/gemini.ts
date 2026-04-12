import type { GeminiResponse } from '../types/post';
import type { Env } from '../utils/env';

export async function rewriteContent(
  c: { env: Env },
  title: string,
  summary: string,
  source: string
): Promise<string> {
  const apiKey = c.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Bạn là một biên tập viên tin tức chuyên nghiệp. Hãy viết lại tin tức sau thành bài đăng Facebook tiếng Việt hấp dẫn:

Tin gốc:
- Tiêu đề: ${title}
- Nội dung: ${summary}
- Nguồn: ${source}

Yêu cầu:
1. Viết hook hấp dẫn 1-2 câu đầu
2. Nội dung chính 150-200 chữ, giữ nguyên thông tin chính xác
3. Thêm 2-3 hashtags phù hợp
4. Format phù hợp đọc trên mobile

Viết ngay bài đăng, không giải thích thêm.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data: GeminiResponse = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid Gemini response');
  }

  return data.candidates[0].content.parts[0].text;
}