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

        // Filtering by approval status logic
        if (session?.role !== 'SUPER_ADMIN') {
            where.OR = [
                { is_approved: true },
                { admin_id: session?.id } // Admin can see their own even if not approved
            ].filter(condition => condition.admin_id !== undefined || condition.is_approved === true);
        }

        if (adminId) where.admin_id = adminId;
        if (sportType) where.sport_type = sportType === 'Football/Cricket' ? 'FOOTBALL_CRICKET' : 'PICKLEBALL';

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
