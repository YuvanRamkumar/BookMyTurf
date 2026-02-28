"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Calendar, CreditCard } from "lucide-react";

const steps = [
    {
        icon: <Search className="w-10 h-10 text-blue-500" />,
        title: "Choose Turf",
        description: "Browse through our collection of high-quality turfs near you. Filter by sport, price, and location.",
        step: "01",
    },
    {
        icon: <Calendar className="w-10 h-10 text-green-500" />,
        title: "Select Slot",
        description: "Pick a date and time that works for your team. Our real-time calendar ensures no double bookings.",
        step: "02",
    },
    {
        icon: <CreditCard className="w-10 h-10 text-blue-500" />,
        title: "Pay & Play",
        description: "Secure your slot with a fast UPI payment. Get instant confirmation and match details on WhatsApp.",
        step: "03",
    },
];

export const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-sm font-bold uppercase tracking-widest mb-4"
                    >
                        Workflow
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold text-slate-900 mb-4"
                    >
                        How It Works
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg max-w-2xl mx-auto"
                    >
                        Book your next game in under a minute with our streamlined process.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-[2.5rem] left-0 w-full h-0.5 border-t-2 border-dashed border-slate-200 z-0" />

                    <div className="grid md:grid-cols-3 gap-12 lg:gap-24 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="relative mb-8">
                                    <div className="w-20 h-20 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                                        {step.icon}
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 leading-relaxed font-medium">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
