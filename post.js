const fs = require('fs');
const axios = require('axios');

async function post() {
  const content = fs.readFileSync('content.txt', 'utf8').trim();
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_TOKEN;
  
  if (!pageId || !token) {
    console.log('Facebook credentials not set, skipping post');
    console.log('Content:', content);
    return;
  }
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      { message: content, access_token: token }
    );
    console.log('Posted! Post ID:', response.data.id);
  } catch (e) {
    console.error('Post failed:', e.response?.data || e.message);
  }
}

post();