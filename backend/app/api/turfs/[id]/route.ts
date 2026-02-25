import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const turf = await db.turf.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        return NextResponse.json(turf)
    } catch (error) {
        console.error("GET_TURF_BY_ID_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const turf = await db.turf.findUnique({
            where: { id }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin can update
        if (session.user.role !== 'SUPER_ADMIN' && turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, location, sport_type, price_per_hour, opening_time, closing_time, image_url, is_approved, status: turfStatus } = body

        // Validate status if provided
        if (turfStatus && !['ACTIVE', 'MAINTENANCE', 'CLOSED'].includes(turfStatus)) {
            return NextResponse.json({ error: "Invalid status. Must be ACTIVE, MAINTENANCE, or CLOSED" }, { status: 400 })
        }

        const updatedTurf = await db.turf.update({
            where: { id },
            data: {
                name,
                location,
                sport_type,
                price_per_hour: price_per_hour ? parseFloat(price_per_hour) : undefined,
                opening_time,
                closing_time,
                image_url,
                status: turfStatus || undefined,
                is_approved: session.user.role === 'SUPER_ADMIN' ? is_approved : undefined
            }
        })

        return NextResponse.json(updatedTurf)
    } catch (error) {
        console.error("PUT_TURF_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const turf = await db.turf.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin can delete
        if (session.user.role !== 'SUPER_ADMIN' && turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Prevent deletion if there are bookings
        if (turf._count.bookings > 0) {
            return NextResponse.json({ error: "Cannot delete turf with active bookings" }, { status: 400 })
        }

        await db.turf.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Turf deleted successfully" })
    } catch (error) {
        console.error("DELETE_TURF_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
