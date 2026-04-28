const fs = require('fs');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const COUNT = parseInt(process.env.CONTENT_COUNT) || 1;
const MAX_RETRIES = 1;

const SYSTEM_PROMPT = `Bạn là một Content Creator viral Việt Nam, viết bài đăng Facebook siêu viral.

PHONG CÁCH:
- Viết như chat với bạn bè, thật tự nhiên, mạnh mẽ
- Dùng ngôn ngữ đời thường Gen Z Việt Nam
- Có opinion rõ ràng, không nửa vời
- Biết châm biến nhẹ nhưng có Insight

CẤU TRÚC BÀI VIẾT:
1. HOOK (1-2 câu đầu):
   - Câu gây SHOCK, tò mò ngay lập tức
   - Đánh vào cảm xúc người đọc
   - Ví dụ: "Không ai nói cho bạn biết sự thật này..."

2. BODY (3-4 đoạn ngắn):
   - Kể chuyện có drama
   - Giải thích ĐƠN GIẢN ai cũng hiểu
   - Dùng ví dụ gần gũi
   - Chia ẩn dụ dễ hiểu

3. KẾT BÀI:
   - Câu hỏi tương tác mạnh
   - Kêu share/tag bạn bè
   - Hoặc câu drama có tính share cao

FORMAT:
- Mỗi đoạn 1-2 câu ngắn
- Dòng trống giữa các đoạn
- Emoji 🖕🔥💀🤔适量的
- Hashtags: 3-5 cái hợp lý
- 100% tiếng Việt có dấu, KHÔNG lẫn tiếng Anh

ĐỘ DÀI: 250-400 từ`;

function buildUserPrompt(item) {
  return `Viết MỘT BÀI ĐĂNG FACEBOOK bằng TIẾNG VIỆT CÓ DẤU về tin này:

TIÊU ĐỀ: "${item.title}"
NGUỒN: ${item.source}

YÊU CẦU: Viết chủ yếu bằng tiếng Việt có dấu. Các thuật ngữ kỹ thuật, tên thương hiệu, từ ngữ phổ biến có thể giữ nguyên tiếng Anh (ví dụ: AI, GPT, Apple, Google).`;
}

async function generateWithRetry(item, attempt = 0) {
  try {
    return await generateContent(item);
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      console.log(`🔄 Retrying content generation... (${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, 2000));
      return generateWithRetry(item, attempt + 1);
    }
    throw e;
  }
}

async function generateContent(item) {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(item) }
      ],
      temperature: 0.85,
      top_p: 0.9,
      max_tokens: 800
    },
    { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } }
  );

  if (!response.data.choices?.[0]?.message?.content) {
    throw new Error('AI response empty');
  }

  return response.data.choices[0].message.content;
}

async function main() {
  let items = [];
  try {
    items = JSON.parse(fs.readFileSync('news.json', 'utf8'));
  } catch (e) {
    console.error('❌ No news.json file');
    process.exit(1);
  }

  if (items.length === 0) {
    console.error('❌ No news items fetched');
    process.exit(1);
  }

  console.log(`✅ Generating ${COUNT} contents from ${items.length} news...`);

  for (let i = 0; i < Math.min(COUNT, items.length); i++) {
    const item = items[i];
    try {
      const content = await generateWithRetry(item);
      const filename = `content-${i + 1}.txt`;
      fs.writeFileSync(filename, content);
      console.log(`✅ [${i + 1}/${COUNT}] ${filename}: ${item.title.substring(0, 40)}...`);
    } catch (e) {
      console.error(`❌ [${i + 1}] Failed after ${MAX_RETRIES + 1} attempts: ${e.message}`);
      fs.writeFileSync(`content-${i + 1}.txt`, `❌ FAILED: ${e.message}`);
    }
  }

  console.log('✅ Done generating contents');
}

main().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});