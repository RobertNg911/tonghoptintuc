import { Hono } from 'hono';
import { fetchAllFeeds } from '../feeds/fetcher';
import { normalizeFeeds } from '../feeds/normalizer';
import type { NewsItem } from '../feeds/types';

const feedsRoute = new Hono();

feedsRoute.get('/', async (c) => {
  try {
    const rawResults = await fetchAllFeeds();
    
    const allItems: NewsItem[] = rawResults
      .filter(r => r.items && r.items.length > 0)
      .flatMap(r => r.items);
    
    const normalized = normalizeFeeds(allItems);
    
    return c.json({
      success: true,
      count: normalized.length,
      items: normalized,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch feeds',
    }, 500);
  }
});

export { feedsRoute };