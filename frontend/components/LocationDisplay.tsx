"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, Navigation, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationDisplay() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Location not supported");
            setLoading(false);
            return;
        }

        const fetchLocation = async () => {
            try {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setLocation({ lat: latitude, lng: longitude });

                        try {
                            // Reverse geocode using Nominatim API (free, no key needed)
                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
                                headers: {
                                    'Accept-Language': 'en-US,en'
                                }
                            });

                            if (res.ok) {
                                const data = await res.json();
                                // Try to extract the best meaningful location name
                                const placeName = data.address?.city ||
                                    data.address?.town ||
                                    data.address?.village ||
                                    data.address?.suburb ||
                                    data.address?.county ||
                                    "Current Location";

                                setAddress(placeName);
                            } else {
                                setAddress("Location detected");
                            }
                        } catch (e) {
                            setAddress("Location detected");
                        }
                        setLoading(false);
                        setPermissionDenied(false);
                        setError(null);
                    },
                    (err) => {
                        setLoading(false);
                        if (err.code === err.PERMISSION_DENIED) {
                            setPermissionDenied(true);
                            setError("Enable location access");
                        } else {
                            setError("Unable to find location");
                        }
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } catch (err) {
                setLoading(false);
                setError("Location error");
            }
        };

        fetchLocation();
    }, []);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        setPermissionDenied(false);
        // Force re-render effect essentially
        navigator.geolocation.getCurrentPosition(
            () => { window.location.reload(); },
            () => { setLoading(false); setError("Still unable to access"); }
        );
    }

    return (
        <div className="relative group cursor-pointer">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2 px-3 py-2 bg-slate-100 rounded-xl"
                    >
                        <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Locating...</span>
                    </motion.div>
                ) : error || permissionDenied ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleRetry}
                        className="flex items-center space-x-2 px-3 py-2 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                        <span className="text-[11px] font-bold text-rose-600 uppercase tracking-widest truncate max-w-[120px]">
                            {error}
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-blue-600 relative z-10" />
                            <div className="absolute inset-0 bg-blue-400 blur-sm rounded-full opacity-50 animate-pulse"></div>
                        </div>
                        <span className="text-[12px] font-bold text-blue-700 truncate max-w-[120px]">
                            {address}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tooltip */}
            {!loading && location && (
                <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    <div className="bg-slate-900 text-white text-[10px] py-1.5 px-3 rounded-lg shadow-xl font-mono whitespace-nowrap border border-slate-700">
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                </div>
            )}
        </div>
    );
}
