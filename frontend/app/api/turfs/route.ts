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
        // Users see only approved + ACTIVE turfs
        // Admins see ACTIVE approved turfs + all their own turfs
        // Super Admins see everything
        if (session?.role === 'USER' || !session) {
            where.is_approved = true;
        } else if (session?.role === 'ADMIN') {
            where.OR = [
                { is_approved: true, status: 'ACTIVE' },
                { admin_id: session.id }
            ];
        }
        // Super Admin sees everything - no filter

        const statusFilter = searchParams.get('status');
        if (statusFilter) where.status = statusFilter;

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
                }
            }
        });

        return NextResponse.json(turfs);
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
        const { name, location, sport_type, price_per_hour, opening_time, closing_time, image_url } = body;

        if (!name || !location || !sport_type || !price_per_hour || !opening_time || !closing_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create the turf
        const turf = await prisma.turf.create({
            data: {
                name,
                location,
                sport_type: (sport_type === 'Football/Cricket' || sport_type === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL',
                price_per_hour: Number(price_per_hour),
                opening_time,
                closing_time,
                image_url,
                admin_id: session.id,
                is_approved: session.role === 'SUPER_ADMIN',
                status: 'ACTIVE'
            }
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
