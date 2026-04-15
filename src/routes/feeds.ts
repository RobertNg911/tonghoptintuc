import { Hono } from 'hono';
import { fetchAllFeeds, DEFAULT_SOURCES } from '../feeds/fetcher';
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
    
    const sourceStats = rawResults.map(r => ({
      name: r.source,
      count: r.items?.length || 0,
      success: !r.error,
      error: r.error || null,
      category: DEFAULT_SOURCES.find(s => s.name === r.source)?.category || 'unknown'
    }));
    
    const successCount = sourceStats.filter(s => s.success && s.count > 0).length;
    const failCount = sourceStats.filter(s => s.error).length;
    
    return c.json({
      success: true,
      count: normalized.length,
      items: normalized,
      fetchedAt: new Date().toISOString(),
      sources: sourceStats,
      stats: {
        total: sourceStats.length,
        success: successCount,
        failed: failCount,
        totalItems: allItems.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch feeds',
    }, 500);
  }
});

export { feedsRoute };