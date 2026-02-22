"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Search, MapPin, Trophy, Star, Filter, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

export default function TurfListing() {
    const [turfs, setTurfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        let url = "/api/turfs";
        const params = new URLSearchParams();
        if (filter !== "All") params.append("sportType", filter);

        const fetchUrl = params.toString() ? `${url}?${params.toString()}` : url;

        fetch(fetchUrl)
            .then(res => res.json())
            .then(data => {
                setTurfs(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [filter]);

    const filteredTurfs = turfs.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Shell>
            <div className="max-w-6xl mx-auto pb-20">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-3">Browse Arenas</h1>
                    <p className="text-slate-500 font-medium text-lg">Find and book the best sports turfs in your city.</p>
                </header>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center space-x-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 w-full lg:max-w-md group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                        <Search className="text-slate-400 h-5 w-5 group-focus-within:text-indigo-500" />
                        <input
                            type="text"
                            placeholder="Search area or venue name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none focus:ring-0 w-full text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center space-x-3 overflow-x-auto pb-2 lg:pb-0">
                        <div className="p-2 bg-slate-50 rounded-xl mr-2">
                            <Filter className="text-slate-400 h-4 w-4" />
                        </div>
                        {["All", "Football/Cricket", "Pickleball"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                                    filter === type
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                                )}
                            >
                                {type === "Football/Cricket" ? "Football" : type}
                            </button>
                        ))}
                    </div>
                </div>

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
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No arenas found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">We couldn't find any results matching your search criteria. Try a different location or sport.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredTurfs.map((turf) => (
                            <Link
                                key={turf.id}
                                href={`/turfs/${turf.id}`}
                                className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 overflow-hidden flex flex-col"
                            >
                                <div className="aspect-[16/11] bg-slate-50 relative overflow-hidden">
                                    {turf.image_url ? (
                                        <img src={turf.image_url} alt={turf.name} className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white transition-all duration-700 group-hover:scale-110">
                                            <Trophy className="w-24 h-24 text-indigo-100 group-hover:rotate-12 transition-all duration-500" />
                                        </div>
                                    )}
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black text-indigo-600 shadow-sm uppercase tracking-widest border border-white/20">
                                        {turf.sport_type}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col pt-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-2xl font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors duration-300">{turf.name}</h3>
                                        <div className="flex items-center px-2 py-1 bg-amber-50 rounded-lg shrink-0 ml-2">
                                            <Star size={14} className="text-amber-500 fill-amber-500" />
                                            <span className="text-xs font-black ml-1 text-amber-700">4.8</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-slate-400 text-sm mb-8 font-bold">
                                        <MapPin size={16} className="mr-2 text-slate-300" />
                                        {turf.location}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-black text-slate-900">{formatCurrency(turf.price_per_hour)}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">/ hr</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-200">
                                            <ArrowRight size={20} />
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
