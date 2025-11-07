// about us page containing how it works section and features
'use client';

import { useState } from 'react';
import CityList from '@/components/CityList';
import NewsSidebar from '@/components/NewsSidebar';

export default function AboutUs() {

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
                <div className="flex flex-col items-center justify-center">                  
                  {/* Info Card */}
                  <div className="mt-8 max-w-md bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-3">
                      How it works
                    </h2>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>News is fetched from Google News RSS feeds for each city</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>AI analyzes news importance and assigns priority levels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Data is cached and refreshed daily to optimize performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>Click on a city to view its latest news headlines</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            {/* Footer */}
            <footer className="bg-gray-800 border-t border-gray-700 mt-16">
                <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
                    <p>Map Based News System! Coming Soon...</p>
                    <p><a href="" className="text-blue-400 hover:text-blue-300">About Us and How it works</a></p>
                </div>
            </footer>
        </main>
    );
}