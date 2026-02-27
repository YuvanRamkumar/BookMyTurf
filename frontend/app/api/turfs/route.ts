import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sportType = searchParams.get('sportType');

    const session = await getSession();

    try {
        let where: any = {};

        // Filtering by approval + status logic
        // Users see only APPROVED + ACTIVE turfs
        // Admins see APPROVED ACTIVE turfs + all their own turfs
        // Super Admins see everything
        if (session?.role === 'USER' || !session) {
            where.status = 'APPROVED';
            where.operational_status = 'ACTIVE';
        } else if (session?.role === 'ADMIN') {
            where.OR = [
                { status: 'APPROVED', operational_status: 'ACTIVE' },
                { admin_id: session.id }
            ];
        }
        // Super Admin sees everything - no filter

        const statusFilter = searchParams.get('status');
        if (statusFilter) where.status = statusFilter;

        const operationalStatusFilter = searchParams.get('operational_status');
        if (operationalStatusFilter) where.operational_status = operationalStatusFilter;

        if (adminId) where.admin_id = adminId;
        if (sportType) where.sport_type = (sportType === 'Football/Cricket' || sportType === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL';

        if (minPrice || maxPrice) {
            where.price_per_hour = {};
            if (minPrice) where.price_per_hour.gte = Number(minPrice);
            if (maxPrice) where.price_per_hour.lte = Number(maxPrice);
        }

        const turfs = await prisma.turf.findMany({
            where,
            include: {
                _count: {
                    select: { slots: true }
                },
                reviews: {
                    select: { rating: true }
                }
            }
        });

        // Calculate average rating for each turf
        const turfsWithRating = turfs.map((t: any) => {
            const avgRating = t.reviews.length > 0
                ? t.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / t.reviews.length
                : 0;
            return { ...t, avgRating, reviewCount: t.reviews.length };
        });

        return NextResponse.json(turfsWithRating);
    } catch (error) {
        console.error("Fetch turfs error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            name,
            location,
            sport_type,
            price_per_hour,
            opening_time,
            closing_time,
            image_url,
            description,
            amenities,
            precautions,
            images,
            weekday_price,
            weekend_price,
            peak_hour_multiplier,
            peak_start_time,
            peak_end_time,
            latitude,
            longitude,
            address
        } = body;

        if (!name || !location || !sport_type || !price_per_hour || !opening_time || !closing_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the turf
        const turf = await prisma.turf.create({
            data: {
                name,
                location,
                description,
                amenities: Array.isArray(amenities) ? amenities : [],
                precautions: Array.isArray(precautions) ? precautions : [],
                images: Array.isArray(images) ? images : [],
                sport_type: (sport_type === 'Football/Cricket' || sport_type === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL',
                price_per_hour: Number(weekday_price || price_per_hour),
                weekday_price: Number(weekday_price || 1000),
                weekend_price: Number(weekend_price || 1200),
                peak_hour_multiplier: Number(peak_hour_multiplier || 1.2),
                peak_start_time: peak_start_time || "18:00",
                peak_end_time: peak_end_time || "21:00",
                opening_time,
                closing_time,
                image_url,
                admin_id: session.id,
                status: (session.role === 'SUPER_ADMIN' ? 'APPROVED' : 'PENDING') as any,
                operational_status: 'ACTIVE' as any,
                latitude: Number(latitude) || 0,
                longitude: Number(longitude) || 0,
                address: address || ""
            } as any
        });

        // Generate initial slots for next 7 days
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

        await prisma.slot.createMany({ data: slots });

        return NextResponse.json(turf, { status: 201 });
    } catch (error) {
        console.error("Create turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
