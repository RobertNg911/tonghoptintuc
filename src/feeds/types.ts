export interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  pubDate: Date;
  source: string;
  sourceCategory: 'world' | 'tech';
}

export interface FeedSource {
  name: string;
  url: string;
  category: 'world' | 'tech';
}

export interface FeedFetchResult {
  source: string;
  items: NewsItem[];
  error?: string;
  fetchedAt: Date;
}