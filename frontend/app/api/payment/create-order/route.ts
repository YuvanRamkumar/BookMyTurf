import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
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

        const booking = await prisma.booking.findUnique({
            where: { id: booking_id },
            include: { turf: true }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.user_id !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Find all pending bookings for this user and turf to group them
        const pendingBookings = await prisma.booking.findMany({
            where: {
                user_id: session.id,
                turf_id: booking.turf_id,
                status: 'PENDING'
            },
            include: { turf: true }
        });

        if (pendingBookings.length === 0) {
            return NextResponse.json({ error: 'No pending bookings found' }, { status: 400 });
        }

        // Amount in paise (1 INR = 100 paise)
        const platformFee = 20; // Example ₹20
        const totalTurfPrice = pendingBookings.reduce((sum, b) => sum + b.turf.price_per_hour, 0);
        const totalAmount = Math.round((totalTurfPrice + platformFee) * 100);

        const options = {
            amount: totalAmount,
            currency: "INR",
            receipt: `group_${session.id.slice(0, 8)}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Update ALL pending bookings for this user/turf with the SAME order ID
        await prisma.booking.updateMany({
            where: {
                id: { in: pendingBookings.map(b => b.id) }
            },
            data: { razorpay_order_id: order.id }
        });

        return NextResponse.json({
            order_id: order.id,
            amount: totalAmount,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID,
            platformFee
        });
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);

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
