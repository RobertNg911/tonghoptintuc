const axios = require('axios');

async function generateImage(prompt) {
  console.log('🎨 Generating image...');
  console.log('   Prompt:', prompt.substring(0, 50) + '...');
  
  // Use landscape 16:9 for Facebook feed
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&nologo=true&seed=${Math.random()}`;
  
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 120000,
      maxRedirects: 5
    });
    console.log('✅ Success');
    return response.data;
  } catch (e) {
    console.log('⚠️ Primary failed, trying fallback...');
    try {
      const altUrl = `https://image.pollinations.ai/${encodeURIComponent(prompt)}?width=1200&height=675&seed=${Math.random()}`;
      const response = await axios.get(altUrl, {
        responseType: 'arraybuffer',
        timeout: 120000
      });
      console.log('✅ Fallback success');
      return response.data;
    } catch (e2) {
      throw new Error(`Image gen failed: ${e.message}, fallback: ${e2.message}`);
    }
  }
}

module.exports = { generateImage };