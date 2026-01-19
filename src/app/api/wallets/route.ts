import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const wallets = await prisma.wallet.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(wallets);
    } catch (error) {
        console.error("Error fetching wallets:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { address, label } = await req.json();

        if (!address) {
            return new NextResponse("Address required", { status: 400 });
        }

        // Check if wallet already linked
        const existing = await prisma.wallet.findUnique({
            where: { address }
        });

        if (existing) {
            if (existing.userId === session.user.id) {
                // Update last active
                await prisma.wallet.update({
                    where: { id: existing.id },
                    data: { lastActive: new Date() }
                });
                return NextResponse.json({ success: true, wallet: existing });
            } else {
                return new NextResponse("Wallet already linked to another account", { status: 409 });
            }
        }

        // Check if this is the first wallet (make primary)
        const count = await prisma.wallet.count({
            where: { userId: session.user.id }
        });

        const newWallet = await prisma.wallet.create({
            data: {
                userId: session.user.id,
                address,
                label: label || "Unknown Wallet",
                isPrimary: count === 0, // First wallet is primary
                isAutoSubscribed: true // Default true
            }
        });

        // Maintain legacy address field on User for now (optional but safe)
        if (count === 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { address: address }
            });
        }

        return NextResponse.json({ success: true, wallet: newWallet });
    } catch (error) {
        console.error("Error linking wallet:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
