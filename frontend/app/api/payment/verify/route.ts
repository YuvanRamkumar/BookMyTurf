import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
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

        const bookings = await prisma.booking.findMany({
            where: { razorpay_order_id }
        });

        if (bookings.length === 0) {
            return NextResponse.json({ error: 'Bookings not found for this order' }, { status: 404 });
        }

        if (isValid) {
            // Atomic update using transaction
            await prisma.$transaction([
                prisma.booking.updateMany({
                    where: { razorpay_order_id },
                    data: {
                        status: 'CONFIRMED',
                        razorpay_payment_id: razorpay_payment_id
                    }
                }),
                prisma.slot.updateMany({
                    where: { id: { in: bookings.map(b => b.slot_id) } },
                    data: { is_booked: true }
                })
            ]);

            return NextResponse.json({ success: true, message: 'Payment verified and bookings confirmed' });
        } else {
            // Atomic update for failure as well
            await prisma.$transaction([
                prisma.booking.updateMany({
                    where: { razorpay_order_id },
                    data: { status: 'FAILED' }
                }),
                prisma.slot.updateMany({
                    where: { id: { in: bookings.map(b => b.slot_id) } },
                    data: { is_booked: false }
                })
            ]);

            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
