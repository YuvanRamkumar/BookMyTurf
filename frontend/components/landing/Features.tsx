"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, ShieldCheck, Users, Zap } from "lucide-react";

const features = [
    {
        title: "Real-Time Slot Booking",
        description: "Check availability instantly and secure your preferred timing without any back-and-forth.",
        icon: <Clock className="w-8 h-8 text-blue-500" />,
        color: "blue",
    },
    {
        title: "Secure UPI Payments",
        description: "Lightning-fast and secure payment integration for a seamless checkout experience.",
        icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
        color: "green",
    },
    {
        title: "Invite Friends Instantly",
        description: "Share match details on WhatsApp with a single click and get your team ready in seconds.",
        icon: <Users className="w-8 h-8 text-blue-500" />,
        color: "blue",
    },
    {
        title: "Create Guilds & Matches",
        description: "Build your own sports community, track stats, and compete in local tournaments.",
        icon: <Zap className="w-8 h-8 text-yellow-500" />,
        color: "yellow",
    },
];

export const Features = () => {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-4"
                    >
                        Built for the <span className="text-blue-500">Urban Athlete</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        Experience the smoothest way to book, play, and connect with your sports community.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                        >
                            <div className="mb-6 p-3 bg-slate-950 w-fit rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
