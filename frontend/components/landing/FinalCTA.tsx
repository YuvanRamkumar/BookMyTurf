"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, ChevronRight } from "lucide-react";

export const FinalCTA = () => {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="mb-10 flex justify-center"
                >
                    <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/50 rotate-12">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight"
                >
                    Ready to Play? <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-400">
                        Book Your Turf Now.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-400 text-xl mb-12"
                >
                    Don't wait for the weekend. Your city is playing tonight.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
                >
                    <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-2xl shadow-blue-900/50 active:scale-95 flex items-center justify-center space-x-3">
                        <span>Start Booking</span>
                        <ChevronRight size={24} />
                    </button>

                    <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-10 py-5 rounded-2xl font-bold text-xl transition-all active:scale-95">
                        Explore Nearby
                    </button>
                </motion.div>
            </div>
        </section>
    );
};
