import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { TurfShowcase } from "@/components/landing/TurfShowcase";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Community } from "@/components/landing/Community";
import { TurfOwners } from "@/components/landing/TurfOwners";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <Navbar />

      <main className="flex-1">
        <Hero />

        {/* Features with intersection observer for fade-ins */}
        <Features />

        {/* Turf Showcase Gallery */}
        <TurfShowcase />

        {/* Detailed Workflow */}
        <HowItWorks />

        {/* Community & Tournaments */}
        <Community />

        {/* B2B / Turf Owners Segment */}
        <TurfOwners />

        {/* Decision Point CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
