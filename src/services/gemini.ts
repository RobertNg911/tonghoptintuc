import type { GeminiResponse } from '../types/post';
import type { Env } from '../utils/env';

const API_VERSION = 'v1';

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

  // Try different models - will fallback to text-only post if all fail
  const models = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro',
  ];

  let lastError = '';
  
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/${API_VERSION}/models/${model}:generateContent?key=${apiKey}`;
  
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
        lastError = await response.text();
        if (response.status === 429 || response.status === 403) {
          continue; // Try next model
        }
        throw new Error(`Gemini API error: ${lastError}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid Gemini response');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (lastError.includes('429') || lastError.includes('quota')) {
        continue; // Try next model
      }
      throw err;
    }
  }
  
  throw new Error(`All Gemini models failed: ${lastError}`);
}

export async function generateImage(
  c: { env: Env },
  prompt: string
): Promise<string | null> {
  // Skip image generation for now - can be added later with paid API
  return null;
}