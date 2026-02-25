"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Trophy, Users, Calendar, Plus, Settings, Loader2, Pencil, Trash2, AlertTriangle, X, CheckCircle2, Image as ImageIcon, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";

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
                body: JSON.stringify({ status: status.toUpperCase() }),
            });
            if (!res.ok) throw new Error("Failed to update status");

            setToast({ type: 'success', text: `Venue status updated to ${status}` });
            setData((prev: any) => ({
                ...prev,
                turfs: prev.turfs.map((t: any) => t.id === turfId ? { ...t, status: status.toUpperCase() } : t),
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
            <div className="max-w-6xl mx-auto">
                {/* Toast */}
                {toast && (
                    <div className={cn(
                        "fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center space-x-3 max-w-md",
                        toast.type === 'success' ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-rose-200 text-rose-700"
                    )}>
                        {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 text-emerald-500" /> : <AlertTriangle size={20} className="shrink-0 text-rose-500" />}
                        <span className="font-semibold text-sm">{toast.text}</span>
                        <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-slate-100 rounded-lg"><X size={14} /></button>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] p-10 max-w-md w-full mx-4 shadow-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-rose-500 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Delete Arena?</h3>
                            <p className="text-slate-500 text-center mb-8 text-sm">This will permanently remove the turf and all its slots. Active bookings must be cancelled first.</p>
                            <div className="flex space-x-4">
                                <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all">
                                    Keep
                                </button>
                                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 px-6 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Turf Management</h1>
                        <p className="text-slate-500 font-medium">Overview of your turfs and bookings.</p>
                    </div>
                    <Link
                        href="/admin/turfs/add"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Plus size={20} className="mr-2" />
                        Add New Turf
                    </Link>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Turfs</div>
                        <div className="text-3xl font-black text-slate-900">{data.stats?.totalTurfs || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Total Bookings</div>
                        <div className="text-3xl font-black text-slate-900">{data.stats?.totalBookings || 0}</div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Revenue</div>
                        <div className="text-3xl font-black text-indigo-600">
                            {formatCurrency(data.stats?.totalRevenue || 0)}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">Avg Occupancy</div>
                        <div className="text-3xl font-black text-emerald-600">68%</div>
                    </div>
                </div>

                {/* My Venues — Main Feature */}
                <section className="mb-10">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                        <Trophy size={24} className="mr-3 text-indigo-600" />
                        My Arenas
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2].map(i => <div key={i} className="h-56 bg-white animate-pulse rounded-[32px] border border-slate-100" />)}
                        </div>
                    ) : data.turfs.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center">
                            <Trophy size={48} className="text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No arenas yet</h3>
                            <p className="text-slate-500 mb-6">Add your first turf to start accepting bookings.</p>
                            <Link href="/admin/turfs/add" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                <Plus size={18} className="mr-2" /> Add Arena
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {data.turfs.map((turf: any) => (
                                <div key={turf.id} className={cn(
                                    "bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300",
                                    deletingId === turf.id && "opacity-50 pointer-events-none"
                                )}>
                                    {/* Image Section */}
                                    <div className="h-44 bg-slate-50 relative overflow-hidden">
                                        {turf.image_url ? (
                                            <img
                                                src={turf.image_url}
                                                alt={turf.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
                                                <Trophy size={56} className="text-indigo-100" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 flex space-x-2">
                                            <div className="px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                                                {turf.sport_type}
                                            </div>
                                            {!turf.is_approved ? (
                                                <div className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-200 flex items-center">
                                                    <Clock size={10} className="mr-1" /> Pending Approval
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center">
                                                    <CheckCircle2 size={10} className="mr-1" /> Approved
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            <Link
                                                href={`/admin/turfs/${turf.id}/edit`}
                                                className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all shadow-lg"
                                            >
                                                <Pencil size={16} />
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteModal(turf.id)}
                                                className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{turf.name}</h3>
                                            <div className={cn(
                                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                turf.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    turf.status === 'MAINTENANCE' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {turf.status}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-400 text-sm mb-4 font-medium">
                                            <MapPin size={14} className="mr-1" />
                                            {turf.location}
                                        </div>

                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center text-sm text-slate-500 font-medium">
                                                <Clock size={14} className="mr-1.5 text-slate-300" />
                                                {turf.opening_time} – {turf.closing_time}
                                            </div>
                                            <div className="text-xl font-black text-slate-900">
                                                {formatCurrency(turf.price_per_hour)}<span className="text-xs font-bold text-slate-400 ml-1">/hr</span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-3 rounded-2xl mb-5 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Set Status:</span>
                                            <div className="flex space-x-1">
                                                {['ACTIVE', 'MAINTENANCE', 'CLOSED'].map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleStatusUpdate(turf.id, s)}
                                                        className={cn(
                                                            "px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                            turf.status === s
                                                                ? (s === 'ACTIVE' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : s === 'MAINTENANCE' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" : "bg-rose-500 text-white shadow-lg shadow-rose-100")
                                                                : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100"
                                                        )}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <Link
                                                href={`/admin/turfs/${turf.id}/slots`}
                                                className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-center font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <Settings size={16} />
                                                <span>Manage Slots</span>
                                            </Link>
                                            <Link
                                                href={`/admin/turfs/${turf.id}/edit`}
                                                className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-2xl text-center font-bold text-sm hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <Pencil size={16} />
                                                <span>Edit Details</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Bookings */}
                <section className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Calendar size={20} className="mr-2 text-indigo-600" />
                        Latest Bookings
                    </h2>
                    {loading ? <Loader2 className="animate-spin text-indigo-600" /> : data.bookings.length === 0 ? (
                        <p className="text-slate-400 text-center py-10">No bookings yet</p>
                    ) : (
                        <div className="space-y-4">
                            {data.bookings.slice(0, 5).map((b: any) => (
                                <div key={b.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                            {b.userName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{b.userName || 'User'}</div>
                                            <div className="text-xs text-slate-500">{b.turf?.name} • {b.slot?.date}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-indigo-600">{b.slot?.start_time} – {b.slot?.end_time}</div>
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase mt-0.5">Confirmed</div>
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
