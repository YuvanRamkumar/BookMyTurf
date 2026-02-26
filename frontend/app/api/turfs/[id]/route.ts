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
        const allowedFields = ['name', 'location', 'sport_type', 'price_per_hour', 'opening_time', 'closing_time', 'image_url', 'status', 'description', 'amenities', 'precautions', 'images', 'operational_status'];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                if (field === 'price_per_hour') data[field] = Number(updates[field]);
                else if (field === 'sport_type') data[field] = (updates[field] === 'Football/Cricket' || updates[field] === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL';
                else if (field === 'amenities' || field === 'precautions' || field === 'images') {
                    data[field] = Array.isArray(updates[field]) ? updates[field] : [];
                }
                else data[field] = updates[field];
            }
        }

        const updatedTurf = await prisma.turf.update({
            where: { id },
            data
        });

        // Regenerate slots if timing changed
        if (updates.opening_time || updates.closing_time) {
            const today = new Date();

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Normalize to YYYY-MM-DD to match database date storage
                const dateStr = date.toISOString().split('T')[0];
                const normalizedDate = new Date(dateStr);

                // Delete only unbooked slots for this date/turf
                await prisma.slot.deleteMany({
                    where: {
                        turf_id: id,
                        date: normalizedDate,
                        is_booked: false,
                        booking: null // Ensure no booking record exists at all (even pending ones)
                    }
                });

                const startHour = parseInt(updatedTurf.opening_time.split(':')[0]);
                const endHour = parseInt(updatedTurf.closing_time.split(':')[0]);

                const newSlots = [];
                for (let h = startHour; h < endHour; h++) {
                    const startTime = `${h.toString().padStart(2, '0')}:00`;
                    const endTime = `${(h + 1).toString().padStart(2, '0')}:00`;

                    // Check if a booked slot already exists at this time
                    const exists = await prisma.slot.findUnique({
                        where: {
                            turf_id_date_start_time_end_time: {
                                turf_id: id,
                                date: normalizedDate,
                                start_time: startTime,
                                end_time: endTime
                            }
                        }
                    });

                    if (!exists) {
                        newSlots.push({
                            turf_id: id,
                            date: normalizedDate,
                            start_time: startTime,
                            end_time: endTime,
                            is_booked: false
                        });
                    }
                }

                if (newSlots.length > 0) {
                    await prisma.slot.createMany({ data: newSlots });
                }
            }
        }

        return NextResponse.json(updatedTurf);
    } catch (error) {
        console.error("Update turf error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
