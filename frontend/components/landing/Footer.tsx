"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Instagram, Twitter, Facebook, Github, ChevronRight } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">
                                BookMy<span className="text-blue-500">Turf</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            The premier platform for sports turf booking and community building. Own the game, anywhere, anytime.
                        </p>
                        <div className="flex space-x-4">
                            {[Instagram, Twitter, Facebook, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/50 transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4">
                            <li><Link href="#explore" className="text-slate-500 hover:text-white transition-colors text-sm">Explore Turfs</Link></li>
                            <li><Link href="#how-it-works" className="text-slate-500 hover:text-white transition-colors text-sm">How It Works</Link></li>
                            <li><Link href="#tournaments" className="text-slate-500 hover:text-white transition-colors text-sm">Tournaments</Link></li>
                            <li><Link href="#owners" className="text-slate-500 hover:text-white transition-colors text-sm">For Owners</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Help Center</Link></li>
                            <li><Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                            <li><Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Subscribe */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                        <p className="text-slate-500 text-sm mb-4">Get the latest match alerts and tournament invites.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-slate-600 text-xs">
                        © {new Date().getFullYear()} BookMyTurf Inc. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-2 text-slate-600 text-xs">
                        <span>Built with passion for the game.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

