"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar role={user?.role} userName={user?.name} />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
