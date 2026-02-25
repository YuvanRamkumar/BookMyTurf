import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')
        const turfId = searchParams.get('turfId')

        let where: any = {}

        // RBAC:
        // Users see only their own bookings
        // Admins see bookings for their own turfs
        // Super Admins see everything
        if (session.user.role === 'USER') {
            where.user_id = session.user.id
        } else if (session.user.role === 'ADMIN') {
            where.turf = { admin_id: session.user.id }
        }

        if (status) {
            if (status === 'active') where.status = 'CONFIRMED'
            else if (status === 'history') where.status = { in: ['EXPIRED', 'CANCELLED', 'FAILED'] }
            else where.status = status.toUpperCase()
        }

        if (turfId) where.turf_id = turfId

        const bookings = await db.booking.findMany({
            where,
            include: {
                turf: true,
                slot: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        return NextResponse.json(bookings)
    } catch (error) {
        console.error("GET_BOOKINGS_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { turf_id, slot_id } = body

        if (!turf_id || !slot_id) {
            return NextResponse.json({ error: "turf_id and slot_id are required" }, { status: 400 })
        }

        // Verify slot is available
        const slot = await db.slot.findUnique({
            where: { id: slot_id }
        })

        if (!slot || slot.is_booked) {
            return NextResponse.json({ error: "Slot is not available" }, { status: 400 })
        }

        // Create booking (usually starts as PENDING until payment)
        // However, some flows might have direct booking. 
        // We'll follow the PENDING flow as per existing payment logic.

        const booking = await db.booking.create({
            data: {
                user_id: session.user.id as string,
                turf_id,
                slot_id,
                status: 'PENDING'
            }
        })

        return NextResponse.json(booking, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 })
        }

        const booking = await db.booking.findUnique({
            where: { id },
            include: { turf: true }
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // RBAC: Only owner of booking, owner of turf, or super admin
        if (session.user.role !== 'SUPER_ADMIN' &&
            booking.user_id !== session.user.id &&
            booking.turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Only allow cancellation if not already cancelled/failed
        if (booking.status === 'CANCELLED' || booking.status === 'FAILED') {
            return NextResponse.json({ error: "Booking already in terminal state" }, { status: 400 })
        }

        // Cancel booking and release slot
        const updatedBooking = await db.$transaction(async (tx) => {
            const b = await tx.booking.update({
                where: { id },
                data: { status: 'CANCELLED' }
            })

            await tx.slot.update({
                where: { id: booking.slot_id },
                data: { is_booked: false }
            })

            return b
        })

        return NextResponse.json(updatedBooking)
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
