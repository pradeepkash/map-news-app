'use client';

import { useState } from 'react';
import CityList from '@/components/CityList';
import NewsSidebar from '@/components/NewsSidebar';
import dynamic from 'next/dynamic';

// Dynamically import MapDisplay to avoid SSR issues with Leaflet
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
      <div className="text-white text-lg">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
  };

  const handleCloseSidebar = () => {
    setSelectedCity(null);
  };

  return (
    <main className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">
            <a href='/'>Mapped News</a>
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time news updates mapped to cities
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-white">Interactive News Map</h2>
              <p className="text-gray-400 mb-4">Click on any city marker to view its news</p>
              <MapDisplay onCitySelect={handleCitySelect} selectedCity={selectedCity || undefined} />
            </div>
          </div>

          {/* City List Section - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <CityList onCitySelect={handleCitySelect} selectedCity={selectedCity || undefined} />
            
            {/* Info Card */}
            <div className="mt-8 bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-3">
                Features
              </h2>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>News for each city</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Simultaneously showcase of news priority</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>AI analyzes for each city&apos;s news</span>
                </li>
              </ul>
              <p><a href="http://localhost:3000/page/about" className='text-red-400 underline hover:text-red-300'>About Us and How it works</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* News Sidebar */}
      {selectedCity && (
        <NewsSidebar cityName={selectedCity} onClose={handleCloseSidebar} />
      )}

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
            <p>Map Based News System! Coming Soon...</p>
        </div>
      </footer>
    </main>
  );
}
