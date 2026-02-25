import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { turfId, approve } = body

        if (!turfId) {
            return NextResponse.json({ error: "turfId is required" }, { status: 400 })
        }

        if (approve) {
            await db.turf.update({
                where: { id: turfId },
                data: { is_approved: true }
            })
        } else {
            // Reject - delete the turf and cascade slots/bookings
            await db.turf.delete({
                where: { id: turfId }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("APPROVE_TURF_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
