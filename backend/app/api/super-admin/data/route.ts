import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const session = await auth()
        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const stats = {
            totalUsers: await db.user.count({ where: { role: 'USER' } }),
            totalAdmins: await db.user.count({ where: { role: 'ADMIN' } }),
            totalTurfs: await db.turf.count(),
            totalBookings: await db.booking.count(),
        }

        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_approved: true,
                created_at: true
            },
            orderBy: { created_at: 'desc' }
        })

        const turfs = await db.turf.findMany({
            include: {
                admin: { select: { name: true, email: true } }
            },
            orderBy: { created_at: 'desc' }
        })

        const bookings = await db.booking.findMany({
            include: {
                turf: { select: { name: true } },
                user: { select: { name: true, email: true } },
                slot: true
            },
            orderBy: { created_at: 'desc' },
            take: 50
        })

        return NextResponse.json({
            stats,
            users,
            turfs,
            bookings
        })
    } catch (error) {
        console.error("GET_SUPER_ADMIN_DATA_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const type = searchParams.get('type') // 'user' | 'turf'

        if (!id || !type) {
            return NextResponse.json({ error: "id and type are required" }, { status: 400 })
        }

        if (type === 'user') {
            // Check if user is not super admin to avoid self-deletion or platform issues
            const user = await db.user.findUnique({ where: { id } })
            if (user?.role === 'SUPER_ADMIN') {
                return NextResponse.json({ error: "Cannot delete super admin" }, { status: 403 })
            }
            await db.user.delete({ where: { id } })
        } else if (type === 'turf') {
            await db.turf.delete({ where: { id } })
        } else {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: `${type} deleted successfully` })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
