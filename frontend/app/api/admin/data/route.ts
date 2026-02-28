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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalTurfs = await prisma.turf.count({ where: { admin_id: adminId } });

        // Stats
        const confirmedBookings = await prisma.booking.findMany({
            where: {
                turf: { admin_id: adminId },
                status: 'CONFIRMED'
            },
            include: { turf: true }
        });
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.turf.price_per_hour, 0);
        const totalBookings = confirmedBookings.length;

        const todayBookingsCount = await prisma.booking.count({
            where: {
                turf: { admin_id: adminId },
                slot: { date: today }
            }
        });

        // Fetch Turfs with their "Today" status
        const turfsRaw = await prisma.turf.findMany({
            where: { admin_id: adminId },
            include: {
                slots: {
                    where: { date: today },
                    orderBy: { start_time: 'asc' }
                }
            }
        });

        const currentHour = new Date().getHours();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

        const turfs = turfsRaw.map((t: any) => {
            const currentSlot = t.slots.find((s: any) => s.start_time <= currentTime && s.end_time > currentTime);
            const nextSlot = t.slots.find((s: any) => s.start_time > currentTime);

            // If the venue is MAINTENANCE or CLOSED, it overrides the slot status
            const currentStatus = t.operational_status !== 'ACTIVE' ? t.operational_status : (currentSlot ? (currentSlot.is_booked ? 'OCCUPIED' : 'VACANT') : 'ACTIVE');

            return {
                ...t,
                currentStatus,
                nextSlot: nextSlot ? { start_time: nextSlot.start_time, is_booked: nextSlot.is_booked } : null
            };
        });

        // Bookings (Today + Recent)
        const bookingsRaw = await prisma.booking.findMany({
            where: { turf: { admin_id: adminId } },
            include: {
                turf: { select: { name: true, price_per_hour: true } },
                user: { select: { name: true, email: true, id: true } },
                slot: true
            },
            orderBy: [
                { slot: { date: 'desc' } },
                { slot: { start_time: 'desc' } }
            ],
            take: 15
        });

        const transformedBookings = bookingsRaw.map(b => ({
            ...b,
            turfName: b.turf.name,
            userName: b.user.name,
            userEmail: b.user.email
        }));

        return NextResponse.json({
            stats: {
                totalTurfs,
                totalBookings,
                totalRevenue,
                todayBookingsCount
            },
            turfs,
            bookings: transformedBookings
        });
    } catch (error) {
        console.error("Admin data error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
