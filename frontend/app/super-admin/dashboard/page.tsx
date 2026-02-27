"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Users, Trophy, Calendar, CheckCircle, XCircle, Trash2, Loader2, PieChart, AlertCircle, MapPin, Search, Filter } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SuperAdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/super-admin/data", { cache: 'no-store' });
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveTurf = async (turfId: string, approve: boolean) => {
        try {
            const res = await fetch("/api/super-admin/approve-turf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ turfId, approve })
            });
            if (res.ok) {
                setData((prev: any) => ({
                    ...prev,
                    turfs: prev.turfs.map((t: any) =>
                        t.id === turfId ? { ...t, status: approve ? 'APPROVED' : 'REJECTED' } : t
                    )
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading && !data) return (
        <Shell>
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Control Center...</p>
            </div>
        </Shell>
    );

    return (
        <Shell>
            <div className="space-y-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8 mb-4">
                    <div>
                        <div className="flex items-center space-x-2 text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>System Authority</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Platform Control</h1>
                        <p className="text-slate-400 mt-2 font-medium">Root access to BookMyTurf global ecosystem.</p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Total Users", value: data?.stats.totalUsers, icon: Users, color: "blue" },
                        { label: "Total Owners", value: data?.stats.totalAdmins, icon: Trophy, color: "green" },
                        { label: "Total Venues", value: data?.stats.totalTurfs, icon: MapPin, color: "amber" },
                        { label: "Total Bookings", value: data?.stats.totalBookings, icon: Calendar, color: "blue" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <stat.icon size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</div>
                                <div className="text-4xl font-black text-white flex items-baseline">
                                    {stat.value}
                                    <span className="text-xs text-slate-600 ml-2 font-bold font-mono">LIVE</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Sections */}
                <div className="grid lg:grid-cols-1 gap-10">
                    {/* Venue Status Monitoring */}
                    <section className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                                    <Filter size={20} className="mr-3 text-blue-500" />
                                    Venue Approval Queue
                                </h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Pending and active arenas across the platform.</p>
                            </div>
                            <div className="flex space-x-2">
                                <div className="flex items-center bg-slate-800/50 border border-white/5 rounded-xl px-4 py-2">
                                    <Search size={16} className="text-slate-500 mr-2" />
                                    <input placeholder="Search arena..." className="bg-transparent border-none outline-none text-sm text-white placeholder-slate-600 w-40" />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-left text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <th className="px-6 py-2">Arena Details</th>
                                        <th className="px-6 py-2">Owner Profle</th>
                                        <th className="px-6 py-2">Ops Status</th>
                                        <th className="px-6 py-2 text-right pr-12">System Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.turfs.map((turf: any, i: number) => (
                                        <motion.tr
                                            key={turf.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (i * 0.05) }}
                                            className="bg-white/5 group hover:bg-white/10 transition-all rounded-2xl relative"
                                        >
                                            <td className="px-6 py-6 first:rounded-l-3xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                                                        {turf.image_url ? (
                                                            <img src={turf.image_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-600/10">
                                                                <Trophy size={20} className="text-blue-500/50" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{turf.name}</div>
                                                        <div className="text-xs text-slate-500 font-medium flex items-center">
                                                            <MapPin size={10} className="mr-1" /> {turf.location}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-[10px] flex items-center justify-center font-black">
                                                        {turf.admin?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-300">{turf.admin?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={cn(
                                                    "inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border backdrop-blur-sm",
                                                    turf.operational_status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                        turf.operational_status === 'MAINTENANCE' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                            "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                )}>
                                                    <span className={cn("w-1.5 h-1.5 rounded-full mr-2",
                                                        turf.operational_status === 'ACTIVE' ? "bg-emerald-400 animate-pulse" :
                                                            turf.operational_status === 'MAINTENANCE' ? "bg-amber-400" : "bg-rose-400")
                                                    } />
                                                    {turf.operational_status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 last:rounded-r-3xl text-right pr-6">
                                                {turf.status === 'APPROVED' ? (
                                                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                                        <CheckCircle size={14} className="text-emerald-500" />
                                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Authorized</span>
                                                    </div>
                                                ) : turf.status === 'REJECTED' ? (
                                                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                                        <XCircle size={14} className="text-rose-500" />
                                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Blacklisted</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleApproveTurf(turf.id, true)}
                                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40 active:scale-95"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveTurf(turf.id, false)}
                                                            className="px-5 py-2.5 bg-slate-800 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Global Activity Feed */}
                    <section className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[3rem] border border-white/5 shadow-2xl">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center mb-8">
                            <PieChart size={20} className="mr-3 text-blue-500" />
                            Real-time Activity
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            {data?.bookings.slice(0, 10).map((b: any, i: number) => (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.05) }}
                                    className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center font-black text-blue-500 ring-2 ring-white/5 group-hover:ring-blue-500/30 transition-all">
                                            {b.userName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{b.userName} <span className="text-slate-500 font-medium">booked</span> {b.turfName}</div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{new Date(b.booked_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-emerald-400">+₹{b.turf?.price_per_hour}</div>
                                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Received</div>
                                    </div>
                                </motion.div>
                            ))}
                            {data?.bookings.length === 0 && (
                                <div className="col-span-2 py-20 text-center">
                                    <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No global activity recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Shell>
    );
}
