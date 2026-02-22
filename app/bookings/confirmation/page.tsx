"use client";

import Shell from "@/components/Shell";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Trophy, ArrowRight, Download, Home } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [booking, setBooking] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetch("/api/bookings")
                .then(res => res.json())
                .then(data => {
                    const b = data.find((x: any) => x.id === id);
                    setBooking(b);
                });
        }
    }, [id]);

    if (!booking) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto py-10">
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-indigo-50/50 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>

                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                    <CheckCircle2 className="text-emerald-600 w-12 h-12" />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
                <p className="text-slate-500 mb-10 text-lg">Your slot at {booking.turf?.name} is secured. Get ready for the game!</p>

                <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left space-y-4">
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                        <span className="text-slate-500 text-sm">Booking ID</span>
                        <span className="font-mono font-bold text-slate-900 uppercase">#{booking.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                        <span className="text-slate-500 text-sm">Venue</span>
                        <span className="font-bold text-slate-900">{booking.turf?.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                        <span className="text-slate-500 text-sm">Date & Time</span>
                        <span className="font-bold text-indigo-600">{booking.slot?.date} • {booking.slot?.start_time} - {booking.slot?.end_time}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                        <span className="text-slate-500 font-bold">Total Paid</span>
                        <span className="text-2xl font-black text-slate-900">{formatCurrency(booking.turf?.price_per_hour)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard" className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        <Home size={18} className="mr-2" />
                        Go Home
                    </Link>
                    <Link href="/bookings" className="flex items-center justify-center px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                        My Bookings
                        <ArrowRight size={18} className="ml-2" />
                    </Link>
                </div>
            </div>

            <p className="text-center text-slate-400 text-xs mt-8">
                Need help? Contact support@turfbook.com
            </p>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Shell>
            <Suspense fallback={<div>Loading...</div>}>
                <ConfirmationContent />
            </Suspense>
        </Shell>
    );
}
