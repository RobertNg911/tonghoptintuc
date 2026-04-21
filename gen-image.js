const fs = require('fs');
const axios = require('axios');
const { generateImage } = require('./src/services/image');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const COUNT = parseInt(process.env.IMAGE_COUNT) || 5;

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

async function main() {
  console.log(`🎨 Generating ${COUNT} images...\n`);
  
  for (let i = 1; i <= COUNT; i++) {
    const contentFile = `content-${i}.txt`;
    const imageFile = `image-${i}.png`;
    
    let content = '';
    try {
      content = fs.readFileSync(contentFile, 'utf8').trim();
    } catch (e) {
      console.log(`❌ [${i}/${COUNT}] No ${contentFile}, skipping`);
      continue;
    }
    
    if (!content || content.startsWith('❌')) {
      console.log(`❌ [${i}/${COUNT}] Content error, skipping`);
      continue;
    }
    
    try {
      console.log(`🎨 [${i}/${COUNT}] Creating prompt...`);
      const imagePrompt = await genImagePrompt(content);
      
      console.log(`🎨 [${i}/${COUNT}] Generating image...`);
      const buf = await generateImage(imagePrompt);
      fs.writeFileSync(imageFile, Buffer.from(buf));
      console.log(`✅ [${i}/${COUNT}] Done: ${imageFile}`);
    } catch (e) {
      console.log(`❌ [${i}/${COUNT}] Failed: ${e.message}`);
    }
  }
  
  console.log('\n✅ All images generated');
}

main().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});