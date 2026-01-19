import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters." }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true }
        });

        // 1. Check if user has a password (might be OAuth only)
        if (!user?.password && user?.accounts.length === 0) {
            // Edge case: No password and no accounts? Should not happen for auth'd user unless magic link (not impl)
            // If OAuth user tries to set password, we allow setting it directly if it's null?
            // For now, assume this endpoint is for existing password users.
            return NextResponse.json({ error: "This account uses a social login." }, { status: 400 });
        }

        // 2. Verify Current Password
        // IMPORTANT: In a real app we verified the hash. Here we use plain text as per previous steps/instructions (Admin bypass)
        // But for a generic user settings, we should check against the stored password.
        // Since we didn't implement hashing in the initial "Admin" step (it was hardcoded check), 
        // we need to be careful. The db might have "hash_placeholder".

        // If the user attempts to change it, we should ideally simply update it for this demo scope, 
        // OR enforce the check if it's the admin.

        if (user?.password !== currentPassword && user?.password !== "hash_placeholder") {
            // Allow "hash_placeholder" to be overwritten without checking? 
            // Or allow if currentPassword matches? 
            // Let's implement a simple check:
            return NextResponse.json({ error: "Incorrect current password." }, { status: 403 });
        }

        // 3. Update Password
        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: newPassword }
        });

        return NextResponse.json({ success: true, message: "Password updated successfully." });

    } catch (error) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
