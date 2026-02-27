"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Trophy, Users, Calendar, Plus, Settings, Loader2, Pencil, Trash2, AlertTriangle, X, CheckCircle2, Image as ImageIcon, MapPin, Clock, DollarSign, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
    const [data, setData] = useState<any>({ turfs: [], bookings: [] });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/data");
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (turfId: string, status: string) => {
        try {
            const res = await fetch(`/api/turfs/${turfId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ operational_status: status.toUpperCase() }),
            });
            if (!res.ok) throw new Error("Failed to update status");

            setToast({ type: 'success', text: `Venue status updated to ${status}` });
            setData((prev: any) => ({
                ...prev,
                turfs: prev.turfs.map((t: any) => t.id === turfId ? { ...t, operational_status: status.toUpperCase() } : t),
            }));
        } catch (err: any) {
            setToast({ type: 'error', text: err.message });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleDelete = async (turfId: string) => {
        setShowDeleteModal(null);
        setDeletingId(turfId);

        try {
            const res = await fetch(`/api/turfs/${turfId}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            setToast({ type: 'success', text: 'Arena deleted successfully!' });
            setData((prev: any) => ({
                ...prev,
                turfs: prev.turfs.filter((t: any) => t.id !== turfId),
            }));
        } catch (err: any) {
            setToast({ type: 'error', text: err.message });
        } finally {
            setDeletingId(null);
            setTimeout(() => setToast(null), 4000);
        }
    };

    return (
        <Shell>
            <div className="space-y-12">
                {/* Toast Notification */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                                "fixed top-12 right-12 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center space-x-3 max-w-md",
                                toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            )}
                        >
                            {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertTriangle size={20} className="shrink-0" />}
                            <span className="font-bold text-sm tracking-tight">{toast.text}</span>
                            <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/10 rounded-lg p-1 transition-colors"><X size={14} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowDeleteModal(null)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative bg-slate-900 border border-white/5 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Trash2 size={120} />
                                </div>
                                <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-rose-500/20">
                                    <AlertTriangle className="text-rose-500 w-8 h-8" />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Delete Arena?</h3>
                                <p className="text-slate-400 font-medium mb-8">This action is permanent. All slots and history will be cleared.</p>
                                <div className="flex space-x-4">
                                    <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/5">
                                        Cancel
                                    </button>
                                    <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 px-6 py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-900/40">
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center space-x-2 text-blue-400 font-black uppercase tracking-[0.2em] text-[10px] mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span>Venue Management</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter">Arena Dashboard</h1>
                        <p className="text-slate-400 font-medium mt-2">Scale your business, manage slots, and track revenue.</p>
                    </div>
                    <Link
                        href="/admin/turfs/add"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center transition-all shadow-xl shadow-blue-900/40 active:scale-95 translate-y-[-4px]"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Turf
                    </Link>
                </header>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: "Total Arenas", value: data.stats?.totalTurfs || 0, icon: Trophy, neon: "text-blue-400" },
                        { label: "Bookings Today", value: data.stats?.todayBookingsCount || 0, icon: TrendingUp, neon: "text-violet-400" },
                        { label: "Net Revenue", value: formatCurrency(data.stats?.totalRevenue || 0), icon: DollarSign, neon: "text-emerald-400" },
                        { label: "Avg Occupancy", value: data.stats?.totalTurfs > 0 ? `${Math.round(((data.stats?.todayBookingsCount || 0) / (data.stats?.totalTurfs * 12)) * 100)}%` : '0%', icon: Users, neon: "text-cyan-400" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 group overflow-hidden relative"
                        >
                            <div className={cn(
                                "absolute -top-2 -right-2 p-6 transition-all duration-500",
                                stat.neon,
                                "opacity-40 group-hover:opacity-100 group-hover:scale-110 group-hover:-rotate-12"
                            )}
                                style={{ filter: `drop-shadow(0 0 20px currentColor)` }}
                            >
                                <stat.icon size={80} strokeWidth={1.5} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</div>
                                <div className={cn(
                                    "text-3xl font-black text-white tracking-tighter",
                                    stat.neon.includes("emerald") && "text-emerald-400"
                                )}>
                                    {stat.value}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* My Venues Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                            <MapPin size={24} className="mr-3 text-blue-500" />
                            Registered Arenas
                        </h2>
                        <div className="h-[1px] flex-1 bg-white/5 mx-6 hidden md:block" />
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[3rem] border border-white/5" />)}
                        </div>
                    ) : data.turfs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-slate-900/50 border-2 border-dashed border-white/5 rounded-[3rem] p-20 text-center"
                        >
                            <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                                <Trophy size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Expand Your Empire</h3>
                            <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">You haven't added any venues yet. Start by adding your first turf.</p>
                            <Link href="/admin/turfs/add" className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40">
                                <Plus size={20} className="mr-2" /> Initialize Venue
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {data.turfs.map((turf: any, i: number) => (
                                <motion.div
                                    key={turf.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className={cn(
                                        "bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 flex flex-col shadow-2xl",
                                        deletingId === turf.id && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    <div className="h-56 bg-slate-800 relative overflow-hidden">
                                        {turf.image_url ? (
                                            <img
                                                src={turf.image_url}
                                                alt={turf.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/20 to-slate-900">
                                                <Trophy size={64} className="text-white/10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                                            <div className="px-3 py-1.5 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-900/40">
                                                {turf.sport_type}
                                            </div>
                                            {turf.status === 'PENDING' ? (
                                                <div className="px-3 py-1.5 bg-amber-500/80 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                                    <Clock size={10} className="mr-1.5" /> Pending Approval
                                                </div>
                                            ) : turf.status === 'APPROVED' ? (
                                                <div className="px-3 py-1.5 bg-emerald-500/80 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                                    <CheckCircle2 size={10} className="mr-1.5" /> Certified
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-rose-500/80 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center">
                                                    <X size={10} className="mr-1.5" /> Disapproved
                                                </div>
                                            )}
                                        </div>

                                        <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            <Link href={`/admin/turfs/${turf.id}/edit`} className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                                                <Pencil size={16} />
                                            </Link>
                                            <button onClick={() => setShowDeleteModal(turf.id)} className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-rose-600 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">{turf.name}</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
                                                <MapPin size={12} className="mr-1.5 text-blue-500" /> {turf.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Live Status</div>
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn("w-2.5 h-2.5 rounded-full", turf.currentStatus === 'VACANT' ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-rose-500 shadow-[0_0_10px_#ef4444]")} />
                                                    <span className="text-lg font-black text-white uppercase tracking-tight">{turf.currentStatus}</span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                                <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2">Pricing</div>
                                                <div className="text-lg font-black text-white tracking-tight">
                                                    {formatCurrency(turf.price_per_hour)}
                                                    <span className="text-xs text-slate-500 ml-1.5">/HR</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mt-auto">
                                            <div className="flex items-center justify-between px-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation Mode</span>
                                                <div className="flex space-x-2">
                                                    {['ACTIVE', 'MAINTENANCE', 'CLOSED'].map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => handleStatusUpdate(turf.id, s)}
                                                            className={cn(
                                                                "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg transition-all",
                                                                turf.operational_status === s
                                                                    ? (s === 'ACTIVE' ? "bg-emerald-500/20 text-emerald-400" : s === 'MAINTENANCE' ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400")
                                                                    : "text-slate-600 hover:text-slate-400 bg-white/5"
                                                            )}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex space-x-3 pt-2">
                                                <Link
                                                    href={`/admin/turfs/${turf.id}/slots`}
                                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-center font-bold text-xs transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center space-x-2"
                                                >
                                                    <Settings size={14} />
                                                    <span>Manage Availability</span>
                                                </Link>
                                                <Link
                                                    href={`/admin/turfs/${turf.id}/edit`}
                                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-center font-bold text-xs transition-all border border-white/5 flex items-center justify-center space-x-2"
                                                >
                                                    <Pencil size={14} />
                                                    <span>Modify</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Latest Bookings Table-style Card */}
                <section className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Calendar size={180} />
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
                                <Calendar size={20} className="mr-3 text-blue-500" />
                                Incoming Revenue
                            </h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">Confirmed bookings across all your active venues.</p>
                        </div>
                        <button className="text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center">
                            View Reports <ChevronRight size={14} className="ml-1" />
                        </button>
                    </div>

                    {loading ? <Loader2 className="animate-spin text-blue-500" /> : data.bookings.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                            <Users size={32} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active reservations found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 relative z-10">
                            {data.bookings.slice(0, 6).map((b: any, idx: number) => (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + (idx * 0.05) }}
                                    className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex items-center space-x-5">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black text-sm ring-1 ring-white/10 group-hover:ring-blue-500/40 transition-all">
                                            {b.userName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{b.userName || 'User'}</div>
                                            <div className="text-[10px] text-slate-500 font-black tracking-widest mt-1">
                                                {b.turf?.name} • <span className="text-slate-400">{b.slot?.date ? format(new Date(b.slot.date), "MMM dd, yyyy") : ''}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-blue-400 tracking-tighter">{b.slot?.start_time} – {b.slot?.end_time}</div>
                                        <div className="flex justify-end mt-1">
                                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-[0.15em] border border-emerald-500/20">Authorized</span>
                                        </div>
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
