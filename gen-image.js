const fs = require('fs');
const axios = require('axios');
const { generateImage } = require('./src/services/image');

const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function genImagePrompt(content) {
  const prompt = `From the Facebook post below, create a short prompt (max 50 words) describing a visual image for illustration.
- Use English only
- Describe the visual directly, no text, no famous people
- Make it simple for AI image generation

Content:
${content}

Return ONLY the English prompt, no explanation:`;

  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100
    },
    { headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` } }
  );
  
  return response.data.choices[0].message.content.trim();
}

async function run() {
  let content = '';
  try {
    content = fs.readFileSync('content.txt', 'utf8').trim();
  } catch (e) {
    console.error('❌ No content.txt');
    process.exit(1);
  }

  if (!content || content.startsWith('❌')) {
    console.error('❌ Content error');
    process.exit(1);
  }

  console.log('📝 Content:', content.substring(0, 100) + '...\n');

  try {
    console.log('🎨 Creating image prompt...');
    const imagePrompt = await genImagePrompt(content);
    console.log('   Prompt:', imagePrompt);
    fs.writeFileSync('image-prompt.txt', imagePrompt);
    
    console.log('🎨 Generating image...');
    const buf = await generateImage(imagePrompt);
    fs.writeFileSync('image.png', Buffer.from(buf));
    console.log('✅ Done: image.png');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

run();