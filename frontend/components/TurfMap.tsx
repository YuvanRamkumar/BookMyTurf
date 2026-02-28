"use client";

import { useState } from "react";
import {
    MapPin,
    Navigation,
    ExternalLink,
    Crosshair,
    Loader2,
    AlertCircle,
    X,
    Route,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
    calculateDistance,
    formatDistance,
    isValidCoordinates,
    getGoogleMapsUrl,
    getGoogleMapsEmbedUrl,
} from "@/lib/geo";

interface TurfMapProps {
    latitude: number;
    longitude: number;
    address: string;
    turfName: string;
    location: string;
}

export default function TurfMap({
    latitude,
    longitude,
    address,
    turfName,
    location,
}: TurfMapProps) {
    const {
        latitude: userLat,
        longitude: userLng,
        loading: geoLoading,
        error: geoError,
        requestLocation,
        clearLocation,
    } = useGeolocation();

    const [manualLocation, setManualLocation] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualCoords, setManualCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const hasValidCoords = isValidCoordinates(latitude, longitude);

    // Determine which user coords to use for distance
    const effectiveLat = manualCoords?.lat ?? userLat;
    const effectiveLng = manualCoords?.lng ?? userLng;

    const distance =
        effectiveLat !== null &&
            effectiveLng !== null &&
            hasValidCoords
            ? calculateDistance(effectiveLat, effectiveLng, latitude, longitude)
            : null;

    const handleManualSearch = async () => {
        if (!manualLocation.trim()) return;

        try {
            // Use Nominatim (free, no API key needed) for geocoding
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    manualLocation
                )}&limit=1`
            );
            const data = await res.json();

            if (data && data.length > 0) {
                setManualCoords({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon),
                });
                setManualLocation(data[0].display_name?.split(",").slice(0, 3).join(",") || manualLocation);
            }
        } catch {
            // Silently fail - user can try again
        }
    };

    const clearManualLocation = () => {
        setManualCoords(null);
        setManualLocation("");
        setShowManualInput(false);
    };

    if (!hasValidCoords) {
        return (
            <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-6 md:col-span-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <MapPin size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-white">Location</h2>
                </div>
                <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                    <MapPin
                        size={48}
                        className="text-white/10 mx-auto mb-4"
                    />
                    <h3 className="text-xl font-bold text-white mb-1">
                        Location not available
                    </h3>
                    <p className="text-slate-500 font-medium">
                        GPS coordinates have not been set for this arena.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-6 md:col-span-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <MapPin size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-white">Location</h2>
                </div>
                {distance !== null && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                        <Route size={14} />
                        <span className="text-sm font-black">
                            {formatDistance(distance)}
                        </span>
                    </div>
                )}
            </div>

            {/* Address */}
            {(address || location) && (
                <div className="flex items-start space-x-3 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <MapPin
                        size={18}
                        className="text-blue-500 mt-0.5 shrink-0"
                    />
                    <div>
                        <p className="font-bold text-white text-sm">
                            {address || location}
                        </p>
                        {address && location && address !== location && (
                            <p className="text-slate-500 text-xs mt-1">
                                {location}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Map Embed */}
            <div className="rounded-[28px] overflow-hidden border border-white/10 shadow-lg relative group">
                <iframe
                    src={getGoogleMapsEmbedUrl(latitude, longitude)}
                    width="100%"
                    height="350"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map showing ${turfName}`}
                    className="w-full"
                />
                {/* Gradient overlay at bottom for aesthetics */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/60 to-transparent pointer-events-none" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Open in Google Maps */}
                <a
                    href={getGoogleMapsUrl(latitude, longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    <ExternalLink size={16} />
                    <span>Open in Google Maps</span>
                </a>

                {/* Use Current Location */}
                <button
                    onClick={requestLocation}
                    disabled={geoLoading}
                    className={cn(
                        "flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold text-sm transition-all border active:scale-95",
                        userLat !== null
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    )}
                >
                    {geoLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Crosshair size={16} />
                    )}
                    <span>
                        {geoLoading
                            ? "Locating..."
                            : userLat !== null
                                ? "Location Found"
                                : "Use My Location"}
                    </span>
                </button>

                {/* Change Location */}
                <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className={cn(
                        "flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold text-sm transition-all border active:scale-95",
                        showManualInput
                            ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                            : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    )}
                >
                    <Navigation size={16} />
                    <span>Change Location</span>
                </button>
            </div>

            {/* Geolocation Error */}
            {geoError && (
                <div className="flex items-start space-x-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <AlertCircle
                        size={16}
                        className="text-rose-400 mt-0.5 shrink-0"
                    />
                    <p className="text-rose-400 text-sm font-medium">
                        {geoError}
                    </p>
                </div>
            )}

            {/* Manual Location Input */}
            {showManualInput && (
                <div className="space-y-3 p-6 bg-white/5 rounded-[24px] border border-white/10">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                        Search Location
                    </label>
                    <div className="flex space-x-3">
                        <input
                            type="text"
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleManualSearch()
                            }
                            placeholder="e.g. Indiranagar, Bangalore"
                            className="flex-1 px-5 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                        />
                        <button
                            type="button"
                            onClick={handleManualSearch}
                            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                        >
                            Search
                        </button>
                        {manualCoords && (
                            <button
                                type="button"
                                onClick={clearManualLocation}
                                className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {manualCoords && (
                        <p className="text-emerald-400 text-xs font-bold flex items-center space-x-2">
                            <MapPin size={12} />
                            <span>
                                Distance from selected location:{" "}
                                {formatDistance(
                                    calculateDistance(
                                        manualCoords.lat,
                                        manualCoords.lng,
                                        latitude,
                                        longitude
                                    )
                                )}
                            </span>
                        </p>
                    )}
                </div>
            )}

            {/* Distance Display from User Location */}
            {userLat !== null && userLng !== null && distance !== null && !manualCoords && (
                <div className="flex items-center space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <Crosshair size={16} className="text-emerald-400 shrink-0" />
                    <p className="text-emerald-400 text-sm font-bold">
                        You are approximately{" "}
                        <span className="text-white">
                            {formatDistance(distance)}
                        </span>{" "}
                        from {turfName}
                    </p>
                    <button
                        onClick={clearLocation}
                        className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={14} className="text-slate-500" />
                    </button>
                </div>
            )}
        </section>
    );
}
