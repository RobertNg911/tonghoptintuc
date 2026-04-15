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
  const token = c.env.FB_TOKEN || c.env.FACEBOOK_ACCESS_TOKEN;
  if (!c.env.FACEBOOK_PAGE_ID || !token) {
    throw new Error('FACEBOOK_PAGE_ID and FB_TOKEN are required');
  }
  return {
    pageId: c.env.FACEBOOK_PAGE_ID,
    accessToken: token,
  };
}

async function uploadPhotoFromBase64(
  c: { env: Env },
  imageBase64: string,
  caption: string
): Promise<PostResult> {
  const { pageId, accessToken } = getEnvVars(c);
  
  try {
    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = imageBase64.split(',')[1];
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create FormData with the image
    const formData = new FormData();
    const blob = new Blob([bytes], { type: 'image/png' });
    formData.append('source', blob, 'image.png');
    formData.append('caption', caption);
    
    // Upload to Facebook
    const url = `https://graph.facebook.com/${API_VERSION}/${pageId}/photos?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.code === 190) {
        return { success: false, error: 'Token expired or invalid' };
      }
      if (data.error?.code === 4) {
        return { success: false, error: 'Rate limit exceeded' };
      }
      return { success: false, error: data.error?.message || 'Upload error' };
    }

    return {
      success: true,
      postId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function postToPage(
  c: { env: Env },
  caption: string,
  imageUrl?: string
): Promise<PostResult> {
  const { pageId, accessToken } = getEnvVars(c);
  
  const baseUrl = `https://graph.facebook.com/${API_VERSION}/${pageId}`;

  try {
    // Handle base64 images using FormData upload
    if (imageUrl && imageUrl.startsWith('data:')) {
      console.log('Uploading base64 image to Facebook...');
      return await uploadPhotoFromBase64(c, imageUrl, caption);
    }

    // Handle URL images (existing method)
    if (imageUrl) {
      const url = `${baseUrl}/photos?access_token=${accessToken}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl, caption }),
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
    }

    // Text-only post
    const url = `${baseUrl}/feed?access_token=${accessToken}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: caption }),
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
  const { pageId, accessToken } = getEnvVars(c);
  
  console.log('Validating with pageId:', pageId, 'token length:', accessToken.length);
  
  const url = `https://graph.facebook.com/${API_VERSION}/me?access_token=${accessToken}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Token validation response:', JSON.stringify(data).substring(0, 200));
  
  if (!response.ok || data.error) {
    return false;
  }
  
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