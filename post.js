const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_TOKEN = process.env.FB_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const SCHEDULED_MINUTES = parseInt(process.env.SCHEDULED_MINUTES) || 0;
const SCHEDULE_INDEX = parseInt(process.env.SCHEDULE_INDEX) || 0;
const IMAGE_FILE = process.env.IMAGE_FILE || 'image.png';

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

  const fileIndex = Math.min(SCHEDULE_INDEX, contentFiles.length - 1);
  const contentFile = contentFiles[fileIndex] || contentFiles[0];

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
      imageId = await uploadImage(IMAGE_FILE, FB_TOKEN);
      console.log('✅ Image uploaded, ID:', imageId);
    } catch (e) {
      console.log('⚠️ Image upload failed:', e.message);
      imageUploadFailed = true;
    }
  } else {
    console.log('⚠️ No image file found:', IMAGE_FILE);
    imageUploadFailed = true;
  }
  
  if (imageUploadFailed) {
    const errMsg = `❌ TongHopTinTuc LỖI: Upload ảnh thất bại!`;
    console.log(errMsg);
    await sendTelegram(errMsg);
    process.exit(1);
  }

  const postData = { message: content, access_token: FB_TOKEN };
  if (imageId) {
    postData.attached_media = [{ media_fbid: imageId }];
  }

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
    process.exit(0);
  } catch (e) {
    console.error('❌ Facebook API Error:');
    if (e.response?.data) console.error(JSON.stringify(e.response.data));
    process.exit(1);
  }
}

post().catch(async e => {
  console.error('❌ Fatal:', e.message);
  await sendTelegram(`❌ TongHopTinTuc LỖI: ${e.message}`);
  process.exit(1);
});