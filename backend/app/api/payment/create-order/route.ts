import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getRazorpay } from "@/lib/razorpay"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const razorpay = getRazorpay()

        const { slotId } = await req.json()
        if (!slotId) {
            return NextResponse.json({ error: "Slot ID is required" }, { status: 400 })
        }

        // 1. Check if slot exists and is not booked
        const slot = await db.slot.findUnique({
            where: { id: slotId },
            include: { turf: true }
        })

        if (!slot || slot.is_booked) {
            return NextResponse.json({ error: "Slot already booked or not found" }, { status: 400 })
        }

        // 2. Create a pending booking
        const options = {
            amount: Math.round(slot.turf.price_per_hour * 100), // amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        }

        const order = await razorpay.orders.create(options)

        const booking = await db.booking.create({
            data: {
                user_id: session.user.id as string,
                turf_id: slot.turf_id,
                slot_id: slotId,
                status: "PENDING",
                razorpay_order_id: order.id,
            },
        })

        return NextResponse.json({
            orderId: order.id,
            amount: options.amount,
            bookingId: booking.id,
            key: process.env.RAZORPAY_KEY_ID
        })

    } catch (error: unknown) {
        console.error("CREATE_ORDER_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
