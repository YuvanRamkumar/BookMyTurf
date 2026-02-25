import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"

const secretKey = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "secret")

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        const user = await db.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.password_hash)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        if (user.role === 'ADMIN' && !user.is_approved) {
            return NextResponse.json({ error: "Your account is pending approval" }, { status: 403 })
        }

        // Create a custom token if they aren't using NextAuth session natively on this specific route
        // But usually NextAuth's skip this. Let's return the user and let the frontend handle the redirect.

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                is_approved: user.is_approved
            }
        })

    } catch (error) {
        console.error("LOGIN_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
