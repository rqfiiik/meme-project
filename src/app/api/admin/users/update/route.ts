import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, isCreator, promoCode, commissionRate } = body;

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        const updateData: any = {};
        if (typeof isCreator !== 'undefined') updateData.isCreator = isCreator;
        if (typeof promoCode !== 'undefined') updateData.promoCode = promoCode || null;
        if (typeof commissionRate !== 'undefined') updateData.commissionRate = parseFloat(commissionRate);

        const updatedUser = await (prisma.user as any).update({
            where: { id: userId },
            data: updateData
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Admin Update Error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
