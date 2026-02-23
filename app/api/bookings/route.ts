import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Booking } from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * Auto-expire bookings whose slot end_time + date has passed.
 * Marks them as 'expired' and releases the slot.
 */
function autoExpireBookings() {
    const db = getDb();
    const now = new Date();
    let changed = false;

    db.bookings.forEach((booking) => {
        if (booking.status !== 'confirmed') return;

        const slot = db.slots.find(s => s.id === booking.slot_id);
        if (!slot) return;

        // Build a Date from slot date + end_time
        const slotEnd = new Date(`${slot.date}T${slot.end_time}:00`);

        if (now > slotEnd) {
            booking.status = 'expired';
            // Release the slot so it shows as available for future dates
            const slotIndex = db.slots.findIndex(s => s.id === booking.slot_id);
            if (slotIndex !== -1) {
                db.slots[slotIndex].is_booked = false;
            }
            changed = true;
        }
    });

    if (changed) {
        saveDb(db);
    }

    return db;
}

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('turfId');
    const status = searchParams.get('status'); // 'active' | 'history' | null (all)

    // Auto-expire before fetching
    const db = autoExpireBookings();
    let bookings = db.bookings;

    if (session.role === 'USER') {
        bookings = bookings.filter(b => b.user_id === session.id);
    } else if (session.role === 'ADMIN') {
        const adminTurfs = db.turfs.filter(t => t.admin_id === session.id).map(t => t.id);
        bookings = bookings.filter(b => adminTurfs.includes(b.turf_id));
        if (turfId) bookings = bookings.filter(b => b.turf_id === turfId);
    } else if (session.role === 'SUPER_ADMIN') {
        if (turfId) bookings = bookings.filter(b => b.turf_id === turfId);
    }

    // Filter by status category
    if (status === 'active') {
        bookings = bookings.filter(b => b.status === 'confirmed');
    } else if (status === 'history') {
        bookings = bookings.filter(b => b.status === 'expired' || b.status === 'cancelled');
    }

    // Join data for UI
    const detailedBookings = bookings.map(b => {
        const turf = db.turfs.find(t => t.id === b.turf_id);
        const slot = db.slots.find(s => s.id === b.slot_id);
        const user = db.users.find(u => u.id === b.user_id);
        return { ...b, turf, slot, userName: user?.name, userEmail: user?.email };
    });

    return NextResponse.json(detailedBookings);
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { turf_id, slot_id, slot_ids } = await request.json();
        const idsToBook = slot_ids || [slot_id];

        if (!idsToBook || idsToBook.length === 0) {
            return NextResponse.json({ error: 'No slots specified' }, { status: 400 });
        }

        const db = getDb();

        const turf = db.turfs.find(t => t.id === turf_id);
        if (!turf) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        if (!turf.is_approved) {
            return NextResponse.json({ error: 'This arena is currently under review and cannot accept bookings yet.' }, { status: 403 });
        }

        const bookingsCreated = [];

        for (const id of idsToBook) {
            const slotIndex = db.slots.findIndex(s => s.id === id && s.turf_id === turf_id);

            if (slotIndex === -1) {
                continue; // Or handle error
            }

            if (db.slots[slotIndex].is_booked) {
                continue; // Or handle error
            }

            db.slots[slotIndex].is_booked = true;

            const newBooking: Booking = {
                id: Math.random().toString(36).substring(7),
                user_id: session.id,
                turf_id,
                slot_id: id,
                status: 'confirmed',
                booked_at: new Date().toISOString(),
                price_paid: turf.price_per_hour,
            };

            db.bookings.push(newBooking);
            bookingsCreated.push(newBooking);
        }

        if (bookingsCreated.length === 0) {
            return NextResponse.json({ error: 'Failed to book any slots' }, { status: 409 });
        }

        saveDb(db);

        // Return the first booking ID for the confirmation page redirect
        return NextResponse.json(bookingsCreated[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('id');

        if (!bookingId) {
            return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
        }

        const db = getDb();
        const bookingIndex = db.bookings.findIndex(b => b.id === bookingId);

        if (bookingIndex === -1) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const booking = db.bookings[bookingIndex];

        // Only confirmed bookings can be cancelled
        if (booking.status !== 'confirmed') {
            return NextResponse.json({ error: 'Only confirmed bookings can be cancelled' }, { status: 400 });
        }

        // Check if user is authorized to delete this booking
        if (session.role === 'USER' && booking.user_id !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Release the slot
        const slotIndex = db.slots.findIndex(s => s.id === booking.slot_id);
        if (slotIndex !== -1) {
            db.slots[slotIndex].is_booked = false;
        }

        // Mark as cancelled and apply 20% cancellation charge
        const charge = booking.price_paid * 0.2;
        db.bookings[bookingIndex].status = 'cancelled';
        db.bookings[bookingIndex].cancellation_charge = charge;

        saveDb(db);

        return NextResponse.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
