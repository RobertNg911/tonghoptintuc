import { type NewsItem } from './types';

const RECENCY_HOURS = 2;

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