"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Calendar, Search, Trophy, ArrowRight, CalendarCheck, Ban, Zap, Star } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function UserDashboard() {
    const [allBookings, setAllBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/bookings")
            .then(res => res.json())
            .then(data => {
                setAllBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const upcoming = allBookings.filter(b => b.status === 'confirmed');
    const total = allBookings.length;

    return (
        <Shell>
            <div className="space-y-12">
                <header>
                    <div className="flex items-center space-x-2 text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                        <Zap size={12} className="fill-current" />
                        <span>Urban Athlete Profile</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Welcome Back! 👋</h1>
                    <p className="text-slate-400 font-medium">Your arena access and match history.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CalendarCheck size={120} />
                        </div>
                        <div className="relative z-10 font-black">
                            <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4">Upcoming Games</div>
                            <div className="text-5xl text-white mb-2">{upcoming.length}</div>
                            <div className="text-blue-400 text-xs flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 animate-pulse" />
                                Confirmed Slots
                            </div>
                        </div>
                    </motion.div>

                    {/* CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative group h-full"
                    >
                        <Link href="/turfs" className="block h-full bg-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all overflow-hidden">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                    <Search className="text-white h-7 w-7" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">Find New Arena</div>
                                    <div className="text-blue-100/70 text-sm font-medium">Explore premium venues near you</div>
                                </div>
                                <div className="mt-8 flex items-center text-white font-black text-xs tracking-widest group-hover:translate-x-2 transition-transform uppercase">
                                    Explore Now <ArrowRight size={16} className="ml-2" />
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                                <Search size={200} />
                            </div>
                        </Link>
                    </motion.div>

                    {/* Stat Card 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Trophy size={120} />
                        </div>
                        <div className="relative z-10 font-black">
                            <div className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-4">Total Matches</div>
                            <div className="text-5xl text-white mb-2">{total}</div>
                            <div className="flex items-center text-xs text-amber-400 uppercase tracking-widest mt-4">
                                <Star size={12} className="mr-1.5 fill-current" />
                                Pro Player Rank
                            </div>
                            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Upcoming Sessions</h2>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black border border-blue-500/20 rounded-md tracking-widest">LIVE LIST</span>
                        </div>
                        <Link href="/bookings" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">View match history</Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-[2rem] border border-white/5" />)}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center"
                        >
                            <Calendar className="text-slate-700 h-16 w-16 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Pitch is Clear</h3>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">No upcoming bookings found. Ready to jump back into action?</p>
                            <Link href="/turfs" className="inline-flex items-center px-8 py-4 bg-white text-slate-950 rounded-2xl font-black hover:bg-slate-200 transition-all shadow-lg active:scale-95">
                                Discover Venues
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {upcoming.slice(0, 4).map((booking, i) => (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="bg-slate-900/50 backdrop-blur-md p-6 rounded-[2.2rem] border border-white/5 group hover:border-blue-500/30 transition-all flex items-center justify-between shadow-xl"
                                >
                                    <div className="flex items-center space-x-5">
                                        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-black text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 ring-1 ring-white/5">
                                            {booking.turf?.sport_type?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{booking.turf?.name}</h3>
                                            <div className="flex items-center space-x-3 mt-1.5">
                                                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    <Calendar size={12} className="mr-1.5" />
                                                    {booking.slot?.date}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                                    {booking.slot?.start_time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-white tracking-tighter">{formatCurrency(booking.turf?.price_per_hour || 0)}</div>
                                        <div className="mt-2 text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-[0.2em] border border-emerald-500/10">Authorized</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Shell>
    );
}
