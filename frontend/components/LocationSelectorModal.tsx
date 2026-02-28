"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Search, CheckCircle2 } from 'lucide-react';
import { useLocation } from '@/lib/LocationContext';

const COMMON_AREAS = [
    "Gandhipuram",
    "Ganapathy",
    "Peelamedu",
    "RS Puram",
    "Saibaba Colony",
    "Saravanampatti",
    "Kovaipudur",
    "Vadavalli",
    "Ramanathapuram",
    "Race Course"
];

interface LocationSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LocationSelectorModal({ isOpen, onClose }: LocationSelectorModalProps) {
    const { locationState, setLocationMode, setCoordinates, setAreaDetails } = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isLocating, setIsLocating] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);

    const filteredAreas = COMMON_AREAS.filter(area =>
        area.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUseGPS = () => {
        setIsLocating(true);
        setGeoError(null);

        if (!("geolocation" in navigator)) {
            setGeoError("Geolocation is not supported by your browser");
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
                        headers: { 'Accept-Language': 'en-US,en' }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.county || "Coimbatore";
                        const area = data.address?.suburb || data.address?.village || data.address?.residential || city;

                        setAreaDetails(area, city);
                    }
                } catch (e) {
                    console.error("Reverse geocoding failed", e);
                }

                setCoordinates(latitude, longitude);
                setLocationMode('GPS');
                setIsLocating(false);
                onClose();
            },
            (error) => {
                setGeoError("Unable to retrieve your location. Please check your permissions.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSelectArea = (area: string) => {
        setLocationMode('AREA');
        setAreaDetails(area, "Coimbatore"); // Defaulting city to Coimbatore
        setCoordinates(0, 0); // Clear coordinates so we rely exclusively on Area string
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Location</h2>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Current Location Button */}
                        <div>
                            <button
                                onClick={handleUseGPS}
                                disabled={isLocating}
                                className="w-full flex items-center p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                    <Navigation className={`w-5 h-5 ${isLocating ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-bold text-blue-900">Detect my location</div>
                                    <div className="text-xs text-blue-600/70 font-medium">Using GPS for nearest turfs</div>
                                </div>
                                {locationState.mode === 'GPS' && !isLocating && (
                                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                )}
                            </button>
                            {geoError && (
                                <p className="mt-2 text-xs font-bold text-rose-500 px-2">{geoError}</p>
                            )}
                        </div>

                        <div className="relative flex items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-black text-slate-400 uppercase tracking-widest">Or select manually</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search areas in Coimbatore..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm font-medium"
                            />
                        </div>

                        {/* Area List */}
                        <div className="max-h-[240px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                            {filteredAreas.length > 0 ? (
                                filteredAreas.map(area => {
                                    const isSelected = locationState.mode === 'AREA' && locationState.area === area;
                                    return (
                                        <button
                                            key={area}
                                            onClick={() => handleSelectArea(area)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${isSelected ? 'bg-slate-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <MapPin className={`w-4 h-4 mr-3 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                                                <span className="font-bold">{area}</span>
                                            </div>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-slate-500 text-sm font-medium">
                                    No areas found matching "{searchQuery}"
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
