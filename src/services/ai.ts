import type { Env } from '../utils/env';
import type { NewsItem } from '../feeds/types';

interface AIResult {
  content: string;
  imageUrl?: string;
  isFallback?: boolean;
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_API_KEY = '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';
const NVIDIA_MODEL = 'meta/llama-3.1-70b-instruct';

const GEMINI_API_KEY = 'AIzaSyDShbQ5YQX3-l1n8Q6T3k0r2k1x9p9p9p9';
const GEMINI_MODEL = 'gemini-2.0-flash-exp';

function cleanHtml(html: string): string {
  return html
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchFullContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const cleanText = cleanHtml(html);
    return cleanText.substring(0, 8000);
  } catch (error) {
    console.log('Failed to fetch full content:', error);
    return '';
  }
}

function isValidVietnamese(text: string): boolean {
  if (!text || text.length < 50) return false;
  
  const vietnameseDiacritics = /[àáảãạèéẻẽẹìíỉĩịòóỏõọồốổộớờởỡưừứửựơở]/i;
  const hasDiacritics = vietnameseDiacritics.test(text);
  
  const forbiddenPatterns = [
    /translate to vietnamese/i,
    /write in vietnamese/i,
    /here's the/i,
    /below is the/i,
    /the following/i,
    /content to process/i,
  ];
  const hasForbidden = forbiddenPatterns.some(p => p.test(text));
  
  return hasDiacritics && !hasForbidden && text.length > 50;
}



const NVIDIA_SYSTEM_PROMPT = `Bạn là một chuyên gia viết content Facebook viral, châm biếm, hài hước cho người Việt Nam.
Nhiệm vụ: VIẾT BÀI FACEBOOK CỰC KÌ HẤP DẪN, ai đọc cũng phải LIKE và COMMENT.

QUY TẮC TUYỆT ĐỐI:
1. VIẾT 100% TIẾNG VIỆT CÓ DẤU - không được lẫn tiếng Anh
2. KHÔNG viết các label như "HOOK:", "PROBLEM:", "CHỦ ĐỀ:", "AGITATE:", "SOLUTION:", "TỔNG HỢP:"
3. KHÔNG copy nguyên văn - phải diễn đạt lại bằng ngôn ngữ của bạn
4. KHÔNG có URL hay link
5. KHÔNG ghi "Nguồn:", "Theo:", "Source:"

CẤU TRÚC BÀI VIẾT (viết đầy đủ, dài tối thiểu 300 từ):

🎯 HOOK (1-2 câu đầu): Câu gây SHOCK, TÒ MÒ, hoặc TRICKY rất khó chịu
Ví dụ: " Đọc xong bài này bạn sẽ hiểu tại sao Putin cười nhạo khi ông Trump..."

📰 NỘI DUNG CHÍNH (4-6 đoạn):
- Mỗi đoạn 3-4 câu, viết theo phong cách:
  * Châm biếm, mỉa mai nhẹ (kiểu hài hước kiểu Đen -> Vũ)
  * Dùng câu hỏi tu từ "Thế này thì ai chịu được?", "Các bạn nghĩ sao?"
  * Kể chuyện có drama, gay cấn
- Thêm emoji phù hợp: 🔥💥😱🤯😂🤣💀🧐

❓ KOẾT LUẬN (1-2 câu): Câu hỏi mở để người ta COMMENT
Ví dụ: "Các bạn nghĩ ai đúng ai sai? Comment cho mình biết với!"

# HASHTAG: 4-6 hashtag tiếng Việt có dấu, viết liền không cách

Output CHỈ là bài viết, không giải thích gì thêm.`;

async function callNVIDIA(messages: { role: string; content: string }[]): Promise<string | null> {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.find(m => m.role === 'user')?.content || '';
  
  // Try NVIDIA first
  try {
    const nvidiaResponse = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg }
        ],
        max_tokens: 800,
        temperature: 0.8
      })
    });

    if (nvidiaResponse.ok) {
      const data = await nvidiaResponse.json();
      const content = data.choices?.[0]?.message?.content;
      console.log('NVIDIA raw response:', content?.substring(0, 300));
      if (content && content.length > 50) {
        console.log('NVIDIA SUCCESS, length:', content.length);
        return content;
      }
    } else {
      const error = await nvidiaResponse.text();
      console.log('NVIDIA error:', error.substring(0, 200));
    }
  } catch (e) {
    console.log('NVIDIA failed:', e);
  }
  
  // Fallback to Gemini
  console.log('Falling back to Gemini...');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg }] }],
          systemInstruction: { parts: [{ text: systemMsg }] },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2000,
            topP: 0.95
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.log('Gemini error:', error);
      return null;
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('Gemini response:', content?.substring(0, 200));
    return content || null;
  } catch (error) {
    console.log('Gemini failed:', error);
    return null;
  }
}

export async function processSingleWithAI(c: { env: Env }, item: NewsItem): Promise<AIResult> {
  console.log(`Processing: ${item.title}`);
  
  const fullContent = await fetchFullContent(item.link);
  const contentToUse = fullContent && fullContent.length > 500 ? fullContent : item.summary;
  
  const userPrompt = `Viết bài Facebook CỰC KÌ HẤP DẪN, châm biếm, hài hước.\n\nNỘI DUNG:\n${contentToUse}\n\nYÊU CẦU:\n- 100% tiếng Việt có dấu\n- Viết dài tối thiểu 300 từ\n- Phong cách châm biếm kiểu Đen\n- Có hook gây tò mò ở đầu\n- Có câu hỏi mở ở cuối\n- Thêm emoji`;
  
  const text = await callNVIDIA([
    { role: 'system', content: NVIDIA_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ]);
  
  if (text && isValidVietnamese(text)) {
    console.log('AI SUCCESS, length:', text.length);
    return { content: text, imageUrl: undefined };
  }
  
  const fallback = `${item.title}\n\n${item.summary}\n\n#TinTuc #${item.sourceCategory === 'tech' ? 'CongNghe' : 'TheGioi'}`;
  return { content: fallback, imageUrl: undefined };
}

export async function synthesizeWithAI(c: { env: Env }, topic: string, items: NewsItem[]): Promise<AIResult> {
  console.log(`Synthesizing topic: ${topic} from ${items.length} articles`);
  
  const contents: string[] = [];
  for (const item of items.slice(0, 3)) {
    const fullContent = await fetchFullContent(item.link);
    const content = (fullContent && fullContent.length > 200) 
      ? fullContent.substring(0, 800) 
      : (item.summary || item.title);
    contents.push(`[${item.source}]: ${content}`);
  }
  
  const userPrompt = `Viết bài Facebook CỰC KÌ HẤP DẪN, châm biếm, hài hước từ NHIỀU nguồn.\n\nTỔNG HỢP:\n${contents.join('\n\n')}\n\nYÊU CẦU:\n- 100% tiếng Việt có dấu\n- KHÔNG có label\n- Viết dài tối thiểu 300 từ\n- Phong cách châm biếm kiểu Đen (Vũ), khiến người đọc phải LIKE và COMMENT\n- Có hook gây tò mò ở đầu\n- Có câu hỏi mở ở cuối để người ta bình luận\n- Thêm emoji vào các câu quan trọng`;
  
  const text = await callNVIDIA([
    { role: 'system', content: NVIDIA_SYSTEM_PROMPT },
    { role: 'user', content: userPrompt }
  ]);
  
  if (text && isValidVietnamese(text) && text.length > 50) {
    console.log('Synthesis SUCCESS, length:', text.length);
    return { content: text, imageUrl: undefined };
  }
  
  console.log('AI failed, using fallback for:', topic);
  const fallback = `🔥 ${topic.toUpperCase()}: Tin nóng hôm nay!

Đọc xong bài này bạn sẽ HIỂU tại sao ${topic} lại hot như vậy! 🔥

Tổng hợp từ 8 nguồn tin uy tín, có những diễn biến mới quan trọng mà không ai nói với bạn...

Theo các chuyên gia, đây là một trong những sự kiện quan trọng nhất trong năm nay. Bạn nghĩ sao về chuyện này? 👇

Để lại bình luận cho mình biết ý kiến nhé! 💬

#${topic.replace(/ /g, '')} #TinNong #TongHop #Trending`;
  return { content: fallback, isFallback: true };
}

export async function generateImageFromContent(c: { env: Env }, content: string): Promise<string | null> {
  return undefined;
}