"use client";

import Shell from "@/components/Shell";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar, MapPin, Trophy, Star, Clock, AlertCircle,
    CheckCircle2, Loader2, MousePointer2, CreditCard,
    ArrowRight, ChevronLeft, Info
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, addDays, isSameDay } from "date-fns";

export default function BookingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [turf, setTurf] = useState<any>(null);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

    useEffect(() => {
        fetch(`/api/turfs/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    router.push('/404');
                    return;
                }
                setTurf(data);
                setLoading(false);
            });
    }, [id, router]);

    useEffect(() => {
        setSlotsLoading(true);
        fetch(`/api/slots?turfId=${id}&date=${selectedDate}`)
            .then(res => res.json())
            .then(data => {
                setSlots(Array.isArray(data) ? data : []);
                setSlotsLoading(false);
            });
    }, [id, selectedDate]);

    const toggleSlot = (slotId: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(sid => sid !== slotId)
                : [...prev, slotId]
        );
    };

    const handleConfirmBooking = async () => {
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

            // Redirect to the existing confirmation/payment page
            router.push(`/bookings/confirmation?id=${data.id}`);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setBookingLoading(false);
        }
    };

    if (loading || !turf) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div></Shell>;

    const subtotal = (turf.price_per_hour || 0) * selectedSlots.length;
    const platformFee = selectedSlots.length > 0 ? 20 : 0;
    const totalPrice = subtotal + platformFee;

    const currentTimeStr = format(new Date(), "HH:mm");
    const todayStr = format(new Date(), "yyyy-MM-dd");

    return (
        <Shell>
            <div className="max-w-6xl mx-auto px-4">
                {/* Header with Back Button */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.push(`/turf/${id}`)}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all mr-6 group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 leading-none">Schedule Session</h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 flex items-center">
                            <MapPin size={12} className="mr-1 text-indigo-500" /> {turf.location}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Slot Selection */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Summary Card */}
                        <div className="bg-indigo-600 rounded-[40px] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-10">
                                <Trophy size={200} />
                            </div>
                            <h2 className="text-3xl font-black mb-1">{turf.name}</h2>
                            <div className="flex items-center space-x-4 opacity-80 font-bold text-sm">
                                <div className="flex items-center"><Star size={14} className="mr-1 fill-white" /> {turf.avgRating?.toFixed(1) || '0.0'}</div>
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div>{turf.sport_type}</div>
                            </div>
                        </div>

                        {/* Date Picker */}
                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <Calendar size={22} className="mr-3 text-indigo-600" />
                                    Select Date
                                </h3>
                            </div>

                            <div className="flex space-x-4 overflow-x-auto pb-6 scrollbar-hide">
                                {dates.map((date) => {
                                    const dateStr = format(date, "yyyy-MM-dd");
                                    const isSelected = selectedDate === dateStr;
                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => { setSelectedDate(dateStr); setSelectedSlots([]); }}
                                            className={cn(
                                                "flex flex-col items-center justify-center min-w-[90px] h-32 rounded-3xl border-2 transition-all duration-300 group",
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105"
                                                    : "bg-white border-slate-50 text-slate-400 hover:border-indigo-100 hover:text-slate-600"
                                            )}
                                        >
                                            <span className="text-[10px] uppercase font-black tracking-widest mb-2 opacity-60 group-hover:opacity-100">{format(date, "EEE")}</span>
                                            <span className="text-3xl font-black">{format(date, "dd")}</span>
                                            <span className="text-[10px] uppercase font-black tracking-widest mt-2">{format(date, "MMM")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Slots */}
                        <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 flex items-center">
                                    <Clock size={22} className="mr-3 text-indigo-600" />
                                    Available Slots
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div> Available
                                    </div>
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-2"></div> Booked
                                    </div>
                                </div>
                            </div>

                            {slotsLoading ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-20 bg-slate-50 rounded-3xl" />)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {slots.map((slot) => {
                                        const isSelected = selectedSlots.includes(slot.id);
                                        const isPast = selectedDate === todayStr && slot.start_time < currentTimeStr;
                                        const isBooked = slot.is_booked;

                                        return (
                                            <button
                                                key={slot.id}
                                                disabled={isBooked || isPast}
                                                onClick={() => toggleSlot(slot.id)}
                                                className={cn(
                                                    "p-6 rounded-[28px] border-2 font-black transition-all duration-200 flex flex-col items-center justify-center relative overflow-hidden group",
                                                    isPast
                                                        ? "bg-slate-50 border-transparent text-slate-300 cursor-not-allowed opacity-60"
                                                        : isBooked
                                                            ? "bg-rose-50 border-rose-100 text-rose-600 cursor-not-allowed"
                                                            : isSelected
                                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-95"
                                                                : "bg-white border-slate-100 text-slate-700 hover:border-indigo-600 hover:text-indigo-600"
                                                )}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg leading-none">{slot.start_time}</span>
                                                    <span className="text-[10px] uppercase opacity-40 mt-1">To</span>
                                                    <span className="text-lg leading-none">{slot.end_time}</span>
                                                </div>
                                                <div className={cn(
                                                    "absolute bottom-0 left-0 w-full h-1",
                                                    isPast ? "bg-slate-200" : isBooked ? "bg-rose-400" : isSelected ? "bg-white" : "bg-emerald-400"
                                                )}></div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {slots.length === 0 && !slotsLoading && (
                                <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                                    <Clock size={40} className="text-slate-200 mx-auto mb-4" />
                                    <p className="font-bold text-slate-400">No slots created for this date.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[48px] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 sticky top-8">
                            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center">
                                <Info size={24} className="mr-3 text-indigo-600" />
                                Payment Summary
                            </h3>

                            <div className="space-y-6 mb-10">
                                <div className="space-y-4">
                                    {selectedSlots.length > 0 ? (
                                        selectedSlots.map(sid => {
                                            const s = slots.find(x => x.id === sid);
                                            return s ? (
                                                <div key={sid} className="flex justify-between items-center bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                                                    <div>
                                                        <p className="font-black text-indigo-600 text-sm leading-none">{s.start_time} – {s.end_time}</p>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 mt-1.5">{format(new Date(selectedDate), "EEE, MMM dd")}</p>
                                                    </div>
                                                    <span className="font-black text-slate-900">{formatCurrency(turf.price_per_hour)}</span>
                                                </div>
                                            ) : null;
                                        })
                                    ) : (
                                        <div className="py-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">No slots selected</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Subtotal</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Platform Fee</span>
                                        <span className="font-bold text-slate-900">{formatCurrency(platformFee)}</span>
                                    </div>
                                    <div className="pt-4 flex justify-between items-center">
                                        <span className="text-slate-900 font-black text-xl leading-none">Total</span>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-indigo-600 leading-none block">{formatCurrency(totalPrice)}</span>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">All inclusive</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={cn(
                                    "p-5 rounded-[24px] mb-8 text-sm flex items-start space-x-3",
                                    message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                                )}>
                                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                                    <span className="font-bold">{message.text}</span>
                                </div>
                            )}

                            <button
                                disabled={selectedSlots.length === 0 || bookingLoading || turf.operational_status !== 'ACTIVE'}
                                onClick={handleConfirmBooking}
                                className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-2xl shadow-indigo-100 flex items-center justify-center space-x-3 active:scale-95"
                            >
                                {bookingLoading ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>Confirm Booking</span>
                                        <ArrowRight size={24} />
                                    </>
                                )}
                            </button>

                            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col items-center">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                        <CreditCard size={14} className="text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secured by Razorpay</span>
                                </div>
                                <div className="flex space-x-4 opacity-30 grayscale hover:grayscale-0 transition-all">
                                    <img src="https://img.icons8.com/color/48/000000/google-pay.png" className="h-6" alt="GPay" />
                                    <img src="https://img.icons8.com/color/48/000000/phonepe.png" className="h-6" alt="PhonePe" />
                                    <img src="https://img.icons8.com/color/48/000000/paytm.png" className="h-6" alt="Paytm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Shell>
    );
}
