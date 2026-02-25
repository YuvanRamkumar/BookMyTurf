import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const adminId = searchParams.get('adminId')
        const sportType = searchParams.get('sportType')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')

        const session = await auth()

        let where: any = {}

        // Base visibility: 
        // 1. Users see only approved + active turfs
        // 2. Admins see approved turfs + their own turfs (any status)
        // 3. Super Admins see everything
        if (session?.user?.role === 'USER' || !session?.user) {
            where.is_approved = true
        } else if (session?.user?.role === 'ADMIN') {
            where.OR = [
                { is_approved: true, status: 'ACTIVE' },
                { admin_id: session.user.id }
            ]
        }
        // Super Admin sees everything - no filter

        const statusFilter = searchParams.get('status')
        if (statusFilter) where.status = statusFilter

        if (adminId) where.admin_id = adminId
        if (sportType) where.sport_type = sportType

        if (minPrice || maxPrice) {
            where.price_per_hour = {}
            if (minPrice) where.price_per_hour.gte = parseFloat(minPrice)
            if (maxPrice) where.price_per_hour.lte = parseFloat(maxPrice)
        }

        const turfs = await db.turf.findMany({
            where,
            include: {
                admin: {
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

        return NextResponse.json(turfs)
    } catch (error) {
        console.error("GET_TURFS_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { name, location, sport_type, price_per_hour, opening_time, closing_time, image_url } = body

        if (!name || !location || !sport_type || !price_per_hour || !opening_time || !closing_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const turf = await db.turf.create({
            data: {
                name,
                location,
                sport_type: (sport_type === 'Football/Cricket' || sport_type === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL',
                price_per_hour: parseFloat(price_per_hour),
                opening_time,
                closing_time,
                image_url,
                admin_id: session.user.id as string,
                is_approved: session.user.role === 'SUPER_ADMIN',
                status: 'ACTIVE'
            }
        })

        // 7 days slot generation
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startHour = parseInt(opening_time.split(':')[0]);
        const endHour = parseInt(closing_time.split(':')[0]);

        const slots = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            for (let h = startHour; h < endHour; h++) {
                slots.push({
                    turf_id: turf.id,
                    date: date,
                    start_time: `${h.toString().padStart(2, '0')}:00`,
                    end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                    is_booked: false
                });
            }
        }

        await db.slot.createMany({ data: slots });

        return NextResponse.json(turf, { status: 201 })
    } catch (error) {
        console.error("POST_TURFS_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
