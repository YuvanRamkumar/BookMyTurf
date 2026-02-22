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
    Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    userName: string;
}

export default function Sidebar({ role, userName }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    };

    const userLinks = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/turfs", icon: Search, label: "Browse Turfs" },
        { href: "/bookings", icon: CalendarCheck, label: "My Bookings" },
    ];

    const adminLinks = [
        { href: "/admin/dashboard", icon: LayoutDashboard, label: "Admin Panel" },
        { href: "/admin/turfs/add", icon: PlusCircle, label: "Add Turf" },
    ];

    const superAdminLinks = [
        { href: "/super-admin/dashboard", icon: LayoutDashboard, label: "Super Dashboard" },
        { href: "/super-admin/users", icon: Users, label: "Manage Users" },
        { href: "/super-admin/turfs", icon: Trophy, label: "Manage Turfs" },
    ];

    const links = role === "SUPER_ADMIN" ? superAdminLinks : role === "ADMIN" ? adminLinks : userLinks;

    return (
        <div className="flex bg-white border-r border-slate-200 h-screen w-64 flex-col fixed left-0 top-0">
            <div className="p-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Trophy className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TurfBook</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                <div className="text-xs font-semibold text-slate-400 uppercase px-2 py-2 mb-2">
                    Menu
                </div>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                            )}
                        >
                            <Icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 mt-auto">
                <div className="flex items-center space-x-3 mb-6 px-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                        {userName.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold text-slate-900 truncate">{userName}</span>
                        <span className="text-xs text-slate-400 truncate font-medium uppercase tracking-wider">{role}</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors font-medium"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
