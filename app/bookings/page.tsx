"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import {
    Calendar, MapPin, Clock, Trophy, X, AlertTriangle, Loader2,
    CheckCircle2, History, CalendarCheck, Ban, TimerOff, ChevronRight
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

type BookingStatus = 'confirmed' | 'cancelled' | 'expired';

interface DetailedBooking {
    id: string;
    user_id: string;
    turf_id: string;
    slot_id: string;
    status: BookingStatus;
    booked_at: string;
    turf?: { name: string; location: string; sport_type: string; price_per_hour: number };
    slot?: { date: string; start_time: string; end_time: string };
    userName?: string;
    userEmail?: string;
    price_paid: number;
    cancellation_charge?: number;
}

export default function BookingsPage() {
    const [allBookings, setAllBookings] = useState<DetailedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const fetchBookings = () => {
        setLoading(true);
        fetch("/api/bookings")
            .then(res => res.json())
            .then(data => {
                setAllBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        // Check if we were redirected from /bookings/history
        const tabIntent = sessionStorage.getItem("bookings_tab");
        if (tabIntent === "history") {
            setActiveTab("history");
            sessionStorage.removeItem("bookings_tab");
        }
        fetchBookings();
    }, []);

    const upcoming = allBookings.filter(b => b.status === 'confirmed');
    const history = allBookings.filter(b => b.status === 'cancelled' || b.status === 'expired');

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    const handleCancel = async (bookingId: string) => {
        setCancellingId(bookingId);
        setShowConfirmModal(null);

        try {
            const res = await fetch(`/api/bookings?id=${bookingId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Cancellation failed");

            const b = allBookings.find(x => x.id === bookingId);
            const refund = b ? (b.price_paid * 0.8) : 0;
            showToast('success', `Booking cancelled! Refund of ${formatCurrency(refund)} (80%) will be processed within 24 hours.`);
            // Move from confirmed to cancelled in local state
            setAllBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
            );
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setCancellingId(null);
        }
    };

    const statusBadge = (status: BookingStatus) => {
        if (status === 'confirmed') return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-emerald-100">
                <CheckCircle2 size={10} /> Confirmed
            </span>
        );
        if (status === 'cancelled') return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-rose-100">
                <Ban size={10} /> Cancelled
            </span>
        );
        if (status === 'expired') return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-slate-200">
                <TimerOff size={10} /> Expired
            </span>
        );
    };

    const BookingCard = ({ booking, isHistory }: { booking: DetailedBooking; isHistory: boolean }) => (
        <div className={cn(
            "bg-white p-7 rounded-[28px] border shadow-sm transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group overflow-hidden relative",
            isHistory
                ? "border-slate-100 opacity-75 hover:opacity-100"
                : "border-slate-100 hover:shadow-xl hover:shadow-slate-200/50",
            cancellingId === booking.id && "opacity-40 pointer-events-none"
        )}>
            {/* Decorative circle */}
            <div className={cn(
                "absolute top-0 right-0 w-28 h-28 translate-x-14 -translate-y-14 rounded-full transition-transform duration-700",
                isHistory ? "bg-slate-100/50" : "bg-indigo-600/5 group-hover:scale-150"
            )} />

            {/* Left: Info */}
            <div className="flex items-center gap-6 relative z-10">
                <div className={cn(
                    "w-16 h-16 rounded-[20px] flex items-center justify-center font-black text-xl shrink-0 transition-all duration-300",
                    isHistory
                        ? "bg-slate-100 text-slate-400"
                        : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
                )}>
                    {booking.turf?.sport_type?.charAt(0) || 'T'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className={cn(
                            "text-lg font-black truncate transition-colors",
                            isHistory ? "text-slate-500" : "text-slate-900 group-hover:text-indigo-600"
                        )}>
                            {booking.turf?.name}
                        </h3>
                        <span className="text-[10px] px-2.5 py-1 bg-indigo-50 text-indigo-500 rounded-full font-black uppercase tracking-widest border border-indigo-100/50 shrink-0">
                            {booking.turf?.sport_type}
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center text-slate-400 text-xs font-bold uppercase tracking-wider gap-x-5 gap-y-1">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-indigo-400/50" />
                            {booking.slot?.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-indigo-400/50" />
                            {booking.slot?.start_time} – {booking.slot?.end_time}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-indigo-400/50" />
                            {booking.turf?.location}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right: Price + Actions */}
            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t md:border-t-0 pt-5 md:pt-0 border-slate-50 relative z-10 shrink-0 gap-3">
                <div className={cn(
                    "text-2xl font-black",
                    isHistory ? "text-slate-400" : "text-slate-900"
                )}>
                    {formatCurrency(booking.turf?.price_per_hour || 0)}
                </div>
                <div className="flex items-center gap-2">
                    {statusBadge(booking.status)}
                    {!isHistory && (
                        <button
                            onClick={() => setShowConfirmModal(booking.id)}
                            disabled={!!cancellingId}
                            className="px-3 py-1.5 bg-rose-50 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-100 hover:text-rose-600 transition-all border border-rose-100 flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {cancellingId === booking.id
                                ? <Loader2 size={12} className="animate-spin" />
                                : <X size={12} />
                            }
                            <span>Cancel</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const EmptyState = ({ tab }: { tab: 'upcoming' | 'history' }) => (
        <div className="text-center py-24 bg-white rounded-[36px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5">
                {tab === 'upcoming'
                    ? <CalendarCheck size={34} className="text-slate-300" />
                    : <History size={34} className="text-slate-300" />
                }
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
                {tab === 'upcoming' ? 'No Upcoming Bookings' : 'No History Yet'}
            </h3>
            <p className="text-slate-400 max-w-xs mx-auto font-medium text-sm">
                {tab === 'upcoming'
                    ? "You have no active bookings. Browse turfs to reserve your next slot!"
                    : "Completed, cancelled, and expired bookings will appear here."
                }
            </p>
            {tab === 'upcoming' && (
                <Link
                    href="/turfs"
                    className="inline-flex items-center gap-2 mt-7 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm"
                >
                    Browse Turfs <ChevronRight size={16} />
                </Link>
            )}
        </div>
    );

    return (
        <Shell>
            <div className="max-w-5xl mx-auto pb-20">

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">My Bookings</h1>
                    <p className="text-slate-500 font-medium">Manage your sessions and review your game history.</p>
                </header>

                {/* Stats row */}
                {!loading && (
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                <CalendarCheck size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900">{upcoming.length}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center shrink-0">
                                <Ban size={20} className="text-rose-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900">
                                    {history.filter(b => b.status === 'cancelled').length}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled</div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                <TimerOff size={20} className="text-slate-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-black text-slate-900">
                                    {history.filter(b => b.status === 'expired').length}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            activeTab === 'upcoming'
                                ? "bg-white text-indigo-600 shadow-sm border border-indigo-100/50"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <CalendarCheck size={16} />
                        Upcoming
                        {!loading && upcoming.length > 0 && (
                            <span className="ml-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                {upcoming.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
                            activeTab === 'history'
                                ? "bg-white text-slate-700 shadow-sm border border-slate-200/50"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <History size={16} />
                        History
                        {!loading && history.length > 0 && (
                            <span className="ml-1 bg-slate-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                                {history.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-28 bg-white animate-pulse rounded-[28px] border border-slate-100" />
                        ))}
                    </div>
                ) : activeTab === 'upcoming' ? (
                    upcoming.length === 0
                        ? <EmptyState tab="upcoming" />
                        : (
                            <div className="grid gap-4">
                                {upcoming.map(booking => (
                                    <BookingCard key={booking.id} booking={booking} isHistory={false} />
                                ))}
                            </div>
                        )
                ) : (
                    history.length === 0
                        ? <EmptyState tab="history" />
                        : (
                            <div className="grid gap-4">
                                {/* Cancelled first, then expired, sorted by date */}
                                {[...history]
                                    .sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime())
                                    .map(booking => (
                                        <BookingCard key={booking.id} booking={booking} isHistory={true} />
                                    ))
                                }
                            </div>
                        )
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in max-w-sm",
                    toast.type === 'success'
                        ? "bg-white border-emerald-200 text-emerald-700"
                        : "bg-white border-rose-200 text-rose-700"
                )}>
                    {toast.type === 'success'
                        ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                        : <AlertTriangle size={18} className="shrink-0 text-rose-500" />
                    }
                    <span className="font-semibold text-sm">{toast.text}</span>
                    <button onClick={() => setToast(null)} className="ml-1 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={13} />
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
                            A 20% cancellation fee ({formatCurrency((allBookings.find(b => b.id === showConfirmModal)?.price_paid || 0) * 0.2)}) will be deducted. An 80% refund will be issued to your original payment method.
                        </p>
                        <div className="flex gap-3">
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
        </Shell>
    );
}
