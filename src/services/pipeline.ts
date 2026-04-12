import { fetchAllFeeds, DEFAULT_SOURCES } from '../feeds/fetcher';
import { normalizeFeeds } from '../feeds/normalizer';
import { processWithAI } from '../services/ai';
import { postToPage } from '../services/facebook';
import type { Env } from '../utils/env';

interface PipelineEnv extends Env {
  LEONARDO_API_KEYS?: string;
}

export async function runFullPipeline(c: { env: PipelineEnv }): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Starting full pipeline...');
    
    // 1. Fetch feeds
    console.log('Fetching feeds...');
    const results = await fetchAllFeeds();
    const allItems = results.filter(r => r.items.length > 0).flatMap(r => r.items);
    const normalized = normalizeFeeds(allItems);
    
    if (normalized.length === 0) {
      return { success: false, message: 'No news items found' };
    }
    
    // 2. Pick a random item
    const item = normalized[Math.floor(Math.random() * normalized.length)];
    console.log(`Selected: ${item.title}`);
    
    // 3. Process with AI
    console.log('Processing with AI...');
    const aiResult = await processWithAI(c, {
      title: item.title,
      summary: item.summary,
      source: item.source,
    });
    
    // 4. Post to Facebook
    console.log('Posting to Facebook...');
    const postResult = await postToPage(c, aiResult.content, aiResult.imageUrl);
    
    if (!postResult.success) {
      return { success: false, message: `Facebook post failed: ${postResult.error}` };
    }
    
    console.log(`Posted successfully: ${postResult.postId}`);
    return { success: true, message: `Posted: ${item.title}` };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Pipeline error:', errorMessage);
    return { success: false, message: errorMessage };
  }
}