import { getCityNames } from '../data/cities';
import { fetchCityNews, fetchMultipleCitiesNews } from './rss-fetcher';
import { analyzeNewsPriority, batchAnalyzeNews } from './ai-analyzer';
import { getCachedNews, setCachedNews, getCachedCities } from './cache-manager';
import type { CityNews, NewsArticle, Priority } from '../types';

export async function getCityNewsWithPriority(
  cityName: string,
  forceRefresh = false
): Promise<CityNews> {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedNews(cityName);
    if (cached) {
      return cached;
    }
  }

  try {
    // Fetch news articles
    const articles = await fetchCityNews(cityName);

    // Analyze priority with AI
    const { priority, analysis } = await analyzeNewsPriority(cityName, articles);

    // Create CityNews object
    const cityNews: CityNews = {
      cityName,
      priority,
      articles,
      lastUpdated: new Date().toISOString(),
      aiAnalysis: analysis,
    };

    // Cache the result
    setCachedNews(cityName, cityNews);

    return cityNews;
  } catch (error) {
    console.error(`Error getting news for ${cityName}:`, error);
    
    // Return empty result with low priority
    return {
      cityName,
      priority: 3,
      articles: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getAllCitiesNews(
  forceRefresh = false
): Promise<CityNews[]> {
  const cityNames = getCityNames();
  const results: CityNews[] = [];

  // If not forcing refresh, try to get from cache
  if (!forceRefresh) {
    const cachedCities = getCachedCities();
    const allCached = cityNames.every((city) => cachedCities.includes(city));

    if (allCached) {
      // All cities are cached, return cached data
      for (const cityName of cityNames) {
        const cached = getCachedNews(cityName);
        if (cached) {
          results.push(cached);
        }
      }
      return results;
    }
  }

  try {
    // Fetch news for all cities
    console.log('Fetching news for all cities...');
    const cityNewsMap = await fetchMultipleCitiesNews(cityNames);

    // Analyze priorities with AI
    console.log('Analyzing news priorities with AI...');
    const priorityMap = await batchAnalyzeNews(cityNewsMap);

    // Combine results
    const entries = Array.from(cityNewsMap.entries());
    for (const [cityName, articles] of entries) {
      const priorityData = priorityMap.get(cityName) || { priority: 3 as Priority };

      const cityNews: CityNews = {
        cityName,
        priority: priorityData.priority,
        articles,
        lastUpdated: new Date().toISOString(),
        aiAnalysis: priorityData.analysis,
      };

      // Cache the result
      setCachedNews(cityName, cityNews);
      results.push(cityNews);
    }

    return results;
  } catch (error) {
    console.error('Error fetching all cities news:', error);
    return [];
  }
}

export async function getCitiesSummary(): Promise<
  Array<{ cityName: string; priority: Priority; lastUpdated: string }>
> {
  const allNews = await getAllCitiesNews();
  
  return allNews.map((cityNews) => ({
    cityName: cityNews.cityName,
    priority: cityNews.priority,
    lastUpdated: cityNews.lastUpdated,
  }));
}

export async function refreshAllCitiesNews(): Promise<void> {
  console.log('Starting daily news refresh...');
  await getAllCitiesNews(true);
  console.log('Daily news refresh completed.');
}
