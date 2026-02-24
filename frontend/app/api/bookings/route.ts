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
        // Handle multiple slot IDs (comma-separated)
        const slotIds = booking.slot_id.split(',');
        const slots = slotIds.map(sid => db.slots.find(s => s.id === sid)).filter(Boolean);
        
        if (slots.length === 0) return;

        const bookedAt = new Date(booking.booked_at);
        // Use the last slot's end time for expiry check
        const lastSlot = slots[slots.length - 1];
        if (!lastSlot) return;
        const slotEnd = new Date(`${lastSlot.date}T${lastSlot.end_time}:00`);

        // 1. Expire past confirmed bookings
        if (booking.status === 'confirmed' && now > slotEnd) {
            booking.status = 'expired';
            // Release all slots
            for (const slotId of slotIds) {
                const slotIndex = db.slots.findIndex(s => s.id === slotId);
                if (slotIndex !== -1) db.slots[slotIndex].is_booked = false;
            }
            changed = true;
        }

        // 2. Release pending bookings older than 15 minutes (payment not completed)
        const isStalePending = booking.status === 'pending' && (now.getTime() - bookedAt.getTime() > 15 * 60 * 1000);
        if (isStalePending) {
            booking.status = 'failed';
            // Slots were never reserved for pending bookings, so no need to release
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
        const user = db.users.find(u => u.id === b.user_id);
        
        // Handle multiple slot IDs (comma-separated)
        const slotIds = b.slot_id.split(',');
        const slots = slotIds.map(sid => db.slots.find(s => s.id === sid)).filter(Boolean);
        
        // For display, show first and last slot times if multiple
        let slot = null;
        if (slots.length > 0) {
            const firstSlot = slots[0];
            const lastSlot = slots[slots.length - 1];
            slot = {
                ...firstSlot,
                start_time: firstSlot?.start_time,
                end_time: lastSlot?.end_time,
                slot_count: slots.length
            };
        }
        
        return { ...b, turf, slot, slots, userName: user?.name, userEmail: user?.email };
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

        // Validate all slots are available (but don't mark them as booked yet)
        const validSlotIds: string[] = [];
        for (const id of idsToBook) {
            const slot = db.slots.find(s => s.id === id && s.turf_id === turf_id);
            if (!slot) {
                return NextResponse.json({ error: `Slot ${id} not found` }, { status: 404 });
            }
            if (slot.is_booked) {
                return NextResponse.json({ error: `Slot ${slot.start_time} - ${slot.end_time} is already booked` }, { status: 409 });
            }
            validSlotIds.push(id);
        }

        // Calculate total price for all slots
        const totalPrice = turf.price_per_hour * validSlotIds.length;

        // Create a single booking with all slot IDs (stored as comma-separated string)
        // Slots are NOT marked as booked yet - they will be reserved only after payment
        const newBooking: Booking = {
            id: Math.random().toString(36).substring(7),
            user_id: session.id,
            turf_id,
            slot_id: validSlotIds.join(','), // Store multiple slot IDs
            status: 'pending',
            booked_at: new Date().toISOString(),
            price_paid: totalPrice, // Total price for all slots
        };

        db.bookings.push(newBooking);
        saveDb(db);

        return NextResponse.json(newBooking);
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

        // Release all slots (handle multiple slot IDs separated by comma)
        const slotIds = booking.slot_id.split(',');
        for (const slotId of slotIds) {
            const slotIndex = db.slots.findIndex(s => s.id === slotId);
            if (slotIndex !== -1) {
                db.slots[slotIndex].is_booked = false;
            }
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
