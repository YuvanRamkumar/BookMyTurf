"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

const TURF_PHOTOS = [
    {
        id: 1,
        url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop",
        name: "Premium Football Arena",
        desc: "Professional grade turf with advanced floodlighting for night games."
    },
    {
        id: 2,
        url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2000&auto=format&fit=crop",
        name: "Grand Cricket Stadium",
        desc: "Full-sized playground suitable for tournament-level cricket."
    },
    {
        id: 3,
        url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2000&auto=format&fit=crop",
        name: "Pickleball Pro Court",
        desc: "Specialized hard-surface courts for the ultimate pickleball experience."
    },
    {
        id: 4,
        url: "https://images.unsplash.com/photo-1624880353068-25938fc44b8d?q=80&w=2000&auto=format&fit=crop",
        name: "Elite Indoor Arena",
        desc: "Temperature-controlled indoor facility for year-round sports."
    },
    {
        id: 5,
        url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2000&auto=format&fit=crop",
        name: "Sunset Sports Complex",
        desc: "Beautifully located turf with scenic views and premium amenities."
    },
];

export default function TurfCarousel() {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const nextStep = useCallback((newIndex?: number) => {
        setDirection(1);
        if (typeof newIndex === 'number') {
            setIndex(newIndex);
        } else {
            setIndex((prev) => (prev + 1) % TURF_PHOTOS.length);
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => nextStep(), 6000);
        return () => clearInterval(timer);
    }, [nextStep]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? "100%" : "-100%",
        }),
        center: {
            x: 0,
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
            }
        },
        exit: (direction: number) => ({
            x: direction < 0 ? "100%" : "-100%",
            transition: {
                x: { type: "spring", stiffness: 300, damping: 30 },
            }
        })
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-900 group">
            {/* Full Screen Reel Strip */}
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                >
                    <img
                        src={TURF_PHOTOS[index].url}
                        alt={TURF_PHOTOS[index].name}
                        className="w-full h-full object-cover brightness-[0.7] group-hover:brightness-[0.8] transition-all duration-1000"
                    />

                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                    {/* Centered Title - Immersion for 100vh */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
                        <motion.h2
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-white text-[4.7rem] md:text-[7.5rem] lg:text-[8.4rem] font-black uppercase tracking-tighter"
                        >
                            {TURF_PHOTOS[index].name}
                        </motion.h2>
                    </div>

                    {/* Bottom-Left Description - Plain White Transparent Text */}
                    <div className="absolute bottom-16 left-16 max-w-lg z-10 pointer-events-none text-white/70">
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-lg md:text-xl font-bold leading-relaxed tracking-wide italic"
                        >
                            {TURF_PHOTOS[index].desc}
                        </motion.p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Bottom-Center Plain Navigation Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {TURF_PHOTOS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setDirection(i > index ? 1 : -1);
                            setIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${index === i ? "bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,1)]" : "bg-white/30 hover:bg-white/60"
                            }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}




