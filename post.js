const fs = require('fs');
const axios = require('axios');

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_TOKEN = process.env.FB_TOKEN;

async function post() {
  let content = '';
  try {
    content = fs.readFileSync('content.txt', 'utf8').trim();
  } catch (e) {
    console.error('❌ No content.txt file');
    process.exit(1);
  }
  
  if (!content || content.startsWith('❌')) {
    console.error('❌ Content is error - skip posting');
    console.log(content);
    process.exit(1);
  }
  
  if (!FB_PAGE_ID || !FB_TOKEN) {
    console.error('❌ Missing FB credentials');
    console.log('FB_PAGE_ID:', FB_PAGE_ID ? 'set' : 'MISSING');
    console.log('FB_TOKEN:', FB_TOKEN ? 'set' : 'MISSING');
    process.exit(1);
  }
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/feed`,
      { message: content, access_token: FB_TOKEN }
    );
    console.log('✅ Posted to Facebook!');
    console.log('Post ID:', response.data.id);
    process.exit(0);
  } catch (e) {
    console.error('❌ Facebook API Error:');
    if (e.response?.data) {
      console.error(JSON.stringify(e.response.data));
    }
    process.exit(1);
  }
}

post().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});