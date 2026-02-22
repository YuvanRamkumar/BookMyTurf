"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Users, Trophy, Calendar, CheckCircle, XCircle, Trash2, Loader2, PieChart } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'turfs'>('stats');

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

    const handleApprove = async (userId: string, approve: boolean) => {
        await fetch("/api/super-admin/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, approve }),
        });
        fetchData();
    };

    const handleDeleteTurf = async (turfId: string) => {
        if (!confirm("Are you sure? This will delete all slots and bookings too.")) return;
        await fetch(`/api/super-admin/data?id=${turfId}`, { method: "DELETE" });
        fetchData();
    };

    if (loading && !data) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div></Shell>;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Platform Control</h1>
                    <p className="text-slate-500">Super Admin access to all system data.</p>
                </header>

                <div className="flex space-x-4 mb-10 overflow-x-auto pb-2">
                    {[
                        { id: 'stats', label: 'Dashboard Stats', icon: PieChart },
                        { id: 'users', label: 'User & Admin Management', icon: Users },
                        { id: 'turfs', label: 'Venue Catalog', icon: Trophy }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-500 hover:bg-indigo-50"
                            )}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' && (
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
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-8 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data?.users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-900">{user.name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                user.role === 'SUPER_ADMIN' ? "bg-indigo-100 text-indigo-700" : user.role === 'ADMIN' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                                            )}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.is_approved ? (
                                                <span className="flex items-center text-emerald-600 text-sm font-bold">
                                                    <CheckCircle size={14} className="mr-1" /> Verified
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-amber-600 text-sm font-bold">
                                                    <AlertCircle size={14} className="mr-1" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.role === 'ADMIN' && !user.is_approved && (
                                                <button
                                                    onClick={() => handleApprove(user.id, true)}
                                                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                                                >
                                                    Approve Owner
                                                </button>
                                            )}
                                            {user.role === 'ADMIN' && user.is_approved && (
                                                <button
                                                    onClick={() => handleApprove(user.id, false)}
                                                    className="text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'turfs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                        {data?.turfs.map((turf: any) => (
                            <div key={turf.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group">
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-slate-900 mb-1 truncate">{turf.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6 flex items-center">
                                        {turf.sport_type} • ₹{turf.price_per_hour}/hr
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <span className="text-xs text-slate-400">Admin: {turf.admin_id}</span>
                                        <button
                                            onClick={() => handleDeleteTurf(turf.id)}
                                            className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Shell>
    );
}
