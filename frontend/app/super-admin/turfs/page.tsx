"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { Trophy, CheckCircle, Trash2, Loader2, AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

export default function SuperAdminTurfs() {
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

    const handleApproveTurf = async (turfId: string, approve: boolean) => {
        await fetch("/api/super-admin/approve-turf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ turfId, approve }),
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
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Manage Turfs</h1>
                    <p className="text-slate-500">Review proposals and manage live venues.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    {data?.turfs.map((turf: any) => (
                        <div key={turf.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 mb-1 truncate">{turf.name}</h3>
                                        <p className="text-slate-500 text-sm">
                                            {turf.sport_type} • ₹{turf.price_per_hour}/hr
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {!turf.is_approved && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter mb-2">
                                                New Proposal
                                            </span>
                                        )}
                                        {turf.is_approved && (
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter border",
                                                turf.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    turf.status === 'maintenance' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>
                                                {turf.status}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!turf.is_approved ? (
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button
                                            onClick={() => handleApproveTurf(turf.id, true)}
                                            className="bg-emerald-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleApproveTurf(turf.id, false)}
                                            className="bg-rose-50 text-rose-600 py-3 rounded-2xl text-xs font-bold hover:bg-rose-100 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-emerald-600 text-xs font-bold mb-6">
                                        <CheckCircle size={14} className="mr-1" /> Active on platform
                                    </div>
                                )}

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
                    {data?.turfs.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <Trophy size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-500 font-bold">No turfs found in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </Shell>
    );
}
