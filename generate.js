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
  
  const prompt = `Vai trò: Bạn là một Content Creator chuyên viết "content bẩn" (hài hước), có khiếu châm biếm sâu cay và cực kỳ am hiểu tâm lý cư dân mạng Việt Nam.

Nhiệm vụ: Viết một bài đăng Facebook về chủ đề: ${topic}

Nguồn:
${news}

Yêu cầu về văn phong:
- Ngôn ngữ: Sử dụng tiếng lóng của Gen Z, các câu nói viral, hoặc cách so sánh ví von "ngược đời"
- Hook (Mở bài): Phải cực mạnh, gây tò mò hoặc đánh ngay vào nỗi đau/sự thật phũ phàng bằng giọng điệu mỉa mai
- Thân bài: Triển khai nội dung bằng cách "bóc trần" sự thật, dùng phép nói quá hoặc châm biếm. Tránh viết kiểu quảng cáo sáo rỗng
- Kết bài: Một câu chốt hạ "xanh chín" hoặc một câu hỏi tương tác khiến người ta phải comment vì ức chế hoặc vì quá đúng
- Định dạng: Sử dụng các icon phù hợp nhưng không lạm dụng. Xuống dòng hợp lý để dễ đọc trên điện thoại
- Tone giọng: Châm biếm, hài hước, hơi "xéo sắc" một chút nhưng không vi phạm tiêu chuẩn cộng đồng
- Ngôn ngữ BẮT BUỘC: 100% tiếng Việt có dấu, không được lẫn tiếng Anh
- Độ dài: 200-300 từ
- Hashtag: 3-5 hashtag tiếng Việt ở cuối`;

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