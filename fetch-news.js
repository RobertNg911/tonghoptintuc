const https = require('https');
const fs = require('fs');
const { parseString } = require('xml2js');

const SOURCES = {
  world: [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' }
  ],
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' }
  ]
};

const CATEGORY = process.env.CATEGORY || 'world';

function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
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

  fs.writeFileSync('news.json', JSON.stringify(items, null, 2));
  console.log(`✅ Total ${items.length} items for ${CATEGORY}`);
  process.exit(0);
}

fetchAll().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});