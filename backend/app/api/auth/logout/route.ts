import { signOut } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST() {
    try {
        await signOut({ redirect: false })
        return NextResponse.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
