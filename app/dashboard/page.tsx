"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Calendar, Search, Trophy, ArrowRight, CalendarCheck, Ban } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

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
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Welcome Back! 👋</h1>
                    <p className="text-slate-500 font-medium">Ready for your next game? Here's your booking overview.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Upcoming Bookings stat */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                            <CalendarCheck className="text-indigo-600 h-7 w-7" />
                        </div>
                        <div className="text-4xl font-black text-slate-900 mb-1">{upcoming.length}</div>
                        <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">Upcoming Sessions</div>
                    </div>

                    {/* Find a Turf CTA */}
                    <Link href="/turfs" className="bg-indigo-600 p-8 rounded-[32px] shadow-xl shadow-indigo-200 text-white hover:bg-indigo-700 transition-all flex flex-col justify-between group relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                                <Search className="text-white h-7 w-7" />
                            </div>
                            <div className="text-2xl font-black mb-1">Find a Turf</div>
                            <div className="text-indigo-100 text-sm font-medium">Explore premium venues near you</div>
                        </div>
                        <div className="flex items-center mt-8 font-bold text-sm relative z-10">
                            BROWSE NOW <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Search size={120} />
                        </div>
                    </Link>

                    {/* All-time bookings stat */}
                    <div className="bg-emerald-600 p-8 rounded-[32px] shadow-xl shadow-emerald-200 text-white flex flex-col justify-between relative overflow-hidden transition-all hover:bg-emerald-700">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                                <Trophy className="text-white h-7 w-7" />
                            </div>
                            <div className="text-4xl font-black mb-1">{total}</div>
                            <div className="text-emerald-100 text-sm font-medium">Total Bookings All-time</div>
                        </div>
                        <div className="mt-8 relative z-10 flex items-center space-x-2">
                            <div className="h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-white rounded-full w-[65%] shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                            </div>
                            <span className="text-[10px] font-black">LVL 4</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-10">
                            <Trophy size={120} />
                        </div>
                    </div>
                </div>

                {/* Recent Upcoming Bookings */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-slate-900">Upcoming Sessions</h2>
                        <Link href="/bookings" className="text-sm text-indigo-600 font-bold hover:underline underline-offset-4">VIEW ALL</Link>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => <div key={i} className="h-24 bg-white animate-pulse rounded-3xl border border-slate-100" />)}
                        </div>
                    ) : upcoming.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="text-slate-300 h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No upcoming bookings</h3>
                            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Your next matches will appear here once you book a slot.</p>
                            <Link href="/turfs" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                Discover Venues
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {upcoming.slice(0, 4).map((booking) => (
                                <div key={booking.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-16 h-16 bg-indigo-50 rounded-[20px] flex items-center justify-center text-indigo-600 font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {booking.turf?.sport_type?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{booking.turf?.name}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{booking.slot?.date} • {booking.slot?.start_time} – {booking.slot?.end_time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-slate-900">{formatCurrency(booking.turf?.price_per_hour || 0)}</div>
                                        <div className="mt-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-emerald-100/50">Confirmed</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Shell>
    );
}
