'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CityList from '@/components/CityList';
import NewsSidebar from '@/components/NewsSidebar';

// Import Leaflet map dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapDisplay'), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] flex items-center justify-center bg-gray-800 rounded-lg">
            <p className="text-white">Loading map...</p>
        </div>
    )
});

export default function AboutUs() {
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
                <div className="flex flex-col items-center justify-center">
                    {/* Map Card */}
                    <div className="mt-8 w-full max-w-5xl bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                        <MapComponent onCitySelect={handleCitySelect} selectedCity={selectedCity || undefined} />
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
                    <p><a href="" className="text-blue-400 hover:text-blue-300">About Us and How it works</a></p>
                </div>
            </footer>
        </main>
    );
}