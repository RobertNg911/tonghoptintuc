const http = require('http');
const https = require('https');

const TEST = [
  { name: 'AP News', url: 'https://feeds.apnews.com/apnews/topnews' },
  { name: 'ABC International', url: 'https://abcnews.go.com/abcnews/internationalnews/rss' },
  { name: 'CBS News', url: 'https://www.cbsnews.com/rss/paramount-603.xml' },
  { name: 'NBC News', url: 'https://feeds.nbcnews.com/rss/topstories' },
  { name: 'Fox News', url: 'https://feeds.foxnews.com/foxnews/international' },
  { name: 'Sky News', url: 'https://feeds.skynews.com/feeds/sky-news-world.xml' },
  { name: 'Euronews', url: 'https://www.euronews.com/rss' },
  { name: 'DW', url: 'https://rss.dw.com/rdf/topnews' }
];

function fetch(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: data.length > 1000, size: data.length }));
    }).on('error', () => resolve({ ok: false }));
  });
}

async function test() {
  for (const t of TEST) {
    const r = await fetch(t.url);
    console.log(r.ok ? `✅ ${t.name}: ${r.size}` : `❌ ${t.name}`);
    await new Promise(r => setTimeout(r, 500));
  }
}
test();