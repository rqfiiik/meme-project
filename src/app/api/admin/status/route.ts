import { auth } from "@/auth";
import { isUserAdmin } from "@/lib/admin";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        // Even if not logged in main auth, we might want to check wallet if provided? 
        // But for now, rely on session.
        if (!session?.user) {
            return NextResponse.json({ isAdmin: false, bypass: false });
        }

        // We can pass wallet if available in session, or rely on email/role
        // Note: isUserAdmin expects Partial<User>. Session user usually has role/email.
        // If we wanted to check connected wallet address from session, we'd need it there.
        // Assuming session.user has relevant info or we just check email/role.
        console.log("[API AdminStatus] Session User:", session.user);
        const isAdmin = isUserAdmin(session.user);
        const bypass = process.env.ADMIN_BYPASS === 'true' && isAdmin;

        console.log("[API AdminStatus] Result:", { isAdmin, bypass });

        return NextResponse.json({
            isAdmin,
            bypass
        });

    } catch (error) {
        console.error("Admin Status Check Error:", error);
        return NextResponse.json({ isAdmin: false, bypass: false }, { status: 500 });
    }
}
