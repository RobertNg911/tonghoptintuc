import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRoute } from './routes/health';
import { feedsRoute } from './routes/feeds';
import { cronRoute } from './middleware/cron';
import * as facebook from './services/facebook';
import { testPipeline } from './test';
import { initLogger, getRunHistory } from './services/logger';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());

// Routes
app.route('/health', healthRoute);
app.route('/feeds', feedsRoute);
app.route('/cron', cronRoute);

// Facebook routes
app.post('/facebook/post', async (c) => {
  const { caption, imageUrl } = await c.req.json().catch(() => ({}));
  
  if (!caption) {
    return c.json({ success: false, error: 'caption is required' }, 400);
  }

  const result = await facebook.postToPage(c, caption, imageUrl);
  return c.json(result);
});

app.get('/facebook/info', async (c) => {
  try {
    const info = await facebook.getPageInfo(c);
    return c.json(info);
  } catch (error) {
    return c.json({ 
      error: error instanceof Error ? error.message : 'Failed to get page info' 
    }, 500);
  }
});

app.get('/facebook/validate', async (c) => {
  try {
    const valid = await facebook.validateToken(c);
    return c.json({ valid });
  } catch (error) {
    return c.json({ valid: false, error: 'Token validation failed' }, 500);
  }
});

app.post('/facebook/test', async (c) => {
  const testCaption = '🧪 Test post from TongHopTinTuc - ' + new Date().toISOString();
  const result = await facebook.postToPage(c, testCaption);
  return c.json(result);
});

// Test endpoint
app.post('/test-result', async (c) => {
  const result = await testPipeline(c);
  return c.json({ result });
});

// Test image generation
app.post('/test-image', async (c) => {
  const { content } = await c.req.json().catch(() => ({}));
  const { generateImageFromContent } = await import('./services/ai');
  
  const contentTest = content || 'Công nghệ AI thống trị thế giới 2025. #AITech #CôngNghệ #TinNóng';
  
  try {
    const imageUrl = await generateImageFromContent(c, contentTest);
    return c.json({ success: !!imageUrl, imageUrl });
  } catch (e) {
    return c.json({ success: false, error: String(e) });
  }
});

// Test all Gemini keys from secrets
app.get('/test-keys', async (c) => {
  const keys = c.env.GEMINI_API_KEY?.split(',').map(k => k.trim()).filter(k => k) || [];
  const results: Record<string, any> = {};
  
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const shortKey = key.substring(0, 15) + '...';
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say hello in Vietnamese' }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        results[shortKey] = { status: 'OK', text: data.candidates?.[0]?.content?.parts?.[0]?.text };
      } else {
        const error = await response.text();
        results[shortKey] = { status: 'ERROR', error: error.substring(0, 200) };
      }
    } catch (e) {
      results[shortKey] = { status: 'EXCEPTION', error: String(e) };
    }
  }
  
  return c.json({ keys: keys.length, results });
});

// Default route - Web UI
app.get('/', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TongHopTinTuc - Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #e94560;
      margin-bottom: 10px;
      font-size: 28px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
    }
    .status {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      margin-bottom: 20px;
      text-align: center;
    }
    .status-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #28a745;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    .btn {
      width: 100%;
      padding: 18px;
      font-size: 18px;
      font-weight: bold;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 15px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #e94560 0%, #ff6b6b 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(233, 69, 96, 0.4);
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    .btn-secondary {
      background: #f8f9fa;
      color: #333;
      border: 2px solid #ddd;
    }
    .btn-secondary:hover {
      background: #eee;
    }
    .result {
      margin-top: 20px;
      padding: 15px;
      border-radius: 10px;
      display: none;
    }
    .result.show { display: block; }
    .result.success { background: #d4edda; color: #155724; }
    .result.error { background: #f8d7da; color: #721c24; }
    .result h3 { margin-bottom: 10px; }
    .result p { line-height: 1.6; }
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #e7f3ff;
      border-radius: 10px;
      font-size: 14px;
      color: #0056b3;
    }
    .info strong { display: block; margin-bottom: 5px; }
    .progress-container {
      display: none;
      background: #f8f9fa;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .step-item {
      padding: 10px 15px;
      margin: 5px 0;
      border-radius: 8px;
      background: #e9ecef;
      font-size: 14px;
    }
    .step-item.active {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      animation: slideIn 0.3s ease;
    }
    .step-item.done {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }
    .step-item.error {
      background: #f8d7da;
      border-left: 4px solid #dc3545;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .loading-dots::after {
      content: '';
      animation: dots 1.5s infinite;
    }
    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }
    .history-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
    }
    .history-item.success { border-left: 4px solid #28a745; }
    .history-item.error { border-left: 4px solid #dc3545; }
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }
    .history-status { font-weight: bold; }
    .history-status.success { color: #28a745; }
    .history-status.error { color: #dc3545; }
    .history-time { font-size: 12px; color: #666; }
    .history-message { font-size: 14px; margin: 5px 0; }
    .history-steps {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 8px;
    }
    .step-badge {
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
    }
    .step-badge.done { background: #d4edda; color: #155724; }
    .step-badge.error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📰 TongHopTinTuc</h1>
    <p class="subtitle">Bot tổng hợp tin tức tự động</p>
    
    <div class="status">
      <span class="status-dot"></span>
      Hệ thống đang hoạt động
    </div>
    
    <div id="result" class="result"></div>
    
    <div class="progress-container" id="progress">
      <div id="currentStep"></div>
    </div>
    
    <button class="btn btn-primary" id="runBtn" onclick="runPipeline()">
      🚀 Chạy Pipeline Ngay
    </button>
    
    <button class="btn btn-secondary" onclick="checkFeeds()">
      📡 Kiểm tra nguồn tin
    </button>
    
<button class="btn btn-secondary" onclick="testServer()">
       🔧 Test Server
     </button>
     
     <div class="history-container" id="historyContainer" style="margin-top:20px;">
       <h3 style="margin-bottom:15px;">📜 Lịch sử chạy</h3>
       <div id="historyList"></div>
     </div>
     
     <div class="info">
      <strong>📌 Thông tin:</strong>
      - Cron tự động chạy mỗi giờ<br>
      - Bài viết được viết lại bằng AI<br>
      - Đăng tự động lên Facebook Fanpage
    </div>
  </div>
  
  <script>
    const STEPS = [
      { id: 'fetch', label: '📡 Thu thập tin tức...' },
      { id: 'trending', label: '🔥 Tìm chủ đề hot...' },
      { id: 'ai-synth', label: '🤖 Tổng hợp nội dung...' },
      { id: 'post-trending', label: '📤 Đăng bài lên Facebook...' },
      { id: 'done', label: '✅ Hoàn thành!' }
    ];
    
    async function runPipeline() {
      const btn = document.getElementById('runBtn');
      const result = document.getElementById('result');
      const progress = document.getElementById('progress');
      const currentStepEl = document.getElementById('currentStep');
      
      btn.disabled = true;
      btn.textContent = '⏳ Đang chạy...';
      result.className = 'result';
      result.style.display = 'none';
      progress.style.display = 'block';
      currentStepEl.innerHTML = '<div class="step-item active">⏳ Bắt đầu...</div>';
      
      let pollCount = 0;
      const maxPolls = 60;
      
      try {
        const start = Date.now();
        
        let data;
        let response;
        
        try {
          response = await fetch('/run', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
          }
          
          data = await response.json();
        } catch (apiError) {
          console.error('API Error:', apiError);
          response = await fetch('/test-pipeline');
          data = await response.json();
        }
        
        const duration = Date.now() - start;
        
        let stepsHtml = '';
        
        if (data.steps && data.steps.length > 0) {
          for (const s of data.steps) {
            const stepInfo = STEPS.find(st => st.id === s.step);
            const label = stepInfo?.label.replace('⏳ ', '').replace('...', '') || s.step;
            if (s.status === 'done') {
              stepsHtml += '<div class="step-item done">✅ ' + label + '</div>';
            } else if (s.status === 'error') {
              stepsHtml += '<div class="step-item error">❌ ' + label + ': ' + (s.message || 'Lỗi') + '</div>';
            } else {
              stepsHtml += '<div class="step-item active">⏳ ' + label + '</div>';
            }
          }
        } else {
          stepsHtml = '<div class="step-item active">⏳ Đang xử lý...</div>';
        }
        
        currentStepEl.innerHTML = stepsHtml;
        
        setTimeout(() => {
          let details = '';
          if (data.stepFailures && data.stepFailures.length > 0) {
            details = '<p><strong>Lỗi:</strong></p>';
            for (const f of data.stepFailures) {
              details += '<div style="margin-top:5px;font-size:13px;color:#721c24;">• ' + f.error + '</div>';
            }
          }
          
          result.className = 'result show ' + (data.success ? 'success' : 'error');
          result.innerHTML = 
            '<h3>' + (data.success ? '✅ Thành công!' : '❌ Thất bại') + '</h3>' +
            '<p><strong>Thông điệp:</strong> ' + (data.message || 'Không có') + '</p>' +
            '<p><strong>Thời gian:</strong> ' + duration + 'ms</p>' +
            details +
            '<p style="margin-top:10px;font-size:12px;color:#666;"><strong>Time:</strong> ' + (data.timestamp || new Date().toISOString()) + '</p>';
          
          setTimeout(() => loadHistory(), 2000);
        }, 500);
      } catch (e) {
        result.className = 'result show error';
        result.innerHTML = '<h3>❌ Lỗi kết nối</h3><p>' + e.message + '</p><pre style="font-size:11px;margin-top:10px;white-space:pre-wrap;">' + (e.stack || '') + '</pre>';
      }
      
      btn.disabled = false;
      btn.textContent = '🚀 Chạy Pipeline Ngay';
      
      setTimeout(() => loadHistory(), 2000);
    }
    
    async function checkFeeds() {
      const result = document.getElementById('result');
      result.className = 'result show';
      result.innerHTML = '<h3>⏳ Đang kiểm tra nguồn tin...</h3>';
      
      try {
        const response = await fetch('/feeds');
        const data = await response.json();
        
        let sourcesHtml = '';
        
        if (data.sources && data.sources.length > 0) {
          const worldSources = data.sources.filter(function(s) { return s.category === 'world'; });
          const techSources = data.sources.filter(function(s) { return s.category === 'tech'; });
          
          if (worldSources.length > 0) {
            sourcesHtml += '<p style="margin-top:15px;font-weight:bold;">🌍 Thế giới:</p>';
            for (let i = 0; i < worldSources.length; i++) {
              const s = worldSources[i];
              const icon = s.error ? '❌' : (s.count > 0 ? '✅' : '⚪');
              const info = s.error ? ' <span style="color:#dc3545;">(' + s.error + ')</span>' : ' (' + s.count + ' tin)';
              sourcesHtml += '<div style="margin-left:10px;">' + icon + ' ' + s.name + info + '</div>';
            }
          }
          
          if (techSources.length > 0) {
            sourcesHtml += '<p style="margin-top:15px;font-weight:bold;">💻 Công nghệ:</p>';
            for (let i = 0; i < techSources.length; i++) {
              const s = techSources[i];
              const icon = s.error ? '❌' : (s.count > 0 ? '✅' : '⚪');
              const info = s.error ? ' <span style="color:#dc3545;">(' + s.error + ')</span>' : ' (' + s.count + ' tin)';
              sourcesHtml += '<div style="margin-left:10px;">' + icon + ' ' + s.name + info + '</div>';
            }
          }
        }
        
        result.className = 'result show success';
        result.innerHTML = 
          '<h3>📡 Nguồn tin</h3>' +
          '<p><strong>Tổng tin:</strong> ' + data.stats.totalItems + ' tin | ' +
          '<strong>Thành công:</strong> ' + data.stats.success + ' nguồn | ' +
          '<strong>Thất bại:</strong> ' + data.stats.failed + ' nguồn</p>' +
          sourcesHtml +
          '<p style="margin-top:15px;font-size:12px;color:#666;"><strong>Fetched:</strong> ' + data.fetchedAt + '</p>';
      } catch (e) {
        result.className = 'result show error';
        result.innerHTML = '<h3>❌ Lỗi</h3><p>' + e.message + '</p>';
      }
    }
    
    async function testServer() {
      const result = document.getElementById('result');
      result.className = 'result show';
      result.innerHTML = '<h3>🔧 Đang kiểm tra server...</h3>';
      
      try {
        const response = await fetch('/test-simple');
        const data = await response.json();
        
        let envInfo = '<p><strong>Environment:</strong></p>';
        envInfo += '<p>• Page ID: ' + (data.env.hasPageId ? '✅' : '❌') + '</p>';
        envInfo += '<p>• Token: ' + (data.env.hasToken ? '✅' : '❌') + '</p>';
        envInfo += '<p>• NVIDIA AI: ' + (data.env.hasGeminiKey ? '✅' : '❌') + '</p>';
        
        result.className = 'result show ' + (data.success ? 'success' : 'error');
        result.innerHTML = 
          '<h3>' + (data.success ? '✅ Server OK' : '❌ Server Lỗi') + '</h3>' +
          '<p><strong>Message:</strong> ' + data.message + '</p>' +
          envInfo +
          '<p style="margin-top:10px;font-size:12px;color:#666;"><strong>Time:</strong> ' + data.timestamp + '</p>';
      } catch (e) {
        result.className = 'result show error';
        result.innerHTML = '<h3>❌ Lỗi kết nối</h3><p>' + e.message + '</p>';
      }
    }
    
    async function loadHistory() {
      const container = document.getElementById('historyContainer');
      const list = document.getElementById('historyList');
      container.style.display = 'block';
      list.innerHTML = '<div class="step-item active">⏳ Đang tải...</div>';
      
      try {
        const response = await fetch('/history?limit=20');
        const data = await response.json();
        
        if (!data.history || data.history.length === 0) {
          list.innerHTML = '<div class="step-item">Chưa có lịch sử chạy</div>';
          return;
        }
        
        let html = '';
        for (let i = 0; i < data.history.length; i++) {
          const run = data.history[i];
          const date = new Date(run.timestamp);
          const timeStr = date.toLocaleString('vi-VN');
          const statusClass = run.success ? 'success' : 'error';
          const statusText = run.success ? '✅ Thành công' : '❌ Thất bại';
          
          let stepsHtml = '';
          if (run.steps && run.steps.length > 0) {
            for (let j = 0; j < run.steps.length; j++) {
              const s = run.steps[j];
              const badgeClass = s.status === 'done' ? 'done' : 'error';
              stepsHtml += '<span class="step-badge ' + badgeClass + '">' + s.step + '</span>';
            }
          }
          
          let errorDetails = '';
          if (run.stepFailures && run.stepFailures.length > 0) {
            for (let k = 0; k < run.stepFailures.length; k++) {
              errorDetails += '<div style="font-size:12px;color:#721c24;margin-top:4px;">• ' + run.stepFailures[k].step + ': ' + run.stepFailures[k].error + '</div>';
            }
          }
          
          html += '<div class="history-item ' + statusClass + '">' +
            '<div class="history-header">' +
              '<span class="history-status ' + statusClass + '">' + statusText + '</span>' +
              '<span class="history-time">' + timeStr + '</span>' +
            '</div>' +
            '<div class="history-message">' + (run.message || 'Không có thông điệp') + '</div>' +
            '<div style="font-size:12px;color:#666;">⏱ ' + (run.durationMs || '?') + 'ms</div>' +
            errorDetails +
            '<div class="history-steps">' + stepsHtml + '</div>' +
          '</div>';
        }
        
        list.innerHTML = html;
      } catch (e) {
        list.innerHTML = '<div class="step-item error">❌ Lỗi: ' + e.message + '</div>';
      }
    }
  loadHistory();
  </script>
</body>
</html>`;
  
  return c.html(html);
});

// Debug env
app.get('/debug', (c) => c.json({
  hasPageId: !!c.env.FACEBOOK_PAGE_ID,
  hasToken: !!c.env.FACEBOOK_ACCESS_TOKEN,
  tokenLength: c.env.FACEBOOK_ACCESS_TOKEN?.length,
  pageId: c.env.FACEBOOK_PAGE_ID
}));

// Test pipeline direct
app.get('/test-pipeline', async (c) => {
  const { runFullPipeline } = await import('./services/pipeline');
  const result = await runFullPipeline(c);
  return c.json(result);
});

// Test Telegram
app.get('/test-telegram', async (c) => {
  if (!c.env.TELEGRAM_BOT_TOKEN || !c.env.TELEGRAM_CHAT_ID) {
    return c.json({
      success: false,
      error: 'Telegram chưa được config!'
    });
  }
  
  const url = `https://api.telegram.org/bot${c.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: c.env.TELEGRAM_CHAT_ID,
    text: `✅ *TongHopTinTuc*\n\nBot Telegram hoạt động!\n⏰ ${new Date().toISOString()}`,
    parse_mode: 'Markdown'
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.ok) {
      return c.json({ success: true, message: 'Đã gửi tin nhắn Telegram!' });
    } else {
      return c.json({ success: false, error: data.description, errorCode: data.error_code });
    }
  } catch (e) {
    return c.json({ success: false, error: String(e) });
  }
});

// Simple test endpoint
app.get('/test-simple', async (c) => {
  const token = c.env.FB_TOKEN || c.env.FACEBOOK_ACCESS_TOKEN;
  let fbValid = false;
  let fbError = '';
  let fbName = '';
  
  if (token) {
    try {
      const response = await fetch(`https://graph.facebook.com/v25.0/me?access_token=${encodeURIComponent(token)}`);
      const data = await response.json();
      if (data.id) {
        fbValid = true;
        fbName = data.name || 'Unknown';
      } else {
        fbError = data.error?.message || JSON.stringify(data);
      }
    } catch (e) {
      fbError = e instanceof Error ? e.message : String(e);
    }
  }
  
  return c.json({ 
    success: true, 
    message: fbValid ? `Page: ${fbName}` : fbError,
    timestamp: new Date().toISOString(),
    env: {
      hasPageId: !!c.env.FACEBOOK_PAGE_ID,
      hasToken: !!token,
      hasGeminiKey: !!c.env.GEMINI_API_KEY,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
      fbValid,
      fbName,
      rawKeys: Object.keys(c.env).filter(k => k.includes('TOKEN') || k.includes('KEY'))
    }
  });
});

// Run pipeline with detailed steps
app.post('/run', async (c) => {
  initLogger(c.env.RUN_LOGS);
  const { runPipeline } = await import('./services/scheduler');
  const startTime = Date.now();
  const result = await runPipeline(c);
  const duration = Date.now() - startTime;
  return c.json({
    ...result,
    durationMs: duration,
    timestamp: new Date().toISOString()
  });
});

// Get run history
app.get('/history', async (c) => {
  initLogger(c.env.RUN_LOGS);
  const limit = parseInt(c.req.query('limit') || '20');
  const history = await getRunHistory(limit);
  return c.json({ history, total: history.length });
});

export default {
  fetch: app.fetch,
  scheduled: async (event: any, env: any, ctx: any) => {
    console.log('Scheduled event triggered', event.cron);
    const c = { env };
    const minute = new Date().getUTCMinutes();
    const category = minute >= 30 ? 'tech' : 'world';
    
    const { runPipeline } = await import('./services/scheduler');
    await runPipeline(c, category);
    
    console.log('Scheduled job completed', { category });
  }
};