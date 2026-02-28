import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
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

                if (!user || !user.password_hash) return null

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
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const existingUser = await db.user.findUnique({
                        where: { email: user.email as string }
                    })

                    if (!existingUser) {
                        await db.user.create({
                            data: {
                                email: user.email as string,
                                name: user.name ?? null,
                                password_hash: null as any, // Bypass required check if Prisma client is stale; DB allows null
                                role: "USER",
                                is_approved: true, // Auto-approve users who sign in with Google
                            }
                        })
                    }
                    return true
                } catch (error) {
                    console.error("Error saving user from Google:", error)
                    return false
                }
            }
            return true
        },
        async jwt({ token, user, account }: { token: any, user: any, account?: any }) {
            if (user) {
                // Initial sign in
                if (account?.provider === "google") {
                    const dbUser = await db.user.findUnique({
                        where: { email: user.email as string }
                    })
                    if (dbUser) {
                        token.role = dbUser.role
                        token.id = dbUser.id
                        token.is_approved = dbUser.is_approved
                    }
                } else {
                    token.role = user.role
                    token.id = user.id
                    token.is_approved = user.is_approved
                }
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                session.user.role = token.role
                session.user.id = token.id
                session.user.is_approved = token.is_approved
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
