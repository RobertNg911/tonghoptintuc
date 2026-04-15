const https = require('https');

const SOURCES = {
  world: [
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
    { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?best-topics=world' },
    { name: 'NYTimes', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
    { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss' },
    { name: 'France24', url: 'https://www.france24.com/en/rss' },
    { name: 'Wall Street Journal', url: 'https://feeds.aap.com.au/foreign' },
    { name: 'Washington Post', url: 'https://feeds.washingtonpost.com/rss/world' },
    { name: 'ABC News', url: 'https://abcnews.go.com/abcnews/topstories/rss' }
  ],
  tech: [
    { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
    { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
    { name: 'CNET', url: 'https://www.cnet.com/rss/news/' },
    { name: 'The Next Web', url: 'https://thenextweb.com/feed/' },
    { name: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
    { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml' },
    { name: 'Digital Trends', url: 'https://www.digitaltrends.com/feed/' }
  ]
};

function fetchFeed(url, name) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        if (data.length > 100) {
          console.log(`✅ ${name}: ${data.length} bytes (${time}ms)`);
          resolve({ ok: true, size: data.length });
        } else {
          console.log(`❌ ${name}: Too small ${data.length} bytes`);
          resolve({ ok: false });
        }
      });
    }).on('error', e => {
      console.log(`❌ ${name}: ${e.message}`);
      resolve({ ok: false });
    });
  });
}

async function test() {
  console.log('=== Testing World Sources ===');
  for (const s of SOURCES.world) {
    await fetchFeed(s.url, s.name);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n=== Testing Tech Sources ===');
  for (const s of SOURCES.tech) {
    await fetchFeed(s.url, s.name);
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n=== Done ===');
}

test();