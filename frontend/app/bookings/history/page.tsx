"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /bookings/history is a convenience route that redirects to /bookings
 * and programmatically switches to the History tab.
 * We store the intent in sessionStorage so the bookings page picks it up.
 */
export default function BookingHistoryRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Signal that the bookings page should open on the History tab
        sessionStorage.setItem("bookings_tab", "history");
        router.replace("/bookings");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="text-slate-400 text-sm font-medium animate-pulse">Loading history…</div>
        </div>
    );
}
