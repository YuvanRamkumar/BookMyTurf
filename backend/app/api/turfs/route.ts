// Updated Prisma Client types
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
            where.status = 'APPROVED'
        } else if (session?.user?.role === 'ADMIN') {
            where.OR = [
                { status: 'APPROVED', operational_status: 'ACTIVE' },
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
        const {
            name, location, sport_type, price_per_hour, opening_time, closing_time, image_url,
            description, amenities, precautions, images,
            weekday_price, weekend_price, peak_hour_multiplier, peak_start_time, peak_end_time,
            latitude, longitude, address
        } = body

        if (!name || !location || !sport_type || !opening_time || !closing_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const turf = await db.turf.create({
            data: {
                name,
                location,
                description,
                amenities: Array.isArray(amenities) ? amenities : [],
                precautions: Array.isArray(precautions) ? precautions : [],
                images: Array.isArray(images) ? images : [],
                sport_type: (sport_type === 'Football/Cricket' || sport_type === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL',
                price_per_hour: parseFloat(weekday_price || price_per_hour || 1000),
                weekday_price: parseFloat(weekday_price || 1000),
                weekend_price: parseFloat(weekend_price || 1200),
                peak_hour_multiplier: parseFloat(peak_hour_multiplier || 1.2),
                peak_start_time: peak_start_time || "18:00",
                peak_end_time: peak_end_time || "21:00",
                opening_time,
                closing_time,
                image_url,
                admin_id: session.user.id as string,
                status: session.user.role === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING',
                operational_status: 'ACTIVE',
                latitude: latitude ? parseFloat(latitude) : 0,
                longitude: longitude ? parseFloat(longitude) : 0,
                address: address || ""
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

            // Normalize date for DB
            const Y = date.getFullYear();
            const M = String(date.getMonth() + 1).padStart(2, '0');
            const D = String(date.getDate()).padStart(2, '0');
            const normalizedDate = new Date(`${Y}-${M}-${D}T00:00:00Z`);

            for (let h = startHour; h < endHour; h++) {
                slots.push({
                    turf_id: turf.id,
                    date: normalizedDate,
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
