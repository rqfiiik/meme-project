import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { address } = body;

        if (!address) {
            return NextResponse.json({ error: "Address required" }, { status: 400 });
        }

        // Verify wallet belongs to user
        const wallet = await prisma.wallet.findUnique({
            where: { address }
        });

        if (!wallet || wallet.userId !== session.user.id) {
            return NextResponse.json({ error: "Wallet not found or unauthorized" }, { status: 404 });
        }

        // Soft disconnect
        const updated = await prisma.wallet.update({
            where: { address },
            data: {
                status: "disconnected",
                lastSeenAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, status: updated.status });
    } catch (error: any) {
        console.error("Disconnect Wallet Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
