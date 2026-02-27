"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MapPin, Trophy, Star, Clock, AlertCircle,
    CheckCircle2, Loader2, Info, ListChecks,
    CheckSquare, MessageSquare, Plus,
    Car, Zap, Bath, Shirt, Droplets, Layout, UtensilsCrossed, Lock,
    ChevronLeft
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { format } from "date-fns";

export default function TurfDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const [turf, setTurf] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [canReview, setCanReview] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/turfs/${id}`);
                const data = await res.json();

                if (res.status === 404 || (data.status && data.status !== 'APPROVED')) {
                    router.push('/404');
                    return;
                }
                setTurf(data);

                // Check auth and booking status
                const authRes = await fetch("/api/auth/me");
                const authData = await authRes.json();
                if (authData.user) {
                    setIsLoggedIn(true);
                    setUser(authData.user);

                    // Check if user has confirmed booking for this turf
                    const bookingRes = await fetch(`/api/bookings?userId=${authData.user.id}&turfId=${id}&status=CONFIRMED`);
                    const bookingData = await bookingRes.json();
                    if (Array.isArray(bookingData) && bookingData.length > 0) {
                        setCanReview(true);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, router]);

    const amenityIconMap: { [key: string]: any } = {
        "Parking": Car,
        "Floodlights": Zap,
        "Washroom": Bath,
        "Changing Room": Shirt,
        "Drinking Water": Droplets,
        "Seating Area": Layout,
        "Cafeteria": UtensilsCrossed,
        "Locker Room": Lock
    };

    if (loading || !turf) {
        return (
            <Shell>
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Back Button */}
                <div className="flex items-center">
                    <button
                        onClick={() => router.push('/turfs')}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:border-white/20 transition-all mr-6 group backdrop-blur-md"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Explore Arenas</h2>
                        <p className="text-xl font-black text-white leading-none">Arena Details</p>
                    </div>
                </div>

                {/* 1️⃣ Hero Section */}
                <section className="bg-slate-900/50 backdrop-blur-xl rounded-[48px] overflow-hidden border border-white/5 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Carousel Mock (Using single image for now as requested images array is string[]) */}
                        <div className="h-[400px] bg-slate-100 relative group">
                            {turf.images && turf.images.length > 0 ? (
                                <img src={turf.images[0]} alt={turf.name} className="w-full h-full object-cover" />
                            ) : turf.image_url ? (
                                <img src={turf.image_url} alt={turf.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                    <Trophy size={64} className="text-indigo-200" />
                                </div>
                            )}
                            <div className="absolute top-6 left-6 flex space-x-2">
                                <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                    {turf.sport_type === 'FOOTBALL_CRICKET' ? 'FOOTBALL / CRICKET' : turf.sport_type}
                                </div>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="p-10 flex flex-col justify-between">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2 leading-tight uppercase tracking-tight">{turf.name}</h1>
                                <div className="flex items-center text-slate-400 mb-6 font-bold">
                                    <MapPin size={18} className="mr-2 text-blue-500" />
                                    <span>{turf.location}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                                            <Trophy size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500">Price</p>
                                            <p className="font-black text-blue-500 text-lg">{formatCurrency(turf.price_per_hour)}/hr</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                            <Star size={20} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400">Rating</p>
                                            <p className="font-black text-emerald-600 text-lg">{turf.avgRating?.toFixed(1) || '0.0'} <span className="text-[10px] text-slate-400 ml-1">({turf.reviewCount || 0})</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 col-span-2">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500">Operating Hours</p>
                                            <p className="font-black text-white">{turf.opening_time} – {turf.closing_time}</p>
                                        </div>
                                    </div>

                                    {/* Dynamic Pricing Info */}
                                    <div className="col-span-2 p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20 flex items-start space-x-4">
                                        <div className="p-2 bg-amber-500 text-white rounded-xl">
                                            <Zap size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Peak Hour Pricing</h4>
                                            <p className="text-slate-400 text-xs font-bold leading-relaxed">
                                                Weekend stay: <span className="text-white">{formatCurrency(turf.weekend_price)}/hr</span>.
                                                Peak surge ({turf.peak_start_time}-{turf.peak_end_time}) applies a <span className="text-white">{turf.peak_hour_multiplier}x</span> multiplier.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/turf/${id}/book`)}
                                className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-indigo-200 active:scale-95"
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                </section>

                {/* Grid for Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2️⃣ About Section */}
                    <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                <Info size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-white">About Arena</h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            {turf.description || "Exciting arena with top-tier facilities for the best sporting experience."}
                        </p>

                        <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ground Details</h4>
                                <p className="font-bold text-white">Premium Synthetic Turf</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Size</h4>
                                <p className="font-bold text-white">7-aside / 40x80m</p>
                            </div>
                        </div>
                    </section>

                    {/* 3️⃣ Amenities Section */}
                    <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                                <ListChecks size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Amenities</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            {(turf.amenities && turf.amenities.length > 0 ? turf.amenities : ["Parking", "Washroom", "Drinking Water"]).map((item: string) => {
                                const Icon = amenityIconMap[item] || CheckCircle2;
                                return (
                                    <div key={item} className="flex items-center space-x-3 bg-white/5 p-4 rounded-2xl group hover:bg-blue-600/10 transition-all border border-transparent hover:border-white/10">
                                        <div className="p-2 bg-white/5 rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                                            <Icon size={18} />
                                        </div>
                                        <span className="font-bold text-slate-300 text-sm">{item}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 4️⃣ Precautions Section */}
                    <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-6 md:col-span-2">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                                <AlertCircle size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-white">Rules & Precautions</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(turf.precautions && turf.precautions.length > 0 ? turf.precautions : [
                                "Safety equipment recommended",
                                "Cancellation allowed up to 4h before",
                                "No smoking allowed inside arena",
                                "Required footwear: Multi-studs / Flats"
                            ]).filter((p: string) => p.trim().length > 0).map((rule: string) => (
                                <div key={rule} className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <CheckSquare size={18} className="text-emerald-400 shrink-0" />
                                    <span className="font-bold text-slate-400 text-sm leading-snug">{rule}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5️⃣ Reviews Section */}
                    <section className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] p-10 border border-white/5 shadow-2xl space-y-8 md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                                    <MessageSquare size={20} />
                                </div>
                                <h2 className="text-2xl font-black text-white">Member Reviews</h2>
                            </div>
                            {canReview && (
                                <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all text-sm shadow-xl shadow-blue-900/40">
                                    <Plus size={16} className="mr-2" />
                                    Write Review
                                </button>
                            )}
                        </div>

                        {turf.reviews && turf.reviews.length > 0 ? (
                            <div className="space-y-6">
                                {turf.reviews.map((rev: any) => (
                                    <div key={rev.id} className="p-6 bg-white/5 rounded-[32px] border border-white/10 flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center font-black text-blue-400 shrink-0 text-xl shadow-sm">
                                            {rev.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-black text-white">{rev.user?.name || 'Anonymous Lover'}</h4>
                                                <span className="text-[10px] font-black uppercase text-slate-500">{format(new Date(rev.created_at), "MMM dd, yyyy")}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-emerald-400 mb-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} strokeWidth={2.5} />
                                                ))}
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                                                "{rev.comment}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
                                <MessageSquare size={48} className="text-white/10 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-1">No reviews yet</h3>
                                <p className="text-slate-500 font-medium">Be the first to share your experience!</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {/* Sticky Book Now for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl md:hidden border-t border-slate-100 z-50">
                <button
                    onClick={() => router.push(`/turf/${id}/book`)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100"
                >
                    Book for {formatCurrency(turf.price_per_hour)}
                </button>
            </div>
        </Shell>
    );
}
