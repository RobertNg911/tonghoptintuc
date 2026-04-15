import { type NewsItem } from './types';

export function filterByCategory(items: NewsItem[], category: 'world' | 'tech'): NewsItem[] {
  return items.filter(item => item.sourceCategory === category);
}

const RECENCY_HOURS = 5;

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
  'you', 'your', 'he', 'she', 'him', 'her', 'his', 'i', 'my', 'me', 'what', 'which',
  'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'can', 'after', 'before', 'about',
  'into', 'through', 'during', 'between', 'under', 'again', 'further', 'then', 'once',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each',
  'covid', 'says', 'said', 'also', 'one', 'two', 'new', 'first', 'last', 'long',
  'great', 'little', 'own', 'old', 'right', 'big', 'high', 'different', 'small'
]);

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));
  return words;
}

function calculateOverlap(items: NewsItem[]): Map<string, NewsItem[]> {
  const topicMap = new Map<string, NewsItem[]>();
  
  for (const item of items) {
    const keywords = extractKeywords(item.title + ' ' + item.summary);
    
    for (const keyword of keywords) {
      if (!topicMap.has(keyword)) {
        topicMap.set(keyword, []);
      }
      const existing = topicMap.get(keyword)!;
      if (!existing.find(i => i.id === item.id)) {
        existing.push(item);
      }
    }
  }
  
  return topicMap;
}

export interface TrendingTopic {
  keyword: string;
  count: number;
  items: NewsItem[];
}

export function findTrendingTopics(items: NewsItem[], topN: number = 5): TrendingTopic[] {
  const overlap = calculateOverlap(items);
  const trending: TrendingTopic[] = [];
  
  overlap.forEach((topicItems, keyword) => {
    if (topicItems.length >= 2) {
      trending.push({ keyword, count: topicItems.length, items: topicItems });
    }
  });
  
  trending.sort((a, b) => b.count - a.count);
  return trending.slice(0, topN);
}

export function filterByRecency(items: NewsItem[], hours: number = RECENCY_HOURS): NewsItem[] {
  const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
  return items.filter(item => item.pubDate && item.pubDate.getTime() > cutoff.getTime());
}

export function deduplicateFeeds(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const unique: NewsItem[] = [];
  
  for (const item of items) {
    const key = `${item.title.toLowerCase()}|${item.link.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }
  return unique;
}

export function normalizeFeeds(rawFeeds: NewsItem[]): NewsItem[] {
  const recent = filterByRecency(rawFeeds);
  const sorted = recent.sort((a, b) => 
    (b.pubDate?.getTime() || 0) - (a.pubDate?.getTime() || 0)
  );
  const unique = deduplicateFeeds(sorted);
  return unique.slice(0, 50);
}

export function categorizeBySource(items: NewsItem[]): { world: NewsItem[]; tech: NewsItem[] } {
  return {
    world: items.filter(i => i.sourceCategory === 'world'),
    tech: items.filter(i => i.sourceCategory === 'tech'),
  };
}