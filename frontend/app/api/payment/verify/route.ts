import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        const db = getDb();
        const bookingIndex = db.bookings.findIndex(b => b.razorpay_order_id === razorpay_order_id);

        if (bookingIndex === -1) {
            return NextResponse.json({ error: 'Booking not found for this order' }, { status: 404 });
        }

        if (isValid) {
            // Update booking status
            db.bookings[bookingIndex].status = 'confirmed';
            db.bookings[bookingIndex].razorpay_payment_id = razorpay_payment_id;

            // Mark slot as booked (safety check - it should already be true if it was pending)
            const slotIndex = db.slots.findIndex(s => s.id === db.bookings[bookingIndex].slot_id);
            if (slotIndex !== -1) {
                db.slots[slotIndex].is_booked = true;
            }

            saveDb(db);
            return NextResponse.json({ success: true, message: 'Payment verified and booking confirmed' });
        } else {
            // Mark booking failed
            db.bookings[bookingIndex].status = 'failed';

            // Release the slot
            const slotIndex = db.slots.findIndex(s => s.id === db.bookings[bookingIndex].slot_id);
            if (slotIndex !== -1) {
                db.slots[slotIndex].is_booked = false;
            }

            saveDb(db);
            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
