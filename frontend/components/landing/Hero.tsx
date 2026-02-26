"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, Play, Users, MapPin, Calendar } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-950">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 blur-[100px] rounded-full" />

            {/* Decorative field lines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white rounded-full scale-[1.5]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
                                Now Live in 12 Cities
                            </span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6">
                            Book Your Turf. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400">
                                Own The Game.
                            </span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                            Find nearby turfs, invite your team, and play without chaos.
                            The ultimate platform for urban athletes.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 shadow-xl shadow-blue-900/40 active:scale-95">
                                <span>Explore Turfs</span>
                                <ChevronRight size={20} />
                            </button>
                            <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 active:scale-95">
                                <Play size={18} fill="currentColor" />
                                <span>How It Works</span>
                            </button>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-800/50 max-w-md">
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-white flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <span>1000+</span>
                                </div>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Matches</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-white flex items-center space-x-2">
                                    <MapPin className="w-5 h-5 text-green-500" />
                                    <span>50+</span>
                                </div>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Turfs</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-bold text-white flex items-center space-x-2">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <span>24/7</span>
                                </div>
                                <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Booking</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right illustration / 3D Graphic */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 w-full aspect-square bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-[3rem] border border-white/5 backdrop-blur-3xl overflow-hidden group">
                            {/* Animated Turf Graphic */}
                            <div className="absolute inset-12 border-2 border-white/10 rounded-2xl flex items-center justify-center">
                                <div className="w-full h-[2px] bg-white/10 absolute top-1/2" />
                                <div className="h-full w-[2px] bg-white/10 absolute left-1/2" />
                                <div className="w-48 h-48 border-2 border-white/10 rounded-full flex items-center justify-center">
                                    <motion.div
                                        animate={{
                                            y: [0, -20, 0],
                                            rotate: [0, 360],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="bg-white p-4 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.3)]"
                                    >
                                        {/* Football simplified icon */}
                                        <svg viewBox="0 0 24 24" className="w-16 h-16 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <path d="M12 2v20M2 12h20" />
                                            <path d="M7 3.3L17 20.7M17 3.3L7 20.7" />
                                        </svg>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Glowing spotlights */}
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500 blur-[80px] opacity-20" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500 blur-[80px] opacity-20" />

                            {/* Dynamic light rays */}
                            <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-blue-400 to-transparent opacity-20 rotate-12" />
                            <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-blue-400 to-transparent opacity-20 -rotate-12" />
                        </div>

                        {/* Floating UI cards for premium feel */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 z-20 bg-slate-900/90 border border-slate-700 backdrop-blur-lg p-4 rounded-2xl shadow-2xl"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <MapPin size={20} className="text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Next Available</p>
                                    <p className="text-sm font-bold text-white">City Arena - 6:00 PM</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-6 -left-6 z-20 bg-slate-900/90 border border-slate-700 backdrop-blur-lg p-4 rounded-2xl shadow-2xl"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Users size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Live Games</p>
                                    <p className="text-sm font-bold text-white">12 Teams Playing</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
