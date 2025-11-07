import fs from 'fs';
import path from 'path';
import type { CityNews, CacheEntry } from '../types';

// In-memory cache
const memoryCache = new Map<string, CacheEntry>();

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_DIR = path.join(process.cwd(), 'cache');

function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCacheFilePath(cityName: string): string {
  return path.join(CACHE_DIR, `${cityName.toLowerCase()}.json`);
}

export function isCacheValid(timestamp: number): boolean {
  const now = Date.now();
  return now - timestamp < CACHE_TTL;
}

export function getCachedNews(cityName: string): CityNews | null {
  // Check memory cache first
  const memoryEntry = memoryCache.get(cityName);
  if (memoryEntry && isCacheValid(memoryEntry.timestamp)) {
    return memoryEntry.data;
  }

  // Check file cache
  try {
    const filePath = getCacheFilePath(cityName);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const entry: CacheEntry = JSON.parse(fileContent);

      if (isCacheValid(entry.timestamp)) {
        // Restore to memory cache
        memoryCache.set(cityName, entry);
        return entry.data;
      } else {
        // Cache expired, delete the file
        fs.unlinkSync(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading cache for ${cityName}:`, error);
  }

  return null;
}

export function setCachedNews(cityName: string, data: CityNews): void {
  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
  };

  // Save to memory cache
  memoryCache.set(cityName, entry);

  // Save to file cache
  try {
    ensureCacheDir();
    const filePath = getCacheFilePath(cityName);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing cache for ${cityName}:`, error);
  }
}
export function getCachedCities(): string[] {
  const cities: string[] = [];

  // Check memory cache
  memoryCache.forEach((entry, cityName) => {
    if (isCacheValid(entry.timestamp)) {
      cities.push(cityName);
    }
  });

  // Check file cache
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const cityName = file.replace('.json', '');
          const entry = getCachedNews(cityName);
          if (entry && !cities.includes(cityName)) {
            cities.push(cityName);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error reading cache directory:', error);
  }

  return cities;
}

export function clearAllCache(): void {
  // Clear memory cache
  memoryCache.clear();

  // Clear file cache
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      files.forEach((file) => {
        const filePath = path.join(CACHE_DIR, file);
        fs.unlinkSync(filePath);
      });
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

export function clearCityCache(cityName: string): void {
  // Clear from memory
  memoryCache.delete(cityName);

  // Clear from file
  try {
    const filePath = getCacheFilePath(cityName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error clearing cache for ${cityName}:`, error);
  }
}
