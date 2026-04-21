const axios = require('axios');

async function generateImage(prompt) {
  console.log('🎨 Generating image...');
  console.log('   Prompt:', prompt.substring(0, 50) + '...');
  
  // Try direct pollinations URL
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
  
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 90000,
      maxRedirects: 5
    });
    console.log('✅ Success');
    return response.data;
  } catch (e) {
    // Try alternative
    console.log('⚠️ Primary failed, trying fallback...');
    try {
      const altUrl = `https://image.pollinations.ai/${encodeURIComponent(prompt)}?width=1024&height=1024`;
      const response = await axios.get(altUrl, {
        responseType: 'arraybuffer',
        timeout: 90000
      });
      console.log('✅ Fallback success');
      return response.data;
    } catch (e2) {
      throw new Error(`Image gen failed: ${e.message}, fallback: ${e2.message}`);
    }
  }
}

module.exports = { generateImage };