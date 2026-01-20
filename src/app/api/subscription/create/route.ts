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
        const { walletAddress, planType, transactionSignature } = body;

        if (!walletAddress || !planType) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Verify transaction if provided (optional for now, but good practice)
        // verifyTransaction(transactionSignature)...

        const subscription = await prisma.subscription.create({
            data: {
                userId: session.user.id,
                walletAddress,
                planType,
                status: 'active', // Default to active for now
                lastPayment: new Date(),
                nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
            }
        });

        return NextResponse.json({ success: true, subscription });

    } catch (error: any) {
        console.error("Create Subscription Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
