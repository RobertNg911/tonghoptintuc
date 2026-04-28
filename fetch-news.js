const http = require('http');
const https = require('https');
const fs = require('fs');
const { parseString } = require('xml2js');
const RSSParser = require('rss-parser');
const parser = new RSSParser();
const { scoreAll } = require('./src/feeds/scorer');
const { rankNews, getTopNews } = require('./src/feeds/ranker');
const { checkDuplicate } = require('./src/services/duplicate');
const { fetchRedditPosts } = require('./src/services/reddit');

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
  ],
  reddit: [
    { name: 'Reddit r/worldnews', subreddit: 'worldnews' },
    { name: 'Reddit r/technology', subreddit: 'technology' },
    { name: 'Reddit r/news', subreddit: 'news' }
  ],
  financial: [
    { name: 'Bloomberg Markets', url: 'https://feeds.bloomberg.com/markets/news.rss' },
    { name: 'Bloomberg Technology', url: 'https://feeds.bloomberg.com/technology/news.rss' },
    { name: 'Reuters (Google RSS)', url: 'https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en' },
    { name: 'AP News (Google RSS)', url: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en' },
    { name: 'WSJ (Google RSS)', url: 'https://news.google.com/rss/search?q=site:wsj.com&hl=en-US&gl=US&ceid=US:en' }
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
  const category = CATEGORY;
  const items = [];
  let successCount = 0;
  
  // Fetch RSS sources (world or tech)
  if (category === 'world' || category === 'tech') {
    const rssSources = SOURCES[category] || [];
    for (const source of rssSources) {
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
            category: category
          });
        }
        successCount++;
        console.log(`✅ ${source.name}: ${entries.length} items`);
      } catch (e) {
        console.error(`❌ ${source.name} failed: ${e.message}`);
      }
    }
  }

  // Fetch Reddit sources (always fetch Reddit for world category or if category is reddit)
  if (category === 'world' || category === 'reddit') {
    const redditSources = SOURCES.reddit || [];
    const subreddits = redditSources.map(s => s.subreddit);

    try {
      console.log(`Fetching Reddit: r/${subreddits.join(', r/')}...`);
      const redditPosts = await fetchRedditPosts(subreddits, { limit: 10 });
      items.push(...redditPosts);
      successCount++;
      console.log(`✅ Reddit: ${redditPosts.length} posts`);
    } catch (e) {
      console.error(`❌ Reddit failed: ${e.message}`);
    }
  }

  // Fetch financial sources (Bloomberg, Reuters, AP, WSJ) using rss-parser
  if (category === 'world' || category === 'financial') {
    const financialSources = SOURCES.financial || [];
    for (const source of financialSources) {
      try {
        console.log(`Fetching ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        const entries = feed.items?.slice(0, 5) || [];

        for (const item of entries) {
          items.push({
            title: item.title || '',
            link: item.link || '',
            pubDate: item.pubDate || item.isoDate || '',
            source: source.name,
            category: 'financial'
          });
        }
        successCount++;
        console.log(`✅ ${source.name}: ${entries.length} items`);
      } catch (e) {
        console.error(`❌ ${source.name} failed: ${e.message}`);
      }
    }
  }
  
  if (items.length === 0) {
    console.error(`❌ No items fetched for ${category}`);
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