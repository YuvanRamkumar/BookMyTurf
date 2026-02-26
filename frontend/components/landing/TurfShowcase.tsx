"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Search, ChevronRight } from "lucide-react";

const mockTurfs = [
    {
        id: 1,
        name: "Victory Arena",
        image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
        sport: "Football",
        location: "Koramangala, Bangalore",
        distance: "1.2 km away",
        rating: 4.8,
        reviews: 124,
        price: 1200,
    },
    {
        id: 2,
        name: "Thunder Sports Center",
        image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop",
        sport: "Cricket",
        location: "Indiranagar, Bangalore",
        distance: "3.5 km away",
        rating: 4.6,
        reviews: 89,
        price: 1500,
    },
    {
        id: 3,
        name: "Prime Turf Hub",
        image: "https://images.unsplash.com/photo-1517466788219-7f57b1f30745?q=80&w=800&auto=format&fit=crop",
        sport: "Multi-sport",
        location: "HSR Layout, Bangalore",
        distance: "2.1 km away",
        rating: 4.9,
        reviews: 210,
        price: 1000,
    },
];

export const TurfShowcase = () => {
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
                    <button className="flex items-center space-x-2 text-blue-500 font-bold hover:text-blue-400 transition-colors group">
                        <span>View All Turfs</span>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockTurfs.map((turf, index) => (
                        <motion.div
                            key={turf.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-blue-500/50 transition-all duration-300 shadow-2xl shadow-slate-950/50"
                        >
                            <div className="relative h-64 w-full overflow-hidden">
                                <img
                                    src={turf.image}
                                    alt={turf.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                        {turf.sport}
                                    </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-1 border border-white/10">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-white text-xs font-bold">{turf.rating}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {turf.name}
                                        </h3>
                                        <div className="flex items-center text-slate-500 text-sm mt-1">
                                            <MapPin size={14} className="mr-1" />
                                            <span>{turf.location}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">{turf.distance}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Starts from</span>
                                        <span className="text-xl font-bold text-white">₹{turf.price}<span className="text-sm font-normal text-slate-500 ml-1">/hr</span></span>
                                    </div>
                                    <button className="bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 border border-blue-600/20 hover:border-blue-600">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
