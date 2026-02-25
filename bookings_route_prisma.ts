import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    try {
        let where: any = {};

        // Role-based filtering
        if (session.role === 'USER') {
            where.user_id = session.id;
        } else if (session.role === 'ADMIN') {
            where.turf = { admin_id: session.id };
        }

        // Status-based filtering
        if (status === 'active') {
            where.status = 'CONFIRMED';
        } else if (status === 'history') {
            where.status = { in: ['FAILED'] }; // Add logic for 'EXPIRED' if needed
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                turf: true,
                slot: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        // Map database status to frontend expected status (lowercase)
        const detailedBookings = bookings.map(b => ({
            ...b,
            status: b.status.toLowerCase(),
            userName: b.user.name,
            userEmail: b.user.email
        }));

        return NextResponse.json(detailedBookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
