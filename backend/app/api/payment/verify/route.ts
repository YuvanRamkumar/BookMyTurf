import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const secret = process.env.RAZORPAY_KEY_SECRET
        if (!secret) return NextResponse.json({ error: "Server configuration error" }, { status: 500 })

        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body.toString())
            .digest("hex")

        const isValid = expectedSignature === razorpay_signature

        if (!isValid) {
            await db.booking.updateMany({
                where: { razorpay_order_id },
                data: { status: "FAILED" }
            })
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        // Find the booking
        const booking = await db.booking.findUnique({
            where: { razorpay_order_id }
        })

        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        // Atomic update to prevent double booking
        const updateResult = await db.slot.updateMany({
            where: {
                id: booking.slot_id,
                is_booked: false
            },
            data: {
                is_booked: true
            }
        })

        if (updateResult.count === 0) {
            await db.booking.update({
                where: { id: booking.id },
                data: { status: "FAILED" }
            })
            return NextResponse.json({ error: "Slot already booked by another transaction" }, { status: 400 })
        }

        // Update booking status to CONFIRMED
        await db.booking.update({
            where: { id: booking.id },
            data: {
                status: "CONFIRMED",
                razorpay_payment_id
            }
        })

        return NextResponse.json({ success: true, bookingId: booking.id })

    } catch (error: any) {
        console.error("VERIFY_PAYMENT_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
