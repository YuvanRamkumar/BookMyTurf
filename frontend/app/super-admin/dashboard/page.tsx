"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Users, Trophy, Calendar, CheckCircle, XCircle, Trash2, Loader2, PieChart, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const res = await fetch("/api/super-admin/data");
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !data) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div></Shell>;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Platform Control</h1>
                    <p className="text-slate-500">Super Admin access to all system data.</p>
                </header>

                <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="text-slate-500 text-sm font-bold uppercase mb-2">Total Users</div>
                            <div className="text-4xl font-black text-slate-900">{data?.stats.totalUsers}</div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="text-slate-500 text-sm font-bold uppercase mb-2">Total Owners</div>
                            <div className="text-4xl font-black text-slate-900">{data?.stats.totalAdmins}</div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="text-slate-500 text-sm font-bold uppercase mb-2">Total Venues</div>
                            <div className="text-4xl font-black text-slate-900">{data?.stats.totalTurfs}</div>
                        </div>
                        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="text-slate-500 text-sm font-bold uppercase mb-2">Bookings</div>
                            <div className="text-4xl font-black text-indigo-600">{data?.stats.totalBookings}</div>
                        </div>
                    </div>

                    <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Recent Activity</h2>
                        <div className="space-y-4">
                            {data?.bookings.slice(0, 10).map((b: any) => (
                                <div key={b.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">{b.userName?.charAt(0)}</div>
                                        <div>
                                            <div className="font-bold text-slate-900">{b.userName} booked {b.turfName}</div>
                                            <div className="text-xs text-slate-500">{new Date(b.booked_at).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="font-black text-indigo-600">+ ₹{b.turf?.price_per_hour}</div>
                                </div>
                            ))}
                            {data?.bookings.length === 0 && (
                                <p className="text-center py-10 text-slate-400 font-medium">No recent bookings found.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </Shell>
    );
}
