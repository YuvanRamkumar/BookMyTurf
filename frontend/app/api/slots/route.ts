import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('turfId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD

    if (!turfId || !dateStr) {
        return NextResponse.json({ error: 'Missing turfId or date' }, { status: 400 });
    }

    try {
        const date = new Date(dateStr);

        const slots = await prisma.slot.findMany({
            where: {
                turf_id: turfId,
                date: {
                    equals: date
                }
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        return NextResponse.json(slots);
    } catch (error) {
        console.error("Fetch slots error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
