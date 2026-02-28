"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Search,
    CalendarCheck,
    PlusCircle,
    Users,
    Settings,
    LogOut,
    MapPin,
    Trophy,
    History,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SidebarProps {
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    userName?: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    const guestLinks = [
        { href: "/turfs", icon: Search, label: "Browse Turfs" },
    ];

    const userLinks = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ...guestLinks,
        { href: "/bookings", icon: CalendarCheck, label: "My Bookings" },
        { href: "/bookings/history", icon: History, label: "History" },
    ];

    const adminLinks = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Admin Panel" },
        { href: "/admin/turfs/add", icon: PlusCircle, label: "Add Turf" },
        { href: "/turfs", icon: Search, label: "Browse Turfs" },
    ];

    const superAdminLinks = [
        { href: "/super-admin/dashboard", icon: LayoutDashboard, label: "Super Dashboard" },
        { href: "/super-admin/users", icon: Users, label: "Manage Users" },
        { href: "/super-admin/turfs", icon: Trophy, label: "Manage Turfs" },
        { href: "/turfs", icon: Search, label: "Browse Turfs" },
    ];

    const links = !role ? guestLinks : role === "SUPER_ADMIN" ? superAdminLinks : role === "ADMIN" ? adminLinks : userLinks;

    return (
        <div className="flex bg-white border-r border-slate-100 h-screen w-64 flex-col fixed left-0 top-0 z-50 shadow-xl">
            <div className="p-8 flex items-center mb-4">
                <Link href="/" className="flex items-center space-x-3 group text-slate-900">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
                        <Trophy className="text-white w-6 h-6" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">BookMyTurf</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 mb-2">
                    Navigation
                </div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                isActive
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200 font-bold"
                                    : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            )}
                        >
                            <Icon size={22} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                            <span className="text-[15px]">{link.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-600 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                {userName ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-100">
                                {userName.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-base font-bold text-slate-900 truncate">{userName}</span>
                                <div className="flex items-center space-x-1">
                                    <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{role}</span>
                                    <CheckCircle2 size={8} className="text-blue-500" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 font-bold text-[15px]"
                        >
                            <LogOut size={22} className="text-slate-400 group-hover:text-rose-500" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/login"
                            className="flex items-center justify-center py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/40"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="flex items-center justify-center py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                        >
                            Join
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
