import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnProtectedPath =
        req.nextUrl.pathname.startsWith("/create-token") ||
        req.nextUrl.pathname.startsWith("/create-liquidity-pool") ||
        req.nextUrl.pathname.startsWith("/copy-trending-tokens") ||
        req.nextUrl.pathname.startsWith("/api/payment");

    if (isOnProtectedPath && !isLoggedIn) {
        return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        "/create-token/:path*",
        "/create-liquidity-pool/:path*",
        "/copy-trending-tokens/:path*",
        "/api/payment/:path*",
    ]
}
