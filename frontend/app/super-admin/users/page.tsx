"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Users, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuperAdminUsers() {
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

    const handleApprove = async (userId: string, approve: boolean) => {
        await fetch("/api/super-admin/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, approve }),
        });
        fetchData();
    };

    if (loading && !data) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div></Shell>;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Manage Users</h1>
                    <p className="text-slate-500">Approve owners and manage platform accounts.</p>
                </header>

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
            </div>
        </Shell>
    );
}
