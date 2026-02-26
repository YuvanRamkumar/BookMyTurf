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
        // Add cache: 'no-store' to prevent stale data
        const res = await fetch("/api/super-admin/data", { cache: 'no-store' });
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveTurf = async (turfId: string, approve: boolean) => {
        try {
            const res = await fetch("/api/super-admin/approve-turf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ turfId, approve })
            });
            if (res.ok) {
                // Update local state immediately for instant feedback
                setData((prev: any) => ({
                    ...prev,
                    turfs: prev.turfs.map((t: any) =>
                        t.id === turfId ? { ...t, status: approve ? 'APPROVED' : 'REJECTED' } : t
                    )
                }));
            }
        } catch (err) {
            console.error(err);
        }
    };

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
                        <h2 className="text-2xl font-black text-slate-900 mb-8">Venue Status Monitoring</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-left text-slate-400 text-xs font-black uppercase tracking-widest">
                                        <th className="px-6 py-2">Arena Name</th>
                                        <th className="px-6 py-2">Owner</th>
                                        <th className="px-6 py-2">Status</th>
                                        <th className="px-6 py-2">Approval</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.turfs.map((turf: any) => (
                                        <tr key={turf.id} className="bg-slate-50 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-2xl">
                                            <td className="px-6 py-5 first:rounded-l-2xl">
                                                <div className="font-bold text-slate-900">{turf.name}</div>
                                                <div className="text-xs text-slate-400">{turf.location}</div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-slate-600">{turf.admin?.name || 'Unknown'}</td>
                                            <td className="px-6 py-5">
                                                <div className={cn(
                                                    "inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                    turf.operational_status === 'ACTIVE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        turf.operational_status === 'MAINTENANCE' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                            "bg-rose-50 text-rose-600 border-rose-100"
                                                )}>
                                                    {turf.operational_status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 last:rounded-r-2xl">
                                                {turf.status === 'APPROVED' ? (
                                                    <span className="flex items-center text-xs font-bold text-emerald-600"><CheckCircle size={14} className="mr-1" /> Approved</span>
                                                ) : turf.status === 'REJECTED' ? (
                                                    <span className="flex items-center text-xs font-bold text-rose-600"><XCircle size={14} className="mr-1" /> Rejected</span>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleApproveTurf(turf.id, true)}
                                                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveTurf(turf.id, false)}
                                                            className="px-3 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-rose-100"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

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
