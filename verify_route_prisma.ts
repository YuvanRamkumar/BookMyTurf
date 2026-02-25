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

        const booking = await prisma.booking.findUnique({
            where: { razorpay_order_id }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found for this order' }, { status: 404 });
        }

        if (isValid) {
            // Update booking status and save payment ID
            await prisma.booking.update({
                where: { id: booking.id },
                data: {
                    status: 'CONFIRMED',
                    razorpay_payment_id: razorpay_payment_id
                }
            });

            // Mark slot as booked (redundant but safe)
            await prisma.slot.update({
                where: { id: booking.slot_id },
                data: { is_booked: true }
            });

            return NextResponse.json({ success: true, message: 'Payment verified and booking confirmed' });
        } else {
            // Mark booking failed and release the slot
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: 'FAILED' }
            });

            await prisma.slot.update({
                where: { id: booking.slot_id },
                data: { is_booked: false }
            });

            return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
