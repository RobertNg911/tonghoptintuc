const fs = require('fs');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generate() {
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
  
  const topicWords = {};
  for (const item of items) {
    const words = item.title.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    for (const w of words) {
      if (w.length > 3 && !['that','this','with','from','have','what','will'].includes(w)) {
        topicWords[w] = (topicWords[w] || 0) + 1;
      }
    }
  }
  
  const topic = Object.entries(topicWords).sort((a, b) => b[1] - a[1])[0]?.[0] || 'tin-tuc';
  const news = items.slice(0, 5).map(i => `- ${i.title}`).join('\n');
  
  const prompt = `Bạn là chuyên gia viết content Facebook viral tiếng Việt.

VIẾT BÀI FACEBOOK về chủ đề: ${topic}

Nguồn tin từ ${items[0]?.source || 'các nguồn'}:
${news}

YÊU CẦU:
- 100% tiếng Việt có dấu
- Phong cách châm biếm, hài hước (kiểu Đen Vũ)
- Có câu hỏi để người ta bình luận
- Thêm emoji vào các câu quan trọng  
- 200-300 từ
- 3-5 hashtag tiếng Việt ở cuối
- Không copy nguyên văn từ nguồn`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400
      },
      { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } }
    );
    
    if (!response.data.choices || !response.data.choices[0]) {
      console.error('❌ AI response empty');
      process.exit(1);
    }
    
    const content = response.data.choices[0].message.content;
    fs.writeFileSync('content.txt', content);
    console.log('✅ AI generated content');
    console.log('Content:', content.substring(0, 100));
    
  } catch (e) {
    console.error('❌ AI Error:', e.message);
    if (e.response?.data) {
      console.error('Response:', JSON.stringify(e.response.data));
    }
    fs.writeFileSync('content.txt', `❌ AI FAILED: ${e.message}`);
    process.exit(1);
  }
}

generate().catch(e => {
  console.error('❌ Fatal Error:', e.message);
  fs.writeFileSync('content.txt', `❌ FATAL: ${e.message}`);
  process.exit(1);
});