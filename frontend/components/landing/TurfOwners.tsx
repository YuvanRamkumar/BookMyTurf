"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, Calendar, Zap, LayoutDashboard } from "lucide-react";

const benefits = [
    "Dynamic Pricing Engine",
    "Real-time Booking Analytics",
    "Automated Revenue Tracking",
    "Cross-platform Dashboard",
];

export const TurfOwners = () => {
    return (
        <section id="owners" className="py-24 bg-slate-900/50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Owner dashboard mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="hidden lg:block relative"
                    >
                        <div className="relative z-10 bg-slate-950 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden aspect-[4/3] flex flex-col">
                            {/* Header */}
                            <div className="border-b border-slate-800 p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <LayoutDashboard size={18} className="text-green-500" />
                                    </div>
                                    <span className="text-white font-bold text-sm">Owner Dashboard</span>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                    <div className="w-2 h-2 rounded-full bg-slate-800" />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 p-6">
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Revenue</p>
                                    <p className="text-xl font-bold text-white">₹1,24,500</p>
                                    <div className="flex items-center text-green-500 space-x-1 mt-2">
                                        <TrendingUp size={12} />
                                        <span className="text-[10px] font-bold">+12.5%</span>
                                    </div>
                                </div>
                                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Total Bookings</p>
                                    <p className="text-xl font-bold text-white">342</p>
                                    <div className="flex items-center text-blue-500 space-x-1 mt-2">
                                        <Calendar size={12} />
                                        <span className="text-[10px] font-bold">24 today</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chart Mockup */}
                            <div className="flex-1 px-6 pb-6">
                                <div className="w-full h-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
                                    <div className="flex items-end justify-between h-full space-x-1 pt-8">
                                        {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40].map((h, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${h}%` }}
                                                transition={{ delay: i * 0.05, duration: 0.5 }}
                                                className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                                            />
                                        ))}
                                    </div>
                                    <div className="absolute top-4 left-4 text-[10px] font-bold text-slate-500 uppercase">Weekly Performance</div>
                                </div>
                            </div>

                            {/* Dynamic light pulse */}
                            <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-extrabold text-green-500 uppercase tracking-tighter">System Online</span>
                            </div>
                        </div>

                        {/* Background blob */}
                        <div className="absolute -top-12 -left-12 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full" />
                    </motion.div>

                    {/* Right: Text Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-sm font-bold uppercase tracking-widest mb-6"
                        >
                            Enterprise
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
                        >
                            Own a Turf? <br />
                            <span className="text-green-500 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-400 font-extrabold">Scale Your Business.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 text-lg mb-8 leading-relaxed"
                        >
                            Take control of your turf management with our advanced owner dashboard. From dynamic pricing to automated accounting, we handle the chaos while you focus on the game.
                        </motion.p>

                        <div className="space-y-4 mb-10">
                            {benefits.map((benefit, i) => (
                                <motion.div
                                    key={benefit}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center space-x-3"
                                >
                                    <CheckCircle2 size={20} className="text-blue-500" />
                                    <span className="text-slate-200 font-medium">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-900/40"
                        >
                            List Your Turf Now
                        </motion.button>
                    </div>
                </div>
            </div>
        </section>
    );
};
