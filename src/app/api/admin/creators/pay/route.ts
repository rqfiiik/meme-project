import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { creatorId } = body;

        console.log(`[Admin] Marking earnings paid for creator: ${creatorId}`);

        if (!creatorId) {
            return NextResponse.json({ error: "Creator ID required" }, { status: 400 });
        }

        // Update all pending earnings for this creator to 'paid'
        const result = await prisma.affiliateEarning.updateMany({
            where: {
                creatorId: creatorId,
                status: 'pending'
            },
            data: {
                status: 'paid',
                paidAt: new Date()
            }
        });

        console.log(`[Admin] Updated ${result.count} rows.`);

        return NextResponse.json({ success: true, count: result.count });

    } catch (error) {
        console.error("Admin Payment Mark Error:", error);
        return NextResponse.json({ error: "Failed to process payout" }, { status: 500 });
    }
}
