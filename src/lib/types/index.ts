export type Priority = 1 | 2 | 3;

export interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
  description?: string;
}

export interface CityNews {
  cityName: string;
  priority: Priority;
  articles: NewsArticle[];
  lastUpdated: string;
  aiAnalysis?: string; // Optional AI commentary
}

export interface CacheEntry {
  data: CityNews;
  timestamp: number;
}

export interface RSSFeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  guid?: string;
  isoDate?: string;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: 'red',    // High priority - urgent/important news
  2: 'yellow', // Medium priority - notable news
  3: 'gray',   // Low priority - routine news
};

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds (e.g., 24 hours)
  maxAge: number; // Maximum age before forced refresh
}
