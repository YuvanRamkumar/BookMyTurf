"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Trophy, Star, Clock, AlertCircle, CheckCircle2, Loader2, MousePointer2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

export default function TurfDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [turf, setTurf] = useState<any>(null);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

    useEffect(() => {
        fetch(`/api/turfs/${id}`)
            .then(res => res.json())
            .then(data => setTurf(data));
    }, [id]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/slots?turfId=${id}&date=${selectedDate}`)
            .then(res => res.json())
            .then(data => {
                setSlots(Array.isArray(data) ? data : []);
                setLoading(false);
            });
    }, [id, selectedDate]);

    const toggleSlot = (slotId: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(sid => sid !== slotId)
                : [...prev, slotId]
        );
    };

    const handleBooking = async () => {
        if (selectedSlots.length === 0) return;
        setBookingLoading(true);
        setMessage(null);

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ turf_id: id, slot_ids: selectedSlots }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed");

            setMessage({ type: 'success', text: "Booking confirmed! Redirecting to confirmation page..." });
            setTimeout(() => {
                router.push(`/bookings/confirmation?id=${data.id}`);
            }, 1500);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setBookingLoading(false);
        }
    };

    if (!turf) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div></Shell>;

    const totalPrice = (turf.price_per_hour || 0) * selectedSlots.length;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Trophy size={120} className="text-indigo-600" />
                            </div>

                            <div className="flex items-center space-x-2 text-indigo-600 font-bold mb-4 uppercase tracking-wider text-xs">
                                <Star size={14} fill="currentColor" />
                                <span>Featured Arena</span>
                            </div>

                            <h1 className="text-4xl font-black text-slate-900 mb-2">{turf.name}</h1>
                            <div className="flex items-center text-slate-500 mb-6 font-medium">
                                <MapPin size={18} className="mr-1" />
                                <span className="text-lg">{turf.location}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-tight">Sport Type</span>
                                    <span className="font-bold text-slate-900">{turf.sport_type}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-tight">Price</span>
                                    <span className="font-bold text-slate-900">{formatCurrency(turf.price_per_hour)}/hr</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-tight">Opens</span>
                                    <span className="font-bold text-slate-900">{turf.opening_time}</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <span className="text-xs text-slate-500 block mb-1 font-bold uppercase tracking-tight">Closes</span>
                                    <span className="font-bold text-slate-900">{turf.closing_time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center">
                                    <Calendar size={24} className="mr-3 text-indigo-600" />
                                    Book Slots
                                </h2>
                                <div className="flex items-center space-x-2 text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <MousePointer2 size={12} />
                                    <span>Select multiple slots</span>
                                </div>
                            </div>

                            <div className="flex space-x-3 overflow-x-auto pb-6 mb-8">
                                {dates.map((date) => {
                                    const dateStr = format(date, "yyyy-MM-dd");
                                    const isSelected = selectedDate === dateStr;
                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => { setSelectedDate(dateStr); setSelectedSlots([]); }}
                                            className={cn(
                                                "flex flex-col items-center justify-center min-w-[85px] h-28 rounded-3xl border transition-all duration-300",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-indigo-400 hover:scale-105"
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{format(date, "EEE")}</span>
                                            <span className="text-3xl font-black">{format(date, "dd")}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {slots
                                        .filter(slot => {
                                            const isPast = slot.date === format(new Date(), "yyyy-MM-dd") && slot.start_time < format(new Date(), "HH:mm");
                                            return !isPast;
                                        })
                                        .map((slot) => {
                                            const isSelected = selectedSlots.includes(slot.id);

                                            return (
                                                <button
                                                    key={slot.id}
                                                    disabled={slot.is_booked}
                                                    onClick={() => toggleSlot(slot.id)}
                                                    className={cn(
                                                        "px-4 py-5 rounded-[24px] border-2 font-bold transition-all duration-200 flex flex-col items-center justify-center group relative overflow-hidden",
                                                        slot.is_booked
                                                            ? "bg-amber-100 border-amber-200 text-amber-700 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                                : "bg-white border-slate-100 text-slate-600 hover:border-indigo-600 hover:text-indigo-600"
                                                    )}
                                                >
                                                    <div className="flex items-center space-x-1.5">
                                                        <span className="text-base font-black">{slot.start_time}</span>
                                                        <span className="text-xs opacity-50">–</span>
                                                        <span className="text-base font-black">{slot.end_time}</span>
                                                    </div>
                                                    <span className="text-[10px] uppercase mt-1 opacity-70">
                                                        {slot.is_booked ? "Reserved" : "Free"}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="absolute top-1.5 right-1.5">
                                                            <CheckCircle2 size={16} className="text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Summary Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm sticky top-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-8">Booking Summary</h2>

                            <div className="space-y-6 mb-10">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Venue</span>
                                    <p className="font-black text-slate-900">{turf.name}</p>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</span>
                                    <p className="font-bold text-slate-900">{format(new Date(selectedDate), "MMMM dd, yyyy")}</p>
                                </div>

                                <div className="space-y-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Selected Slots ({selectedSlots.length})</span>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSlots.length > 0 ? (
                                            selectedSlots.map(sid => {
                                                const s = slots.find(x => x.id === sid);
                                                return s ? (
                                                    <span key={sid} className="px-3 py-1.5 bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black">
                                                        {s.start_time} – {s.end_time}
                                                    </span>
                                                ) : null;
                                            })
                                        ) : (
                                            <p className="text-sm font-medium text-slate-400 italic">No slots selected yet...</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold">Total Amount</span>
                                        <span className="text-3xl font-black text-slate-900">{formatCurrency(totalPrice)}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Includes all taxes and fees</p>
                                </div>
                            </div>

                            {turf.status !== 'active' && (
                                <div className={cn(
                                    "p-6 rounded-[32px] mb-8 border flex items-start space-x-4",
                                    turf.status === 'maintenance' ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-rose-50 border-rose-200 text-rose-800"
                                )}>
                                    <AlertCircle size={28} className="shrink-0 text-amber-600" />
                                    <div>
                                        <h4 className="font-black text-lg mb-1">{turf.status === 'maintenance' ? "Under Maintenance" : "Temporarily Closed"}</h4>
                                        <p className="text-sm font-medium opacity-80">This arena is currently {turf.status}. We are not accepting new bookings at this time. Please check back later.</p>
                                    </div>
                                </div>
                            )}

                            {message && (
                                <div className={cn(
                                    "p-5 rounded-3xl mb-8 text-sm flex items-start space-x-3",
                                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                                )}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                                    <span className="font-semibold">{message.text}</span>
                                </div>
                            )}

                            <button
                                disabled={selectedSlots.length === 0 || bookingLoading || turf.status !== 'active'}
                                onClick={handleBooking}
                                className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2"
                            >
                                {bookingLoading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>{turf.status === 'active' ? 'Confirm Booking' : 'Unavailable'}</span>
                                        <CheckCircle2 size={24} />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 flex items-center justify-center space-x-3 text-slate-400 bg-slate-50 py-3 rounded-2xl">
                                <Clock size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest">Instant Confirmation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
