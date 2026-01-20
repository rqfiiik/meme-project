import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();

        // 1. Check Admin Role
        const adminEmail = "rqfik.lakehal@gmail.com";
        if (session?.user?.email !== adminEmail && session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { userId, action } = body;

        if (!userId || !['flag', 'ban', 'activate'].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        // 2. Map action to status
        let newStatus = 'active';
        if (action === 'flag') newStatus = 'suspended'; // Using "suspended" for flagged users appropriately or "flagged" if schema allows
        if (action === 'ban') newStatus = 'banned'; // Schema has "suspended" or "active", let's check schema. User model says: status String @default("active") // "active", "suspended"

        // Schema check: status is String. Comments say "active", "suspended". 
        // Let's stick to simple states: active, suspended (flagged), banned.
        // We will treat 'flag' as 'suspended' for now or just generic string.
        if (action === 'flag') newStatus = 'suspended';
        if (action === 'ban') newStatus = 'banned';
        if (action === 'activate') newStatus = 'active';

        // 3. Update User
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { status: newStatus }
        });

        // 4. Create Audit Log
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        await prisma.adminLog.create({
            data: {
                adminId: session.user.id,
                action: `user_${action}`,
                targetId: userId,
                details: `Status changed to ${newStatus}. IP: ${ip}`
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error: any) {
        console.error("Admin User Action Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
