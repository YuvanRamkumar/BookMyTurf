"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShellProps {
    children: React.ReactNode;
}

export default function Shell({ children }: ShellProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            try {
                // In integrated mode, we might fetch from the actual backend
                // or the local API that proxies it.
                const res = await fetch("/api/auth/me");
                const data = await res.json();

                const isPublicPath = window.location.pathname === "/turfs" ||
                    window.location.pathname.startsWith("/turfs/");

                if (!data.user) {
                    if (!isPublicPath && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                        router.push("/login");
                    }
                    return;
                }
                setUser(data.user);
            } catch (error) {
                const isPublicPath = window.location.pathname === "/turfs" ||
                    window.location.pathname.startsWith("/turfs/");
                if (!isPublicPath && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    router.push("/login");
                }
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-950">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 blur-[100px] rounded-full" />

                <div className="flex flex-col items-center space-y-4 relative z-10">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Configuring Arena...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex font-sans selection:bg-blue-500/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none opacity-50 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-64 w-[600px] h-[600px] bg-green-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <Sidebar role={user?.role} userName={user?.name} />

            <main className="flex-1 ml-64 p-8 relative z-10 min-h-screen overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={typeof window !== 'undefined' ? window.location.pathname : 'server'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                        <div className="max-w-7xl mx-auto pt-4 pb-20">
                            {children}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
