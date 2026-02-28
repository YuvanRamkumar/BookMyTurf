import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    try {
        const turf = await prisma.turf.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                },
                _count: {
                    select: { bookings: true }
                }
            }
        });

        if (!turf) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        // Calculate average rating
        const avgRating = turf.reviews.length > 0
            ? turf.reviews.reduce((acc, r) => acc + r.rating, 0) / turf.reviews.length
            : 0;

        return NextResponse.json({ ...turf, avgRating });
    } catch (error) {
        console.error("Fetch turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const updates = await request.json();

        // Log the updates for debugging
        try {
            const fs = require('fs');
            fs.appendFileSync('api_error_debug.log', `[${new Date().toISOString()}] UPDATE_REQUEST for ${id}: ${JSON.stringify(updates)}\n`);
        } catch (e) { }

        const turf = await prisma.turf.findUnique({
            where: { id }
        });

        if (!turf) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        if (session.role === 'ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only edit your own turfs' }, { status: 403 });
        }

        const data: any = {};
        const allowedFields = ['name', 'location', 'sport_type', 'price_per_hour', 'opening_time', 'closing_time', 'image_url', 'status', 'description', 'amenities', 'precautions', 'images', 'operational_status', 'weekday_price', 'weekend_price', 'peak_hour_multiplier', 'peak_start_time', 'peak_end_time', 'latitude', 'longitude', 'address'];

        for (const field of allowedFields) {
            if (updates[field] !== undefined && updates[field] !== null) {
                if (['price_per_hour', 'weekday_price', 'weekend_price', 'peak_hour_multiplier', 'latitude', 'longitude'].includes(field)) {
                    const val = Number(updates[field]);
                    if (!isNaN(val)) {
                        data[field] = val;
                        if (field === 'weekday_price') data['price_per_hour'] = val;
                    }
                }
                else if (field === 'sport_type') {
                    data[field] = (updates[field] === 'Football/Cricket' || updates[field] === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL';
                }
                else if (['amenities', 'precautions', 'images'].includes(field)) {
                    data[field] = Array.isArray(updates[field]) ? updates[field] : [];
                }
                else {
                    data[field] = updates[field];
                }
            }
        }

        const updatedTurf = await prisma.turf.update({
            where: { id },
            data
        });

        // Regenerate slots ONLY if timing actually changed
        const timingChanged = updates.opening_time || updates.closing_time;

        if (timingChanged) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                const Y = date.getFullYear();
                const M = date.getMonth();
                const D = date.getDate();
                const normalizedDate = new Date(Date.UTC(Y, M, D));

                try {
                    // Delete unbooked slots for this date
                    await prisma.slot.deleteMany({
                        where: {
                            turf_id: id,
                            date: normalizedDate,
                            is_booked: false,
                            booking: { is: null }
                        }
                    });

                    const opening = updates.opening_time || updatedTurf.opening_time || "06:00";
                    const closing = updates.closing_time || updatedTurf.closing_time || "22:00";
                    const startHour = parseInt(opening.split(':')[0]);
                    const endHour = parseInt(closing.split(':')[0]);

                    if (isNaN(startHour) || isNaN(endHour)) continue;

                    const slotsToCreate = [];
                    for (let h = startHour; h < endHour; h++) {
                        slotsToCreate.push({
                            turf_id: id,
                            date: normalizedDate,
                            start_time: `${h.toString().padStart(2, '0')}:00`,
                            end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                            is_booked: false
                        });
                    }

                    if (slotsToCreate.length > 0) {
                        await prisma.slot.createMany({
                            data: slotsToCreate,
                            skipDuplicates: true
                        });
                    }
                } catch (slotErr: any) {
                    console.error(`Error regenerating slots for ${id}:`, slotErr.message);
                }
            }
        }

        return NextResponse.json(updatedTurf);
    } catch (error: any) {
        console.error("Update turf error:", error);
        // Temporary debug logging to a file we can read
        try {
            const fs = require('fs');
            const logMsg = `[${new Date().toISOString()}] UPDATE_ERROR: ${error.message}\n${error.stack}\n\n`;
            fs.appendFileSync('api_error_debug.log', logMsg);
        } catch (e) { }

        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;
        const turf = await prisma.turf.findUnique({
            where: { id },
            include: { _count: { select: { bookings: true } } }
        });

        if (!turf) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        if (session.role === 'ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only delete your own turfs' }, { status: 403 });
        }

        if (turf._count.bookings > 0) {
            return NextResponse.json({
                error: `Cannot delete: ${turf._count.bookings} active booking(s) exist. Cancel them first.`
            }, { status: 400 });
        }

        await prisma.turf.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Turf deleted successfully' });
    } catch (error) {
        console.error("Delete turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
