"use client";

import Link from "next/link";
import { Trophy, Calendar, MapPin, CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import OpeningCircles from "@/components/OpeningCircles";
import TurfCarousel from "@/components/TurfCarousel";
import { useRef } from "react";

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center space-y-4 text-center group">
      <div className="p-6 bg-white rounded-3xl shadow-sm group-hover:shadow-xl transition-all duration-500 group-hover:-translate-y-2">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900">{title}</h3>
      <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  /**
   * ARCHITECTURE:
   *  - Layer 1 (z-10, fixed): TurfCarousel — never moves
   *  - Layer 2 (z-20, fixed): White circles — roll IN over the carousel as user scrolls
   *  - Layer 3 (z-30, fixed): Hero content  — fades in after circles cover screen
   *  - Spacer (transparent, 400vh): provides the scroll track
   *  - Page 3 (z-40, relative, solid bg): naturally overlays fixed layers when scrolled into view
   */

  // Target the transparent spacer for scroll progress
  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end end"],
  });

  // Phase 2 [0.55 → 0.85]: Hero fades in after circles form a solid white screen
  const heroOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0.55, 0.85], [36, 0]);

  return (
    <div className="bg-white">
      {/* Hide scrollbar globally */}
      <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar{display:none}html,body{-ms-overflow-style:none;scrollbar-width:none}` }} />

      {/* ── FIXED HEADER ── z-[100], always on top */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center px-4 lg:px-6 z-[100]
                         border-b border-white/10 bg-black/30 backdrop-blur-md">
        <Link className="flex items-center justify-center space-x-2" href="#">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Trophy className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">BookMyTurf</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-bold text-white/70 hover:text-white transition-colors" href="/login">Login</Link>
          <Link className="text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all" href="/register">Register</Link>
        </nav>
      </header>

      {/* ── LAYER 1: Carousel ── fixed, z-10 — the base layer, always visible */}
      <div className="fixed inset-0 z-10">
        <TurfCarousel />
      </div>

      {/* ── LAYER 2: Circles ── fixed, z-20 — rolls over the carousel */}
      <OpeningCircles scrollYProgress={scrollYProgress} />

      {/* ── LAYER 3: Hero ── fixed, z-30 — fades in when screen is white */}
      <motion.div
        style={{ opacity: heroOpacity, y: heroY }}
        className="fixed inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
      >
        <span className="text-indigo-600 text-xs font-black uppercase tracking-[0.5em] mb-4 inline-block">
          Premium Sports Booking
        </span>
        <h1 className="text-7xl md:text-[9.3rem] font-black leading-[0.85] tracking-tighter text-slate-950 uppercase italic">
          BookMy<span className="text-indigo-600">Turf</span>
        </h1>
        <p className="mt-8 text-slate-500 text-xl md:text-2xl font-medium tracking-tight max-w-2xl mx-auto">
          Experience the game on the finest turfs.
          <br className="hidden md:block" />
          Instant booking, prime locations, and elite facilities.
        </p>
        <div className="mt-12 pointer-events-auto">
          <Link href="/booking">
            <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-full transition-all hover:scale-105 shadow-2xl shadow-indigo-200">
              Start Booking Now
            </button>
          </Link>
        </div>
      </motion.div>

      {/*
        ── TRANSPARENT SCROLL SPACER ──
        This is what the user actually scrolls through.
        400vh = 100vh of "entrance" + 300vh of animation scroll room.
        Has z-0 so it sits behind all fixed layers but still intercepts scroll events.
      */}
      <div ref={spacerRef} className="relative z-0 h-[400vh]" />

      {/*
        ── PAGE 3: FEATURES ──
        z-40 with solid bg-slate-50 → naturally covers all fixed layers (z-10, 20, 30)
        when the user scrolls past the spacer.
      */}
      <section className="relative z-40 bg-slate-50 min-h-[50vh] w-full py-32 flex items-center border-t border-slate-200">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-indigo-600" />}
              title="Instant Booking"
              desc="Real-time slot availability. No more waiting for phone confirmations."
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8 text-indigo-600" />}
              title="Prime Locations"
              desc="Discover premium turfs in your neighborhood with ease."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-indigo-600" />}
              title="Secure Payments"
              desc="Fast and secure checkout process for every booking."
            />
          </div>
        </div>
      </section>

      {/* Footer — also z-40 so it's above the fixed layers */}
      <footer className="relative z-40 flex flex-col gap-2 sm:flex-row py-8 w-full items-center px-4 md:px-6 border-t border-slate-100 bg-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 BookMyTurf Inc.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest" href="#">Terms</Link>
          <Link className="text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest" href="#">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
