"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Megaphone, BarChart3 } from "lucide-react";

const communityFeatures = [
    {
        icon: <Megaphone className="w-6 h-6 text-blue-500" />,
        title: "Create Public Matches",
        description: "Missing a player? Create a public match request and let local players join your squad instantly.",
    },
    {
        icon: <Trophy className="w-6 h-6 text-green-500" />,
        title: "Join Tournaments",
        description: "Register for weekend leagues and tournaments hosted by top turfs in your city.",
    },
    {
        icon: <Users className="w-6 h-6 text-blue-500" />,
        title: "Build Your Guild",
        description: "Create a permanent team page, track win rates, and climb the local leaderboard.",
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-yellow-500" />,
        title: "Track Player Stats",
        description: "Record goals, assists, and MVPs after every match to build your athletic profile.",
    },
];

export const Community = () => {
    return (
        <section id="tournaments" className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: UI Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 aspect-square lg:aspect-video flex flex-col justify-center shadow-2xl relative overflow-hidden group">
                            {/* Fake Leaderboard UI */}
                            <div className="mb-6">
                                <h4 className="text-white font-bold mb-4">Top Guild Leaders</h4>
                                <div className="space-y-3">
                                    {[
                                        { name: "Urban Strikers", points: 2450, winRate: "88%" },
                                        { name: "Midnight FC", points: 2120, winRate: "82%" },
                                        { name: "Neon Knights", points: 1980, winRate: "79%" },
                                    ].map((guild, i) => (
                                        <motion.div
                                            key={guild.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                                    #{i + 1}
                                                </div>
                                                <span className="text-white font-medium text-sm">{guild.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-blue-400 font-bold">{guild.points} PTS</p>
                                                <p className="text-[10px] text-slate-500 uppercase">Win Rate: {guild.winRate}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Fake Stats UI Overlay */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 right-10 bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 p-4 rounded-2xl shadow-xl hidden md:block"
                            >
                                <BarChart3 className="text-blue-500 mb-2" />
                                <p className="text-xs text-blue-200 font-bold">Monthly Activity</p>
                                <p className="text-lg font-bold text-white">+24.5%</p>
                            </motion.div>

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </motion.div>

                    {/* Right: Text Content */}
                    <div className="order-1 lg:order-2">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
                        >
                            More Than <span className="text-blue-500">Just Booking.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-400 text-lg mb-10"
                        >
                            Join a thriving ecosystem of athletes. Compete, connect, and elevate your game within the BookMyTurf community.
                        </motion.p>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {communityFeatures.map((feat, i) => (
                                <motion.div
                                    key={feat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="space-y-3"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                                        {feat.icon}
                                    </div>
                                    <h4 className="text-lg font-bold text-white">{feat.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{feat.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
