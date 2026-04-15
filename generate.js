const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  
  const prompt = `Viết bài Facebook viral tiếng Việt về "${topic}"

Nguồn:
${news}

Viết 200 từ, châm biếm, có câu hỏi, emoji, hashtag.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400
    });
    
    const content = response.choices[0].message.content;
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