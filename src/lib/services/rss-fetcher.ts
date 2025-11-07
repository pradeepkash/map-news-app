import Parser from 'rss-parser';
import type { NewsArticle, RSSFeedItem } from '../types';

const parser = new Parser();

export function buildGoogleNewsURL(cityName: string): string {
  const encodedCity = encodeURIComponent(cityName);
  return `https://news.google.com/rss/search?q=${encodedCity}&hl=en-IN&gl=IN&ceid=IN:en`;
}

export async function fetchCityNews(cityName: string): Promise<NewsArticle[]> {
  try {
    const url = buildGoogleNewsURL(cityName);
    const feed = await parser.parseURL(url);

    // Transform RSS items to our NewsArticle format
    const articles: NewsArticle[] = feed.items.map((item: RSSFeedItem) => ({
      title: item.title || 'No title',
      link: item.link || '#',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: extractSource(item.title),
      description: item.contentSnippet || item.content || '',
    }));

    return articles;
  } catch (error) {
    console.error(`Error fetching news for ${cityName}:`, error);
    throw new Error(`Failed to fetch news for ${cityName}`);
  }
}

function extractSource(title?: string): string | undefined {
  if (!title) return undefined;
  
  const parts = title.split(' - ');
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  
  return undefined;
}

export async function fetchMultipleCitiesNews(
  cityNames: string[]
): Promise<Map<string, NewsArticle[]>> {
  const results = new Map<string, NewsArticle[]>();

  // Fetch all cities in parallel
  const promises = cityNames.map(async (cityName) => {
    try {
      const articles = await fetchCityNews(cityName);
      return { cityName, articles };
    } catch (error) {
      console.error(`Failed to fetch news for ${cityName}:`, error);
      return { cityName, articles: [] };
    }
  });

  const allResults = await Promise.all(promises);

  // Build the results map
  allResults.forEach(({ cityName, articles }) => {
    results.set(cityName, articles);
  });

  return results;
}
