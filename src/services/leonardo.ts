import type { LeonardoImage } from '../types/post';

interface LeonardoEnv {
  LEONARDO_API_KEYS?: string;
}

let currentKeyIndex = 0;

function getKeys(env: LeonardoEnv): string[] {
  if (!env.LEONARDO_API_KEYS) {
    return [];
  }
  return env.LEONARDO_API_KEYS.split(',').map(k => k.trim()).filter(k => k);
}

function getNextKey(env: LeonardoEnv): string | null {
  const keys = getKeys(env);
  if (keys.length === 0) return null;
  return keys[currentKeyIndex % keys.length];
}

export function rotateKey(): void {
  currentKeyIndex++;
}

export async function generateImage(
  env: LeonardoEnv,
  prompt: string,
  width: number = 1024,
  height: number = 1024
): Promise<string | null> {
  const keys = getKeys(env);
  if (keys.length === 0) {
    console.log('Leonardo.ai: No API keys configured');
    return null;
  }

  const imagePrompt = `${prompt}, professional, flat design, vibrant colors, social media post, ${width}x${height}`;

  for (let i = 0; i < keys.length; i++) {
    const key = getNextKey(env);
    if (!key) break;

    try {
      const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          width,
          height,
          model_id: 'ac6146e5-d4c3-4a9d-9c1f-1c8e5f8d7b3a', // Default model
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('quota') || errorText.includes('credits') || errorText.includes('rate_limit')) {
          rotateKey();
          console.log(`Leonardo.ai: Quota exceeded, rotating to next key`);
          continue;
        }
        throw new Error(`Leonardo API error: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.generations?.[0]?.url) {
        console.log(`Leonardo.ai: Image generated successfully with key ${currentKeyIndex + 1}`);
        return data.generations[0].url;
      }
      
      // If no immediate URL, polling may be needed - for now return null as fallback
      console.log('Leonardo.ai: No image URL in response, using fallback');
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('quota') || errorMessage.includes('credits')) {
        rotateKey();
        console.log(`Leonardo.ai: Quota error, rotating to next key`);
        continue;
      }
      console.error('Leonardo.ai error:', errorMessage);
    }
  }

  console.log('Leonardo.ai: All keys failed or quota exceeded');
  return null;
}