"use client";

import Shell from "@/components/Shell";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle2, Trophy, ArrowRight, Home, Loader2,
    AlertCircle, ShieldCheck, CreditCard, Lock as LockIcon
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

declare global {
    interface Window {
        Razorpay: any;
    }
}

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const [booking, setBooking] = useState<any>(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const PLATFORM_FEE = 20;

    const fetchBooking = async () => {
        if (!id) return;
        const res = await fetch("/api/bookings");
        const data = await res.json();
        const b = data.find((x: any) => x.id === id);
        setBooking(b);
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setPaymentLoading(true);
        setError(null);

        try {
            const res = await loadRazorpayScript();
            if (!res) {
                throw new Error("Razorpay SDK failed to load. Are you online?");
            }

            // Create Order
            const orderRes = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ booking_id: id }),
            });
            const orderData = await orderRes.json();

            if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

            const options = {
                key: orderData.key_id,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "BookMyTurf",
                description: `Booking for ${booking.turf.name}`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    setVerifying(true);
                    try {
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok) {
                            fetchBooking(); // Refresh to show success
                        } else {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }
                    } catch (err: any) {
                        setError(err.message);
                        fetchBooking(); // Might have marked it as failed
                    } finally {
                        setVerifying(false);
                    }
                },
                prefill: {
                    name: booking.userName,
                    email: booking.userEmail,
                },
                theme: {
                    color: "#2563EB",
                },
                modal: {
                    ondismiss: function () {
                        setPaymentLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setError(response.error.description);
                setPaymentLoading(false);
            });
            rzp.open();
        } catch (err: any) {
            setError(err.message);
            setPaymentLoading(false);
        }
    };

    if (!booking) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>;

    const totalAmount = booking.price_paid + PLATFORM_FEE;

    if (booking.status === 'confirmed') {
        return (
            <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-700">
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-indigo-50/50 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="text-emerald-600 w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-slate-500 mb-10 text-lg">Your game at <span className="font-bold text-slate-900">{booking.turf?.name}</span> is secured.</p>

                    <div className="bg-slate-50 rounded-3xl p-8 mb-10 text-left space-y-4">
                        <div className="flex justify-between border-b border-slate-200 pb-3">
                            <span className="text-slate-500 text-sm">Booking ID</span>
                            <span className="font-mono font-bold text-slate-900 uppercase">#{booking.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-3">
                            <span className="text-slate-500 text-sm">Payment ID</span>
                            <span className="font-mono text-xs font-bold text-slate-500 truncate ml-4 text-right">{booking.razorpay_payment_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Venue</span>
                            <span className="font-bold text-slate-900">{booking.turf?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Date & Time</span>
                            <span className="font-bold text-indigo-600">{booking.slot?.date} • {booking.slot?.start_time} - {booking.slot?.end_time}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard" className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                            <Home size={18} className="mr-2" /> Go Home
                        </Link>
                        <Link href="/bookings" className="flex items-center justify-center px-6 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                            My Bookings <ArrowRight size={18} className="ml-2" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (booking.status === 'failed') {
        return (
            <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-700">
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-rose-50/50 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
                    <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-600">
                        <AlertCircle size={48} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Payment Failed</h1>
                    <p className="text-slate-500 mb-10 text-lg">We couldn&apos;t confirm your booking due to a payment issue.</p>
                    <Link href={`/turfs/${booking.turf_id}`} className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        Try Again
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600/20"></div>

                <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
                    <ShieldCheck className="text-indigo-600 mr-3" />
                    Complete Payment
                </h1>

                <div className="space-y-6 mb-10">
                    <div className="flex items-start gap-4 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                            <Trophy className="text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900">{booking.turf?.name}</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                {booking.slot?.date} • {booking.slot?.start_time} - {booking.slot?.end_time}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Turf Price</span>
                            <span className="font-bold text-slate-900">{formatCurrency(booking.price_paid)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Platform Fee</span>
                            <span className="font-bold text-slate-900">{formatCurrency(PLATFORM_FEE)}</span>
                        </div>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-slate-900 font-black text-lg">Total Amount</span>
                            <span className="text-3xl font-black text-indigo-600">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-8 flex items-center gap-3 text-rose-600">
                        <AlertCircle size={20} className="shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={paymentLoading || verifying}
                    className="w-full bg-indigo-600 text-white py-5 rounded-[28px] font-black text-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2"
                >
                    {paymentLoading || verifying ? <Loader2 className="animate-spin" /> : (
                        <>
                            <span>Proceed to Secure Payment</span>
                            <CreditCard size={24} />
                        </>
                    )}
                </button>

                <div className="mt-8 flex flex-col items-center gap-4 py-4 border-t border-slate-50">
                    <div className="flex items-center gap-6 opacity-40">
                        <img src="https://img.icons8.com/color/48/000000/google-pay.png" className="h-6" alt="GPay" />
                        <img src="https://img.icons8.com/color/48/000000/phonepe.png" className="h-6" alt="PhonePe" />
                        <img src="https://img.icons8.com/color/48/000000/paytm.png" className="h-6" alt="Paytm" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                        <LockIcon size={12} />
                        Secured by Razorpay • UPI Supported
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Shell>
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>}>
                <ConfirmationContent />
            </Suspense>
        </Shell>
    );
}
