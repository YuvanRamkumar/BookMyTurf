"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Search, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Turf {
    id: string;
    name: string;
    image_url: string;
    sport_type: string;
    location: string;
    price_per_hour: number;
    avgRating?: number;
    reviewCount?: number;
}

export const TurfShowcase = () => {
    const [turfs, setTurfs] = useState<Turf[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTurfs = async () => {
            try {
                const res = await fetch("/api/turfs");
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Limit to 3 for the showcase
                    setTurfs(data.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch turfs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTurfs();
    }, []);

    if (loading) {
        return (
            <div className="py-24 bg-slate-900/30 flex justify-center items-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <section id="explore" className="py-24 bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold text-white mb-4"
                        >
                            Explore <span className="text-green-500">Popular Turfs</span>
                        </motion.h2>
                        <p className="text-slate-400 text-lg">
                            Top rated turfs in your city, vetted for quality and experience.
                        </p>
                    </div>
                    <Link href="/turfs" className="flex items-center space-x-2 text-blue-500 font-bold hover:text-blue-400 transition-colors group">
                        <span>View All Turfs</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {turfs.map((turf, index) => (
                        <motion.div
                            key={turf.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-2xl shadow-slate-950/50 flex flex-col h-full"
                        >
                            <div className="relative h-64 w-full overflow-hidden">
                                <img
                                    src={turf.image_url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop"}
                                    alt={turf.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {turf.sport_type.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1 border border-white/10">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-white text-xs font-bold">{turf.avgRating?.toFixed(1) || "4.5"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                            {turf.name}
                                        </h3>
                                        <div className="flex items-center text-slate-500 text-sm mt-1">
                                            <MapPin size={14} className="mr-1 shrink-0" />
                                            <span className="truncate">{turf.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">Live</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Starts from</span>
                                        <span className="text-xl font-bold text-white">₹{turf.price_per_hour}<span className="text-xs font-normal text-slate-500 ml-1">/hr</span></span>
                                    </div>
                                    <Link
                                        href={`/turfs/${turf.id}`}
                                        className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-blue-600/20 hover:border-blue-600"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

