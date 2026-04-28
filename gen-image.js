const fs = require('fs');
const axios = require('axios');
const { generateImage } = require('./src/services/image');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const COUNT = parseInt(process.env.IMAGE_COUNT) || 1;
const MAX_RETRIES = 1;

async function generateWithRetry(prompt, attempt = 0) {
  try {
    return await generateImage(prompt);
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      console.log(`🔄 Retrying image generation... (${attempt + 1}/${MAX_RETRIES})`);
      await new Promise(r => setTimeout(r, 2000));
      return generateWithRetry(prompt, attempt + 1);
    }
    throw e;
  }
}

async function genImagePrompt(content) {
  const prompt = `Analyze the viral Facebook post below and create a VISUAL PROMPT for a striking, scroll-stopping cover image.

REQUIREMENTS:
- Use English only, simple words
- Visual style: Bold, eye-catching, meme-style illustration
- NO text, NO famous people faces
- NO logos or watermarks
- Modern social media aesthetic
- High contrast, vibrant colors
- If topic is serious → use dramatic/stormy mood
- If topic is fun → use bright, playful mood
- Add style keywords: "3D render", "bold typography", "trending on social media"

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
      const buf = await generateWithRetry(imagePrompt);
      fs.writeFileSync(imageFile, Buffer.from(buf));
      console.log(`✅ [${i}/${COUNT}] Done: ${imageFile}`);
    } catch (e) {
      console.log(`❌ [${i}/${COUNT}] Failed after ${MAX_RETRIES + 1} attempts: ${e.message}`);
    }
  }
  
  console.log('\n✅ All images generated');
}

main().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});