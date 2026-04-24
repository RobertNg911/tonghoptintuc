const http = require('http');
const https = require('https');
const fs = require('fs');
const { parseString } = require('xml2js');
const { scoreAll } = require('./src/feeds/scorer');
const { rankNews, getTopNews } = require('./src/feeds/ranker');
const { checkDuplicate } = require('./src/services/duplicate');

const SOURCES = {
  world: [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'NYTimes', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
    { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
    { name: 'France24', url: 'https://www.france24.com/en/rss' },
    { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world' },
    { name: 'CBS News', url: 'https://www.cbsnews.com/rss/paramount-603.xml' },
    { name: 'Fox News', url: 'https://feeds.foxnews.com/foxnews/international' },
    { name: 'Euronews', url: 'https://www.euronews.com/rss' }
  ],
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
    { name: 'CNET', url: 'https://www.cnet.com/rss/news/' },
    { name: 'The Next Web', url: 'https://thenextweb.com/feed/' },
    { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml' },
    { name: 'Digital Trends', url: 'https://www.digitaltrends.com/feed/' }
  ]
};

const CATEGORY = process.env.CATEGORY || 'world';

function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchAll() {
  const sources = SOURCES[CATEGORY] || SOURCES.world;
  const items = [];
  let successCount = 0;
  
  for (const source of sources) {
    try {
      console.log(`Fetching ${source.name}...`);
      const xml = await fetchFeed(source.url);
      const feed = await new Promise((resolve, reject) => 
        parseString(xml, (err, result) => err ? reject(err) : resolve(result))
      );
      const channel = feed.rss?.channel?.[0];
      const entries = channel?.item || [];
      
      for (const item of entries.slice(0, 5)) {
        items.push({
          title: item.title?.[0] || '',
          link: item.link?.[0] || '',
          pubDate: item.pubDate?.[0] || '',
          source: source.name,
          category: CATEGORY
        });
      }
      successCount++;
      console.log(`✅ ${source.name}: ${entries.length} items`);
    } catch (e) {
      console.error(`❌ ${source.name} failed: ${e.message}`);
    }
  }

  if (items.length === 0) {
    console.error(`❌ No items fetched for ${CATEGORY}`);
    process.exit(1);
  }

  // Score and rank news - select top 1 with hotScore >= 20
  const scored = scoreAll(items);
  const topNews = getTopNews(scored, { top: 1, minScore: 20 });
  
  if (topNews.length === 0) {
    console.error('❌ No news meeting hotScore threshold (>= 20)');
    process.exit(1);
  }

  // Check for duplicates
  if (checkDuplicate(topNews[0].link)) {
    console.log(`⚠️ Duplicate detected: ${topNews[0].title.substring(0, 50)}...`);
    console.log('🔄 Skipping - will retry next run');
    process.exit(1);
  }

  fs.writeFileSync('news.json', JSON.stringify(topNews, null, 2));
  console.log(`✅ Ranked ${topNews.length} hot items for ${CATEGORY}`);
  topNews.forEach((item, i) => {
    console.log(`  ${i+1}. [${item.hotScore}pts] ${item.source}: ${item.title.substring(0, 50)}...`);
  });
  process.exit(0);
}

fetchAll().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});