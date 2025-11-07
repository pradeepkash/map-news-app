'use client';

import { useState, useEffect } from 'react';
import PriorityDot from './PriorityDot';
import type { CityNews, NewsArticle } from '@/lib/types';

interface NewsSidebarProps {
  cityName: string | null;
  onClose: () => void;
}

export default function NewsSidebar({ cityName, onClose }: NewsSidebarProps) {
  const [newsData, setNewsData] = useState<CityNews | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cityName) {
      fetchCityNews(cityName);
    }
  }, [cityName]);

  const fetchCityNews = async (city: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/news/${encodeURIComponent(city)}`);
      const result = await response.json();

      if (result.success) {
        setNewsData(result.data);
      } else {
        setError('Failed to load news');
      }
    } catch (err) {
      console.error('Error fetching city news:', err);
      setError('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  if (!cityName) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-gray-800 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {newsData && <PriorityDot priority={newsData.priority} size="lg" />}
          <h2 className="text-2xl font-bold">{cityName}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          aria-label="Close sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-400">Loading news...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => cityName && fetchCityNews(cityName)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {newsData && !loading && !error && (
          <>
            {/* AI Analysis */}
            {newsData.aiAnalysis && (
              <div className="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-700">
                <p className="text-sm text-blue-200">
                  <span className="font-semibold">City Analysis Summary:</span> {newsData.aiAnalysis}
                </p>
              </div>
            )}

            {/* News Articles */}
            <div className="space-y-4">
              {newsData.articles.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No news articles found</p>
              ) : (
                newsData.articles.map((article: NewsArticle, index: number) => (
                  <article
                    key={index}
                    className="border-b border-gray-700 pb-4 last:border-b-0"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {article.title}
                      </a>
                    </h3>
                    
                    {article.description && (
                      <p className="text-sm text-gray-400 mb-2 line-clamp-3">
                        {article.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {article.source && (
                        <span className="font-medium">{article.source}</span>
                      )}
                      <span>{new Date(article.pubDate).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Last Updated */}
            <div className="mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500 text-center">
              Last updated: {new Date(newsData.lastUpdated).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
