import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    let response = NextResponse.next();
    const isLoggedIn = !!req.auth
    const isOnProtectedPath =
        req.nextUrl.pathname.startsWith("/create-token") ||
        req.nextUrl.pathname.startsWith("/create-liquidity-pool") ||
        req.nextUrl.pathname.startsWith("/copy-trending-tokens") ||
        req.nextUrl.pathname.startsWith("/api/payment");

    if (isOnProtectedPath && !isLoggedIn) {
        response = NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl))
    }

    // Affiliate Tracking Logic
    const ref = req.nextUrl.searchParams.get("ref");
    if (ref) {
        response.cookies.set("affiliate_ref", ref, {
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 days
            httpOnly: true,
            sameSite: "lax",
        });
    }

    return response;
})

export const config = {
    matcher: [
        "/create-token/:path*",
        "/create-liquidity-pool/:path*",
        "/copy-trending-tokens/:path*",
        "/api/payment/:path*",
    ]
}
