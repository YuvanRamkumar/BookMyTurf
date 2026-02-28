"use client";

import Shell from "@/components/Shell";
import { useEffect, useState, useCallback } from "react";
import { Search, MapPin, Trophy, Star, Filter, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

const PRICE_PRESETS = [
    { label: "Any", min: 0, max: 10000 },
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 – ₹1000", min: 500, max: 1000 },
    { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
    { label: "Above ₹2000", min: 2000, max: 10000 },
];

const MAX_SLIDER = 10000;

export default function TurfListing() {
    const [turfs, setTurfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sportFilter, setSportFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [maxPrice, setMaxPrice] = useState(MAX_SLIDER);
    const [activePreset, setActivePreset] = useState("Any");
    const [showPricePanel, setShowPricePanel] = useState(false);

    const fetchTurfs = useCallback(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (sportFilter !== "All") params.append("sportType", sportFilter);

        fetch(`/api/turfs${params.toString() ? `?${params}` : ""}`)
            .then(res => res.json())
            .then(data => {
                setTurfs(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [sportFilter]);

    useEffect(() => { fetchTurfs(); }, [fetchTurfs]);

    const applyPreset = (preset: typeof PRICE_PRESETS[number]) => {
        setActivePreset(preset.label);
        setMaxPrice(preset.max === Infinity ? MAX_SLIDER : preset.max);
    };

    const handleSliderChange = (val: number) => {
        setMaxPrice(val);
        setActivePreset("Custom");
    };

    const clearPriceFilter = () => {
        setMaxPrice(MAX_SLIDER);
        setActivePreset("Any");
    };

    // Client-side final filter (price + search)
    const filteredTurfs = turfs.filter(t => {
        const matchesSearch =
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = t.price_per_hour <= maxPrice;
        return matchesSearch && matchesPrice;
    });

    const priceFilterActive = activePreset !== "Any";

    return (
        <Shell>
            <div className="max-w-6xl mx-auto pb-20">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Browse Arenas</h1>
                    <p className="text-slate-400 font-medium text-lg">Find and book the best sports turfs in your city.</p>
                </header>

                {/* Filter bar */}
                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm mb-10 space-y-4">
                    {/* Row 1: Search + Price toggle */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3.5 rounded-2xl border border-slate-100 flex-1 group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                            <Search className="text-slate-400 h-4 w-4 shrink-0 group-focus-within:text-indigo-500" />
                            <input
                                type="text"
                                placeholder="Search venue or area..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 w-full text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-slate-300 hover:text-slate-500">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Price filter toggle button */}
                        <button
                            onClick={() => setShowPricePanel(p => !p)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border whitespace-nowrap",
                                priceFilterActive
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                                    : "bg-slate-50 text-slate-600 border-slate-100 hover:border-indigo-200 hover:text-indigo-600"
                            )}
                        >
                            <SlidersHorizontal size={16} />
                            {priceFilterActive ? `Up to ${formatCurrency(maxPrice)}` : "Price Filter"}
                            {priceFilterActive && (
                                <span
                                    onClick={(e) => { e.stopPropagation(); clearPriceFilter(); }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X size={13} />
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Price panel — expandable */}
                    {showPricePanel && (
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-black text-slate-700">Max Price per Hour</span>
                                <span className="text-lg font-black text-indigo-600">
                                    {maxPrice >= MAX_SLIDER ? "Any" : formatCurrency(maxPrice)}
                                </span>
                            </div>

                            {/* Slider */}
                            <div className="relative">
                                <input
                                    type="range"
                                    min={100}
                                    max={MAX_SLIDER}
                                    step={100}
                                    value={maxPrice}
                                    onChange={e => handleSliderChange(Number(e.target.value))}
                                    className="w-full h-2 appearance-none rounded-full cursor-pointer accent-indigo-600"
                                    style={{
                                        background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${((maxPrice - 100) / (MAX_SLIDER - 100)) * 100}%, #e2e8f0 ${((maxPrice - 100) / (MAX_SLIDER - 100)) * 100}%, #e2e8f0 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1.5">
                                    <span>₹100</span>
                                    <span>₹{MAX_SLIDER}</span>
                                </div>
                            </div>

                            {/* Quick preset chips */}
                            <div className="flex flex-wrap gap-2">
                                {PRICE_PRESETS.map(preset => (
                                    <button
                                        key={preset.label}
                                        onClick={() => applyPreset(preset)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                            activePreset === preset.label
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                        )}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Row 2: Sport type chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        <div className="p-2 bg-slate-50 rounded-xl shrink-0">
                            <Filter className="text-slate-400 h-4 w-4" />
                        </div>
                        {["All", "Football/Cricket", "Pickleball"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setSportFilter(type)}
                                className={cn(
                                    "px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                                    sportFilter === type
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                )}
                            >
                                {type === "Football/Cricket" ? "⚽ Football / Cricket" : type === "Pickleball" ? "🏓 Pickleball" : "All Sports"}
                            </button>
                        ))}
                    </div>

                    {/* Active filter summary */}
                    {(priceFilterActive || sportFilter !== "All" || searchQuery) && (
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold pt-1 border-t border-slate-100">
                            <span>Showing {filteredTurfs.length} result{filteredTurfs.length !== 1 ? "s" : ""}</span>
                            {priceFilterActive && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">Up to {formatCurrency(maxPrice)}/hr</span>}
                            {sportFilter !== "All" && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">{sportFilter}</span>}
                            {searchQuery && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">"{searchQuery}"</span>}
                        </div>
                    )}
                </div>

                {/* Turf grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-[400px] bg-white animate-pulse rounded-[40px] border border-slate-100" />
                        ))}
                    </div>
                ) : filteredTurfs.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2">No arenas found</h3>
                        <p className="text-slate-400 max-w-sm mx-auto font-medium">
                            Try adjusting your filters or search query.
                        </p>
                        <button
                            onClick={() => { setSportFilter("All"); clearPriceFilter(); setSearchQuery(""); }}
                            className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTurfs.map((turf) => (
                            <Link
                                key={turf.id}
                                href={`/turf/${turf.id}`}
                                className={cn(
                                    "group bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/5 shadow-2xl hover:border-indigo-500/50 transition-all duration-500 overflow-hidden flex flex-col",
                                    turf.operational_status !== 'ACTIVE' && "grayscale opacity-80 bg-slate-800/50"
                                )}
                            >
                                <div className="aspect-[16/11] bg-slate-50 relative overflow-hidden">
                                    {turf.image_url ? (
                                        <img src={turf.image_url} alt={turf.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white transition-all duration-700 group-hover:scale-110">
                                            <Trophy className="w-24 h-24 text-indigo-100 group-hover:rotate-12 transition-all duration-500" />
                                        </div>
                                    )}
                                    <div className="absolute top-5 left-5">
                                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-widest border border-white/20">
                                            {turf.sport_type === 'FOOTBALL_CRICKET' ? 'FOOTBALL / CRICKET' : turf.sport_type}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900/50 to-transparent" />
                                </div>

                                <div className="p-7 flex-1 flex flex-col pt-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-black text-white truncate group-hover:text-indigo-400 transition-colors duration-300">
                                            {turf.name}
                                        </h3>
                                        <div className="flex items-center px-2 py-1 bg-amber-400/10 border border-amber-400/20 rounded-lg shrink-0 ml-2">
                                            <Star size={13} className="text-amber-400 fill-amber-400" />
                                            <span className="text-xs font-black ml-1 text-amber-400">{turf.avgRating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-slate-400 text-sm mb-2 font-bold">
                                        <MapPin size={14} className="mr-1.5 text-slate-300" />
                                        {turf.location}
                                    </div>

                                    {turf.operational_status !== 'ACTIVE' && (
                                        <div className={cn(
                                            "inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border w-fit mb-4",
                                            turf.operational_status === 'MAINTENANCE' ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200"
                                        )}>
                                            {turf.operational_status === 'MAINTENANCE' ? '🛠️ Under Maintenance' : '🔒 Temporarily Closed'}
                                        </div>
                                    )}

                                    <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-black text-white">{formatCurrency(turf.price_per_hour)}</span>
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">/ hr</span>
                                        </div>
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
