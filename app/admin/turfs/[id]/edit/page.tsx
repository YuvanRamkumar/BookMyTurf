"use client";

import Shell from "@/components/Shell";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, ImagePlus, X, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function EditTurf() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        sport_type: "Football/Cricket" as string,
        price_per_hour: "",
        opening_time: "06:00",
        closing_time: "22:00",
        image_url: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetch(`/api/turfs/${id}`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    name: data.name || "",
                    location: data.location || "",
                    sport_type: data.sport_type || "Football/Cricket",
                    price_per_hour: String(data.price_per_hour || ""),
                    opening_time: data.opening_time || "06:00",
                    closing_time: data.closing_time || "22:00",
                    image_url: data.image_url || "",
                });
                if (data.image_url) setImagePreview(data.image_url);
                setLoading(false);
            });
    }, [id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
        setImageUploading(true);

        try {
            const uploadData = new FormData();
            uploadData.append("image", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: uploadData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setFormData(prev => ({ ...prev, image_url: data.url }));
        } catch (err: any) {
            setMessage({ type: 'error', text: "Image upload failed: " + err.message });
            setImagePreview(formData.image_url || null);
        } finally {
            setImageUploading(false);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image_url: "" }));
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch(`/api/turfs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessage({ type: 'success', text: "Arena updated successfully! Redirecting..." });
            setTimeout(() => router.push("/admin/dashboard"), 1500);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
            <div className="max-w-3xl mx-auto">
                <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Dashboard
                </Link>
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Edit Arena</h1>
                    <p className="text-slate-500">Update your turf details, timings, and photos.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                    {/* Image Upload Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Arena Photo</label>
                        <div className="relative">
                            {imagePreview || formData.image_url ? (
                                <div className="relative w-full h-56 rounded-3xl overflow-hidden border-2 border-slate-100 group">
                                    <img
                                        src={imagePreview || formData.image_url}
                                        alt="Turf preview"
                                        className="w-full h-full object-cover"
                                    />
                                    {imageUploading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-indigo-600 w-8 h-8" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-white/90 backdrop-blur rounded-xl text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-all shadow-lg"
                                        >
                                            Change Photo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-lg"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-56 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                                >
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100/50 transition-colors">
                                        <ImagePlus size={28} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    <span className="font-bold text-sm">Click to upload arena photo</span>
                                    <span className="text-xs mt-1">JPEG, PNG, WebP • Max 5MB</span>
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Turf Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Dream Arena"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Location</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Area 51, Downtown"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sport Type</label>
                            <select
                                value={formData.sport_type}
                                onChange={(e) => setFormData({ ...formData, sport_type: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            >
                                <option value="Football/Cricket">Football / Cricket</option>
                                <option value="Pickleball">Pickleball</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Price (₹ / hr)</label>
                            <input
                                required
                                type="number"
                                placeholder="800"
                                value={formData.price_per_hour}
                                onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Opening Time</label>
                            <input
                                required
                                type="time"
                                value={formData.opening_time}
                                onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Closing Time</label>
                            <input
                                required
                                type="time"
                                value={formData.closing_time}
                                onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100/50 flex items-start space-x-4">
                        <AlertCircle className="text-amber-600 mt-0.5 shrink-0" size={20} />
                        <div>
                            <h4 className="font-bold text-amber-900">Timing Change Notice</h4>
                            <p className="text-amber-700 text-sm">Changing opening/closing times will regenerate available slots for the next 7 days. Already booked slots won't be affected.</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-5 rounded-3xl text-sm flex items-start space-x-3 ${message.type === 'success'
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> : <AlertCircle size={20} className="mt-0.5 shrink-0" />}
                            <span className="font-semibold">{message.text}</span>
                        </div>
                    )}

                    <button
                        disabled={saving || imageUploading}
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Save size={24} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </Shell>
    );
}
