import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const db = getDb();
    const turf = db.turfs.find(t => t.id === id);

    if (!turf) {
        return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
    }

    return NextResponse.json(turf);
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
        const db = getDb();
        const turfIndex = db.turfs.findIndex(t => t.id === id);

        if (turfIndex === -1) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        const turf = db.turfs[turfIndex];

        // Only the owning admin or super admin can edit
        if (session.role === 'ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only edit your own turfs' }, { status: 403 });
        }

        // Update allowed fields
        const allowedFields = ['name', 'location', 'sport_type', 'price_per_hour', 'opening_time', 'closing_time', 'image_url'];
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                (db.turfs[turfIndex] as any)[field] = field === 'price_per_hour' ? Number(updates[field]) : updates[field];
            }
        }

        // If timing changed, regenerate slots for future dates (don't touch booked slots)
        if (updates.opening_time || updates.closing_time) {
            const updatedTurf = db.turfs[turfIndex];
            const today = new Date();

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];

                // Remove only unbooked slots for this date
                db.slots = db.slots.filter(s =>
                    !(s.turf_id === id && s.date === dateStr && !s.is_booked)
                );

                // Regenerate unbooked slots with new timing
                const startHour = parseInt(updatedTurf.opening_time.split(':')[0]);
                const endHour = parseInt(updatedTurf.closing_time.split(':')[0]);

                for (let h = startHour; h < endHour; h++) {
                    const slotId = `s-${id}-${dateStr}-${h}`;
                    const exists = db.slots.find(s => s.id === slotId);
                    if (!exists) {
                        db.slots.push({
                            id: slotId,
                            turf_id: id,
                            date: dateStr,
                            start_time: `${h.toString().padStart(2, '0')}:00`,
                            end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                            is_booked: false,
                        });
                    }
                }
            }
        }

        saveDb(db);
        return NextResponse.json(db.turfs[turfIndex]);
    } catch (error) {
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
        const db = getDb();
        const turfIndex = db.turfs.findIndex(t => t.id === id);

        if (turfIndex === -1) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        const turf = db.turfs[turfIndex];

        // Only the owning admin or super admin can delete
        if (session.role === 'ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only delete your own turfs' }, { status: 403 });
        }

        // Check for active bookings
        const activeBookings = db.bookings.filter(b => b.turf_id === id);
        if (activeBookings.length > 0) {
            return NextResponse.json({
                error: `Cannot delete: ${activeBookings.length} active booking(s) exist. Cancel them first.`
            }, { status: 400 });
        }

        // Remove all slots for this turf
        db.slots = db.slots.filter(s => s.turf_id !== id);

        // Remove the turf
        db.turfs.splice(turfIndex, 1);

        saveDb(db);
        return NextResponse.json({ message: 'Turf deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
