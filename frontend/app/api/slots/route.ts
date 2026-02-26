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
        // Uniform UTC midnight normalization for the date field
        const date = new Date(dateStr);
        const normalizedDate = new Date(date.toISOString().split('T')[0]);

        let slots = await prisma.slot.findMany({
            where: {
                turf_id: turfId,
                date: normalizedDate
            },
            orderBy: {
                start_time: 'asc'
            }
        });

        const turf = await prisma.turf.findUnique({ where: { id: turfId } });
        if (!turf) return NextResponse.json({ error: 'Turf not found' }, { status: 404 });

        const startHour = parseInt(turf.opening_time.split(':')[0]);
        const endHour = parseInt(turf.closing_time.split(':')[0]);

        // Dynamic slot generation and maintenance
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const isTodayOrFuture = normalizedDate.toISOString().split('T')[0] >= todayStr;

        if (isTodayOrFuture) {
            const newSlotsData = [];
            for (let h = startHour; h < endHour; h++) {
                const startTime = `${h.toString().padStart(2, '0')}:00`;
                const endTime = `${(h + 1).toString().padStart(2, '0')}:00`;

                const existingSlot = slots.find(s => s.start_time === startTime);
                if (!existingSlot) {
                    newSlotsData.push({
                        turf_id: turfId,
                        date: normalizedDate,
                        start_time: startTime,
                        end_time: endTime,
                        is_booked: false
                    });
                }
            }

            if (newSlotsData.length > 0) {
                await prisma.slot.createMany({ data: newSlotsData });
                // Re-fetch all slots to include new ones
                slots = await prisma.slot.findMany({
                    where: { turf_id: turfId, date: normalizedDate },
                    orderBy: { start_time: 'asc' }
                });
            }

            // Cleanup/Filter: Remove slots that fall outside current operating hours
            // This fix ensures that if timing changed from 00:00 to 10:00, the 00:00 slots disappear
            const originalCount = slots.length;
            const validSlots = slots.filter(s => {
                const sHour = parseInt(s.start_time.split(':')[0]);
                return sHour >= startHour && sHour < endHour;
            });

            // If we found stale slots, we return only the valid ones
            slots = validSlots;
        }

        return NextResponse.json(slots);
    } catch (error) {
        console.error("Fetch slots error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { turf_id, date, start_time, end_time } = await request.json();

        if (!turf_id || !date || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic check: Only owner or super admin
        const turf = await prisma.turf.findUnique({ where: { id: turf_id } });
        if (!turf) return NextResponse.json({ error: "Turf not found" }, { status: 404 });
        if (session.role !== 'SUPER_ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const slot = await prisma.slot.create({
            data: {
                turf_id,
                date: new Date(date),
                start_time,
                end_time,
                is_booked: false
            }
        });

        return NextResponse.json(slot, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const id = body.id || body.slot_id;
        const is_booked = body.is_booked;

        if (!id) {
            return NextResponse.json({ error: 'id or slot_id required' }, { status: 400 });
        }

        const slot = await prisma.slot.findUnique({
            where: { id },
            include: { turf: true }
        });

        if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

        // RBAC Check
        if (session.role !== 'SUPER_ADMIN' && slot.turf.admin_id !== session.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updatedSlot = await prisma.slot.update({
            where: { id },
            data: { is_booked: !!is_booked }
        });

        return NextResponse.json(updatedSlot);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        const slot = await prisma.slot.findUnique({
            where: { id },
            include: { turf: true }
        });

        if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

        if (session.role !== 'SUPER_ADMIN' && slot.turf.admin_id !== session.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (slot.is_booked) {
            return NextResponse.json({ error: "Cannot delete a booked slot" }, { status: 400 });
        }

        await prisma.slot.delete({ where: { id } });
        return NextResponse.json({ message: "Slot deleted" });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
