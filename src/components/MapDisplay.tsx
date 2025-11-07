'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Priority } from '@/lib/types';
import { MAJOR_CITIES } from '@/lib/data/cities';

interface CityData {
  cityName: string;
  priority: Priority;
  lastUpdated: string;
}

// icons
const createPriorityIcon = (priority: Priority) => {
  const color = priority === 1 ? '#ef4444' : priority === 2 ? '#f59e0b' : '#10b981';
  
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
      <circle cx="20" cy="20" r="6" fill="white" opacity="0.3"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// bounds
const INDIA_BOUNDS: L.LatLngBoundsExpression = [
    [6.5, 68.0],    // Southwest coordinates (bottom-left)
    [35.5, 97.5]    // Northeast coordinates (top-right)
];

function SetBounds() {
    const map = useMap();

    useEffect(() => {
        map.setMaxBounds(INDIA_BOUNDS);
        map.fitBounds(INDIA_BOUNDS);
    }, [map]);

    return null;
}

interface MapDisplayProps {
  onCitySelect: (cityName: string) => void;
  selectedCity?: string;
}

export default function MapComponent({ onCitySelect, selectedCity }: MapDisplayProps) {
    const [cities, setCities] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            setLoading(true);
            
            const response = await fetch('/api/cities');
            const result = await response.json();

            if (result.success) {
                setCities(result.data);
            } else {
                console.error('Failed to load cities');
            }
        } catch (err) {
            console.error('Error fetching cities:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCityCoordinates = (cityName: string) => {
        const city = MAJOR_CITIES.find(c => c.name === cityName);
        return city ? [city.lat!, city.lng!] as [number, number] : null;
    };

    const getPriorityLabel = (priority: Priority) => {
        switch (priority) {
            case 1: return 'Urgent';
            case 2: return 'Notable';
            case 3: return 'Routine';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="h-[600px] w-full rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
                <div className="text-white text-lg">Loading map...</div>
            </div>
        );
    }

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden">
            <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5}
                minZoom={5}
                maxZoom={6}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                maxBounds={INDIA_BOUNDS}
                maxBoundsViscosity={1.0}
                attributionControl={false}
            >
                <SetBounds />

                {/* Dark Mode Tile Layer */}
                <TileLayer
                    attribution='Pradeep Kashnia'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Dynamic City Markers */}
                {cities.map((city) => {
                    const coords = getCityCoordinates(city.cityName);
                    if (!coords) return null;

                    return (
                        <Marker
                            key={city.cityName}
                            position={coords}
                            icon={createPriorityIcon(city.priority)}
                            eventHandlers={{
                                click: () => onCitySelect(city.cityName),
                            }}
                        >
                            <Popup>
                                <div className="text-sm min-w-[200px]">
                                    <strong className="text-lg block mb-2">{city.cityName}</strong>
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2">
                                            <span className="font-semibold">Priority:</span>
                                            <span className={`
                                                px-2 py-0.5 rounded text-xs font-medium
                                                ${city.priority === 1 ? 'bg-red-100 text-red-800' : ''}
                                                ${city.priority === 2 ? 'bg-amber-100 text-amber-800' : ''}
                                                ${city.priority === 3 ? 'bg-green-100 text-green-800' : ''}
                                            `}>
                                                {getPriorityLabel(city.priority)}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Updated: {new Date(city.lastUpdated).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onCitySelect(city.cityName)}
                                        className="mt-3 w-full px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                                    >
                                        View News
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}