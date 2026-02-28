"use client";

import Shell from "@/components/Shell";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trophy, ArrowLeft, Loader2, Save, ImagePlus, X, Crosshair } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AddTurf() {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        area: "",
        city: "",
        description: "",
        amenities: [] as string[],
        precautions: [] as string[],
        sport_type: "Football/Cricket" as const,
        price_per_hour: "1000",
        weekday_price: "1000",
        weekend_price: "1200",
        peak_hour_multiplier: "1.2",
        peak_start_time: "18:00",
        peak_end_time: "21:00",
        opening_time: "06:00",
        closing_time: "22:00",
        image_url: "",
        latitude: "",
        longitude: "",
        address: "",
    });

    const [detectingLocation, setDetectingLocation] = useState(false);

    const amenitiesList = [
        "Parking", "Floodlights", "Washroom", "Changing Room",
        "Drinking Water", "Seating Area", "Cafeteria", "Locker Room"
    ];

    const handleAmenityChange = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
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
            alert("Image upload failed: " + err.message);
            setImagePreview(null);
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
        setLoading(true);

        try {
            const res = await fetch("/api/turfs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price_per_hour: parseFloat(formData.weekday_price),
                    weekday_price: parseFloat(formData.weekday_price),
                    weekend_price: parseFloat(formData.weekend_price),
                    peak_hour_multiplier: parseFloat(formData.peak_hour_multiplier),
                    peak_start_time: formData.peak_start_time,
                    peak_end_time: formData.peak_end_time,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
                    address: formData.address,
                    area: formData.area,
                    city: formData.city,
                }),
            });

            if (!res.ok) throw new Error("Failed to add turf");

            router.push("/admin/dashboard");
        } catch (error) {
            alert("Error adding turf");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Shell>
            <div className="max-w-3xl mx-auto">
                <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Dashboard
                </Link>
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-slate-900 mb-2">Setup Your Arena</h1>
                    <p className="text-slate-500">Add details and we'll auto-generate hourly slots for you.</p>
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
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={20} />
                                    </button>
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
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Location / Landmark</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Near Central Mall"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Area</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Ganapathy"
                                value={formData.area}
                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">City</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Coimbatore"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        {/* GPS Location Section */}
                        <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">GPS Coordinates</label>
                                <button
                                    type="button"
                                    disabled={detectingLocation}
                                    onClick={() => {
                                        setDetectingLocation(true);
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    latitude: String(pos.coords.latitude),
                                                    longitude: String(pos.coords.longitude),
                                                }));
                                                setDetectingLocation(false);
                                            },
                                            () => {
                                                alert('Could not detect location. Please enter manually.');
                                                setDetectingLocation(false);
                                            },
                                            { enableHighAccuracy: true, timeout: 10000 }
                                        );
                                    }}
                                    className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-3 py-1.5 bg-indigo-50 rounded-xl"
                                >
                                    {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                                    <span>{detectingLocation ? 'Detecting...' : 'Detect My Location'}</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 12.9716"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        placeholder="e.g. 77.5946"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Full Address</label>
                            <input
                                type="text"
                                placeholder="e.g. 42, 3rd Cross, Indiranagar, Bangalore 560038"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sport Type</label>
                            <select
                                value={formData.sport_type}
                                onChange={(e) => setFormData({ ...formData, sport_type: e.target.value as any })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            >
                                <option value="Football/Cricket">Football / Cricket</option>
                                <option value="Pickleball">Pickleball</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Weekday Price (₹ / hr)</label>
                            <input
                                required
                                type="number"
                                placeholder="1000"
                                min="0"
                                value={formData.weekday_price}
                                onChange={(e) => setFormData({ ...formData, weekday_price: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Weekend Price (₹ / hr)</label>
                            <input
                                required
                                type="number"
                                placeholder="1200"
                                min="0"
                                value={formData.weekend_price}
                                onChange={(e) => setFormData({ ...formData, weekend_price: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Peak Hour Multiplier</label>
                            <input
                                required
                                type="number"
                                step="0.1"
                                min="1"
                                placeholder="1.2"
                                value={formData.peak_hour_multiplier}
                                onChange={(e) => setFormData({ ...formData, peak_hour_multiplier: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[10px]">Peak Start</label>
                                <input
                                    required
                                    type="time"
                                    value={formData.peak_start_time}
                                    onChange={(e) => setFormData({ ...formData, peak_start_time: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider text-[10px]">Peak End</label>
                                <input
                                    required
                                    type="time"
                                    value={formData.peak_end_time}
                                    onChange={(e) => setFormData({ ...formData, peak_end_time: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800"
                                />
                            </div>
                            <p className="col-span-2 text-[10px] text-slate-500 font-medium px-1 italic">Peak multiplier applies between start and end time.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
                            <textarea
                                placeholder="Tell us more about your arena..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800 h-32 resize-none"
                            />
                        </div>

                        <div className="space-y-4 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">Amenities</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {amenitiesList.map(amenity => (
                                    <label key={amenity} className="flex items-center space-x-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={() => handleAmenityChange(amenity)}
                                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-600 transition-all cursor-pointer"
                                        />
                                        <span className={`text-sm font-bold transition-colors ${formData.amenities.includes(amenity) ? 'text-indigo-600' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                            {amenity}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Precautions & Rules (One per line)</label>
                            <textarea
                                placeholder="e.g. Non-marking shoes required&#10;No smoking"
                                value={formData.precautions.join('\n')}
                                onChange={(e) => setFormData({ ...formData, precautions: e.target.value.split('\n') })}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-slate-800 h-32 resize-none"
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

                    <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50 flex items-start space-x-4">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-indigo-900">Auto-Generation Enabled</h4>
                            <p className="text-indigo-700 text-sm">We'll create hourly slots from {formData.opening_time} to {formData.closing_time} for the next 7 days.</p>
                        </div>
                    </div>

                    <button
                        disabled={loading || imageUploading}
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <Save size={24} />
                                <span>Launch Arena</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </Shell>
    );
}
