"use client";

import { useState } from "react";
import { MapPin, Navigation, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "@/lib/LocationContext";
import LocationSelectorModal from "./LocationSelectorModal";

export default function LocationDisplay() {
    const { locationState, isLoading } = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-xl animate-pulse">
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                <div className="w-20 h-3 rounded-full bg-slate-200" />
            </div>
        );
    }

    const { mode, area } = locationState;
    const isGPS = mode === 'GPS';

    return (
        <>
            <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border transition-colors ${isGPS
                            ? 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                >
                    <div className="relative">
                        {isGPS ? (
                            <>
                                <Navigation className="w-4 h-4 text-blue-600 relative z-10" />
                                <div className="absolute inset-0 bg-blue-400 blur-sm rounded-full opacity-50 animate-pulse"></div>
                            </>
                        ) : (
                            <MapPin className="w-4 h-4 text-slate-700 relative z-10" />
                        )}
                    </div>

                    <div className="flex flex-col min-w-0">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isGPS ? 'text-blue-500' : 'text-slate-400'}`}>
                            {isGPS ? 'Current Location' : 'Selected Area'}
                        </span>
                        <span className={`text-[13px] font-bold truncate max-w-[140px] ${isGPS ? 'text-blue-900' : 'text-slate-900'}`}>
                            {area || "Select location"}
                        </span>
                    </div>

                    <ChevronDown className={`w-4 h-4 ml-1 ${isGPS ? 'text-blue-400' : 'text-slate-400'} group-hover:translate-y-0.5 transition-transform`} />
                </motion.div>
            </div>

            <LocationSelectorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
