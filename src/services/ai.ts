import { rewriteContent } from './gemini';
import { generateImage } from './leonardo';
import type { Env } from '../utils/env';

interface AITarget {
  title: string;
  summary: string;
  source: string;
}

interface AIResult {
  content: string;
  imageUrl?: string;
}

export async function processWithAI(c: { env: Env }, target: AITarget): Promise<AIResult> {
  // Step 1: Rewrite content with Gemini
  const content = await rewriteContent(c, target.title, target.summary, target.source);
  
  // Step 2: Try to generate image (optional, fallback to text-only)
  let imageUrl: string | undefined;
  
  try {
    imageUrl = await generateImage(c.env as { LEONARDO_API_KEYS?: string }, target.title) || undefined;
  } catch (error) {
    console.log('Image generation failed, posting text-only');
  }

  return { content, imageUrl };
}