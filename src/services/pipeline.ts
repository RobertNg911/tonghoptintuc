import { fetchAllFeeds, DEFAULT_SOURCES } from '../feeds/fetcher';
import { normalizeFeeds, categorizeBySource, findTrendingTopics, filterByCategory, type TrendingTopic } from '../feeds/normalizer';
import { processSingleWithAI, synthesizeWithAI } from '../services/ai';
import { postToPage } from '../services/facebook';
import { alertError } from '../services/alert';
import type { Env } from '../utils/env';
import type { NewsItem } from '../feeds/types';

interface PipelineEnv extends Env {
  LEONARDO_API_KEYS?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  FACEBOOK_PAGE_ID: string;
  FB_TOKEN: string;
}

interface StepFailure {
  step: string;
  error: string;
}

type StepCallback = (step: string, status: 'done' | 'error', message?: string) => void;

export async function runFullPipeline(
  c: { env: PipelineEnv },
  onStep?: StepCallback,
  category?: 'world' | 'tech'
): Promise<{ 
  success: boolean; 
  message: string;
  stepFailures?: StepFailure[];
}> {
  const targetCategory = category || 'world';
  const stepFailures: StepFailure[] = [];
  const report = (step: string, status: 'done' | 'error', message?: string) => {
    if (onStep) onStep(step, status, message);
  };
  
  try {
    console.log('Starting full pipeline...');
    
    report('fetch', 'done', 'Đang thu thập tin tức...');
    console.log('Fetching feeds...');
    const results = await fetchAllFeeds();
    
    const failedFeeds = results.filter(r => r.error).map(r => ({ 
      step: 'fetch:' + r.source, 
      error: r.error! 
    }));
    
    for (const f of failedFeeds) {
      stepFailures.push(f);
      report(f.step, 'error', f.error);
    }
    
    const allItems = results.filter(r => r.items.length > 0).flatMap(r => r.items);
    const allNormalized = normalizeFeeds(allItems);
    const normalized = targetCategory === 'all' 
      ? allNormalized 
      : filterByCategory(allNormalized, targetCategory);
    
    if (normalized.length === 0) {
      stepFailures.push({ step: 'fetch', error: `No ${targetCategory} news found` });
      report('fetch', 'error', `Không tìm thấy tin ${targetCategory}`);
      return { success: false, message: `No ${targetCategory} news found`, stepFailures };
    }
    
    console.log(`Fetched ${normalized.length} ${targetCategory} items`);
    report('fetch', `Đã thu thập ${normalized.length} tin ${targetCategory}`);
    
    const trendingTopics = findTrendingTopics(normalized, 3);
    console.log('Trending topics:', trendingTopics.map(t => `${t.keyword}(${t.count})`).join(', '));
    
    if (trendingTopics.length > 0) {
      report('trending', 'done', `Chủ đề hot: "${trendingTopics[0].keyword}" (${trendingTopics[0].count} bài)`);
    }
    
    const posted: string[] = [];
    
    if (trendingTopics.length > 0) {
      const topTopic = trendingTopics[0];
      console.log(`Synthesizing topic: ${topTopic.keyword} from ${topTopic.items.length} articles`);
      report('ai-synth', 'done', `Tổng hợp ${topTopic.items.length} bài viết...`);
      
      try {
        const aiResult = await synthesizeWithAI(c, topTopic.keyword, topTopic.items);
        console.log('Synthesized content:', aiResult.content.substring(0, 150));
        
        if (aiResult.isFallback) {
          const alertMsg = `⚠️ *TongHopTinTuc - AI Fallback*\n\nChủ đề: ${topTopic.keyword}\nNội dung: ${aiResult.content.substring(0, 200)}...\n\nAI không generate được, cần kiểm tra!`;
          console.log('AI using fallback, skipping FB post, sending alert');
          await alertError(alertMsg, c.env);
          stepFailures.push({ step: 'ai-synth', error: 'AI Fallback - skipped FB post' });
          report('ai-synth', 'error', 'AI Fallback - alert sent');
        } else {
          report('post-trending', 'done', 'Đang đăng bài...');
          const postResult = await postToPage(c, aiResult.content);
          
          if (postResult.success) {
            posted.push(`Tổng hợp: "${topTopic.keyword}" (${topTopic.items.length} nguồn)`);
            console.log(`Trending posted: ${postResult.postId}`);
            report('post-trending', 'done', 'Đăng thành công!');
          } else {
            stepFailures.push({ step: 'post-trending', error: postResult.error || 'Unknown error' });
            report('post-trending', 'error', postResult.error);
          }
        }
      } catch (err) {
        const errMsg = String(err);
        console.error('Synthesis error:', errMsg);
        stepFailures.push({ step: 'ai-synth', error: errMsg });
        report('ai-synth', 'error', errMsg);
      }
    } else {
      console.log('No trending topics found - skipping synthesis');
      report('trending', 'done', 'Không có chủ đề hot - bỏ qua');
    }
    
    if (stepFailures.length > 0 && posted.length === 0) {
      const errorMsg = stepFailures.map(f => `[${f.step}] ${f.error}`).join('; ');
      console.error('Pipeline errors:', errorMsg);
      return { success: false, message: errorMsg, stepFailures };
    }
    
    if (posted.length > 0) {
      report('done', 'done', 'Hoàn thành!');
      return { success: true, message: `Đã đăng ${posted.length} bài: ${posted.join(' | ')}`, stepFailures };
    }
    
    return { success: false, message: 'Failed to post any news', stepFailures };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Pipeline fatal error:', errorMessage);
    return { success: false, message: errorMessage, stepFailures: [...stepFailures, { step: 'fatal', error: errorMessage }] };
  }
}