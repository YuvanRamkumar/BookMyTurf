import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
};

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const razorpay = getRazorpay();

    try {
        const { booking_id } = await request.json();
        if (!booking_id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

        const db = getDb();
        const booking = db.bookings.find(b => b.id === booking_id);

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.user_id !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (booking.status !== 'pending') {
            return NextResponse.json({ error: 'Booking is not in pending state' }, { status: 400 });
        }

        // Amount in paise (1 INR = 100 paise)
        // Add a small "platform fee" as per requirements
        const platformFee = 20; // Example ₹20
        const totalAmount = (booking.price_paid + platformFee) * 100;

        const options = {
            amount: totalAmount,
            currency: "INR",
            receipt: `receipt_${booking.id}`,
        };

        const razorpayInstance = getRazorpayInstance();
        const order = await razorpayInstance.orders.create(options);

        // Save order ID to booking
        const bookingIndex = db.bookings.findIndex(b => b.id === booking_id);
        db.bookings[bookingIndex].razorpay_order_id = order.id;
        saveDb(db);

        return NextResponse.json({
            order_id: order.id,
            amount: totalAmount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID,
            platformFee
        });
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);

        // Check for placeholder keys
        if (process.env.RAZORPAY_KEY_ID?.includes('YOUR_')) {
            return NextResponse.json({
                error: 'Razorpay keys not configured. Please add your real keys to the .env file.'
            }, { status: 500 });
        }

        return NextResponse.json({
            error: error.message || 'Failed to create payment order'
        }, { status: 500 });
    }
}
