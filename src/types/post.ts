export interface PostContent {
  title: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
}

export interface AIGenerateRequest {
  title: string;
  summary: string;
  source: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

export interface LeonardoImage {
  url: string;
  id: string;
}