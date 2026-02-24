import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req: any) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const role = req.auth?.user?.role
    const isApproved = req.auth?.user?.is_approved

    const isAdminRoute = nextUrl.pathname.startsWith("/admin")
    const isSuperAdminRoute = nextUrl.pathname.startsWith("/super-admin")
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

    if (isAdminRoute || isSuperAdminRoute || isDashboardRoute) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }

        if (isAdminRoute) {
            if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
                return NextResponse.redirect(new URL("/dashboard", nextUrl))
            }
            if (role === "ADMIN" && !isApproved) {
                return NextResponse.redirect(new URL("/dashboard?error=not_approved", nextUrl))
            }
        }

        if (isSuperAdminRoute && role !== "SUPER_ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl))
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
