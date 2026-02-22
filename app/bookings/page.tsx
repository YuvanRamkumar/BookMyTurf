"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Trophy, Download, X, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function BookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchBookings = () => {
        setLoading(true);
        fetch("/api/bookings")
            .then(res => res.json())
            .then(data => {
                setBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId: string) => {
        setCancellingId(bookingId);
        setShowConfirmModal(null);

        try {
            const res = await fetch(`/api/bookings?id=${bookingId}`, {
                method: "DELETE",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Cancellation failed");

            setToast({ type: 'success', text: 'Booking cancelled successfully! The slot is now available again.' });
            // Remove the cancelled booking from local state
            setBookings(prev => prev.filter(b => b.id !== bookingId));
        } catch (err: any) {
            setToast({ type: 'error', text: err.message });
        } finally {
            setCancellingId(null);
            // Auto-dismiss toast after 4 seconds
            setTimeout(() => setToast(null), 4000);
        }
    };

    return (
        <Shell>
            <div className="max-w-6xl mx-auto pb-20">
                <header className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 mb-3">My Bookings</h1>
                    <p className="text-slate-500 font-medium text-lg">Track your games, wins, and future sessions.</p>
                </header>

                {/* Toast Notification */}
                {toast && (
                    <div className={cn(
                        "fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center space-x-3 animate-in slide-in-from-top-4 fade-in max-w-md",
                        toast.type === 'success'
                            ? "bg-white border-emerald-200 text-emerald-700"
                            : "bg-white border-rose-200 text-rose-700"
                    )}>
                        {toast.type === 'success'
                            ? <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                            : <AlertTriangle size={20} className="shrink-0 text-rose-500" />
                        }
                        <span className="font-semibold text-sm">{toast.text}</span>
                        <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] p-10 max-w-md w-full mx-4 shadow-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-rose-500 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Cancel Booking?</h3>
                            <p className="text-slate-500 text-center mb-8 text-sm">
                                This action cannot be undone. The slot will become available for others to book.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowConfirmModal(null)}
                                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={() => handleCancel(showConfirmModal)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                                >
                                    Yes, Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-[32px] border border-slate-100" />)}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">No Bookings Yet</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">You haven't booked any arenas yet. Start by browsing available turfs.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className={cn(
                                    "bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-8 group overflow-hidden relative",
                                    cancellingId === booking.id && "opacity-50 pointer-events-none"
                                )}
                            >
                                <div className="flex items-center space-x-8 relative z-10">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-[28px] flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                                        {booking.turf?.sport_type?.charAt(0) || 'T'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-y-1">
                                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{booking.turf?.name}</h3>
                                            <span className="text-[10px] px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black uppercase tracking-widest border border-indigo-100/50 shrink-0">{booking.turf?.sport_type}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center text-slate-400 text-xs font-bold uppercase tracking-wider gap-x-6 gap-y-2">
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-2 text-indigo-400/50" />
                                                {booking.slot?.date}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-2 text-indigo-400/50" />
                                                {booking.slot?.start_time} - {booking.slot?.end_time}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin size={14} className="mr-2 text-indigo-400/50" />
                                                {booking.turf?.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 pt-6 md:pt-0 border-slate-50 relative z-10 shrink-0">
                                    <div className="text-3xl font-black text-slate-900 mb-2">{formatCurrency(booking.turf?.price_per_hour || 0)}</div>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-tighter border border-emerald-100">Confirmed</span>
                                        <button
                                            onClick={() => setShowConfirmModal(booking.id)}
                                            disabled={cancellingId === booking.id}
                                            className="px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 hover:text-rose-600 transition-all border border-rose-100 flex items-center space-x-1.5 disabled:opacity-50"
                                        >
                                            {cancellingId === booking.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <X size={14} />
                                            )}
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 translate-x-16 -translate-y-16 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
