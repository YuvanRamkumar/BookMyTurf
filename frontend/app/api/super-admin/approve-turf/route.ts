import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { turfId, approve } = await request.json();

        if (approve) {
            await prisma.turf.update({
                where: { id: turfId },
                data: { status: 'APPROVED' }
            });
        } else {
            await prisma.turf.update({
                where: { id: turfId },
                data: { status: 'REJECTED' }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Approve turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
