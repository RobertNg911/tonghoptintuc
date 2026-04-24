const fs = require('fs');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const COUNT = parseInt(process.env.CONTENT_COUNT) || 5;
const MAX_RETRIES = 1;

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
  const prompt = `Vai trò: Bạn là một Content Creator chuyên viết "content bẩn" (hài hước), có khiếu châm biếm sâu cay và cực kỳ am hiểu tâm lý cư dân mạng Việt Nam.

Nhiệm vụ: Viết một bài đăng Facebook về tin này:
"${item.title}"

Nguồn: ${item.source}

Yêu cầu về văn phong:
- Ngôn ngữ: Tiếng lóng Gen Z, viral, so sánh "ngược đời"
- Hook: Cực mạnh, gây tò mò, đánh vào nỗi đau
- Thân bài: "Bóc trần" sự thật, châm biếm
- Kết bài: Câu chốt "xanh chín" hoặc câu hỏi tương tác
- Định dạng: Icon, xuống dòng hợp lý cho mobile
- Tone: Châm biếm, hài hước, "xéo sắc"
- Ngôn ngữ: 100% tiếng Việt có dấu
- Độ dài: 200-300 từ
- Hashtag: 3-5 hashtag tiếng Việt`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400
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