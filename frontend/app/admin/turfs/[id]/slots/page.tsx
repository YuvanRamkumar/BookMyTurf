"use client";

import Shell from "@/components/Shell";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, ArrowLeft, Loader2, Lock, Unlock, AlertCircle, Plus, Trash2, X, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

export default function AdminSlotsManagement() {
    const { id } = useParams();
    const [turf, setTurf] = useState<any>(null);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSlotStart, setNewSlotStart] = useState("06:00");
    const [newSlotEnd, setNewSlotEnd] = useState("07:00");
    const [addingSlot, setAddingSlot] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPastSlots, setShowPastSlots] = useState(false);

    const dates = Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));

    const fetchData = async () => {
        setLoading(true);
        const turfRes = await fetch(`/api/turfs/${id}`);
        const turfData = await turfRes.json();
        setTurf(turfData);

        const slotsRes = await fetch(`/api/slots?turfId=${id}&date=${selectedDate}`);
        const slotsData = await slotsRes.json();
        setSlots(Array.isArray(slotsData) ? slotsData : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [id, selectedDate]);

    const showToast = (type: 'success' | 'error', text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 3000);
    };

    const toggleSlot = async (slotId: string, currentlyBooked: boolean) => {
        setActionLoading(slotId);
        try {
            const res = await fetch("/api/slots", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slot_id: slotId, is_booked: !currentlyBooked }),
            });
            if (res.ok) {
                setSlots(slots.map(s => s.id === slotId ? { ...s, is_booked: !currentlyBooked } : s));
                showToast('success', !currentlyBooked ? 'Slot blocked' : 'Slot unblocked');
            }
        } catch (error) {
            showToast('error', 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAddSlot = async () => {
        setAddingSlot(true);
        try {
            const res = await fetch("/api/slots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    turf_id: id,
                    date: selectedDate,
                    start_time: newSlotStart,
                    end_time: newSlotEnd,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSlots(prev => [...prev, data].sort((a, b) => a.start_time.localeCompare(b.start_time)));
            setShowAddModal(false);
            showToast('success', `Slot ${newSlotStart} – ${newSlotEnd} added`);
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setAddingSlot(false);
        }
    };

    const handleRemoveSlot = async (slotId: string) => {
        setActionLoading(slotId);
        try {
            const res = await fetch(`/api/slots?id=${slotId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSlots(prev => prev.filter(s => s.id !== slotId));
            showToast('success', 'Slot removed');
        } catch (err: any) {
            showToast('error', err.message);
        } finally {
            setActionLoading(null);
        }
    };

    // Generate time options for the add-slot modal
    const timeOptions: string[] = [];
    for (let h = 0; h < 24; h++) {
        timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    }

    if (!turf && loading) return <Shell><div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div></Shell>;

    return (
        <Shell>
            <div className="max-w-6xl mx-auto">
                {/* Toast */}
                {toast && (
                    <div className={cn(
                        "fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl border flex items-center space-x-3 max-w-md",
                        toast.type === 'success' ? "bg-white border-emerald-200 text-emerald-700" : "bg-white border-rose-200 text-rose-700"
                    )}>
                        {toast.type === 'success' ? <CheckCircle2 size={20} className="shrink-0 text-emerald-500" /> : <AlertCircle size={20} className="shrink-0 text-rose-500" />}
                        <span className="font-semibold text-sm">{toast.text}</span>
                        <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-slate-100 rounded-lg"><X size={14} /></button>
                    </div>
                )}

                {/* Add Slot Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-[32px] p-10 max-w-md w-full mx-4 shadow-2xl border border-slate-100">
                            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Plus className="text-indigo-600 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 text-center mb-2">Add New Slot</h3>
                            <p className="text-slate-500 text-center mb-8 text-sm">Create a custom time slot for {format(new Date(selectedDate), "MMM dd, yyyy")}</p>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
                                    <select
                                        value={newSlotStart}
                                        onChange={(e) => {
                                            setNewSlotStart(e.target.value);
                                            // Auto-set end time to 1 hour later
                                            const startH = parseInt(e.target.value.split(':')[0]);
                                            const endH = (startH + 1) % 24;
                                            setNewSlotEnd(`${endH.toString().padStart(2, '0')}:00`);
                                        }}
                                        className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 text-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
                                    <select
                                        value={newSlotEnd}
                                        onChange={(e) => setNewSlotEnd(e.target.value)}
                                        className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 text-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                        <option value="00:00">00:00 (next day)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-indigo-50 p-4 rounded-2xl mb-6 text-center">
                                <span className="text-2xl font-black text-indigo-600">{newSlotStart} – {newSlotEnd}</span>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSlot}
                                    disabled={addingSlot}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center"
                                >
                                    {addingSlot ? <Loader2 className="animate-spin" size={20} /> : "Add Slot"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button onClick={() => window.history.back()} className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                </button>

                <header className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">{turf?.name}</h1>
                        <p className="text-slate-500 font-medium">Manage slots — add, remove, or block time slots.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        <Plus size={20} className="mr-2" />
                        Add Slot
                    </button>
                </header>

                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm mb-10">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <Calendar size={20} className="mr-2 text-indigo-600" />
                        Select Date
                    </h2>

                    <div className="flex space-x-3 overflow-x-auto pb-4 mb-10">
                        {dates.map((date) => {
                            const dateStr = format(date, "yyyy-MM-dd");
                            const isSelected = selectedDate === dateStr;
                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[100px] py-4 rounded-2xl border transition-all",
                                        isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                                    )}
                                >
                                    <span className="text-xs uppercase font-bold mb-1">{format(date, "EEE")}</span>
                                    <span className="text-xl font-black">{format(date, "dd")}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-6 mb-8 bg-slate-50 p-4 rounded-2xl">
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-200"></div>
                            <span className="text-slate-600 font-medium">Available</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-200"></div>
                            <span className="text-slate-600 font-medium">Blocked / Booked</span>
                        </div>
                        <div className="ml-auto flex items-center space-x-2 text-xs text-slate-400">
                            <Lock size={12} />
                            <span>Click to block/unblock</span>
                            <span className="mx-2">|</span>
                            <Trash2 size={12} />
                            <span>Hover to remove</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-6">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showPastSlots}
                                    onChange={() => setShowPastSlots(!showPastSlots)}
                                />
                                <div className={cn(
                                    "w-10 h-6 rounded-full transition-colors",
                                    showPastSlots ? "bg-indigo-600" : "bg-slate-200"
                                )}></div>
                                <div className={cn(
                                    "absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform",
                                    showPastSlots && "translate-x-4"
                                )}></div>
                            </div>
                            <span className="ml-3 text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Show Past Slots</span>
                        </label>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl" />)}
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <Clock size={40} className="text-slate-200 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No slots for this date</h3>
                            <p className="text-slate-500 text-sm mb-6">Add custom time slots using the button above.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                            >
                                <Plus size={16} className="mr-2" /> Add First Slot
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {slots
                                .filter(slot => {
                                    if (showPastSlots) return true;
                                    const todayStr = format(new Date(), "yyyy-MM-dd");
                                    const slotDateStr = slot.date.split('T')[0];
                                    const currentTimeStr = format(new Date(), "HH:mm");

                                    const isPast = slotDateStr === todayStr && slot.start_time < currentTimeStr;
                                    return !isPast;
                                })
                                .map((slot) => {
                                    const todayStr = format(new Date(), "yyyy-MM-dd");
                                    const slotDateStr = slot.date.split('T')[0];
                                    const currentTimeStr = format(new Date(), "HH:mm");
                                    const currentHour = new Date().getHours();
                                    const currentSlotTime = `${currentHour.toString().padStart(2, '0')}:00`;

                                    const isCurrent = slotDateStr === todayStr && slot.start_time === currentSlotTime;
                                    const isPast = slotDateStr === todayStr && slot.start_time < currentTimeStr;

                                    return (
                                        <div
                                            key={slot.id}
                                            className={cn(
                                                "p-5 rounded-3xl border-2 transition-all relative group",
                                                isCurrent && "ring-2 ring-indigo-500 ring-offset-2",
                                                isPast ? "opacity-60 grayscale-[0.5]" : "",
                                                slot.is_booked
                                                    ? "bg-amber-50 border-amber-100"
                                                    : "bg-emerald-50 border-emerald-100",
                                                actionLoading === slot.id && "opacity-50 pointer-events-none"
                                            )}
                                        >
                                            {isCurrent && (
                                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-bounce">
                                                    NOW
                                                </div>
                                            )}
                                            {/* Time Range - Main Display */}
                                            <div className="text-center mb-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <span className={cn("text-xl font-black", slot.is_booked ? "text-amber-600" : "text-emerald-600")}>
                                                        {slot.start_time}
                                                    </span>
                                                    <span className={cn("text-sm font-bold", slot.is_booked ? "text-amber-300" : "text-emerald-300")}>–</span>
                                                    <span className={cn("text-xl font-black", slot.is_booked ? "text-amber-600" : "text-emerald-600")}>
                                                        {slot.end_time}
                                                    </span>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] uppercase font-bold tracking-wider mt-1 block",
                                                    slot.is_booked ? "text-amber-500" : "text-emerald-400"
                                                )}>
                                                    {slot.is_booked ? "Blocked / Booked" : "Available"}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => toggleSlot(slot.id, slot.is_booked)}
                                                    disabled={actionLoading === slot.id}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5",
                                                        slot.is_booked
                                                            ? "bg-white text-amber-600 hover:bg-amber-100 border border-amber-100"
                                                            : "bg-white text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
                                                    )}
                                                >
                                                    {actionLoading === slot.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : slot.is_booked ? (
                                                        <><Unlock size={14} /><span>Unblock</span></>
                                                    ) : (
                                                        <><Lock size={14} /><span>Block</span></>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveSlot(slot.id)}
                                                    disabled={actionLoading === slot.id || slot.is_booked}
                                                    title={slot.is_booked ? "Unblock first to remove" : "Remove this slot"}
                                                    className="px-3 py-2 rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-slate-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </Shell >
    );
}
