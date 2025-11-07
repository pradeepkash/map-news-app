'use client';

import { useState, useEffect } from 'react';
import PriorityDot from './PriorityDot';
import type { Priority } from '@/lib/types';

interface CityData {
  cityName: string;
  priority: Priority;
  lastUpdated: string;
}

interface CityListProps {
  onCitySelect: (cityName: string) => void;
  selectedCity?: string;
}

export default function CityList({ onCitySelect, selectedCity }: CityListProps) {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/cities');
      const result = await response.json();

      if (result.success) {
        // Sort by priority (1 first, then 2, then 3)
        const sorted = result.data.sort((a: CityData, b: CityData) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return a.cityName.localeCompare(b.cityName);
        });
        setCities(sorted);
      } else {
        setError('Failed to load cities');
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-gray-400">Loading cities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-400">{error}</div>
        <button
          onClick={fetchCities}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Indian Cities News</h2>
        
        <div className="space-y-2">
          {cities.map((city) => (
            <button
              key={city.cityName}
              onClick={() => onCitySelect(city.cityName)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-all duration-200
                ${
                  selectedCity === city.cityName
                    ? 'bg-blue-900 border-2 border-blue-500'
                    : 'bg-gray-700 border-2 border-transparent hover:bg-gray-600'
                }
              `}
            >
              <span className="flex items-center gap-3">
                <PriorityDot priority={city.priority} size="md" />
                <span className="text-lg font-medium text-white">
                  {city.cityName}
                </span>
              </span>
              <span className="text-xs text-gray-400">
                {city.priority === 1 && 'High'}
                {city.priority === 2 && 'Medium'}
                {city.priority === 3 && 'Low'}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <PriorityDot priority={1} size="sm" />
                <span>Urgent</span>
              </div>
              <div className="flex items-center gap-1">
                <PriorityDot priority={2} size="sm" />
                <span>Notable</span>
              </div>
              <div className="flex items-center gap-1">
                <PriorityDot priority={3} size="sm" />
                <span>Routine</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={fetchCities}
          className="mt-4 w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
