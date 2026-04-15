import { type NewsItem, type FeedSource, type FeedFetchResult } from './types';

const DEFAULT_SOURCES: FeedSource[] = [
  // World News - 10 nguồn
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'CNN World', url: 'http://rss.cnn.com/rss/edition_world.rss', category: 'world' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'Guardian World', url: 'https://www.theguardian.com/world/rss', category: 'world' },
  { name: 'NYTimes World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world' },
  { name: 'France24', url: 'https://www.france24.com/en/rss', category: 'world' },
  { name: 'Independent', url: 'https://www.independent.co.uk/news/world/rss', category: 'world' },
  { name: 'BBC Asia', url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', category: 'world' },
  { name: 'VOA News', url: 'https://www.voanews.com/rss', category: 'world' },
  { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'world' },
  
  // Tech News - 10 nguồn
  { name: 'BBC Tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'tech' },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/', category: 'tech' },
  { name: 'The Next Web', url: 'https://thenextweb.com/feed/', category: 'tech' },
  { name: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'Digital Trends', url: 'https://www.digitaltrends.com/feed/', category: 'tech' },
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

function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i.exec(itemXml);
    const linkMatch = /<link>(.*?)<\/link>/i.exec(itemXml);
    const descMatch = /<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i.exec(itemXml);
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(itemXml);
    
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '';
    const link = linkMatch ? linkMatch[1].trim() : '';
    const summary = descMatch ? (descMatch[1] || descMatch[2] || '').substring(0, 300).trim() : '';
    let pubDate = new Date();
    if (pubDateMatch) {
      pubDate = new Date(pubDateMatch[1]);
    }
    
    if (title && link) {
      items.push({
        id: generateId(title, link),
        title,
        link,
        summary,
        pubDate,
        source: '',
        sourceCategory: 'world',
      });
    }
  }
  
  return items;
}

export async function fetchFeed(source: FeedSource): Promise<FeedFetchResult> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'TongHopTinTuc/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const items = parseRSS(xml).map(item => ({
      ...item,
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