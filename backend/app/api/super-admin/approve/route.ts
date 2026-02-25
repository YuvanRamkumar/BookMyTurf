import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { userId, approve } = body

        if (!userId) {
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const user = await db.user.update({
            where: { id: userId },
            data: { is_approved: !!approve }
        })

        return NextResponse.json({ success: true, user: { id: user.id, is_approved: user.is_approved } })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
