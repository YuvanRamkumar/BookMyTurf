"use client";

import Link from "next/link";
import { Trophy, Calendar, MapPin, CheckCircle } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import GridReveal from "@/components/GridReveal";
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
   *  - Layer 1 (z-10, fixed): TurfCarousel — the base, always visible
   *  - Layer 2 (z-20, fixed): GridReveal  — chessboard sweep + turf bg + cards
   *  - Spacer (transparent, 400vh): provides the scroll track
   *  - Page 3 (z-40, relative, solid bg): naturally overlays fixed layers
   */

  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ["start start", "end end"],
  });

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

      {/* ── LAYER 1: Carousel ── fixed, z-10 — base layer */}
      <motion.div
        className="fixed inset-0 z-10"
        style={{ y: useTransform(scrollYProgress, [0, 0.6], ["0%", "-10%"]) }}
      >
        <TurfCarousel />
      </motion.div>

      {/* ── LAYER 2: GridReveal ── fixed, z-20 — chessboard + turf bg + cards */}
      <GridReveal scrollYProgress={scrollYProgress} />

      {/*
        ── TRANSPARENT SCROLL SPACER ──
        400vh gives plenty of room for the 3 animation phases.
      */}
      <div ref={spacerRef} className="relative z-0 h-[400vh]" />

      {/*
        ── FEATURES SECTION ──
        z-40 with solid bg naturally covers all fixed layers when scrolled into view.
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

      {/* Footer */}
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
