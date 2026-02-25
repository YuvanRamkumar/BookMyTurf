import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const adminId = session.id;

        const totalTurfs = await prisma.turf.count({ where: { admin_id: adminId } });
        const totalBookings = await prisma.booking.count({
            where: { turf: { admin_id: adminId } }
        });

        const turfs = await prisma.turf.findMany({
            where: { admin_id: adminId },
            include: {
                _count: {
                    select: { bookings: true, slots: true }
                }
            }
        });

        const bookings = await prisma.booking.findMany({
            where: { turf: { admin_id: adminId } },
            include: {
                turf: { select: { name: true, price_per_hour: true } },
                user: { select: { name: true, email: true } },
                slot: true
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        // Calculate revenue from confirmed bookings
        const confirmedBookings = await prisma.booking.findMany({
            where: {
                turf: { admin_id: adminId },
                status: 'CONFIRMED'
            },
            include: { turf: true }
        });

        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.turf.price_per_hour, 0);

        const transformedBookings = bookings.map(b => ({
            ...b,
            turfName: b.turf.name,
            userName: b.user.name,
            userEmail: b.user.email
        }));

        return NextResponse.json({
            stats: {
                totalTurfs,
                totalBookings,
                totalRevenue
            },
            turfs,
            bookings: transformedBookings
        });
    } catch (error) {
        console.error("Admin data error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
