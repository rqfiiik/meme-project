import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const walletAddress = searchParams.get('address');

        if (!walletAddress) {
            return NextResponse.json({ error: "Wallet address required" }, { status: 400 });
        }

        const subscription = await prisma.subscription.findFirst({
            where: {
                walletAddress,
                status: 'active'
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!subscription) {
            return NextResponse.json({ active: false });
        }

        return NextResponse.json({ active: true, subscription });

    } catch (error: any) {
        console.error("Subscription Status Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
