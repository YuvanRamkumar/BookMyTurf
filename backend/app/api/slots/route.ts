import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const turfId = searchParams.get('turfId')
        const date = searchParams.get('date') // YYYY-MM-DD

        if (!turfId || !date) {
            return NextResponse.json({ error: "turfId and date are required" }, { status: 400 })
        }

        const slots = await db.slot.findMany({
            where: {
                turf_id: turfId,
                date: new Date(date)
            },
            orderBy: {
                start_time: 'asc'
            }
        })

        return NextResponse.json(slots)
    } catch (error) {
        console.error("GET_SLOTS_ERROR", error)
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
        const { turf_id, date, start_time, end_time } = body

        if (!turf_id || !date || !start_time || !end_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const turf = await db.turf.findUnique({
            where: { id: turf_id }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin can add slots
        if (session.user.role !== 'SUPER_ADMIN' && turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Check for existing slot at same time
        const existingSlot = await db.slot.findFirst({
            where: {
                turf_id,
                date: new Date(date),
                start_time,
                end_time
            }
        })

        if (existingSlot) {
            return NextResponse.json({ error: "Slot already exists at this time" }, { status: 400 })
        }

        const slot = await db.slot.create({
            data: {
                turf_id,
                date: new Date(date),
                start_time,
                end_time,
                is_booked: false
            }
        })

        return NextResponse.json(slot, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const id = body.id || body.slot_id
        const is_booked = body.is_booked

        if (!id) {
            return NextResponse.json({ error: "id or slot_id is required" }, { status: 400 })
        }

        const slot = await db.slot.findUnique({
            where: { id },
            include: { turf: true }
        })

        if (!slot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin
        if (session.user.role !== 'SUPER_ADMIN' && slot.turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const updatedSlot = await db.slot.update({
            where: { id },
            data: { is_booked: !!is_booked }
        })

        return NextResponse.json(updatedSlot)
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

        const slot = await db.slot.findUnique({
            where: { id },
            include: { turf: true }
        })

        if (!slot) {
            return NextResponse.json({ error: "Slot not found" }, { status: 404 })
        }

        // RBAC Check
        if (session.user.role !== 'SUPER_ADMIN' && slot.turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        if (slot.is_booked) {
            return NextResponse.json({ error: "Cannot delete a booked slot" }, { status: 400 })
        }

        await db.slot.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Slot deleted successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
