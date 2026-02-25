import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
        const totalTurfs = await prisma.turf.count();
        const totalBookings = await prisma.booking.count();

        const stats = {
            totalUsers,
            totalAdmins,
            totalTurfs,
            totalBookings,
        };

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                is_approved: true
            }
        });

        const turfs = await prisma.turf.findMany();

        const bookings = await prisma.booking.findMany({
            include: {
                turf: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        const transformedBookings = bookings.map(b => ({
            ...b,
            turfName: b.turf.name,
            userName: b.user.name
        }));

        return NextResponse.json({
            stats,
            users,
            turfs,
            bookings: transformedBookings
        });
    } catch (error) {
        console.error("Super admin data error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const turfId = searchParams.get('id');

        if (!turfId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        // Prisma will handle dependent deletions if configured (OnDelete: Cascade)
        // In our schema, Slot has onDelete: Cascade for Turf.
        // Booking also links to Turf and Slot.

        await prisma.turf.delete({
            where: { id: turfId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
