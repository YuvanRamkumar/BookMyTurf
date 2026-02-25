import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password, role } = registerSchema.parse(body)

        const existingUser = await db.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists with this email" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await db.user.create({
            data: {
                name,
                email,
                password_hash: hashedPassword,
                role,
                // Admins are not approved by default
                is_approved: role === "USER" ? true : false,
            },
        })

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        )
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
            return NextResponse.json({ error: `Validation failed: ${errorMessages}` }, { status: 400 })
        }
        console.error("REGISTER_ERROR", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
