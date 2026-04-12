import feedExtractor from '@extractus/feed-extractor';
import { type NewsItem, type FeedSource, type FeedFetchResult } from './types';

const DEFAULT_SOURCES: FeedSource[] = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'Reuters World', url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best', category: 'world' },
  { name: 'AP News', url: 'https://feeds.apnews.com/apnews/topnews', category: 'world' },
  { name: 'CNN', url: 'http://edition.cnn.com/rss', category: 'world' },
  { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'world' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'world' },
  { name: 'USA Today', url: 'https://rssfeeds.usatoday.com/UsatodaycomWorld-TopStories', category: 'world' },
  { name: 'NBC News', url: 'https://worldnews.nbcnews.com/rss.xml', category: 'world' },
  { name: 'ABC News', url: 'http://feeds.abcnews.com/International/', category: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { name: 'WIRED', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'tech' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'tech' },
  { name: 'Hacker News', url: 'https://hnrss.org/newest', category: 'tech' },
  { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml', category: 'tech' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', category: 'tech' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'tech' },
];

function generateId(title: string, link: string): string {
  const str = `${title}|${link}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function fetchFeed(source: FeedSource): Promise<FeedFetchResult> {
  try {
    const feed = await feedExtractor.loadFeed(source.url);
    
    const items: NewsItem[] = (feed.items || []).map(item => ({
      id: generateId(item.title || '', item.link || ''),
      title: item.title || '',
      link: item.link || '',
      summary: item.description?.substring(0, 300) || '',
      pubDate: new Date(item.pubDate || Date.now()),
      source: source.name,
      sourceCategory: source.category,
    }));

    return { source: source.name, items, fetchedAt: new Date() };
  } catch (error) {
    return {
      source: source.name,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      fetchedAt: new Date(),
    };
  }
}

export async function fetchAllFeeds(sources?: FeedSource[]): Promise<FeedFetchResult[]> {
  const toFetch = sources || DEFAULT_SOURCES;
  const timeout = 10000;

  const results = await Promise.allSettled(
    toFetch.map(source => 
      Promise.race([
        fetchFeed(source),
        new Promise<FeedFetchResult>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ).catch(() => ({
          source: source.name,
          items: [],
          error: 'Timeout',
          fetchedAt: new Date(),
        }))
      ])
    )
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    return { source: toFetch[i].name, items: [], error: 'Failed', fetchedAt: new Date() };
  });
}

export { DEFAULT_SOURCES, type FeedSource };