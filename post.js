const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const { checkDuplicate, markPosted } = require('./src/services/duplicate');

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_TOKEN = process.env.FB_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SCHEDULED_MINUTES = parseInt(process.env.SCHEDULED_MINUTES) || 15;
const SCHEDULE_INDEX = parseInt(process.env.SCHEDULE_INDEX) || 0;
const IMAGE_FILE = process.env.IMAGE_FILE || `image-${SCHEDULE_INDEX + 1}.png`;
const CONTENT_FILE = process.env.CONTENT_FILE || `content-${SCHEDULE_INDEX + 1}.txt`;

async function sendAlert(step, message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('⚠️ Telegram not configured, skipping alert');
    return;
  }
  
  const alertMsg = `🚨 *TongHopTinTuc Alert*\n\n` +
    `*Step:* ${step}\n` +
    `*Error:* ${message}\n` +
    `*Time:* ${new Date().toISOString()}\n\n` +
    `*Retry suggestion:* Check GitHub Actions logs`;
  
  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      { chat_id: TELEGRAM_CHAT_ID, text: alertMsg, parse_mode: 'Markdown' }
    );
    console.log('✅ Alert sent to Telegram');
  } catch (e) {
    console.log('⚠️ Failed to send Telegram alert:', e.message);
  }
}

async function sendTelegram(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  await axios.post(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    { chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }
  );
}

async function uploadImage(imagePath, token) {
  console.log('📤 Uploading image...');
  
  const form = new FormData();
  form.append('source', fs.createReadStream(imagePath), {
    filename: path.basename(imagePath),
    contentType: 'image/png'
  });
  form.append('access_token', token);
  
  const response = await axios.post(
    `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/photos`,
    form,
    { 
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    }
  );
  return response.data.id;
}

async function post() {
  let content = '';
  let contentFiles = ['content.txt'];
  if (process.env.CONTENT_FILE) {
    contentFiles = process.env.CONTENT_FILE.split(',').map(f => f.trim());
  }

  const contentFile = CONTENT_FILE;
  console.log(`📄 Reading: ${contentFile}`);

  try {
    content = fs.readFileSync(contentFile, 'utf8').trim();
  } catch (e) {
    console.error(`❌ No ${contentFile} file`);
    process.exit(1);
  }
  
  if (!content || content.startsWith('❌')) {
    console.error('❌ Content is error - skip posting');
    console.log(content);
    process.exit(1);
  }
  
  if (!FB_PAGE_ID || !FB_TOKEN) {
    console.error('❌ Missing FB credentials');
    process.exit(1);
  }

  let imageId = null;
  let imageUploadFailed = false;
  
  if (fs.existsSync(IMAGE_FILE)) {
    const imageStats = fs.statSync(IMAGE_FILE);
    console.log(`📸 Image file exists: ${IMAGE_FILE} (${imageStats.size} bytes)`);
    try {
      // Upload ảnh kèm caption trực tiếp - tạo 1 bài với ảnh + text
      console.log('📤 Posting with image...');
      const form = new FormData();
      form.append('caption', content);
      form.append('access_token', FB_TOKEN);
      form.append('source', fs.createReadStream(IMAGE_FILE), {
        filename: path.basename(IMAGE_FILE),
        contentType: 'image/png'
      });
      
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/photos`,
        form,
        { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity }
      );
      imageId = response.data.id;
      console.log('✅ Done! Post with image. ID:', imageId);
      
      // Mark as posted to prevent duplicate
      const newsData = JSON.parse(fs.readFileSync('news.json', 'utf8'));
      if (newsData[0]) {
        markPosted(newsData[0].link, newsData[0].title);
      }
      process.exit(0);
    } catch (e) {
      console.log('⚠️ Image upload failed:', e.message);
      imageUploadFailed = true;
    }
  }
  
  if (imageUploadFailed) {
    console.log('⚠️ Posting text only (no image)...');
  }
  
  const postData = { message: content, access_token: FB_TOKEN };

  if (SCHEDULED_MINUTES > 0) {
    const minutesOffset = SCHEDULE_INDEX * SCHEDULED_MINUTES;
    const publishAt = Math.floor(Date.now() / 1000) + (minutesOffset * 60);
    postData.publish_at = publishAt;
    postData.published = false;
    console.log(`📅 Scheduling ${contentFile} for +${minutesOffset} minutes...`);
  } else {
    console.log(`📤 Posting ${contentFile} now...`);
  }
  
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/feed`,
      postData
    );
    console.log('✅ Done! Post ID:', response.data.id, `- ${contentFile}`);
    
    // Mark as posted to prevent duplicate
    const newsData = JSON.parse(fs.readFileSync('news.json', 'utf8'));
    if (newsData[0]) {
      markPosted(newsData[0].link, newsData[0].title);
    }
    process.exit(0);
  } catch (e) {
    console.error('❌ Facebook API Error:');
    if (e.response?.data) console.error(JSON.stringify(e.response.data));
    await sendAlert('post.js - Facebook API', e.message);
    process.exit(1);
  }
}

post().catch(async e => {
  console.error('❌ Fatal:', e.message);
  await sendAlert('post.js - Fatal', e.message);
  process.exit(1);
});