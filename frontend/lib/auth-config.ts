import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
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

                const user = await prisma.user.findUnique({
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
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email as string }
                    })

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email as string,
                                name: user.name,
                                role: "USER",
                                is_approved: true,
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
                if (account?.provider === "google") {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email as string }
                    })
                    if (dbUser) {
                        token.role = dbUser.role
                        token.id = dbUser.id
                        token.is_approved = dbUser.is_approved
                    }
                } else {
                    const u = user as any
                    token.role = u.role
                    token.id = u.id
                    token.is_approved = u.is_approved
                }
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
                (session.user as any).is_approved = token.is_approved;
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
    },
})
