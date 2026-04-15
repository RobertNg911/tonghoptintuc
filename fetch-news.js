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

function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function fetchAll() {
  const category = process.env.CATEGORY || 'world';
  const sources = SOURCES[category] || SOURCES.world;
  const items = [];

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
          category
        });
      }
    } catch (e) {
      console.error(`Error fetching ${source.name}: ${e.message}`);
    }
  }

  fs.writeFileSync('news.json', JSON.stringify(items, null, 2));
  console.log(`Fetched ${items.length} items for ${category}`);
}

fetchAll().catch(console.error);