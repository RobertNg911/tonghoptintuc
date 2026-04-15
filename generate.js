const fs = require('fs');
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_xxxx';

async function generate() {
  const items = JSON.parse(fs.readFileSync('news.json', 'utf8'));
  
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
  
  const prompt = `Write Facebook post in Vietnamese about "${topic}"

News:
${news}

Write 200 words, humorous, emojis, hashtag, ask question.`;

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
    
    const content = response.data.choices[0].message.content;
    fs.writeFileSync('content.txt', content);
    console.log('Generated:', content.substring(0, 100));
  } catch (e) {
    const fallback = `🔥 ${topic.toUpperCase()}: Tin nóng!

Theo các nguồn, có diễn biến mới về ${topic}.

Bạn nghĩ sao? Comment nhé! 💬
#${topic.replace(/ /g, '')} #TinNong #TongHop`;
    fs.writeFileSync('content.txt', fallback);
    console.log('Fallback used');
  }
}

generate();