import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('turfId');
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!turfId || !date) {
        return NextResponse.json({ error: 'Missing turfId or date' }, { status: 400 });
    }

    const db = getDb();
    const slots = db.slots.filter(s => s.turf_id === turfId && s.date === date);

    // Sort by start_time
    slots.sort((a, b) => a.start_time.localeCompare(b.start_time));

    return NextResponse.json(slots);
}

// Admin can block/unblock slots
export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { slot_id, is_booked } = await request.json();
        const db = getDb();
        const slotIndex = db.slots.findIndex(s => s.id === slot_id);

        if (slotIndex === -1) {
            return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
        }

        db.slots[slotIndex].is_booked = is_booked;
        saveDb(db);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Admin can add a new custom slot
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

        const db = getDb();

        // Verify turf exists
        const turf = db.turfs.find(t => t.id === turf_id);
        if (!turf) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        // Check ownership
        if (session.role === 'ADMIN' && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only manage your own turfs' }, { status: 403 });
        }

        // Check for overlapping slots
        const overlap = db.slots.find(s =>
            s.turf_id === turf_id &&
            s.date === date &&
            s.start_time === start_time &&
            s.end_time === end_time
        );
        if (overlap) {
            return NextResponse.json({ error: 'A slot with this time range already exists' }, { status: 400 });
        }

        const newSlot = {
            id: `s-${turf_id}-${date}-${start_time.replace(':', '')}`,
            turf_id,
            date,
            start_time,
            end_time,
            is_booked: false,
        };

        db.slots.push(newSlot);
        saveDb(db);

        return NextResponse.json(newSlot);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Admin can remove a slot
export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const slotId = searchParams.get('id');

        if (!slotId) {
            return NextResponse.json({ error: 'Slot ID required' }, { status: 400 });
        }

        const db = getDb();
        const slotIndex = db.slots.findIndex(s => s.id === slotId);

        if (slotIndex === -1) {
            return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
        }

        const slot = db.slots[slotIndex];

        // Check if slot is booked
        if (slot.is_booked) {
            return NextResponse.json({ error: 'Cannot remove a booked slot. Cancel the booking first.' }, { status: 400 });
        }

        // Check ownership
        const turf = db.turfs.find(t => t.id === slot.turf_id);
        if (session.role === 'ADMIN' && turf && turf.admin_id !== session.id) {
            return NextResponse.json({ error: 'You can only manage your own turfs' }, { status: 403 });
        }

        db.slots.splice(slotIndex, 1);
        saveDb(db);

        return NextResponse.json({ message: 'Slot removed successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
