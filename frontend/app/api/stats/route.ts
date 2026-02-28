import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [turfCount, bookingCount, locations] = await Promise.all([
            prisma.turf.count({
                where: { status: 'APPROVED', operational_status: 'ACTIVE' }
            }),
            prisma.booking.count({
                where: { status: 'CONFIRMED' }
            }),
            prisma.turf.findMany({
                where: { status: 'APPROVED', operational_status: 'ACTIVE' },
                select: { location: true },
                distinct: ['location']
            })
        ]);

        // Simple logic to count "cities" from location strings (e.g. "Koramangala, Bangalore" -> "Bangalore")
        const cities = new Set(locations.map(l => {
            const parts = l.location.split(',');
            return (parts[parts.length - 1] || parts[0]).trim();
        }));

        return NextResponse.json({
            turfCount,
            bookingCount,
            cityCount: cities.size || 1
        });
    } catch (error) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
