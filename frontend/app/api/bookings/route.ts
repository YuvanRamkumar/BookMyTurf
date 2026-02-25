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
        // Group by razorpay_order_id to handle multi-slot bookings correctly
        const groupedMap = new Map();

        bookings.forEach(b => {
            const key = b.razorpay_order_id;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    ...b,
                    status: b.status.toLowerCase(),
                    userName: b.user.name,
                    userEmail: b.user.email,
                    price_paid: b.turf.price_per_hour,
                    slot_ids: [b.slot_id],
                    slot_count: 1
                });
            } else {
                const group = groupedMap.get(key);
                group.price_paid += b.turf.price_per_hour;
                group.slot_count += 1;
                group.slot_ids.push(b.slot_id);
            }
        });

        const detailedBookings = Array.from(groupedMap.values());

        return NextResponse.json(detailedBookings);
    } catch (error) {
        console.error("Fetch bookings error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { turf_id, slot_ids } = await request.json();

        if (!turf_id || !slot_ids || !Array.isArray(slot_ids) || slot_ids.length === 0) {
            return NextResponse.json({ error: 'turf_id and slot_ids (array) are required' }, { status: 400 });
        }

        // Check if any of these slots are already CONFIRMED
        const existingConfirmed = await prisma.booking.findMany({
            where: {
                slot_id: { in: slot_ids },
                status: 'CONFIRMED'
            }
        });

        if (existingConfirmed.length > 0) {
            return NextResponse.json({ error: 'One or more slots are already booked' }, { status: 400 });
        }

        const batchId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        const result = await prisma.$transaction(async (tx) => {
            // Delete any existing PENDING bookings for these slots to allow re-booking
            await tx.booking.deleteMany({
                where: {
                    slot_id: { in: slot_ids },
                    status: 'PENDING'
                }
            });

            // Create new PENDING bookings
            const newBookings = await Promise.all(
                slot_ids.map((slot_id) =>
                    tx.booking.create({
                        data: {
                            user_id: session.id,
                            turf_id,
                            slot_id,
                            status: 'PENDING',
                            razorpay_order_id: batchId,
                        }
                    })
                )
            );
            return newBookings;
        });

        // Return the first booking ID for the confirmation page
        return NextResponse.json(result[0], { status: 201 });
    } catch (error: any) {
        console.error("Create booking error:", error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'One or more slots are already booked' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { turf: true }
        });

        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // RBAC: Only owner of booking, owner of turf, or super-admin
        const isOwner = booking.user_id === session.id;
        const isTurfAdmin = booking.turf.admin_id === session.id;
        const isSuper = session.role === 'SUPER_ADMIN';

        if (!isOwner && !isTurfAdmin && !isSuper) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Atomic update
        await prisma.$transaction([
            prisma.booking.update({
                where: { id },
                data: { status: 'FAILED' } // Or 'CANCELLED' if you add to enum, currently FAILED is safe
            }),
            prisma.slot.update({
                where: { id: booking.slot_id },
                data: { is_booked: false }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Booking cancelled' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
