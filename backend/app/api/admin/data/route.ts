import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const adminId = session.user.id

        const stats = {
            totalTurfs: await db.turf.count({ where: { admin_id: adminId } }),
            totalBookings: await db.booking.count({
                where: { turf: { admin_id: adminId } }
            }),
            totalRevenue: 0, // Calculate below
        }

        const turfs = await db.turf.findMany({
            where: { admin_id: adminId },
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        })

        const bookings = await db.booking.findMany({
            where: { turf: { admin_id: adminId } },
            include: {
                turf: { select: { name: true } },
                user: { select: { name: true, email: true } },
                slot: true
            },
            orderBy: { created_at: 'desc' },
            take: 20
        })

        // Calculate Revenue from Confirmed Bookings
        const confirmedBookings = await db.booking.findMany({
            where: {
                turf: { admin_id: adminId },
                status: 'CONFIRMED'
            },
            include: { turf: true }
        })

        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.turf.price_per_hour, 0)
        stats.totalRevenue = totalRevenue

        return NextResponse.json({
            stats,
            turfs,
            bookings
        })
    } catch (error) {
        console.error("GET_ADMIN_DATA_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
