import type { Env } from '../utils/env';

export interface PostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface PageInfo {
  id: string;
  name: string;
  fan_count: number;
}

export interface FacebookPost {
  caption: string;
  imageUrl?: string;
}

const API_VERSION = 'v25.0';

function getEnvVars(c: { env: Env }): { pageId: string; accessToken: string } {
  if (!c.env.FACEBOOK_PAGE_ID || !c.env.FACEBOOK_ACCESS_TOKEN) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_ACCESS_TOKEN are required');
  }
  return {
    pageId: c.env.FACEBOOK_PAGE_ID,
    accessToken: c.env.FACEBOOK_ACCESS_TOKEN,
  };
}

export async function postToPage(
  c: { env: Env },
  caption: string,
  imageUrl?: string
): Promise<PostResult> {
  const { pageId, accessToken } = getEnvVars(c);
  
  const baseUrl = `https://graph.facebook.com/${API_VERSION}/${pageId}`;
  const params = new URLSearchParams({ access_token: accessToken });

  try {
    let endpoint: string;
    let body: Record<string, string>;

    if (imageUrl) {
      endpoint = `${baseUrl}/photos`;
      body = { url: imageUrl, caption };
    } else {
      endpoint = `${baseUrl}/feed`;
      body = { message: caption };
    }

    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.code === 190) {
        return { success: false, error: 'Token expired or invalid' };
      }
      if (data.error?.code === 4) {
        return { success: false, error: 'Rate limit exceeded' };
      }
      return { success: false, error: data.error?.message || 'API error' };
    }

    return {
      success: true,
      postId: data.id || data.post_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getPageInfo(c: { env: Env }): Promise<PageInfo> {
  const { pageId, accessToken } = getEnvVars(c);
  
  const url = `https://graph.facebook.com/${API_VERSION}/${pageId}?fields=id,name,fan_count&access_token=${accessToken}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to get page info');
  }

  return {
    id: data.id,
    name: data.name,
    fan_count: data.fan_count || 0,
  };
}

export async function validateToken(c: { env: Env }): Promise<boolean> {
  const { accessToken } = getEnvVars(c);
  
  const url = `https://graph.facebook.com/${API_VERSION}/me?access_token=${accessToken}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return !!data.id;
}

export function getRandomDelay(): number {
  return Math.floor(Math.random() * 15 * 60 * 1000);
}

const HOOK_PHRASES = ['Mới nhất:', 'Cập nhật:', 'Hot:', 'Thông tin mới:', 'Chú ý:'];

export function getRandomHook(): string {
  return HOOK_PHRASES[Math.floor(Math.random() * HOOK_PHRASES.length)];
}

let lastPostTime = 0;
const MIN_POST_INTERVAL = 60 * 60 * 1000;

export function canPost(): boolean {
  return Date.now() - lastPostTime >= MIN_POST_INTERVAL;
}

export function markPosted(): void {
  lastPostTime = Date.now();
}