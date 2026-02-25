import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) return null

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password_hash
                )

                if (!isValid) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    is_approved: user.is_approved,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            const u = user as any
            if (u) {
                token.role = u.role
                token.id = u.id
                token.is_approved = u.is_approved
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            const t = token as any
            if (t && session.user) {
                (session.user as any).role = t.role
                    (session.user as any).id = t.id
                        (session.user as any).is_approved = t.is_approved
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
